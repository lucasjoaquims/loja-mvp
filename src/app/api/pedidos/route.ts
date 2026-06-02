// src/app/api/pedidos/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const createOrderSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      name: z.string(),
      image: z.string(),
      price: z.number().positive(),
      size: z.string(),
      color: z.string(),
      quantity: z.number().int().positive(),
    })
  ).min(1, "Carrinho vazio"),
  addressId: z.string().optional(),
  couponId: z.string().optional(),
  couponCode: z.string().optional(),
  subtotal: z.number().positive(),
  discount: z.number().min(0),
  shipping: z.number().min(0),
  total: z.number().positive(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const data = createOrderSchema.parse(body);

    // Valida estoque de todos os produtos
    for (const item of data.items) {
      const produto = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { stock: true, active: true, name: true },
      });

      if (!produto || !produto.active) {
        return NextResponse.json(
          { error: `Produto "${item.name}" indisponível` },
          { status: 400 }
        );
      }

      if (produto.stock < item.quantity) {
        return NextResponse.json(
          { error: `Estoque insuficiente para "${item.name}". Disponível: ${produto.stock}` },
          { status: 400 }
        );
      }
    }

    // Valida cupom se informado
    let couponId: string | undefined;
    if (data.couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: data.couponCode.toUpperCase() },
      });

      if (!coupon || !coupon.active) {
        return NextResponse.json({ error: "Cupom inválido" }, { status: 400 });
      }

      if (coupon.expiresAt && coupon.expiresAt < new Date()) {
        return NextResponse.json({ error: "Cupom expirado" }, { status: 400 });
      }

      if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
        return NextResponse.json({ error: "Cupom esgotado" }, { status: 400 });
      }

      if (coupon.minOrder && data.subtotal < coupon.minOrder) {
        return NextResponse.json(
          { error: `Pedido mínimo para este cupom: R$ ${coupon.minOrder.toFixed(2)}` },
          { status: 400 }
        );
      }

      couponId = coupon.id;
    }

    // Cria o pedido em transação
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId: session.user.id,
          addressId: data.addressId,
          couponId,
          subtotal: data.subtotal,
          discount: data.discount,
          shipping: data.shipping,
          total: data.total,
          status: "PENDING",
          items: {
            create: data.items.map((item) => ({
              productId: item.productId,
              name: item.name,
              image: item.image,
              price: item.price,
              size: item.size,
              color: item.color,
              quantity: item.quantity,
            })),
          },
        },
        include: { items: true },
      });

      // Incrementa uso do cupom
      if (couponId) {
        await tx.coupon.update({
          where: { id: couponId },
          data: { usedCount: { increment: 1 } },
        });
      }

      return newOrder;
    });

    return NextResponse.json({ orderId: order.id, total: order.total }, { status: 201 });
  } catch (error) {
    console.error("[PEDIDOS] POST error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.errors },
        { status: 422 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao criar pedido" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const pedidos = await prisma.order.findMany({
      where: { userId: session.user.id },
      include: {
        items: true,
        payment: { select: { method: true, mpStatus: true, paidAt: true } },
        address: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(pedidos);
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
