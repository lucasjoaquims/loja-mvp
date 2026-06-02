"use client";
// src/components/home/HeroSection.tsx
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    id: 1,
    title: "Nova Coleção",
    subtitle: "Outono / Inverno 2025",
    description: "Peças que definem quem você é. Qualidade premium, estilo autêntico.",
    cta: "Ver Coleção",
    href: "/produtos?novidades=true",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1400&q=90",
    badge: "Novo",
    badgeColor: "bg-white text-zinc-900",
  },
  {
    id: 2,
    title: "Streetwear",
    subtitle: "Para quem manda",
    description: "Hoodies, camisetas oversized e calças cargo com identidade única.",
    cta: "Explorar",
    href: "/produtos?categoria=moletons",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1400&q=90",
    badge: "Destaque",
    badgeColor: "bg-zinc-900 text-white",
  },
  {
    id: 3,
    title: "Feminino",
    subtitle: "Poder e elegância",
    description: "Coleção exclusiva para mulheres que não precisam de aprovação.",
    cta: "Descobrir",
    href: "/produtos?categoria=feminino",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1400&q=90",
    badge: "Exclusivo",
    badgeColor: "bg-red-600 text-white",
  },
];

export default function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  const goTo = (index: number) => {
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
  };

  const prev = () => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const next = () => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const slide = slides[current];

  return (
    <section className="relative h-[70vh] min-h-[520px] overflow-hidden bg-zinc-950">
      {/* Imagem de fundo */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={slide.id}
          custom={direction}
          initial={{ opacity: 0, x: direction * 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -60 }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="absolute inset-0"
        >
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          {/* Overlay gradiente */}
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/80 via-zinc-950/40 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Conteúdo */}
      <div className="relative h-full container-loja flex items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id + "-text"}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="max-w-lg"
          >
            <span
              className={`inline-block px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-full mb-4 ${slide.badgeColor}`}
            >
              {slide.badge}
            </span>

            <h1 className="text-white text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-none mb-2">
              {slide.title}
            </h1>
            <p className="text-zinc-300 text-xl md:text-2xl font-light mb-4">
              {slide.subtitle}
            </p>
            <p className="text-zinc-400 text-sm md:text-base mb-8 leading-relaxed">
              {slide.description}
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href={slide.href}
                className="inline-flex items-center gap-2 bg-white text-zinc-900 px-7 py-3.5 text-sm font-bold uppercase tracking-wide hover:bg-zinc-100 transition-colors group"
              >
                {slide.cta}
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/produtos?promocao=true"
                className="inline-flex items-center gap-2 border border-white/40 text-white px-7 py-3.5 text-sm font-medium uppercase tracking-wide hover:bg-white/10 transition-colors"
              >
                Ver promoções
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controles */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors flex items-center justify-center rounded-full"
        aria-label="Anterior"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors flex items-center justify-center rounded-full"
        aria-label="Próximo"
      >
        <ChevronRight size={20} />
      </button>

      {/* Indicadores */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`transition-all duration-300 rounded-full ${
              i === current ? "w-8 h-2 bg-white" : "w-2 h-2 bg-white/40"
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
