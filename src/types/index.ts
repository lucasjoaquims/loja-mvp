// src/types/index.ts
// Tipos globais da Loja MVP

export type UserRole = "USER" | "ADMIN";

export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export type PaymentMethod = "PIX" | "CREDIT_CARD" | "BOLETO";

export type CouponType = "PERCENTAGE" | "FIXED";

// ─── PRODUTO ──────────────────────────────────────────────────────────────────
export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number | null;
  sku: string;
  stock: number;
  sold: number;
  active: boolean;
  featured: boolean;
  isNew: boolean;
  categoryId: string;
  images: string[];      // já parseado
  sizes: string[];       // já parseado
  colors: ProductColor[]; // já parseado
  createdAt: Date;
  updatedAt: Date;
  category?: Category;
  reviews?: Review[];
  _avgRating?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  active: boolean;
  createdAt: Date;
}

// ─── CARRINHO ─────────────────────────────────────────────────────────────────
export interface CartItem {
  id: string;          // productId + size + color como ID único local
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  originalPrice?: number | null;
  size: string;
  color: ProductColor;
  quantity: number;
  stock: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  discount: number;     // desconto do cupom
  autoDiscount: number; // desconto automático (3 peças = 10%)
  shipping: number;
  total: number;
  couponCode?: string;
  couponId?: string;
}

// ─── PEDIDO ───────────────────────────────────────────────────────────────────
export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  image: string;
  price: number;
  size: string;
  color: string;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  createdAt: Date;
  updatedAt: Date;
  items: OrderItem[];
  payment?: Payment;
  address?: Address;
  coupon?: Coupon;
  user?: { name?: string | null; email: string };
}

// ─── PAGAMENTO ────────────────────────────────────────────────────────────────
export interface Payment {
  id: string;
  orderId: string;
  mpPaymentId?: string | null;
  mpStatus?: string | null;
  method: PaymentMethod;
  amount: number;
  pixQrCode?: string | null;
  pixQrCodeText?: string | null;
  boletoUrl?: string | null;
  boletoBarcode?: string | null;
  paidAt?: Date | null;
  expiresAt?: Date | null;
  createdAt: Date;
}

// ─── ENDEREÇO ─────────────────────────────────────────────────────────────────
export interface Address {
  id: string;
  userId: string;
  name: string;
  cep: string;
  street: string;
  number: string;
  complement?: string | null;
  district: string;
  city: string;
  state: string;
  isDefault: boolean;
}

// ─── CEP ──────────────────────────────────────────────────────────────────────
export interface CepData {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

// ─── CUPOM ────────────────────────────────────────────────────────────────────
export interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  minOrder?: number | null;
  maxUses?: number | null;
  usedCount: number;
  active: boolean;
  expiresAt?: Date | null;
  createdAt: Date;
}

// ─── AVALIAÇÃO ────────────────────────────────────────────────────────────────
export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment?: string | null;
  createdAt: Date;
  user?: { name?: string | null; image?: string | null };
}

// ─── FILTROS ──────────────────────────────────────────────────────────────────
export interface ProductFilters {
  categoria?: string;
  tamanho?: string;
  cor?: string;
  precoMin?: number;
  precoMax?: number;
  promocao?: boolean;
  maisVendidos?: boolean;
  novidades?: boolean;
  busca?: string;
  pagina?: number;
  porPagina?: number;
  ordenar?: "preco_asc" | "preco_desc" | "mais_vendidos" | "novidades" | "relevancia";
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
export interface DashboardMetrics {
  totalVendas: number;
  totalPedidos: number;
  totalClientes: number;
  totalProdutos: number;
  vendasHoje: number;
  pedidosHoje: number;
  pedidosPendentes: number;
  ticketMedio: number;
}

// ─── API RESPONSES ────────────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  pagina: number;
  totalPaginas: number;
  porPagina: number;
}
