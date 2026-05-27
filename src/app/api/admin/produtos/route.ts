// src/app/api/admin/produtos/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { slugify, parseProduct } from "@/utils";
import { z } from "zod";

async function checkAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return false;
  return true;
}

export async function GET(req: NextRequest) {
  if (!(await checkAdmin())) return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const pagina = parseInt(searchParams.get("pagina") ?? "1");
  const porPagina = parseInt(searchParams.get("porPagina") ?? "20");
  const busca = searchParams.get("busca") ?? "";

  const where = busca
    ? {
        OR: [
          { name: { contains: busca } },
          { sku: { contains: busca } },
        ],
      }
    : {};

  const [produtos, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      skip: (pagina - 1) * porPagina,
      take: porPagina,
    }),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json({
    data: produtos.map((p) => parseProduct(p as { images: string; sizes: string; colors: string; [key: string]: unknown })),
    total,
    pagina,
    totalPaginas: Math.ceil(total / porPagina),
  });
}

export async function POST(req: NextRequest) {
  if (!(await checkAdmin())) return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

  try {
    const body = await req.json();
    const slug = slugify(body.name);

    const produto = await prisma.product.create({
      data: {
        name: body.name,
        slug,
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
        sizes: JSON.stringify(body.sizes ?? ["PP", "P", "M", "G", "GG"]),
        colors: JSON.stringify(body.colors ?? [{ name: "Preto", hex: "#0A0A0A" }]),
      },
    });

    return NextResponse.json(parseProduct(produto as { images: string; sizes: string; colors: string; [key: string]: unknown }), { status: 201 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erro ao criar produto";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
