// src/app/api/admin/dashboard/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const [
      totalPedidos,
      totalClientes,
      totalProdutos,
      pedidosPendentes,
      pedidosHoje,
      vendas,
      vendasHoje,
      pedidosRecentes,
      produtosMaisVendidos,
      vendasPorDia,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.user.count({ where: { role: "USER" } }),
      prisma.product.count({ where: { active: true } }),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.count({ where: { createdAt: { gte: hoje } } }),

      // Total vendido (pedidos pagos)
      prisma.order.aggregate({
        where: { status: { in: ["PAID", "SHIPPED", "DELIVERED"] } },
        _sum: { total: true },
      }),

      // Vendas hoje
      prisma.order.aggregate({
        where: {
          status: { in: ["PAID", "SHIPPED", "DELIVERED"] },
          createdAt: { gte: hoje },
        },
        _sum: { total: true },
      }),

      // Pedidos recentes
      prisma.order.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          items: { take: 1 },
        },
      }),

      // Produtos mais vendidos
      prisma.product.findMany({
        where: { active: true },
        orderBy: { sold: "desc" },
        take: 5,
        select: { id: true, name: true, sold: true, price: true, images: true, stock: true },
      }),

      // Vendas por dia (últimos 7 dias) - sqlite simplificado
      prisma.order.findMany({
        where: {
          status: { in: ["PAID", "SHIPPED", "DELIVERED"] },
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
        select: { createdAt: true, total: true },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    // Agrupa vendas por dia
    const vendasPorDiaMap: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const key = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
      vendasPorDiaMap[key] = 0;
    }
    vendasPorDia.forEach((p) => {
      const key = new Date(p.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
      if (key in vendasPorDiaMap) vendasPorDiaMap[key] += p.total;
    });

    const chartData = Object.entries(vendasPorDiaMap).map(([data, valor]) => ({ data, valor }));

    const ticketMedio =
      totalPedidos > 0 ? (vendas._sum.total ?? 0) / totalPedidos : 0;

    return NextResponse.json({
      metrics: {
        totalVendas: vendas._sum.total ?? 0,
        totalPedidos,
        totalClientes,
        totalProdutos,
        vendasHoje: vendasHoje._sum.total ?? 0,
        pedidosHoje,
        pedidosPendentes,
        ticketMedio,
      },
      pedidosRecentes,
      produtosMaisVendidos: produtosMaisVendidos.map((p) => ({
        ...p,
        images: JSON.parse(p.images),
      })),
      chartData,
    });
  } catch (error) {
    console.error("[ADMIN DASHBOARD]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
