// src/app/api/admin/pedidos/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

async function checkAdmin() {
  const session = await auth();
  return session?.user?.role === "ADMIN";
}

export async function GET(req: NextRequest) {
  if (!(await checkAdmin())) return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const pagina = parseInt(searchParams.get("pagina") ?? "1");
  const porPagina = parseInt(searchParams.get("porPagina") ?? "20");
  const status = searchParams.get("status");
  const busca = searchParams.get("busca");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};
  if (status) where.status = status;
  if (busca) {
    where.OR = [
      { id: { contains: busca } },
      { user: { email: { contains: busca } } },
      { user: { name: { contains: busca } } },
    ];
  }

  const [pedidos, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        user: { select: { name: true, email: true, image: true } },
        items: true,
        payment: { select: { method: true, mpStatus: true, paidAt: true } },
        address: true,
      },
      orderBy: { createdAt: "desc" },
      skip: (pagina - 1) * porPagina,
      take: porPagina,
    }),
    prisma.order.count({ where }),
  ]);

  return NextResponse.json({
    data: pedidos,
    total,
    pagina,
    totalPaginas: Math.ceil(total / porPagina),
  });
}

export async function PATCH(req: NextRequest) {
  if (!(await checkAdmin())) return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

  const { orderId, status } = await req.json();
  const validStatuses = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"];

  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Status inválido" }, { status: 400 });
  }

  const pedido = await prisma.order.update({
    where: { id: orderId },
    data: { status },
  });

  return NextResponse.json(pedido);
}
