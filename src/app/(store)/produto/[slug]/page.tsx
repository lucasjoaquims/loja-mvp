"use client";
// src/app/(store)/produto/[slug]/page.tsx
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Heart, Star, ChevronRight, Minus, Plus, Truck, RefreshCw, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/store/cartStore";
import { formatPrice, calcDiscountPercent } from "@/utils";
import ProdutoCard from "@/components/produto/ProdutoCard";
import type { Product } from "@/types";

export default function ProdutoPage() {
  const { slug } = useParams() as { slug: string };
  const router = useRouter();
  const { data: session } = useSession();
  const addItem = useCartStore((s) => s.addItem);

  const [produto, setProduto] = useState<Product & { relacionados?: Product[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgSel, setImgSel] = useState(0);
  const [sizeSel, setSizeSel] = useState("");
  const [colorSel, setColorSel] = useState(0);
  const [qty, setQty] = useState(1);
  const [favorited, setFavorited] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetch(`/api/produtos/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        setProduto(data);
        if (data.colors?.length > 0) setColorSel(0);
      })
      .catch(() => router.push("/404"))
      .finally(() => setLoading(false));
  }, [slug, router]);

  if (loading) {
    return (
      <div className="container-loja py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="skeleton aspect-square" />
          <div className="space-y-4">
            <div className="skeleton h-6 w-32 rounded" />
            <div className="skeleton h-10 w-full rounded" />
            <div className="skeleton h-8 w-40 rounded" />
            <div className="skeleton h-20 w-full rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!produto) return null;

  const desconto = calcDiscountPercent(produto.originalPrice ?? 0, produto.price);
  const corAtual = produto.colors[colorSel];

  const handleAddToCart = async () => {
    if (produto.sizes.length > 1 && !sizeSel) {
      toast.error("Selecione um tamanho");
      return;
    }

    setAdding(true);
    addItem({
      productId: produto.id,
      name: produto.name,
      slug: produto.slug,
      image: produto.images[0],
      price: produto.price,
      originalPrice: produto.originalPrice,
      size: sizeSel || produto.sizes[0],
      color: corAtual,
      quantity: qty,
      stock: produto.stock,
    });

    toast.success("Adicionado ao carrinho!", {
      action: { label: "Ver carrinho", onClick: () => router.push("/carrinho") },
    });
    setAdding(false);
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    router.push("/carrinho");
  };

  return (
    <>
      <div className="container-loja py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-zinc-400 mb-8">
          <Link href="/" className="hover:text-zinc-700">Início</Link>
          <ChevronRight size={14} />
          <Link href="/produtos" className="hover:text-zinc-700">Produtos</Link>
          {produto.category && (
            <>
              <ChevronRight size={14} />
              <Link href={`/produtos?categoria=${produto.category.slug}`} className="hover:text-zinc-700">
                {produto.category.name}
              </Link>
            </>
          )}
          <ChevronRight size={14} />
          <span className="text-zinc-700 truncate max-w-[200px]">{produto.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">
          {/* Galeria */}
          <div className="space-y-3">
            <div className="relative overflow-hidden bg-zinc-100 aspect-square">
              <AnimatePresence mode="wait">
                <motion.div
                  key={imgSel}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={produto.images[imgSel]}
                    alt={produto.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                  />
                </motion.div>
              </AnimatePresence>

              {desconto > 0 && (
                <div className="absolute top-4 left-4 badge-discount text-sm px-3 py-1">
                  -{desconto}%
                </div>
              )}
            </div>

            {/* Miniaturas */}
            {produto.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {produto.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setImgSel(i)}
                    className={`relative flex-shrink-0 w-20 h-20 overflow-hidden border-2 transition-colors ${
                      i === imgSel ? "border-zinc-900" : "border-transparent"
                    }`}
                  >
                    <Image src={img} alt="" fill className="object-cover" sizes="80px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <p className="text-xs uppercase tracking-widest text-zinc-400 mb-2">
              {produto.category?.name}
            </p>
            <h1 className="text-3xl font-black tracking-tight mb-3">{produto.name}</h1>

            {/* Rating */}
            {(produto._avgRating ?? 0) > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={16}
                      className={s <= Math.round(produto._avgRating ?? 0)
                        ? "fill-amber-400 text-amber-400"
                        : "fill-zinc-200 text-zinc-200"}
                    />
                  ))}
                </div>
                <span className="text-sm text-zinc-500">
                  {produto._avgRating?.toFixed(1)} estrelas
                </span>
                <span className="text-sm text-zinc-400">• {produto.sold} vendidos</span>
              </div>
            )}

            {/* Preço */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-4xl font-black">{formatPrice(produto.price)}</span>
              {produto.originalPrice && (
                <span className="text-xl text-zinc-400 line-through">
                  {formatPrice(produto.originalPrice)}
                </span>
              )}
            </div>

            <p className="text-xs text-zinc-500 mb-6">
              ou 12x de {formatPrice(produto.price / 12)} sem juros
            </p>

            {/* Cor */}
            <div className="mb-6">
              <p className="text-sm font-semibold mb-2 uppercase tracking-wider">
                Cor: <span className="font-normal text-zinc-600">{corAtual?.name}</span>
              </p>
              <div className="flex gap-2">
                {produto.colors.map((cor, i) => (
                  <button
                    key={cor.name}
                    onClick={() => setColorSel(i)}
                    title={cor.name}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      i === colorSel ? "border-zinc-900 scale-110" : "border-zinc-200 hover:border-zinc-400"
                    }`}
                    style={{ backgroundColor: cor.hex }}
                  />
                ))}
              </div>
            </div>

            {/* Tamanho */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold uppercase tracking-wider">Tamanho</p>
                <button className="text-xs text-zinc-500 underline hover:text-zinc-800">
                  Guia de tamanhos
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {produto.sizes.map((size) => {
                  const esgotado = produto.stock === 0;
                  return (
                    <button
                      key={size}
                      onClick={() => !esgotado && setSizeSel(size)}
                      disabled={esgotado}
                      className={`min-w-[50px] py-2 px-3 text-sm font-medium border transition-all ${
                        esgotado
                          ? "border-zinc-200 text-zinc-300 cursor-not-allowed line-through"
                          : sizeSel === size
                          ? "border-zinc-900 bg-zinc-900 text-white"
                          : "border-zinc-300 text-zinc-700 hover:border-zinc-900"
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
              {produto.stock <= 5 && produto.stock > 0 && (
                <p className="text-xs text-amber-600 mt-2 font-medium">
                  ⚡ Apenas {produto.stock} em estoque!
                </p>
              )}
            </div>

            {/* Quantidade */}
            <div className="mb-6">
              <p className="text-sm font-semibold uppercase tracking-wider mb-2">Quantidade</p>
              <div className="flex items-center gap-0 border border-zinc-300 w-fit">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-zinc-100 transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="w-12 text-center text-sm font-semibold">{qty}</span>
                <button
                  onClick={() => setQty(Math.min(produto.stock, qty + 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-zinc-100 transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={handleAddToCart}
                disabled={adding || produto.stock === 0}
                className="flex-1 btn-secondary flex items-center justify-center gap-2"
              >
                <ShoppingBag size={18} />
                {produto.stock === 0 ? "Esgotado" : "Adicionar ao carrinho"}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={produto.stock === 0}
                className="flex-1 btn-primary"
              >
                Comprar agora
              </button>
              <button
                onClick={() => {
                  if (!session) return toast.error("Faça login para favoritar");
                  setFavorited(!favorited);
                  toast.success(favorited ? "Removido dos favoritos" : "Adicionado aos favoritos!");
                }}
                className="w-12 h-12 border border-zinc-300 flex items-center justify-center hover:border-zinc-900 transition-colors"
              >
                <Heart
                  size={18}
                  className={favorited ? "fill-red-500 text-red-500" : "text-zinc-600"}
                />
              </button>
            </div>

            {/* Benefícios */}
            <div className="space-y-3 py-6 border-t border-zinc-100">
              {[
                { icon: Truck, text: "Frete grátis nas compras acima de R$ 299" },
                { icon: RefreshCw, text: "Troca grátis em até 30 dias" },
                { icon: Shield, text: "Compra 100% segura e protegida" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 text-sm text-zinc-600">
                  <Icon size={16} className="text-zinc-400 shrink-0" />
                  {text}
                </div>
              ))}
            </div>

            {/* Descrição */}
            <div className="pt-6 border-t border-zinc-100">
              <h3 className="font-semibold mb-3">Sobre o produto</h3>
              <p className="text-sm text-zinc-600 leading-relaxed">{produto.description}</p>
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-zinc-500">
                <span>SKU: {produto.sku}</span>
                <span>{produto.sold}+ vendidos</span>
              </div>
            </div>
          </div>
        </div>

        {/* Relacionados */}
        {produto.relacionados && produto.relacionados.length > 0 && (
          <div className="mt-16 pt-16 border-t border-zinc-100">
            <h2 className="text-2xl font-black tracking-tight mb-8">Você também pode gostar</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {produto.relacionados.map((p, i) => (
                <ProdutoCard key={p.id} produto={p} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
