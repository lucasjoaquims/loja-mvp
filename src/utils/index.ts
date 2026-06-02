// src/utils/index.ts

// ─── MOEDA ────────────────────────────────────────────────────────────────────
export function formatPrice(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatPriceRaw(value: number): string {
  return value.toFixed(2).replace(".", ",");
}

/** Calcula percentual de desconto */
export function calcDiscountPercent(original: number, current: number): number {
  if (!original || original <= current) return 0;
  return Math.round(((original - current) / original) * 100);
}

// ─── STRINGS ─────────────────────────────────────────────────────────────────
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + "...";
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

// ─── CEP ─────────────────────────────────────────────────────────────────────
export function formatCep(cep: string): string {
  const only = cep.replace(/\D/g, "");
  return only.replace(/^(\d{5})(\d{3})$/, "$1-$2");
}

export function cleanCep(cep: string): string {
  return cep.replace(/\D/g, "");
}

// ─── CPF ─────────────────────────────────────────────────────────────────────
export function formatCpf(cpf: string): string {
  const only = cpf.replace(/\D/g, "");
  return only.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
}

export function validateCpf(cpf: string): boolean {
  const only = cpf.replace(/\D/g, "");
  if (only.length !== 11) return false;
  if (/^(\d)\1+$/.test(only)) return false;

  const calc = (mod: number) => {
    let sum = 0;
    for (let i = 0; i < mod - 1; i++) {
      sum += parseInt(only[i]) * (mod - i);
    }
    const rem = (sum * 10) % 11;
    return rem === 10 || rem === 11 ? 0 : rem;
  };

  return calc(10) === parseInt(only[9]) && calc(11) === parseInt(only[10]);
}

// ─── CARTÃO ───────────────────────────────────────────────────────────────────
export function formatCard(number: string): string {
  return number
    .replace(/\D/g, "")
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

export function formatExpiry(expiry: string): string {
  return expiry
    .replace(/\D/g, "")
    .replace(/^(\d{2})(\d)/, "$1/$2")
    .slice(0, 5);
}

// ─── DATAS ───────────────────────────────────────────────────────────────────
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function timeAgo(date: Date | string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "agora mesmo";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}min atrás`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h atrás`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d atrás`;
  return formatDate(date);
}

// ─── STATUS ───────────────────────────────────────────────────────────────────
export function labelOrderStatus(status: string): string {
  const labels: Record<string, string> = {
    PENDING: "Aguardando pagamento",
    PAID: "Pago",
    SHIPPED: "Enviado",
    DELIVERED: "Entregue",
    CANCELLED: "Cancelado",
    REFUNDED: "Reembolsado",
  };
  return labels[status] ?? status;
}

export function colorOrderStatus(status: string): string {
  const colors: Record<string, string> = {
    PENDING: "text-yellow-600 bg-yellow-50",
    PAID: "text-green-600 bg-green-50",
    SHIPPED: "text-blue-600 bg-blue-50",
    DELIVERED: "text-emerald-600 bg-emerald-50",
    CANCELLED: "text-red-600 bg-red-50",
    REFUNDED: "text-purple-600 bg-purple-50",
  };
  return colors[status] ?? "text-gray-600 bg-gray-50";
}

// ─── FRETE ────────────────────────────────────────────────────────────────────
export function calcShipping(subtotal: number, cep?: string): number {
  // Lógica simples: frete grátis acima de R$299
  if (subtotal >= 299) return 0;
  // Simula frete por região baseada no CEP
  if (!cep) return 19.90;
  const prefix = parseInt(cep.slice(0, 2));
  if (prefix >= 1 && prefix <= 19) return 9.90;   // SP capital
  if (prefix >= 20 && prefix <= 28) return 14.90;  // RJ
  if (prefix >= 30 && prefix <= 39) return 16.90;  // MG
  return 19.90; // outros
}

// ─── DESCONTO AUTOMÁTICO (3 PEÇAS = 10%) ─────────────────────────────────────
export function calcAutoDiscount(items: { quantity: number; price: number }[]): {
  hasDiscount: boolean;
  totalItems: number;
  discountPercent: number;
  discountAmount: number;
} {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (totalItems >= 3) {
    const discountAmount = subtotal * 0.1;
    return {
      hasDiscount: true,
      totalItems,
      discountPercent: 10,
      discountAmount,
    };
  }

  return {
    hasDiscount: false,
    totalItems,
    discountPercent: 0,
    discountAmount: 0,
  };
}

// ─── PRODUTO PARSING ─────────────────────────────────────────────────────────
/** Converte produto do banco (JSON strings) para tipo frontend */
export function parseProduct(raw: {
  images: string;
  sizes: string;
  colors: string;
  [key: string]: unknown;
}) {
  return {
    ...raw,
    images: JSON.parse(raw.images) as string[],
    sizes: JSON.parse(raw.sizes) as string[],
    colors: JSON.parse(raw.colors) as { name: string; hex: string }[],
  };
}

// ─── ARRAYS ───────────────────────────────────────────────────────────────────
export function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

// ─── CLASS NAMES (tw-merge like) ─────────────────────────────────────────────
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
