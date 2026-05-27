// src/app/api/admin/cupons/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

async function checkAdmin() {
  const session = await auth();
  return session?.user?.role === "ADMIN";
}

export async function GET() {
  if (!(await checkAdmin())) return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  const cupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(cupons);
}

export async function POST(req: NextRequest) {
  if (!(await checkAdmin())) return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

  const body = await req.json();

  try {
    const cupom = await prisma.coupon.create({
      data: {
        code: body.code.toUpperCase(),
        type: body.type,
        value: parseFloat(body.value),
        minOrder: body.minOrder ? parseFloat(body.minOrder) : null,
        maxUses: body.maxUses ? parseInt(body.maxUses) : null,
        active: body.active ?? true,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      },
    });
    return NextResponse.json(cupom, { status: 201 });
  } catch (error) {
    const msg = (error as { code?: string })?.code === "P2002"
      ? "Código de cupom já existe"
      : "Erro ao criar cupom";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!(await checkAdmin())) return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

  const body = await req.json();
  const { id, ...data } = body;

  const cupom = await prisma.coupon.update({
    where: { id },
    data: {
      active: data.active,
      value: data.value !== undefined ? parseFloat(data.value) : undefined,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
    },
  });

  return NextResponse.json(cupom);
}

export async function DELETE(req: NextRequest) {
  if (!(await checkAdmin())) return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

  const { id } = await req.json();
  await prisma.coupon.delete({ where: { id } });
  return NextResponse.json({ message: "Cupom excluído" });
}
