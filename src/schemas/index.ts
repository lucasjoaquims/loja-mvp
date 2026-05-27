// src/schemas/index.ts
import { z } from "zod";

// ─── AUTH ─────────────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
    email: z.string().email("Email inválido"),
    password: z
      .string()
      .min(8, "Senha deve ter no mínimo 8 caracteres")
      .regex(/[A-Z]/, "Deve conter ao menos uma letra maiúscula")
      .regex(/[0-9]/, "Deve conter ao menos um número"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Senhas não conferem",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email("Email inválido"),
});

// ─── ENDEREÇO ─────────────────────────────────────────────────────────────────
export const addressSchema = z.object({
  name: z.string().min(2, "Nome do endereço obrigatório"),
  cep: z
    .string()
    .min(8, "CEP inválido")
    .max(9, "CEP inválido")
    .regex(/^\d{5}-?\d{3}$/, "CEP inválido"),
  street: z.string().min(3, "Rua obrigatória"),
  number: z.string().min(1, "Número obrigatório"),
  complement: z.string().optional(),
  district: z.string().min(2, "Bairro obrigatório"),
  city: z.string().min(2, "Cidade obrigatória"),
  state: z.string().length(2, "UF inválida"),
});

// ─── CHECKOUT ─────────────────────────────────────────────────────────────────
export const checkoutPersonalSchema = z.object({
  name: z.string().min(2, "Nome completo obrigatório"),
  email: z.string().email("Email inválido"),
  cpf: z
    .string()
    .min(11, "CPF inválido")
    .regex(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/, "CPF inválido"),
  phone: z
    .string()
    .min(10, "Telefone inválido")
    .optional()
    .or(z.literal("")),
});

// ─── PAGAMENTO ────────────────────────────────────────────────────────────────
export const pixSchema = z.object({
  // apenas confirma CPF do pagador
  cpf: z.string().regex(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/, "CPF inválido"),
});

export const cardSchema = z.object({
  cardholderName: z.string().min(3, "Nome no cartão obrigatório"),
  cardNumber: z
    .string()
    .min(19, "Número do cartão inválido")
    .max(19, "Número do cartão inválido"),
  expiry: z
    .string()
    .regex(/^\d{2}\/\d{2}$/, "Validade inválida (MM/AA)"),
  cvv: z.string().min(3, "CVV inválido").max(4, "CVV inválido"),
  installments: z.string(),
  cpf: z.string().regex(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/, "CPF inválido"),
});

export const boletoSchema = z.object({
  cpf: z.string().regex(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/, "CPF inválido"),
});

// ─── PRODUTO (admin) ──────────────────────────────────────────────────────────
export const productSchema = z.object({
  name: z.string().min(3, "Nome obrigatório"),
  description: z.string().min(20, "Descrição muito curta"),
  price: z.coerce.number().positive("Preço deve ser positivo"),
  originalPrice: z.coerce.number().positive().optional().or(z.literal("")),
  sku: z.string().min(3, "SKU obrigatório"),
  stock: z.coerce.number().int().min(0, "Estoque não pode ser negativo"),
  categoryId: z.string().min(1, "Categoria obrigatória"),
  featured: z.boolean().optional(),
  isNew: z.boolean().optional(),
  active: z.boolean().optional(),
});

// ─── CUPOM (admin) ────────────────────────────────────────────────────────────
export const couponSchema = z.object({
  code: z
    .string()
    .min(3, "Código muito curto")
    .max(20, "Código muito longo")
    .regex(/^[A-Z0-9]+$/, "Somente letras maiúsculas e números"),
  type: z.enum(["PERCENTAGE", "FIXED"]),
  value: z.coerce.number().positive("Valor deve ser positivo"),
  minOrder: z.coerce.number().min(0).optional().or(z.literal("")),
  maxUses: z.coerce.number().int().positive().optional().or(z.literal("")),
  active: z.boolean().default(true),
  expiresAt: z.string().optional().or(z.literal("")),
});

// ─── REVIEW ───────────────────────────────────────────────────────────────────
export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional().or(z.literal("")),
});

// Tipos inferidos
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type CheckoutPersonalInput = z.infer<typeof checkoutPersonalSchema>;
export type CardInput = z.infer<typeof cardSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type CouponInput = z.infer<typeof couponSchema>;
