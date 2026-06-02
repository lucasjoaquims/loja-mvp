"use client";
// src/app/admin/page.tsx
import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from "recharts";
import {
  DollarSign, ShoppingBag, Users, Package,
  TrendingUp, Clock, AlertCircle
} from "lucide-react";
import { formatPrice, formatDateTime, labelOrderStatus, colorOrderStatus } from "@/utils";

interface DashboardData {
  metrics: {
    totalVendas: number;
    totalPedidos: number;
    totalClientes: number;
    totalProdutos: number;
    vendasHoje: number;
    pedidosHoje: number;
    pedidosPendentes: number;
    ticketMedio: number;
  };
  pedidosRecentes: Array<{
    id: string;
    total: number;
    status: string;
    createdAt: string;
    user: { name?: string; email: string };
  }>;
  produtosMaisVendidos: Array<{
    id: string;
    name: string;
    sold: number;
    price: number;
    stock: number;
    images: string[];
  }>;
  chartData: Array<{ data: string; valor: number }>;
}

function MetricCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: typeof DollarSign;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-zinc-100">
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm text-zinc-500 font-medium">{label}</p>
        <div className={`p-2 rounded-xl ${color}`}>
          <Icon size={18} />
        </div>
      </div>
      <p className="text-2xl font-black text-zinc-900">{value}</p>
      {sub && <p className="text-xs text-zinc-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton h-28 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;
  const { metrics, pedidosRecentes, produtosMaisVendidos, chartData } = data;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-zinc-900">Dashboard</h1>
        <p className="text-zinc-500 text-sm">Visão geral da sua loja</p>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          label="Total vendido"
          value={formatPrice(metrics.totalVendas)}
          sub={`Hoje: ${formatPrice(metrics.vendasHoje)}`}
          icon={DollarSign}
          color="bg-green-100 text-green-700"
        />
        <MetricCard
          label="Pedidos"
          value={metrics.totalPedidos.toString()}
          sub={`Hoje: ${metrics.pedidosHoje} novos`}
          icon={ShoppingBag}
          color="bg-blue-100 text-blue-700"
        />
        <MetricCard
          label="Clientes"
          value={metrics.totalClientes.toString()}
          icon={Users}
          color="bg-purple-100 text-purple-700"
        />
        <MetricCard
          label="Produtos ativos"
          value={metrics.totalProdutos.toString()}
          icon={Package}
          color="bg-amber-100 text-amber-700"
        />
        <MetricCard
          label="Ticket médio"
          value={formatPrice(metrics.ticketMedio)}
          icon={TrendingUp}
          color="bg-zinc-100 text-zinc-700"
        />
        <MetricCard
          label="Pedidos pendentes"
          value={metrics.pedidosPendentes.toString()}
          sub="Aguardando pagamento"
          icon={Clock}
          color="bg-yellow-100 text-yellow-700"
        />
      </div>

      {/* Gráfico + Top Produtos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Gráfico de vendas */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-zinc-100">
          <h2 className="font-bold text-zinc-900 mb-5">Vendas — Últimos 7 dias</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
              <XAxis dataKey="data" tick={{ fontSize: 12, fill: "#a1a1aa" }} />
              <YAxis
                tick={{ fontSize: 11, fill: "#a1a1aa" }}
                tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(v: number) => formatPrice(v)}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #f4f4f5",
                  fontSize: "13px",
                }}
              />
              <Bar dataKey="valor" fill="#09090b" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Mais vendidos */}
        <div className="bg-white rounded-2xl p-6 border border-zinc-100">
          <h2 className="font-bold text-zinc-900 mb-4">Mais vendidos</h2>
          <div className="space-y-3">
            {produtosMaisVendidos.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="text-xs font-bold text-zinc-400 w-4">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.name}</p>
                  <p className="text-xs text-zinc-400">{p.sold} vendidos • {p.stock} em estoque</p>
                </div>
                <span className="text-xs font-semibold text-zinc-600 shrink-0">
                  {formatPrice(p.price)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pedidos recentes */}
      <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
          <h2 className="font-bold text-zinc-900">Pedidos recentes</h2>
          <a href="/admin/pedidos" className="text-xs text-zinc-500 hover:text-zinc-800 transition-colors">
            Ver todos →
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-100">
                <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Pedido</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {pedidosRecentes.map((pedido) => (
                <tr key={pedido.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono font-semibold text-zinc-700">
                      #{pedido.id.slice(-8).toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium">{pedido.user.name ?? "—"}</p>
                      <p className="text-xs text-zinc-400">{pedido.user.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${colorOrderStatus(pedido.status)}`}>
                      {labelOrderStatus(pedido.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold">{formatPrice(pedido.total)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-zinc-500">{formatDateTime(pedido.createdAt)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
