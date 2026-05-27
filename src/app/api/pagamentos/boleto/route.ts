// src/app/api/pagamentos/boleto/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { createBoletoPayment } from "@/lib/mercadopago";
import { z } from "zod";

const schema = z.object({
  orderId: z.string().min(1),
  cpf: z.string().min(11),
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  address: z.object({
    streetName: z.string().min(3),
    streetNumber: z.string().min(1),
    zipCode: z.string().min(8),
    city: z.string().min(2),
    state: z.string().length(2),
  }),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const data = schema.parse(body);

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
      return NextResponse.json({ error: "Pedido já processado" }, { status: 400 });
    }

    const notificationUrl =
      process.env.NODE_ENV === "production"
        ? `${process.env.NEXT_PUBLIC_APP_URL}/api/pagamentos/webhook`
        : undefined;

    const result = await createBoletoPayment({
      method: "boleto",
      orderId: order.id,
      amount: order.total,
      payer: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        cpf: data.cpf,
      },
      address: data.address,
      items: order.items.map((item) => ({
        id: item.productId,
        title: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
      })),
      notificationUrl,
    });

    const payment = await prisma.payment.upsert({
      where: { orderId: order.id },
      update: {
        mpPaymentId: result.mpPaymentId,
        mpStatus: result.status,
        boletoUrl: result.boletoUrl,
        boletoBarcode: result.boletoBarcode,
        expiresAt: result.boletoExpiresAt,
        updatedAt: new Date(),
      },
      create: {
        orderId: order.id,
        mpPaymentId: result.mpPaymentId,
        mpStatus: result.status,
        method: "BOLETO",
        amount: order.total,
        boletoUrl: result.boletoUrl,
        boletoBarcode: result.boletoBarcode,
        expiresAt: result.boletoExpiresAt,
      },
    });

    return NextResponse.json({
      paymentId: payment.id,
      mpPaymentId: result.mpPaymentId,
      status: result.status,
      boletoUrl: result.boletoUrl,
      boletoBarcode: result.boletoBarcode,
      expiresAt: result.boletoExpiresAt,
      amount: order.total,
    });
  } catch (error) {
    console.error("[BOLETO] Erro:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.errors },
        { status: 422 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao gerar boleto" },
      { status: 500 }
    );
  }
}
