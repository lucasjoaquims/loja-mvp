"use client";
// src/components/home/Depoimentos.tsx
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const depoimentos = [
  {
    name: "Marina Costa",
    cargo: "Designer UX",
    avatar: "MC",
    rating: 5,
    texto:
      "Recebi o moletom em 2 dias e a qualidade é incrível! Superou todas as expectativas. Com certeza vou comprar mais peças.",
    produto: "Moletom Hoodie Essential",
  },
  {
    name: "Rafael Mendes",
    cargo: "Desenvolvedor",
    avatar: "RM",
    rating: 5,
    texto:
      "As camisetas têm um caimento perfeito e o tecido não desbota depois de várias lavagens. Compra certeira!",
    produto: "Camiseta Essentials Off-White",
  },
  {
    name: "Juliana Alves",
    cargo: "Arquiteta",
    avatar: "JA",
    rating: 5,
    texto:
      "O blazer chegou impecável, exatamente como nas fotos. O desconto de 3 peças é real, economizei bastante!",
    produto: "Blazer Alfaiataria Slim",
  },
  {
    name: "Pedro Santos",
    cargo: "Empresário",
    avatar: "PS",
    rating: 4,
    texto:
      "Ótima loja, entrega rápida e embalagem caprichada. As calças jeans têm um denim de qualidade premium.",
    produto: "Calça Jeans Slim Dark",
  },
];

export default function Depoimentos() {
  return (
    <section className="py-16 container-loja">
      <div className="text-center mb-12">
        <p className="text-xs uppercase tracking-widest text-zinc-400 mb-2">Clientes felizes</p>
        <h2 className="text-3xl font-black tracking-tight">O que dizem sobre nós</h2>
        <div className="divider mt-4" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {depoimentos.map((dep, i) => (
          <motion.div
            key={dep.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="bg-white border border-zinc-100 p-6 rounded-2xl hover:shadow-lg transition-shadow"
          >
            <Quote size={24} className="text-zinc-200 mb-4" />

            <div className="flex mb-3">
              {[...Array(5)].map((_, j) => (
                <Star
                  key={j}
                  size={14}
                  className={
                    j < dep.rating
                      ? "fill-amber-400 text-amber-400"
                      : "fill-zinc-200 text-zinc-200"
                  }
                />
              ))}
            </div>

            <p className="text-sm text-zinc-600 leading-relaxed mb-4">{dep.texto}</p>

            <p className="text-xs text-zinc-400 mb-4 italic">Comprou: {dep.produto}</p>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-zinc-900 text-white rounded-full flex items-center justify-center text-sm font-bold">
                {dep.avatar}
              </div>
              <div>
                <p className="text-sm font-semibold">{dep.name}</p>
                <p className="text-xs text-zinc-400">{dep.cargo}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
