// src/components/home/MaisVendidos.tsx
import Link from "next/link";
import { Flame, ArrowRight } from "lucide-react";
import prisma from "@/lib/prisma";
import { parseProduct } from "@/utils";
import ProdutoCard from "@/components/produto/ProdutoCard";
import type { Product } from "@/types";

async function getMaisVendidos(): Promise<Product[]> {
  const produtos = await prisma.product.findMany({
    where: { active: true },
    include: {
      category: { select: { name: true, slug: true } },
      reviews: { select: { rating: true } },
    },
    orderBy: { sold: "desc" },
    take: 4,
  });

  return produtos.map((p) => {
    const parsed = parseProduct(p as { images: string; sizes: string; colors: string; [key: string]: unknown });
    const avgRating =
      p.reviews.length > 0
        ? p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length
        : 0;
    return { ...parsed, _avgRating: avgRating } as Product;
  });
}

export default async function MaisVendidos() {
  const produtos = await getMaisVendidos();

  return (
    <section className="py-16 bg-zinc-50">
      <div className="container-loja">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Flame size={16} className="text-red-500" />
              <p className="text-xs uppercase tracking-widest text-zinc-400">Top vendas</p>
            </div>
            <h2 className="text-3xl font-black tracking-tight">Mais Vendidos</h2>
          </div>
          <Link
            href="/produtos?ordenar=mais_vendidos"
            className="hidden sm:flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 group"
          >
            Ver ranking
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {produtos.map((produto, i) => (
            <ProdutoCard key={produto.id} produto={produto} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
