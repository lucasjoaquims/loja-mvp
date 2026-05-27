// src/app/api/pagamentos/pix/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { createPixPayment } from "@/lib/mercadopago";
import { z } from "zod";

const schema = z.object({
  orderId: z.string().min(1),
  cpf: z.string().min(11),
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const data = schema.parse(body);

    // Busca o pedido e valida que pertence ao usuário
    const order = await prisma.order.findUnique({
      where: { id: data.orderId },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
    }

    if (order.userId !== session.user.id) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    if (order.status !== "PENDING") {
      return NextResponse.json({ error: "Pedido já foi processado" }, { status: 400 });
    }

    // Verifica se já existe pagamento
    const existingPayment = await prisma.payment.findUnique({
      where: { orderId: data.orderId },
    });
    if (existingPayment?.mpStatus === "approved") {
      return NextResponse.json({ error: "Pedido já pago" }, { status: 400 });
    }

    // URL do webhook (em produção use o domínio real)
    const notificationUrl =
      process.env.NODE_ENV === "production"
        ? `${process.env.NEXT_PUBLIC_APP_URL}/api/pagamentos/webhook`
        : undefined; // localhost não funciona para webhooks

    // Cria pagamento PIX no Mercado Pago
    const result = await createPixPayment({
      method: "pix",
      orderId: order.id,
      amount: order.total,
      payer: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        cpf: data.cpf,
      },
      items: order.items.map((item) => ({
        id: item.productId,
        title: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
      })),
      notificationUrl,
    });

    // Salva/atualiza pagamento no banco
    const payment = await prisma.payment.upsert({
      where: { orderId: order.id },
      update: {
        mpPaymentId: result.mpPaymentId,
        mpStatus: result.status,
        pixQrCode: result.pixQrCode,
        pixQrCodeText: result.pixQrCodeText,
        expiresAt: result.pixExpiresAt,
        updatedAt: new Date(),
      },
      create: {
        orderId: order.id,
        mpPaymentId: result.mpPaymentId,
        mpStatus: result.status,
        method: "PIX",
        amount: order.total,
        pixQrCode: result.pixQrCode,
        pixQrCodeText: result.pixQrCodeText,
        expiresAt: result.pixExpiresAt,
        externalRef: `loja-mvp-${order.id}`,
      },
    });

    return NextResponse.json({
      paymentId: payment.id,
      mpPaymentId: result.mpPaymentId,
      status: result.status,
      pixQrCode: result.pixQrCode,
      pixQrCodeText: result.pixQrCodeText,
      expiresAt: result.pixExpiresAt,
      amount: order.total,
    });
  } catch (error) {
    console.error("[PIX] Erro:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.errors },
        { status: 422 }
      );
    }

    const message =
      error instanceof Error ? error.message : "Erro ao processar pagamento";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Polling de status do PIX
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json({ error: "orderId obrigatório" }, { status: 400 });
    }

    const payment = await prisma.payment.findUnique({
      where: { orderId },
      include: { order: { select: { userId: true, status: true } } },
    });

    if (!payment || payment.order.userId !== session.user.id) {
      return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      mpStatus: payment.mpStatus,
      orderStatus: payment.order.status,
      paidAt: payment.paidAt,
    });
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
