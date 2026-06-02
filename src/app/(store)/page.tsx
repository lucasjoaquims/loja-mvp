// src/app/(store)/page.tsx
import HeroSection from "@/components/home/HeroSection";
import CategoriasSection from "@/components/home/CategoriasSection";
import ProdutosDestaque from "@/components/home/ProdutosDestaque";
import BannerPromocional from "@/components/home/BannerPromocional";
import MaisVendidos from "@/components/home/MaisVendidos";
import Depoimentos from "@/components/home/Depoimentos";
import BannerDesconto from "@/components/home/BannerDesconto";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Loja MVP — Moda Premium | Camisetas, Calças, Moletons e Tênis",
  description:
    "Descubra a nova coleção Loja MVP. Streetwear premium, roupas masculinas e femininas com qualidade excepcional e entrega rápida.",
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CategoriasSection />
      <ProdutosDestaque />
      <BannerDesconto />
      <MaisVendidos />
      <BannerPromocional />
      <Depoimentos />
    </>
  );
}
