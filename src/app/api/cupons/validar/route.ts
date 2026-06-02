// src/app/api/cupons/validar/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { code, subtotal } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "Código obrigatório" }, { status: 400 });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      return NextResponse.json({ error: "Cupom não encontrado" }, { status: 404 });
    }

    if (!coupon.active) {
      return NextResponse.json({ error: "Cupom inativo" }, { status: 400 });
    }

    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return NextResponse.json({ error: "Cupom expirado" }, { status: 400 });
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ error: "Cupom esgotado" }, { status: 400 });
    }

    if (coupon.minOrder && subtotal < coupon.minOrder) {
      return NextResponse.json(
        { error: `Pedido mínimo de R$ ${coupon.minOrder.toFixed(2)} para este cupom` },
        { status: 400 }
      );
    }

    // Calcula desconto
    let discountAmount = 0;
    if (coupon.type === "PERCENTAGE") {
      discountAmount = subtotal * (coupon.value / 100);
    } else {
      discountAmount = Math.min(coupon.value, subtotal);
    }

    return NextResponse.json({
      valid: true,
      couponId: coupon.id,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discountAmount,
      message:
        coupon.type === "PERCENTAGE"
          ? `${coupon.value}% de desconto aplicado!`
          : `R$ ${coupon.value.toFixed(2)} de desconto aplicado!`,
    });
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
