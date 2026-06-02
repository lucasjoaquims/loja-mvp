"use client";
// src/app/admin/cupons/page.tsx
import { useState, useEffect } from "react";
import { Plus, Tag, Trash2, X, Toggle } from "lucide-react";
import { toast } from "sonner";
import { formatPrice, formatDate } from "@/utils";
import type { Coupon } from "@/types";

export default function AdminCuponsPage() {
  const [cupons, setCupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    code: "", type: "PERCENTAGE", value: "", minOrder: "",
    maxUses: "", active: true, expiresAt: "",
  });

  const fetchCupons = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/cupons");
    const data = await res.json();
    setCupons(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { fetchCupons(); }, []);

  const handleCreate = async () => {
    if (!form.code || !form.value) {
      toast.error("Código e valor são obrigatórios");
      return;
    }
    const res = await fetch("/api/admin/cupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      toast.success("Cupom criado!");
      setModalOpen(false);
      setForm({ code: "", type: "PERCENTAGE", value: "", minOrder: "", maxUses: "", active: true, expiresAt: "" });
      fetchCupons();
    } else {
      toast.error(data.error ?? "Erro ao criar cupom");
    }
  };

  const toggleActive = async (cupom: Coupon) => {
    const res = await fetch("/api/admin/cupons", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: cupom.id, active: !cupom.active }),
    });
    if (res.ok) {
      toast.success(cupom.active ? "Cupom desativado" : "Cupom ativado");
      fetchCupons();
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Excluir cupom "${code}"?`)) return;
    const res = await fetch("/api/admin/cupons", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) { toast.success("Cupom excluído!"); fetchCupons(); }
    else toast.error("Erro ao excluir");
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black">Cupons</h1>
          <p className="text-zinc-500 text-sm">{cupons.length} cupons cadastrados</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary gap-2 rounded-xl">
          <Plus size={16} />
          Novo cupom
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-40 rounded-2xl" />)
          : cupons.map((cupom) => (
              <div key={cupom.id} className={`bg-white rounded-2xl border p-5 ${cupom.active ? "border-zinc-100" : "border-zinc-100 opacity-60"}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Tag size={16} className="text-zinc-500" />
                    <span className="font-black font-mono text-lg tracking-wider">{cupom.code}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => toggleActive(cupom)} className={`px-2 py-1 text-xs font-semibold rounded-full ${cupom.active ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-500"}`}>
                      {cupom.active ? "Ativo" : "Inativo"}
                    </button>
                    <button onClick={() => handleDelete(cupom.id, cupom.code)} className="p-1 text-zinc-400 hover:text-red-500 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Desconto</span>
                    <span className="font-bold text-green-700">
                      {cupom.type === "PERCENTAGE" ? `${cupom.value}%` : formatPrice(cupom.value)}
                    </span>
                  </div>
                  {cupom.minOrder && (
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Pedido mínimo</span>
                      <span>{formatPrice(cupom.minOrder)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Usos</span>
                    <span>{cupom.usedCount}{cupom.maxUses ? ` / ${cupom.maxUses}` : ""}</span>
                  </div>
                  {cupom.expiresAt && (
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Expira</span>
                      <span className={new Date(cupom.expiresAt) < new Date() ? "text-red-600 font-semibold" : ""}>
                        {formatDate(cupom.expiresAt)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-bold">Novo cupom</h2>
              <button onClick={() => setModalOpen(false)}><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Código *</label>
                <input
                  value={form.code}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                  className="w-full border border-zinc-300 rounded-xl px-3 py-2.5 text-sm uppercase font-mono font-bold outline-none focus:border-zinc-600"
                  placeholder="BEMVINDO10"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Tipo</label>
                  <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                    className="w-full border border-zinc-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-zinc-600">
                    <option value="PERCENTAGE">Porcentagem (%)</option>
                    <option value="FIXED">Valor fixo (R$)</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Valor *</label>
                  <input type="number" value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                    className="w-full border border-zinc-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-zinc-600"
                    placeholder={form.type === "PERCENTAGE" ? "10" : "20"} />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Pedido mínimo</label>
                  <input type="number" value={form.minOrder} onChange={(e) => setForm((f) => ({ ...f, minOrder: e.target.value }))}
                    className="w-full border border-zinc-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-zinc-600" placeholder="100" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Máx. usos</label>
                  <input type="number" value={form.maxUses} onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value }))}
                    className="w-full border border-zinc-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-zinc-600" placeholder="ilimitado" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Data de expiração</label>
                <input type="date" value={form.expiresAt} onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
                  className="w-full border border-zinc-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-zinc-600" />
              </div>
            </div>
            <div className="px-6 py-4 border-t flex gap-3 justify-end">
              <button onClick={() => setModalOpen(false)} className="btn-secondary px-5 py-2.5 rounded-xl text-sm">Cancelar</button>
              <button onClick={handleCreate} className="btn-primary px-5 py-2.5 rounded-xl text-sm">Criar cupom</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
