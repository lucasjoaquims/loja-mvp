"use client";
// src/components/produto/ProdutoCard.tsx
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useCartStore } from "@/store/cartStore";
import { formatPrice, calcDiscountPercent } from "@/utils";
import type { Product } from "@/types";

interface ProdutoCardProps {
  produto: Product;
  index?: number;
}

export default function ProdutoCard({ produto, index = 0 }: ProdutoCardProps) {
  const { data: session } = useSession();
  const addItem = useCartStore((s) => s.addItem);
  const [favorited, setFavorited] = useState(false);
  const [addingCart, setAddingCart] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);

  const discountPercent = calcDiscountPercent(
    produto.originalPrice ?? 0,
    produto.price
  );

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (produto.sizes.length > 1) {
      // Redireciona para página do produto para escolher tamanho
      window.location.href = `/produto/${produto.slug}`;
      return;
    }

    setAddingCart(true);
    addItem({
      productId: produto.id,
      name: produto.name,
      slug: produto.slug,
      image: produto.images[0],
      price: produto.price,
      originalPrice: produto.originalPrice,
      size: produto.sizes[0],
      color: produto.colors[0],
      quantity: 1,
      stock: produto.stock,
    });

    toast.success(`${produto.name} adicionado ao carrinho!`, {
      action: {
        label: "Ver carrinho",
        onClick: () => (window.location.href = "/carrinho"),
      },
    });

    setAddingCart(false);
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session) {
      toast.error("Faça login para salvar favoritos");
      return;
    }

    setFavorited(!favorited);
    toast.success(favorited ? "Removido dos favoritos" : "Adicionado aos favoritos!");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: Math.min(index * 0.07, 0.4) }}
    >
      <Link href={`/produto/${produto.slug}`} className="group block">
        {/* Imagem */}
        <div className="relative overflow-hidden bg-zinc-100 aspect-[3/4] mb-3">
          <Image
            src={produto.images[imgIndex] ?? produto.images[0]}
            alt={produto.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {produto.isNew && (
              <span className="px-2 py-0.5 bg-zinc-900 text-white text-xs font-semibold uppercase tracking-wider">
                Novo
              </span>
            )}
            {discountPercent > 0 && (
              <span className="badge-discount">-{discountPercent}%</span>
            )}
            {produto.stock <= 5 && produto.stock > 0 && (
              <span className="px-2 py-0.5 bg-amber-500 text-white text-xs font-semibold uppercase tracking-wider">
                Últimas peças
              </span>
            )}
            {produto.stock === 0 && (
              <span className="px-2 py-0.5 bg-zinc-400 text-white text-xs font-semibold uppercase tracking-wider">
                Esgotado
              </span>
            )}
          </div>

          {/* Ações */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={handleWishlist}
              className="w-8 h-8 bg-white shadow rounded-full flex items-center justify-center hover:bg-zinc-100 transition-colors"
              aria-label="Favoritar"
            >
              <Heart
                size={14}
                className={favorited ? "fill-red-500 text-red-500" : "text-zinc-600"}
              />
            </button>
          </div>

          {/* Quick add */}
          {produto.stock > 0 && (
            <div className="absolute bottom-0 inset-x-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <button
                onClick={handleQuickAdd}
                disabled={addingCart}
                className="w-full bg-zinc-900 text-white py-3 text-xs font-semibold uppercase tracking-widest hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingBag size={14} />
                {produto.sizes.length > 1 ? "Escolher tamanho" : "Adicionar ao carrinho"}
              </button>
            </div>
          )}

          {/* Miniaturas de imagem */}
          {produto.images.length > 1 && (
            <div className="absolute bottom-3 left-3 flex gap-1">
              {produto.images.slice(0, 3).map((_, i) => (
                <button
                  key={i}
                  onMouseEnter={() => setImgIndex(i)}
                  onClick={(e) => { e.preventDefault(); setImgIndex(i); }}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    i === imgIndex ? "bg-white" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="text-xs text-zinc-400 uppercase tracking-widest mb-1">
            {produto.category?.name ?? ""}
          </p>
          <h3 className="text-sm font-semibold text-zinc-900 mb-1 line-clamp-1 group-hover:text-zinc-600 transition-colors">
            {produto.name}
          </h3>

          {/* Rating */}
          {(produto._avgRating ?? 0) > 0 && (
            <div className="flex items-center gap-1 mb-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={10}
                  className={
                    star <= Math.round(produto._avgRating ?? 0)
                      ? "fill-amber-400 text-amber-400"
                      : "text-zinc-200 fill-zinc-200"
                  }
                />
              ))}
              <span className="text-xs text-zinc-400 ml-0.5">
                ({produto._avgRating?.toFixed(1)})
              </span>
            </div>
          )}

          {/* Preço */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-zinc-900">{formatPrice(produto.price)}</span>
            {produto.originalPrice && produto.originalPrice > produto.price && (
              <span className="text-xs text-zinc-400 line-through">
                {formatPrice(produto.originalPrice)}
              </span>
            )}
          </div>

          {/* Cores */}
          {produto.colors.length > 1 && (
            <div className="flex gap-1 mt-2">
              {produto.colors.slice(0, 5).map((cor) => (
                <div
                  key={cor.name}
                  title={cor.name}
                  className="w-3.5 h-3.5 rounded-full border border-zinc-200"
                  style={{ backgroundColor: cor.hex }}
                />
              ))}
              {produto.colors.length > 5 && (
                <span className="text-xs text-zinc-400">+{produto.colors.length - 5}</span>
              )}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
