// src/app/api/pagamentos/cartao/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { createCardPayment } from "@/lib/mercadopago";
import { z } from "zod";

const schema = z.object({
  orderId: z.string().min(1),
  token: z.string().min(1, "Token do cartão obrigatório"),
  installments: z.number().int().min(1).max(12),
  paymentMethodId: z.string().min(1),
  issuerId: z.string().optional(),
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

    // Valida o pedido
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

    // Processa pagamento no Mercado Pago
    const result = await createCardPayment({
      method: "credit_card",
      orderId: order.id,
      amount: order.total,
      token: data.token,
      installments: data.installments,
      paymentMethodId: data.paymentMethodId,
      issuerId: data.issuerId,
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

    // Determina novo status do pedido
    const newOrderStatus = result.status === "approved" ? "PAID" : "PENDING";

    // Salva pagamento
    const payment = await prisma.payment.upsert({
      where: { orderId: order.id },
      update: {
        mpPaymentId: result.mpPaymentId,
        mpStatus: result.status,
        paidAt: result.status === "approved" ? new Date() : null,
        updatedAt: new Date(),
      },
      create: {
        orderId: order.id,
        mpPaymentId: result.mpPaymentId,
        mpStatus: result.status,
        method: "CREDIT_CARD",
        amount: order.total,
        paidAt: result.status === "approved" ? new Date() : null,
      },
    });

    // Atualiza status do pedido se aprovado
    if (newOrderStatus === "PAID") {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "PAID" },
      });

      // Decrementar estoque
      for (const item of order.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity },
            sold: { increment: item.quantity },
          },
        });
      }
    }

    return NextResponse.json({
      paymentId: payment.id,
      mpPaymentId: result.mpPaymentId,
      status: result.status,
      statusDetail: result.statusDetail,
      orderStatus: newOrderStatus,
      approved: result.status === "approved",
    });
  } catch (error) {
    console.error("[CARTÃO] Erro:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.errors },
        { status: 422 }
      );
    }

    // Erros específicos do Mercado Pago
    const errMessage = error instanceof Error ? error.message : "Erro no pagamento";
    const isCardError =
      errMessage.includes("cc_rejected") ||
      errMessage.includes("insufficient") ||
      errMessage.includes("invalid");

    return NextResponse.json(
      {
        error: isCardError
          ? "Cartão recusado. Verifique os dados ou tente outro cartão."
          : errMessage,
      },
      { status: isCardError ? 422 : 500 }
    );
  }
}
