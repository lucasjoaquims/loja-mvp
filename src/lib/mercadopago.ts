// src/lib/mercadopago.ts
// Integração completa com Mercado Pago — PIX, Cartão de Crédito e Boleto

import { MercadoPagoConfig, Payment, PaymentMethod } from "mercadopago";

// ─── CLIENTE ─────────────────────────────────────────────────────────────────
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
  options: {
    timeout: 5000,
    idempotencyKey: undefined, // gerado por chamada
  },
});

export const mpPayment = new Payment(client);

// ─── TIPOS ────────────────────────────────────────────────────────────────────
export interface PayerData {
  email: string;
  firstName: string;
  lastName: string;
  cpf: string; // somente números
  phone?: string;
}

export interface PaymentItem {
  id: string;
  title: string;
  quantity: number;
  unitPrice: number;
}

export interface CreatePaymentBase {
  orderId: string;
  amount: number;
  payer: PayerData;
  items: PaymentItem[];
  notificationUrl?: string;
}

export interface CreatePixPayment extends CreatePaymentBase {
  method: "pix";
}

export interface CreateCardPayment extends CreatePaymentBase {
  method: "credit_card";
  token: string;        // token gerado pelo SDK JS no frontend
  installments: number;
  issuerId?: string;
  paymentMethodId: string;
}

export interface CreateBoletoPayment extends CreatePaymentBase {
  method: "boleto";
  address: {
    streetName: string;
    streetNumber: string;
    zipCode: string;
    city: string;
    state: string;
  };
}

export type CreatePaymentInput =
  | CreatePixPayment
  | CreateCardPayment
  | CreateBoletoPayment;

// ─── RESULTADO ────────────────────────────────────────────────────────────────
export interface PaymentResult {
  mpPaymentId: string;
  status: string; // pending | approved | rejected | in_process
  statusDetail: string;
  method: string;
  amount: number;
  // PIX
  pixQrCode?: string;
  pixQrCodeText?: string;
  pixExpiresAt?: Date;
  // Boleto
  boletoUrl?: string;
  boletoBarcode?: string;
  boletoExpiresAt?: Date;
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
/** Remove tudo que não é número */
const onlyNumbers = (s: string) => s.replace(/\D/g, "");

/** Externalref único por pedido para idempotência */
const makeExternalRef = (orderId: string) =>
  `loja-mvp-${orderId}-${Date.now()}`;

// ─── PIX ─────────────────────────────────────────────────────────────────────
export async function createPixPayment(input: CreatePixPayment): Promise<PaymentResult> {
  const externalRef = makeExternalRef(input.orderId);

  const response = await mpPayment.create({
    body: {
      transaction_amount: input.amount,
      description: `Pedido #${input.orderId} — Loja MVP`,
      payment_method_id: "pix",
      external_reference: externalRef,
      notification_url: input.notificationUrl,
      payer: {
        email: input.payer.email,
        first_name: input.payer.firstName,
        last_name: input.payer.lastName,
        identification: {
          type: "CPF",
          number: onlyNumbers(input.payer.cpf),
        },
      },
      // PIX expira em 30 minutos
      date_of_expiration: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    },
    requestOptions: {
      idempotencyKey: externalRef,
    },
  });

  const qrData = response.point_of_interaction?.transaction_data;

  return {
    mpPaymentId: String(response.id),
    status: response.status ?? "pending",
    statusDetail: response.status_detail ?? "",
    method: "PIX",
    amount: response.transaction_amount ?? input.amount,
    pixQrCode: qrData?.qr_code_base64 ?? undefined,
    pixQrCodeText: qrData?.qr_code ?? undefined,
    pixExpiresAt: new Date(Date.now() + 30 * 60 * 1000),
  };
}

// ─── CARTÃO DE CRÉDITO ───────────────────────────────────────────────────────
export async function createCardPayment(input: CreateCardPayment): Promise<PaymentResult> {
  const externalRef = makeExternalRef(input.orderId);

  const response = await mpPayment.create({
    body: {
      transaction_amount: input.amount,
      token: input.token,
      description: `Pedido #${input.orderId} — Loja MVP`,
      installments: input.installments,
      payment_method_id: input.paymentMethodId,
      issuer_id: input.issuerId ? Number(input.issuerId) : undefined,
      external_reference: externalRef,
      notification_url: input.notificationUrl,
      payer: {
        email: input.payer.email,
        first_name: input.payer.firstName,
        last_name: input.payer.lastName,
        identification: {
          type: "CPF",
          number: onlyNumbers(input.payer.cpf),
        },
      },
      additional_info: {
        items: input.items.map((item) => ({
          id: item.id,
          title: item.title,
          quantity: item.quantity,
          unit_price: item.unitPrice,
        })),
      },
    },
    requestOptions: {
      idempotencyKey: externalRef,
    },
  });

  return {
    mpPaymentId: String(response.id),
    status: response.status ?? "pending",
    statusDetail: response.status_detail ?? "",
    method: "CREDIT_CARD",
    amount: response.transaction_amount ?? input.amount,
  };
}

// ─── BOLETO ──────────────────────────────────────────────────────────────────
export async function createBoletoPayment(input: CreateBoletoPayment): Promise<PaymentResult> {
  const externalRef = makeExternalRef(input.orderId);

  const response = await mpPayment.create({
    body: {
      transaction_amount: input.amount,
      description: `Pedido #${input.orderId} — Loja MVP`,
      payment_method_id: "bolbradesco",
      external_reference: externalRef,
      notification_url: input.notificationUrl,
      payer: {
        email: input.payer.email,
        first_name: input.payer.firstName,
        last_name: input.payer.lastName,
        identification: {
          type: "CPF",
          number: onlyNumbers(input.payer.cpf),
        },
        address: {
          street_name: input.address.streetName,
          street_number: input.address.streetNumber,
          zip_code: onlyNumbers(input.address.zipCode),
          city: input.address.city,
          federal_unit: input.address.state,
        },
      },
      // Boleto vence em 3 dias úteis
      date_of_expiration: new Date(
        Date.now() + 3 * 24 * 60 * 60 * 1000
      ).toISOString(),
    },
    requestOptions: {
      idempotencyKey: externalRef,
    },
  });

  const boletoData = response.transaction_details;
  const expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

  return {
    mpPaymentId: String(response.id),
    status: response.status ?? "pending",
    statusDetail: response.status_detail ?? "",
    method: "BOLETO",
    amount: response.transaction_amount ?? input.amount,
    boletoUrl: boletoData?.external_resource_url ?? undefined,
    boletoBarcode: (response as { barcode?: { content?: string } }).barcode?.content ?? undefined,
    boletoExpiresAt: expiresAt,
  };
}

// ─── CONSULTAR PAGAMENTO ─────────────────────────────────────────────────────
export async function getPaymentStatus(mpPaymentId: string) {
  const response = await mpPayment.get({ id: mpPaymentId });
  return {
    id: String(response.id),
    status: response.status,
    statusDetail: response.status_detail,
    amount: response.transaction_amount,
  };
}

// ─── MAPEAR STATUS MP → NOSSO ─────────────────────────────────────────────────
export function mapMpStatus(mpStatus: string): "PENDING" | "PAID" | "CANCELLED" {
  switch (mpStatus) {
    case "approved":
      return "PAID";
    case "rejected":
    case "cancelled":
      return "CANCELLED";
    default:
      return "PENDING";
  }
}
