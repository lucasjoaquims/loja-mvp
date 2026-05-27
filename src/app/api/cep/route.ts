// src/app/api/cep/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cep = searchParams.get("cep")?.replace(/\D/g, "");

  if (!cep || cep.length !== 8) {
    return NextResponse.json({ error: "CEP inválido" }, { status: 400 });
  }

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
      next: { revalidate: 3600 }, // cache 1h
    });

    if (!response.ok) {
      return NextResponse.json({ error: "CEP não encontrado" }, { status: 404 });
    }

    const data = await response.json();

    if (data.erro) {
      return NextResponse.json({ error: "CEP não encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      cep: data.cep,
      street: data.logradouro,
      district: data.bairro,
      city: data.localidade,
      state: data.uf,
      complement: data.complemento,
    });
  } catch {
    return NextResponse.json({ error: "Erro ao consultar CEP" }, { status: 500 });
  }
}
