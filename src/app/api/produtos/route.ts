// src/app/api/produtos/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { parseProduct } from "@/utils";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const categoria = searchParams.get("categoria");
    const busca = searchParams.get("busca");
    const tamanho = searchParams.get("tamanho");
    const cor = searchParams.get("cor");
    const precoMin = searchParams.get("precoMin");
    const precoMax = searchParams.get("precoMax");
    const promocao = searchParams.get("promocao") === "true";
    const maisVendidos = searchParams.get("maisVendidos") === "true";
    const novidades = searchParams.get("novidades") === "true";
    const destaque = searchParams.get("destaque") === "true";
    const ordenar = searchParams.get("ordenar") ?? "relevancia";
    const pagina = parseInt(searchParams.get("pagina") ?? "1");
    const porPagina = parseInt(searchParams.get("porPagina") ?? "12");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { active: true };

    if (categoria) {
      where.category = { slug: categoria };
    }

    if (busca) {
      where.OR = [
        { name: { contains: busca, mode: "insensitive" } },
        { description: { contains: busca, mode: "insensitive" } },
        { sku: { contains: busca, mode: "insensitive" } },
      ];
    }

    if (precoMin) where.price = { ...where.price, gte: parseFloat(precoMin) };
    if (precoMax) where.price = { ...where.price, lte: parseFloat(precoMax) };
    if (promocao) where.originalPrice = { not: null };
    if (novidades) where.isNew = true;
    if (destaque) where.featured = true;

    // Tamanho: filtra dentro do JSON
    if (tamanho) {
      where.sizes = { contains: tamanho };
    }

    // Cor: filtra dentro do JSON
    if (cor) {
      where.colors = { contains: cor };
    }

    // Ordenação
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let orderBy: any = { sold: "desc" };
    switch (ordenar) {
      case "preco_asc":
        orderBy = { price: "asc" };
        break;
      case "preco_desc":
        orderBy = { price: "desc" };
        break;
      case "mais_vendidos":
        orderBy = { sold: "desc" };
        break;
      case "novidades":
        orderBy = { createdAt: "desc" };
        break;
      case "relevancia":
      default:
        orderBy = [{ featured: "desc" }, { sold: "desc" }];
    }

    const skip = (pagina - 1) * porPagina;

    const [produtos, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: { select: { name: true, slug: true } },
          reviews: { select: { rating: true } },
        },
        orderBy,
        skip,
        take: porPagina,
      }),
      prisma.product.count({ where }),
    ]);

    const data = produtos.map((p) => {
      const parsed = parseProduct(p as { images: string; sizes: string; colors: string; [key: string]: unknown });
      const avgRating =
        p.reviews.length > 0
          ? p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length
          : 0;
      return { ...parsed, _avgRating: avgRating, reviews: undefined };
    });

    return NextResponse.json({
      data,
      total,
      pagina,
      totalPaginas: Math.ceil(total / porPagina),
      porPagina,
    });
  } catch (error) {
    console.error("[PRODUTOS] GET error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
