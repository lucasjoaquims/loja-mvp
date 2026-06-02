"use client";
// src/app/admin/produtos/page.tsx
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Plus, Search, Edit, Trash2, Check, X } from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/utils";
import type { Product, Category } from "@/types";

export default function AdminProdutosPage() {
  const [produtos, setProdutos] = useState<Product[]>([]);
  const [categorias, setCategorias] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Product | null>(null);
  const [form, setForm] = useState({
    name: "", description: "", price: "", originalPrice: "",
    sku: "", stock: "", categoryId: "", featured: false, isNew: false, active: true,
  });

  const fetchProdutos = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (busca) params.set("busca", busca);
    const res = await fetch(`/api/admin/produtos?${params}`);
    const data = await res.json();
    setProdutos(data.data ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, [busca]);

  useEffect(() => { fetchProdutos(); }, [fetchProdutos]);

  useEffect(() => {
    fetch("/api/admin/categorias").then((r) => r.json()).then(setCategorias).catch(() => {});
  }, []);

  const openModal = (produto?: Product) => {
    if (produto) {
      setEditando(produto);
      setForm({
        name: produto.name,
        description: produto.description,
        price: produto.price.toString(),
        originalPrice: produto.originalPrice?.toString() ?? "",
        sku: produto.sku,
        stock: produto.stock.toString(),
        categoryId: produto.categoryId,
        featured: produto.featured,
        isNew: produto.isNew,
        active: produto.active,
      });
    } else {
      setEditando(null);
      setForm({ name: "", description: "", price: "", originalPrice: "", sku: "", stock: "0", categoryId: "", featured: false, isNew: false, active: true });
    }
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.price || !form.sku) {
      toast.error("Preencha nome, preço e SKU");
      return;
    }

    const url = editando ? `/api/admin/produtos/${editando.id}` : "/api/admin/produtos";
    const method = editando ? "PUT" : "POST";

    const payload = {
      ...form,
      images: editando?.images ?? ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600"],
      sizes: editando?.sizes ?? ["PP", "P", "M", "G", "GG"],
      colors: editando?.colors ?? [{ name: "Preto", hex: "#0A0A0A" }],
    };

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      toast.success(editando ? "Produto atualizado!" : "Produto criado!");
      setModalOpen(false);
      fetchProdutos();
    } else {
      const err = await res.json();
      toast.error(err.error ?? "Erro ao salvar");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Desativar "${name}"?`)) return;
    const res = await fetch(`/api/admin/produtos/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Produto desativado!");
      fetchProdutos();
    } else {
      toast.error("Erro ao desativar");
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black">Produtos</h1>
          <p className="text-zinc-500 text-sm">{total} produtos cadastrados</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary gap-2 rounded-xl">
          <Plus size={16} />
          Novo produto
        </button>
      </div>

      {/* Busca */}
      <div className="relative mb-6 max-w-sm">
        <Search size={16} className="absolute left-3 top-3 text-zinc-400" />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar produtos..."
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-zinc-300 rounded-xl outline-none focus:border-zinc-600"
        />
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-50 border-b border-zinc-100">
              <tr>
                {["Produto", "SKU", "Categoria", "Preço", "Estoque", "Vendidos", "Status", "Ações"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 8 }).map((_, j) => (
                        <td key={j} className="px-4 py-4"><div className="skeleton h-4 rounded" /></td>
                      ))}
                    </tr>
                  ))
                : produtos.map((produto) => (
                    <tr key={produto.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-12 rounded overflow-hidden bg-zinc-100 flex-shrink-0">
                            {produto.images[0] && (
                              <Image src={produto.images[0]} alt={produto.name} fill className="object-cover" sizes="40px" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-semibold line-clamp-1">{produto.name}</p>
                            <div className="flex gap-1 mt-0.5">
                              {produto.featured && <span className="text-xs bg-amber-100 text-amber-700 px-1.5 rounded">Destaque</span>}
                              {produto.isNew && <span className="text-xs bg-blue-100 text-blue-700 px-1.5 rounded">Novo</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4"><span className="font-mono text-xs text-zinc-500">{produto.sku}</span></td>
                      <td className="px-4 py-4"><span className="text-sm text-zinc-600">{(produto as { category?: { name: string } }).category?.name}</span></td>
                      <td className="px-4 py-4">
                        <p className="text-sm font-bold">{formatPrice(produto.price)}</p>
                        {produto.originalPrice && (
                          <p className="text-xs text-zinc-400 line-through">{formatPrice(produto.originalPrice)}</p>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`text-sm font-semibold ${produto.stock <= 5 ? "text-red-600" : "text-zinc-700"}`}>
                          {produto.stock}
                        </span>
                      </td>
                      <td className="px-4 py-4"><span className="text-sm text-zinc-600">{produto.sold}</span></td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${produto.active ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-500"}`}>
                          {produto.active ? <><Check size={11} /> Ativo</> : <><X size={11} /> Inativo</>}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openModal(produto)}
                            className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(produto.id, produto.name)}
                            className="p-1.5 text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-bold">{editando ? "Editar produto" : "Novo produto"}</h2>
              <button onClick={() => setModalOpen(false)} className="p-1 hover:bg-zinc-100 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-zinc-700 block mb-1">Nome *</label>
                <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full border border-zinc-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-zinc-600" />
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-700 block mb-1">Descrição</label>
                <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3}
                  className="w-full border border-zinc-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-zinc-600 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-zinc-700 block mb-1">Preço *</label>
                  <input type="number" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    className="w-full border border-zinc-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-zinc-600" placeholder="99.90" />
                </div>
                <div>
                  <label className="text-sm font-medium text-zinc-700 block mb-1">Preço original</label>
                  <input type="number" value={form.originalPrice} onChange={(e) => setForm((f) => ({ ...f, originalPrice: e.target.value }))}
                    className="w-full border border-zinc-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-zinc-600" placeholder="129.90" />
                </div>
                <div>
                  <label className="text-sm font-medium text-zinc-700 block mb-1">SKU *</label>
                  <input value={form.sku} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
                    className="w-full border border-zinc-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-zinc-600" />
                </div>
                <div>
                  <label className="text-sm font-medium text-zinc-700 block mb-1">Estoque</label>
                  <input type="number" value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                    className="w-full border border-zinc-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-zinc-600" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-700 block mb-1">Categoria</label>
                <select value={form.categoryId} onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
                  className="w-full border border-zinc-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-zinc-600">
                  <option value="">Selecionar...</option>
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-4">
                {[
                  { key: "featured", label: "Produto em destaque" },
                  { key: "isNew", label: "Marcar como novo" },
                  { key: "active", label: "Produto ativo" },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form[key as keyof typeof form] as boolean}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm text-zinc-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="px-6 py-4 border-t flex gap-3 justify-end">
              <button onClick={() => setModalOpen(false)} className="btn-secondary px-5 py-2.5 rounded-xl text-sm">
                Cancelar
              </button>
              <button onClick={handleSubmit} className="btn-primary px-5 py-2.5 rounded-xl text-sm">
                {editando ? "Salvar alterações" : "Criar produto"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
