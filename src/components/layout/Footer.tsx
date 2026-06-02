"use client";
// src/components/layout/Footer.tsx
import Link from "next/link";
import { useState } from "react";
import { Instagram, Youtube, Twitter, Mail, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    toast.success("Cadastrado com sucesso! Você receberá nossas novidades.");
    setEmail("");
    setLoading(false);
  };

  return (
    <footer className="bg-zinc-950 text-zinc-400">
      {/* Newsletter */}
      <div className="border-b border-zinc-800">
        <div className="container-loja py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-white text-xl font-bold tracking-wide mb-1">
                Fique por dentro das novidades
              </h3>
              <p className="text-sm">
                Cadastre-se e ganhe 10% de desconto na primeira compra.
              </p>
            </div>
            <form onSubmit={handleNewsletter} className="flex gap-0 w-full md:w-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Seu melhor e-mail"
                required
                className="bg-zinc-800 text-white placeholder:text-zinc-500 px-4 py-3 text-sm outline-none flex-1 md:w-72 border border-zinc-700 focus:border-zinc-500 transition-colors"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-white text-zinc-900 px-6 py-3 text-sm font-semibold uppercase tracking-wide hover:bg-zinc-100 transition-colors disabled:opacity-70 whitespace-nowrap"
              >
                {loading ? "..." : "Quero desconto"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="container-loja py-14 grid grid-cols-2 md:grid-cols-4 gap-10">
        {/* Brand */}
        <div className="col-span-2 md:col-span-1">
          <Link href="/" className="text-white text-xl font-bold tracking-[0.2em] uppercase block mb-4">
            LOJA MVP
          </Link>
          <p className="text-sm leading-relaxed mb-6">
            Moda premium com identidade. Cada peça conta uma história.
          </p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition-colors" aria-label="Instagram">
              <Instagram size={18} />
            </a>
            <a href="#" className="hover:text-white transition-colors" aria-label="Youtube">
              <Youtube size={18} />
            </a>
            <a href="#" className="hover:text-white transition-colors" aria-label="Twitter">
              <Twitter size={18} />
            </a>
          </div>
        </div>

        {/* Loja */}
        <div>
          <h4 className="text-white text-xs uppercase tracking-widest font-semibold mb-5">Loja</h4>
          <ul className="space-y-3 text-sm">
            {[
              { label: "Novidades", href: "/produtos?novidades=true" },
              { label: "Promoções", href: "/produtos?promocao=true" },
              { label: "Camisetas", href: "/produtos?categoria=camisetas" },
              { label: "Calças", href: "/produtos?categoria=calcas" },
              { label: "Moletons", href: "/produtos?categoria=moletons" },
              { label: "Feminino", href: "/produtos?categoria=feminino" },
            ].map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-white transition-colors link-hover">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Ajuda */}
        <div>
          <h4 className="text-white text-xs uppercase tracking-widest font-semibold mb-5">Ajuda</h4>
          <ul className="space-y-3 text-sm">
            {[
              { label: "Central de Atendimento", href: "#" },
              { label: "Política de Trocas", href: "#" },
              { label: "Prazo de Entrega", href: "#" },
              { label: "Rastrear Pedido", href: "/conta/pedidos" },
              { label: "Guia de Tamanhos", href: "#" },
            ].map((item) => (
              <li key={item.label}>
                <Link href={item.href} className="hover:text-white transition-colors link-hover">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contato */}
        <div>
          <h4 className="text-white text-xs uppercase tracking-widest font-semibold mb-5">Contato</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <Mail size={15} className="mt-0.5 shrink-0" />
              <span>contato@lojamvp.com.br</span>
            </li>
            <li className="flex items-start gap-2">
              <Phone size={15} className="mt-0.5 shrink-0" />
              <span>(11) 9 9999-9999</span>
            </li>
            <li className="flex items-start gap-2">
              <MapPin size={15} className="mt-0.5 shrink-0" />
              <span>Atendimento seg–sex, 9h às 18h</span>
            </li>
          </ul>

          <div className="mt-6">
            <p className="text-xs text-zinc-600 mb-2 uppercase tracking-wider">Pagamentos aceitos</p>
            <div className="flex gap-2 flex-wrap">
              {["PIX", "Visa", "Master", "Boleto"].map((p) => (
                <span
                  key={p}
                  className="px-2 py-1 bg-zinc-800 rounded text-xs text-zinc-300 border border-zinc-700"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-zinc-800">
        <div className="container-loja py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-600">
          <p>© {new Date().getFullYear()} Loja MVP. Todos os direitos reservados.</p>
          <div className="flex gap-5">
            <Link href="#" className="hover:text-zinc-400 transition-colors">Privacidade</Link>
            <Link href="#" className="hover:text-zinc-400 transition-colors">Termos de uso</Link>
            <Link href="#" className="hover:text-zinc-400 transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
