// src/app/api/admin/categorias/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }
  const categorias = await prisma.category.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(categorias);
}
