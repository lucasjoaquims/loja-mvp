"use client";
// src/components/layout/Navbar.tsx
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Search,
  Heart,
  User,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Package,
  Settings,
  LayoutDashboard,
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { motion, AnimatePresence } from "framer-motion";

const categorias = [
  { label: "Camisetas", href: "/produtos?categoria=camisetas" },
  { label: "Calças", href: "/produtos?categoria=calcas" },
  { label: "Moletons", href: "/produtos?categoria=moletons" },
  { label: "Tênis", href: "/produtos?categoria=tenis" },
  { label: "Acessórios", href: "/produtos?categoria=acessorios" },
  { label: "Feminino", href: "/produtos?categoria=feminino" },
];

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const getItemCount = useCartStore((s) => s.getItemCount);
  const [itemCount, setItemCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [busca, setBusca] = useState("");
  const [buscaOpen, setBuscaOpen] = useState(false);

  useEffect(() => {
    setItemCount(getItemCount());
  }, [getItemCount]);

  useEffect(() => {
    const unsubscribe = useCartStore.subscribe(() => {
      setItemCount(useCartStore.getState().getItemCount());
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleBusca = (e: React.FormEvent) => {
    e.preventDefault();
    if (busca.trim()) {
      router.push(`/produtos?busca=${encodeURIComponent(busca.trim())}`);
      setBusca("");
      setBuscaOpen(false);
    }
  };

  return (
    <>
      {/* Barra de anúncio */}
      <div className="bg-zinc-900 text-white text-xs text-center py-2 tracking-widest">
        FRETE GRÁTIS NAS COMPRAS ACIMA DE R$ 299 • USE O CUPOM{" "}
        <span className="font-bold">BEMVINDO10</span> E GANHE 10% OFF
      </div>

      {/* Navbar principal */}
      <header
        className={`sticky top-0 z-50 bg-white transition-shadow duration-300 ${
          scrolled ? "shadow-md" : "border-b border-zinc-100"
        }`}
      >
        <div className="container-loja">
          <div className="flex items-center justify-between h-16">
            {/* Menu mobile */}
            <button
              className="lg:hidden p-2 -ml-2"
              onClick={() => setMobileOpen(true)}
              aria-label="Menu"
            >
              <Menu size={22} />
            </button>

            {/* Logo */}
            <Link
              href="/"
              className="text-xl font-bold tracking-[0.2em] uppercase text-zinc-900"
            >
              LOJA MVP
            </Link>

            {/* Nav desktop */}
            <nav className="hidden lg:flex items-center gap-8">
              {categorias.map((cat) => (
                <Link
                  key={cat.href}
                  href={cat.href}
                  className="text-sm font-medium text-zinc-600 hover:text-zinc-900 tracking-wide uppercase link-hover transition-colors"
                >
                  {cat.label}
                </Link>
              ))}
              <Link
                href="/produtos?promocao=true"
                className="text-sm font-medium text-red-600 hover:text-red-700 tracking-wide uppercase link-hover"
              >
                Promoções
              </Link>
            </nav>

            {/* Ações direita */}
            <div className="flex items-center gap-3">
              {/* Busca */}
              <button
                onClick={() => setBuscaOpen(true)}
                className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
                aria-label="Buscar"
              >
                <Search size={20} />
              </button>

              {/* Favoritos */}
              {session && (
                <Link
                  href="/favoritos"
                  className="p-2 hover:bg-zinc-100 rounded-full transition-colors hidden sm:block"
                  aria-label="Favoritos"
                >
                  <Heart size={20} />
                </Link>
              )}

              {/* Usuário */}
              <div className="relative">
                {session ? (
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-1 p-2 hover:bg-zinc-100 rounded-full transition-colors"
                  >
                    <User size={20} />
                    <ChevronDown size={14} />
                  </button>
                ) : (
                  <Link
                    href="/auth/login"
                    className="flex items-center gap-1 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
                  >
                    <User size={20} />
                    <span className="hidden sm:block">Entrar</span>
                  </Link>
                )}

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-52 bg-white border border-zinc-200 shadow-xl rounded-lg overflow-hidden z-50"
                      onMouseLeave={() => setUserMenuOpen(false)}
                    >
                      <div className="px-4 py-3 border-b border-zinc-100">
                        <p className="text-sm font-semibold truncate">{session?.user?.name}</p>
                        <p className="text-xs text-zinc-500 truncate">{session?.user?.email}</p>
                      </div>

                      <div className="py-1">
                        <Link
                          href="/conta"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <User size={16} />
                          Minha conta
                        </Link>
                        <Link
                          href="/conta/pedidos"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Package size={16} />
                          Meus pedidos
                        </Link>
                        <Link
                          href="/favoritos"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Heart size={16} />
                          Favoritos
                        </Link>

                        {session?.user?.role === "ADMIN" && (
                          <>
                            <div className="my-1 border-t border-zinc-100" />
                            <Link
                              href="/admin"
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              <LayoutDashboard size={16} />
                              Painel Admin
                            </Link>
                          </>
                        )}

                        <div className="my-1 border-t border-zinc-100" />
                        <button
                          onClick={() => signOut({ callbackUrl: "/" })}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut size={16} />
                          Sair
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Carrinho */}
              <Link
                href="/carrinho"
                className="relative p-2 hover:bg-zinc-100 rounded-full transition-colors"
                aria-label="Carrinho"
              >
                <ShoppingBag size={20} />
                {itemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-zinc-900 text-white text-xs rounded-full flex items-center justify-center font-bold"
                  >
                    {itemCount > 9 ? "9+" : itemCount}
                  </motion.span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Modal de busca */}
      <AnimatePresence>
        {buscaOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20"
            onClick={(e) => e.target === e.currentTarget && setBuscaOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.96 }}
              className="bg-white w-full max-w-2xl mx-4 rounded-2xl shadow-2xl overflow-hidden"
            >
              <form onSubmit={handleBusca} className="flex items-center">
                <Search size={20} className="ml-5 text-zinc-400 shrink-0" />
                <input
                  autoFocus
                  type="text"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar produtos, categorias..."
                  className="flex-1 px-4 py-5 text-lg outline-none placeholder:text-zinc-400"
                />
                <button
                  type="button"
                  onClick={() => setBuscaOpen(false)}
                  className="p-4 text-zinc-400 hover:text-zinc-700"
                >
                  <X size={20} />
                </button>
              </form>

              <div className="border-t border-zinc-100 px-5 py-4">
                <p className="text-xs text-zinc-500 mb-3 uppercase tracking-wider">Sugestões</p>
                <div className="flex flex-wrap gap-2">
                  {["Camiseta Oversized", "Moletom Hoodie", "Calça Jeans", "Tênis Runner"].map(
                    (s) => (
                      <button
                        key={s}
                        onClick={() => {
                          setBusca(s);
                          router.push(`/produtos?busca=${encodeURIComponent(s)}`);
                          setBuscaOpen(false);
                        }}
                        className="px-3 py-1.5 text-sm bg-zinc-100 hover:bg-zinc-200 rounded-full text-zinc-700 transition-colors"
                      >
                        {s}
                      </button>
                    )
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Menu mobile */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="absolute inset-y-0 left-0 w-72 bg-white shadow-xl overflow-y-auto"
            >
              <div className="flex items-center justify-between p-5 border-b">
                <span className="font-bold tracking-widest uppercase">LOJA MVP</span>
                <button onClick={() => setMobileOpen(false)}>
                  <X size={22} />
                </button>
              </div>

              <nav className="p-5">
                <p className="text-xs text-zinc-400 uppercase tracking-widest mb-3">Categorias</p>
                {categorias.map((cat) => (
                  <Link
                    key={cat.href}
                    href={cat.href}
                    className="block py-3 text-sm font-medium text-zinc-800 border-b border-zinc-100 hover:text-zinc-500 transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    {cat.label}
                  </Link>
                ))}
                <Link
                  href="/produtos?promocao=true"
                  className="block py-3 text-sm font-medium text-red-600 border-b border-zinc-100"
                  onClick={() => setMobileOpen(false)}
                >
                  🔥 Promoções
                </Link>

                <div className="mt-6">
                  {session ? (
                    <>
                      <Link
                        href="/conta"
                        className="block py-3 text-sm text-zinc-700"
                        onClick={() => setMobileOpen(false)}
                      >
                        Minha conta
                      </Link>
                      <Link
                        href="/favoritos"
                        className="block py-3 text-sm text-zinc-700"
                        onClick={() => setMobileOpen(false)}
                      >
                        Favoritos
                      </Link>
                      <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="block py-3 text-sm text-red-600 w-full text-left"
                      >
                        Sair
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/auth/login"
                      className="btn-primary w-full text-center"
                      onClick={() => setMobileOpen(false)}
                    >
                      Entrar / Cadastrar
                    </Link>
                  )}
                </div>
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
