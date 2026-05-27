"use client";
// src/components/home/BannerDesconto.tsx
import { motion } from "framer-motion";
import { Tag, Percent, ShoppingBag } from "lucide-react";
import Link from "next/link";

export default function BannerDesconto() {
  return (
    <section className="bg-zinc-900 text-white py-14">
      <div className="container-loja">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 text-sm mb-6">
            <Percent size={16} className="text-amber-400" />
            <span>Desconto automático aplicado no carrinho</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            Leve 3 peças e pague{" "}
            <span className="text-amber-400">10% menos</span>
          </h2>
          <p className="text-zinc-400 text-lg mb-8 max-w-xl mx-auto">
            Desconto aplicado automaticamente ao adicionar 3 ou mais itens ao carrinho. 
            Sem cupom, sem complicação.
          </p>

          <div className="flex flex-wrap justify-center gap-8 mb-10">
            {[
              { icon: ShoppingBag, label: "1 peça", valor: "Preço normal" },
              { icon: ShoppingBag, label: "2 peças", valor: "Preço normal" },
              { icon: Tag, label: "3+ peças", valor: "10% de desconto", destaque: true },
            ].map(({ icon: Icon, label, valor, destaque }) => (
              <div
                key={label}
                className={`text-center ${destaque ? "relative" : "opacity-60"}`}
              >
                {destaque && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-amber-400 text-zinc-900 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                    ✨ Você economiza!
                  </div>
                )}
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${
                    destaque ? "bg-amber-400 text-zinc-900" : "bg-white/10"
                  }`}
                >
                  <Icon size={24} />
                </div>
                <p className="font-bold">{label}</p>
                <p className={`text-sm ${destaque ? "text-amber-400 font-semibold" : "text-zinc-400"}`}>
                  {valor}
                </p>
              </div>
            ))}
          </div>

          <Link href="/produtos" className="btn-primary bg-white text-zinc-900 hover:bg-zinc-100">
            Aproveitar agora
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
