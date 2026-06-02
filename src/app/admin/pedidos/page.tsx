"use client";
// src/app/admin/pedidos/page.tsx
import { useState, useEffect, useCallback } from "react";
import { Search, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { formatPrice, formatDateTime, labelOrderStatus, colorOrderStatus } from "@/utils";

const STATUS_OPTIONS = [
  { value: "", label: "Todos" },
  { value: "PENDING", label: "Pendente" },
  { value: "PAID", label: "Pago" },
  { value: "SHIPPED", label: "Enviado" },
  { value: "DELIVERED", label: "Entregue" },
  { value: "CANCELLED", label: "Cancelado" },
];

interface Pedido {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  user: { name?: string | null; email: string };
  items: { name: string; quantity: number }[];
  payment?: { method: string; mpStatus?: string | null };
}

export default function AdminPedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [busca, setBusca] = useState("");
  const [pagina, setPagina] = useState(1);

  const fetchPedidos = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (busca) params.set("busca", busca);
    params.set("pagina", pagina.toString());

    const res = await fetch(`/api/admin/pedidos?${params}`);
    const data = await res.json();
    setPedidos(data.data ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, [statusFilter, busca, pagina]);

  useEffect(() => { fetchPedidos(); }, [fetchPedidos]);

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/admin/pedidos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      if (!res.ok) throw new Error();
      toast.success("Status atualizado!");
      fetchPedidos();
    } catch {
      toast.error("Erro ao atualizar status");
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black">Pedidos</h1>
        <p className="text-zinc-500 text-sm">{total} pedidos no total</p>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-3 text-zinc-400" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por ID ou cliente..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-zinc-300 rounded-xl outline-none focus:border-zinc-600"
          />
        </div>
        <div className="flex gap-2">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s.value}
              onClick={() => { setStatusFilter(s.value); setPagina(1); }}
              className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                statusFilter === s.value
                  ? "bg-zinc-900 text-white"
                  : "bg-white border border-zinc-300 text-zinc-600 hover:border-zinc-600"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <button
          onClick={fetchPedidos}
          className="p-2.5 border border-zinc-300 rounded-xl hover:bg-zinc-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin text-zinc-400" : "text-zinc-600"} />
        </button>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-50">
              <tr>
                {["Pedido", "Cliente", "Itens", "Pagamento", "Status", "Total", "Data", "Ação"].map((h) => (
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
                        <td key={j} className="px-4 py-4">
                          <div className="skeleton h-4 rounded w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                : pedidos.map((pedido) => (
                    <tr key={pedido.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="px-4 py-4">
                        <span className="font-mono text-sm font-semibold text-zinc-700">
                          #{pedido.id.slice(-8).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm font-medium">{pedido.user.name ?? "—"}</p>
                        <p className="text-xs text-zinc-400">{pedido.user.email}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-xs text-zinc-600">
                          {pedido.items.length} item(s)
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-xs text-zinc-500">
                          {pedido.payment?.method ?? "—"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${colorOrderStatus(pedido.status)}`}>
                          {labelOrderStatus(pedido.status)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-bold">{formatPrice(pedido.total)}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-xs text-zinc-500 whitespace-nowrap">
                          {formatDateTime(pedido.createdAt)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <select
                          value={pedido.status}
                          onChange={(e) => updateStatus(pedido.id, e.target.value)}
                          className="text-xs border border-zinc-300 rounded-lg px-2 py-1.5 outline-none focus:border-zinc-600 cursor-pointer"
                        >
                          {STATUS_OPTIONS.filter((s) => s.value).map((s) => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {total > 20 && (
          <div className="px-6 py-4 border-t border-zinc-100 flex items-center justify-between">
            <p className="text-sm text-zinc-500">
              Mostrando {(pagina - 1) * 20 + 1}–{Math.min(pagina * 20, total)} de {total}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPagina((p) => Math.max(1, p - 1))}
                disabled={pagina === 1}
                className="px-3 py-1.5 text-sm border border-zinc-300 rounded-lg disabled:opacity-40 hover:bg-zinc-50"
              >
                Anterior
              </button>
              <button
                onClick={() => setPagina((p) => p + 1)}
                disabled={pagina * 20 >= total}
                className="px-3 py-1.5 text-sm border border-zinc-300 rounded-lg disabled:opacity-40 hover:bg-zinc-50"
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
