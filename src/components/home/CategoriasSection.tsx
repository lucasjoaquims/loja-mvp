"use client";
// src/components/home/CategoriasSection.tsx
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

const categorias = [
  {
    label: "Camisetas",
    slug: "camisetas",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80",
    span: "col-span-2 md:col-span-1",
  },
  {
    label: "Moletons",
    slug: "moletons",
    image: "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&q=80",
    span: "col-span-2 md:col-span-1",
  },
  {
    label: "Feminino",
    slug: "feminino",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80",
    span: "col-span-2",
  },
  {
    label: "Tênis",
    slug: "tenis",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
    span: "col-span-2 md:col-span-1",
  },
  {
    label: "Acessórios",
    slug: "acessorios",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80",
    span: "col-span-2 md:col-span-1",
  },
];

export default function CategoriasSection() {
  return (
    <section className="py-16 container-loja">
      <div className="text-center mb-10">
        <p className="text-xs uppercase tracking-widest text-zinc-400 mb-2">Explore</p>
        <h2 className="text-3xl font-black tracking-tight">Categorias</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {categorias.map((cat, i) => (
          <motion.div
            key={cat.slug}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className={cat.span}
          >
            <Link
              href={`/produtos?categoria=${cat.slug}`}
              className="group relative block overflow-hidden bg-zinc-100 aspect-[4/3]"
            >
              <Image
                src={cat.image}
                alt={cat.label}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-zinc-900/30 group-hover:bg-zinc-900/50 transition-colors duration-300" />
              <div className="absolute inset-0 flex items-end p-5">
                <div>
                  <h3 className="text-white font-bold text-lg uppercase tracking-wider">
                    {cat.label}
                  </h3>
                  <span className="text-white/70 text-xs uppercase tracking-widest group-hover:text-white transition-colors">
                    Ver tudo →
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
