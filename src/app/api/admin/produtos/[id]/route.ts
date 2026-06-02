// src/app/api/admin/produtos/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { parseProduct } from "@/utils";

async function checkAdmin() {
  const session = await auth();
  return session?.user?.role === "ADMIN";
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAdmin())) return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();

  try {
    const produto = await prisma.product.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        price: parseFloat(body.price),
        originalPrice: body.originalPrice ? parseFloat(body.originalPrice) : null,
        sku: body.sku,
        stock: parseInt(body.stock),
        categoryId: body.categoryId,
        featured: body.featured ?? false,
        isNew: body.isNew ?? false,
        active: body.active ?? true,
        images: JSON.stringify(body.images ?? []),
        sizes: JSON.stringify(body.sizes ?? []),
        colors: JSON.stringify(body.colors ?? []),
      },
    });

    return NextResponse.json(parseProduct(produto as { images: string; sizes: string; colors: string; [key: string]: unknown }));
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAdmin())) return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

  const { id } = await params;

  try {
    await prisma.product.update({
      where: { id },
      data: { active: false }, // soft delete
    });
    return NextResponse.json({ message: "Produto desativado com sucesso" });
  } catch {
    return NextResponse.json({ error: "Erro ao excluir" }, { status: 500 });
  }
}
