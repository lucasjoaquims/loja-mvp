"use client";
// src/app/(store)/produtos/page.tsx
import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ProdutoCard from "@/components/produto/ProdutoCard";
import ProdutoCardSkeleton from "@/components/produto/ProdutoCardSkeleton";
import type { Product } from "@/types";

const TAMANHOS = ["PP", "P", "M", "G", "GG", "XG"];
const CORES = ["Preto", "Branco", "Cinza", "Azul", "Verde", "Bege", "Marrom", "Vinho"];
const ORDENAR_OPTIONS = [
  { value: "relevancia", label: "Relevância" },
  { value: "mais_vendidos", label: "Mais vendidos" },
  { value: "novidades", label: "Novidades" },
  { value: "preco_asc", label: "Menor preço" },
  { value: "preco_desc", label: "Maior preço" },
];

interface Filters {
  tamanho: string;
  cor: string;
  precoMin: string;
  precoMax: string;
  promocao: boolean;
  novidades: boolean;
  ordenar: string;
}

export default function ProdutosPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [produtos, setProdutos] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    tamanho: "",
    cor: "",
    precoMin: "",
    precoMax: "",
    promocao: searchParams.get("promocao") === "true",
    novidades: searchParams.get("novidades") === "true",
    ordenar: searchParams.get("ordenar") ?? "relevancia",
  });

  const categoria = searchParams.get("categoria");
  const busca = searchParams.get("busca");

  const fetchProdutos = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (categoria) params.set("categoria", categoria);
      if (busca) params.set("busca", busca);
      if (filters.tamanho) params.set("tamanho", filters.tamanho);
      if (filters.cor) params.set("cor", filters.cor);
      if (filters.precoMin) params.set("precoMin", filters.precoMin);
      if (filters.precoMax) params.set("precoMax", filters.precoMax);
      if (filters.promocao) params.set("promocao", "true");
      if (filters.novidades) params.set("novidades", "true");
      params.set("ordenar", filters.ordenar);
      params.set("porPagina", "24");

      const res = await fetch(`/api/produtos?${params}`);
      const data = await res.json();
      setProdutos(data.data ?? []);
      setTotal(data.total ?? 0);
    } catch {
      setProdutos([]);
    } finally {
      setLoading(false);
    }
  }, [categoria, busca, filters]);

  useEffect(() => {
    fetchProdutos();
  }, [fetchProdutos]);

  const tituloCategoria: Record<string, string> = {
    camisetas: "Camisetas",
    calcas: "Calças",
    moletons: "Moletons",
    tenis: "Tênis",
    acessorios: "Acessórios",
    feminino: "Feminino",
  };

  const titulo = busca
    ? `Resultados para "${busca}"`
    : categoria
    ? tituloCategoria[categoria] ?? "Produtos"
    : filters.promocao
    ? "Promoções"
    : "Todos os Produtos";

  const activeFiltersCount = [
    filters.tamanho,
    filters.cor,
    filters.precoMin,
    filters.precoMax,
    filters.promocao,
    filters.novidades,
  ].filter(Boolean).length;

  const clearFilters = () =>
    setFilters({ tamanho: "", cor: "", precoMin: "", precoMax: "", promocao: false, novidades: false, ordenar: "relevancia" });

  return (
    <div className="container-loja py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight mb-1">{titulo}</h1>
        <p className="text-sm text-zinc-500">{total} produtos encontrados</p>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-zinc-100">
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="flex items-center gap-2 text-sm font-medium text-zinc-700 hover:text-zinc-900 transition-colors"
        >
          <SlidersHorizontal size={16} />
          Filtros
          {activeFiltersCount > 0 && (
            <span className="w-5 h-5 bg-zinc-900 text-white rounded-full text-xs flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>

        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-500 hidden sm:block">Ordenar por:</span>
          <select
            value={filters.ordenar}
            onChange={(e) => setFilters((f) => ({ ...f, ordenar: e.target.value }))}
            className="text-sm border border-zinc-200 rounded-lg px-3 py-2 outline-none focus:border-zinc-400"
          >
            {ORDENAR_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Filtros expandidos */}
      <AnimatePresence>
        {filtersOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {/* Tamanho */}
                <div>
                  <p className="text-xs uppercase tracking-widest text-zinc-500 mb-3">Tamanho</p>
                  <div className="flex flex-wrap gap-2">
                    {TAMANHOS.map((t) => (
                      <button
                        key={t}
                        onClick={() => setFilters((f) => ({ ...f, tamanho: f.tamanho === t ? "" : t }))}
                        className={`px-3 py-1.5 text-xs font-medium border transition-colors ${
                          filters.tamanho === t
                            ? "bg-zinc-900 text-white border-zinc-900"
                            : "border-zinc-300 text-zinc-600 hover:border-zinc-600"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cor */}
                <div>
                  <p className="text-xs uppercase tracking-widest text-zinc-500 mb-3">Cor</p>
                  <div className="flex flex-wrap gap-2">
                    {CORES.map((c) => (
                      <button
                        key={c}
                        onClick={() => setFilters((f) => ({ ...f, cor: f.cor === c ? "" : c }))}
                        className={`px-3 py-1.5 text-xs font-medium border transition-colors ${
                          filters.cor === c
                            ? "bg-zinc-900 text-white border-zinc-900"
                            : "border-zinc-300 text-zinc-600 hover:border-zinc-600"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preço */}
                <div>
                  <p className="text-xs uppercase tracking-widest text-zinc-500 mb-3">Preço</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Mín"
                      value={filters.precoMin}
                      onChange={(e) => setFilters((f) => ({ ...f, precoMin: e.target.value }))}
                      className="w-20 text-sm border border-zinc-300 rounded px-2 py-1.5 outline-none focus:border-zinc-600"
                    />
                    <span className="text-zinc-400">—</span>
                    <input
                      type="number"
                      placeholder="Máx"
                      value={filters.precoMax}
                      onChange={(e) => setFilters((f) => ({ ...f, precoMax: e.target.value }))}
                      className="w-20 text-sm border border-zinc-300 rounded px-2 py-1.5 outline-none focus:border-zinc-600"
                    />
                  </div>
                </div>

                {/* Outros */}
                <div>
                  <p className="text-xs uppercase tracking-widest text-zinc-500 mb-3">Filtros</p>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.promocao}
                        onChange={(e) => setFilters((f) => ({ ...f, promocao: e.target.checked }))}
                        className="rounded"
                      />
                      <span className="text-sm text-zinc-700">Em promoção</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.novidades}
                        onChange={(e) => setFilters((f) => ({ ...f, novidades: e.target.checked }))}
                        className="rounded"
                      />
                      <span className="text-sm text-zinc-700">Novidades</span>
                    </label>
                  </div>
                </div>
              </div>

              {activeFiltersCount > 0 && (
                <div className="mt-4 pt-4 border-t border-zinc-200 flex justify-end">
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
                  >
                    <X size={14} />
                    Limpar filtros
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <ProdutoCardSkeleton key={i} />
          ))}
        </div>
      ) : produtos.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🔍</p>
          <h3 className="text-xl font-bold mb-2">Nenhum produto encontrado</h3>
          <p className="text-zinc-500 mb-6">Tente ajustar os filtros ou buscar outro termo.</p>
          <button onClick={clearFilters} className="btn-secondary">
            Limpar filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {produtos.map((produto, i) => (
            <ProdutoCard key={produto.id} produto={produto} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
