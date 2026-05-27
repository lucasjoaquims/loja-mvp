// src/app/api/produtos/[slug]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { parseProduct } from "@/utils";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const produto = await prisma.product.findUnique({
      where: { slug, active: true },
      include: {
        category: true,
        reviews: {
          include: {
            user: { select: { name: true, image: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!produto) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    }

    const parsed = parseProduct(produto as { images: string; sizes: string; colors: string; [key: string]: unknown });
    const avgRating =
      produto.reviews.length > 0
        ? produto.reviews.reduce((s, r) => s + r.rating, 0) / produto.reviews.length
        : 0;

    // Produtos relacionados (mesma categoria)
    const relacionados = await prisma.product.findMany({
      where: {
        categoryId: produto.categoryId,
        id: { not: produto.id },
        active: true,
      },
      take: 4,
      orderBy: { sold: "desc" },
    });

    const relacionadosParsed = relacionados.map((p) =>
      parseProduct(p as { images: string; sizes: string; colors: string; [key: string]: unknown })
    );

    return NextResponse.json({
      ...parsed,
      _avgRating: avgRating,
      relacionados: relacionadosParsed,
    });
  } catch (error) {
    console.error("[PRODUTO] GET error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
