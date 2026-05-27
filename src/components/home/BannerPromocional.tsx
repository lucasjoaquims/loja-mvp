"use client";
// src/components/home/BannerPromocional.tsx
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function BannerPromocional() {
  return (
    <section className="py-8 container-loja">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Banner 1 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden bg-zinc-900 aspect-[16/9] group"
        >
          <Image
            src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80"
            alt="Tênis"
            fill
            className="object-cover opacity-60 group-hover:opacity-50 transition-opacity duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 p-8 flex flex-col justify-end">
            <p className="text-white/60 text-xs uppercase tracking-widest mb-1">Nova coleção</p>
            <h3 className="text-white text-2xl font-black mb-3">Tênis em Destaque</h3>
            <Link
              href="/produtos?categoria=tenis"
              className="inline-flex items-center gap-2 text-white text-sm font-medium group/link"
            >
              Explorar
              <ArrowRight
                size={16}
                className="group-hover/link:translate-x-1 transition-transform"
              />
            </Link>
          </div>
        </motion.div>

        {/* Banner 2 */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden bg-zinc-100 aspect-[16/9] group"
        >
          <Image
            src="https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&q=80"
            alt="Feminino"
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/70 to-transparent" />
          <div className="absolute inset-0 p-8 flex flex-col justify-end">
            <p className="text-white/70 text-xs uppercase tracking-widest mb-1">Até 40% off</p>
            <h3 className="text-white text-2xl font-black mb-3">Feminino em Promoção</h3>
            <Link
              href="/produtos?categoria=feminino&promocao=true"
              className="inline-flex items-center gap-2 text-white text-sm font-medium group/link"
            >
              Ver promoções
              <ArrowRight
                size={16}
                className="group-hover/link:translate-x-1 transition-transform"
              />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
