// src/app/api/pagamentos/webhook/route.ts
// Recebe notificações do Mercado Pago e atualiza pedidos automaticamente
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getPaymentStatus, mapMpStatus } from "@/lib/mercadopago";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("[WEBHOOK] Recebido:", JSON.stringify(body, null, 2));

    // Mercado Pago envia type: "payment" com data.id
    if (body.type !== "payment" || !body.data?.id) {
      return NextResponse.json({ ok: true }); // ignora outros eventos
    }

    const mpPaymentId = String(body.data.id);

    // Busca status atual no MP
    const mpData = await getPaymentStatus(mpPaymentId);
    const newOrderStatus = mapMpStatus(mpData.status ?? "");

    // Encontra o pagamento no nosso banco
    const payment = await prisma.payment.findFirst({
      where: { mpPaymentId },
      include: {
        order: {
          include: { items: true },
        },
      },
    });

    if (!payment) {
      console.warn("[WEBHOOK] Pagamento não encontrado no banco:", mpPaymentId);
      return NextResponse.json({ ok: true });
    }

    // Evita processar duas vezes
    if (payment.order.status === "PAID" || payment.order.status === "CANCELLED") {
      return NextResponse.json({ ok: true });
    }

    // Atualiza pagamento
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        mpStatus: mpData.status,
        paidAt: mpData.status === "approved" ? new Date() : null,
        updatedAt: new Date(),
      },
    });

    // Atualiza pedido
    await prisma.order.update({
      where: { id: payment.orderId },
      data: { status: newOrderStatus },
    });

    // Se aprovado: decrementa estoque
    if (newOrderStatus === "PAID") {
      for (const item of payment.order.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity },
            sold: { increment: item.quantity },
          },
        });
      }
      console.log(`[WEBHOOK] Pedido ${payment.orderId} PAGO com sucesso!`);
    }

    if (newOrderStatus === "CANCELLED") {
      console.log(`[WEBHOOK] Pedido ${payment.orderId} CANCELADO.`);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[WEBHOOK] Erro crítico:", error);
    // Retorna 200 para o MP não reenviar o webhook em loop
    return NextResponse.json({ ok: true });
  }
}

// Mercado Pago também faz GET para verificar o endpoint
export async function GET() {
  return NextResponse.json({ status: "Webhook ativo — Loja MVP" });
}
