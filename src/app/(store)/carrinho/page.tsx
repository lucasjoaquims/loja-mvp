"use client";
// src/app/(store)/carrinho/page.tsx
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2, Tag, ShoppingBag, ArrowRight, Percent } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/utils";
import { useSession } from "next-auth/react";

export default function CarrinhoPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const {
    items,
    removeItem,
    updateQuantity,
    getSubtotal,
    getAutoDiscount,
    getTotal,
    shipping,
    couponCode,
    couponDiscount,
    applyCoupon,
    removeCoupon,
    setCep,
    cep,
  } = useCartStore();

  const [cupomInput, setCupomInput] = useState(couponCode);
  const [cepInput, setCepInput] = useState(cep);
  const [validatingCupom, setValidatingCupom] = useState(false);
  const [calculatingFrete, setCalculatingFrete] = useState(false);

  const subtotal = getSubtotal();
  const autoDiscount = getAutoDiscount();
  const total = getTotal();

  const handleValidarCupom = async () => {
    if (!cupomInput.trim()) return;
    setValidatingCupom(true);
    try {
      const res = await fetch("/api/cupons/validar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: cupomInput.toUpperCase(), subtotal }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Cupom inválido");
        return;
      }

      applyCoupon(data.code, data.couponId, data.discountAmount);
      toast.success(data.message);
    } catch {
      toast.error("Erro ao validar cupom");
    } finally {
      setValidatingCupom(false);
    }
  };

  const handleCalcularFrete = async () => {
    if (!cepInput || cepInput.replace(/\D/g, "").length !== 8) {
      toast.error("CEP inválido");
      return;
    }
    setCalculatingFrete(true);
    await new Promise((r) => setTimeout(r, 600)); // simula chamada
    setCep(cepInput.replace(/\D/g, ""));
    toast.success("Frete calculado!");
    setCalculatingFrete(false);
  };

  const handleCheckout = () => {
    if (!session) {
      toast.error("Faça login para continuar");
      router.push("/auth/login?callbackUrl=/checkout");
      return;
    }
    router.push("/checkout");
  };

  if (items.length === 0) {
    return (
      <div className="container-loja py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ShoppingBag size={64} className="mx-auto text-zinc-200 mb-6" />
          <h1 className="text-2xl font-black mb-3">Seu carrinho está vazio</h1>
          <p className="text-zinc-500 mb-8">
            Explore nossos produtos e encontre algo que você ame.
          </p>
          <Link href="/produtos" className="btn-primary">
            Explorar produtos
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container-loja py-8">
      <h1 className="text-3xl font-black tracking-tight mb-8">
        Carrinho ({items.reduce((s, i) => s + i.quantity, 0)} itens)
      </h1>

      {/* Banner desconto automático */}
      <AnimatePresence>
        {autoDiscount.hasDiscount && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3"
          >
            <Percent size={20} className="text-green-600 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-green-800">
                🎉 Desconto de 10% aplicado automaticamente!
              </p>
              <p className="text-xs text-green-600">
                Você está levando {autoDiscount.totalItems} peças — economizou{" "}
                {formatPrice(autoDiscount.amount)}
              </p>
            </div>
          </motion.div>
        )}
        {!autoDiscount.hasDiscount && autoDiscount.totalItems > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center gap-3"
          >
            <Tag size={20} className="text-amber-600 shrink-0" />
            <p className="text-sm text-amber-800">
              Adicione mais {3 - autoDiscount.totalItems} peça(s) e ganhe{" "}
              <strong>10% de desconto</strong> automático!
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Itens */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.3 }}
                className="flex gap-4 p-4 bg-white border border-zinc-100 rounded-xl"
              >
                <Link href={`/produto/${item.slug}`} className="relative w-24 h-32 flex-shrink-0 overflow-hidden bg-zinc-100">
                  <Image src={item.image} alt={item.name} fill className="object-cover" sizes="96px" />
                </Link>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between gap-2">
                    <Link href={`/produto/${item.slug}`} className="font-semibold text-sm hover:text-zinc-600 line-clamp-2">
                      {item.name}
                    </Link>
                    <button
                      onClick={() => {
                        removeItem(item.productId, item.size, item.color.name);
                        toast.success("Item removido");
                      }}
                      className="text-zinc-400 hover:text-red-500 transition-colors flex-shrink-0"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="flex gap-3 text-xs text-zinc-500 mt-1 mb-3">
                    <span>Tamanho: <strong>{item.size}</strong></span>
                    <span>Cor: <strong>{item.color.name}</strong></span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-0 border border-zinc-200 w-fit">
                      <button
                        onClick={() => updateQuantity(item.productId, item.size, item.color.name, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-zinc-100 text-zinc-600"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-10 text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.size, item.color.name, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-zinc-100 text-zinc-600"
                        disabled={item.quantity >= item.stock}
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="font-bold">{formatPrice(item.price * item.quantity)}</p>
                      {item.quantity > 1 && (
                        <p className="text-xs text-zinc-400">{formatPrice(item.price)} cada</p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Resumo */}
        <div className="lg:col-span-1">
          <div className="bg-zinc-50 rounded-2xl p-6 sticky top-24">
            <h2 className="font-bold text-lg mb-6">Resumo do pedido</h2>

            {/* Calcular frete */}
            <div className="mb-4">
              <p className="text-sm font-medium mb-2">Calcular frete</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="00000-000"
                  value={cepInput}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "").slice(0, 8);
                    setCepInput(v.replace(/^(\d{5})(\d)/, "$1-$2"));
                  }}
                  className="flex-1 text-sm border border-zinc-300 rounded-lg px-3 py-2 outline-none focus:border-zinc-600"
                />
                <button
                  onClick={handleCalcularFrete}
                  disabled={calculatingFrete}
                  className="btn-secondary px-4 py-2 text-xs whitespace-nowrap"
                >
                  {calculatingFrete ? "..." : "Calcular"}
                </button>
              </div>
            </div>

            {/* Cupom */}
            <div className="mb-6">
              <p className="text-sm font-medium mb-2">Cupom de desconto</p>
              {couponCode ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Tag size={14} className="text-green-600" />
                    <span className="text-sm font-semibold text-green-700">{couponCode}</span>
                    <span className="text-xs text-green-600">-{formatPrice(couponDiscount)}</span>
                  </div>
                  <button onClick={() => { removeCoupon(); setCupomInput(""); }} className="text-xs text-red-500 hover:text-red-700">
                    Remover
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="CODIGO"
                    value={cupomInput}
                    onChange={(e) => setCupomInput(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === "Enter" && handleValidarCupom()}
                    className="flex-1 text-sm border border-zinc-300 rounded-lg px-3 py-2 outline-none focus:border-zinc-600 uppercase"
                  />
                  <button
                    onClick={handleValidarCupom}
                    disabled={validatingCupom || !cupomInput}
                    className="btn-secondary px-4 py-2 text-xs whitespace-nowrap"
                  >
                    {validatingCupom ? "..." : "Aplicar"}
                  </button>
                </div>
              )}
            </div>

            {/* Totais */}
            <div className="space-y-2 text-sm border-t border-zinc-200 pt-4">
              <div className="flex justify-between">
                <span className="text-zinc-600">Subtotal</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              {autoDiscount.hasDiscount && (
                <div className="flex justify-between text-green-600">
                  <span>Desconto 3 peças (-{autoDiscount.percent}%)</span>
                  <span>-{formatPrice(autoDiscount.amount)}</span>
                </div>
              )}
              {couponDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Cupom {couponCode}</span>
                  <span>-{formatPrice(couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-zinc-600">Frete</span>
                <span className={shipping === 0 ? "text-green-600 font-medium" : "font-medium"}>
                  {shipping === 0 ? "GRÁTIS" : formatPrice(shipping)}
                </span>
              </div>
              {shipping === 0 && subtotal > 0 && (
                <p className="text-xs text-green-600">✓ Frete grátis aplicado!</p>
              )}
            </div>

            <div className="flex justify-between items-center mt-4 pt-4 border-t border-zinc-200">
              <span className="font-bold text-lg">Total</span>
              <span className="font-black text-2xl">{formatPrice(total)}</span>
            </div>

            <p className="text-xs text-zinc-400 text-center mt-2">
              ou 12x de {formatPrice(total / 12)} sem juros
            </p>

            <button
              onClick={handleCheckout}
              className="btn-primary w-full mt-6 gap-2"
            >
              Finalizar compra
              <ArrowRight size={16} />
            </button>

            <Link href="/produtos" className="block text-center text-xs text-zinc-500 mt-4 hover:text-zinc-700">
              ← Continuar comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
