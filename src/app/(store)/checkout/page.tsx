"use client";
// src/app/(store)/checkout/page.tsx
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/store/cartStore";
import { formatPrice, cleanCep, formatCpf } from "@/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight, User, MapPin, CreditCard, CheckCircle,
  Copy, QrCode, FileText, Loader2
} from "lucide-react";
import Image from "next/image";

type Step = "dados" | "endereco" | "pagamento" | "confirmacao";
type PayMethod = "pix" | "cartao" | "boleto";

interface PersonalData { name: string; email: string; cpf: string; phone: string; }
interface AddressData { cep: string; street: string; number: string; complement: string; district: string; city: string; state: string; }
interface PaymentResult { method: string; pixQrCode?: string; pixQrCodeText?: string; boletoUrl?: string; boletoBarcode?: string; amount: number; orderId: string; }

const STEPS: { key: Step; label: string; icon: typeof User }[] = [
  { key: "dados", label: "Dados", icon: User },
  { key: "endereco", label: "Endereço", icon: MapPin },
  { key: "pagamento", label: "Pagamento", icon: CreditCard },
  { key: "confirmacao", label: "Confirmação", icon: CheckCircle },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, getSubtotal, getAutoDiscount, getTotal, shipping, couponCode, couponId, couponDiscount, clearCart } = useCartStore();

  const [step, setStep] = useState<Step>("dados");
  const [loading, setLoading] = useState(false);
  const [payMethod, setPayMethod] = useState<PayMethod>("pix");
  const [result, setResult] = useState<PaymentResult | null>(null);
  const [orderId, setOrderId] = useState("");

  const [personal, setPersonal] = useState<PersonalData>({
    name: session?.user?.name ?? "",
    email: session?.user?.email ?? "",
    cpf: "",
    phone: "",
  });

  const [address, setAddress] = useState<AddressData>({
    cep: "", street: "", number: "", complement: "", district: "", city: "", state: "",
  });

  const [card, setCard] = useState({ number: "", name: "", expiry: "", cvv: "", installments: "1", cpf: "" });
  const [loadingCep, setLoadingCep] = useState(false);

  const subtotal = getSubtotal();
  const autoDiscount = getAutoDiscount();
  const total = getTotal();

  if (!session) {
    router.push("/auth/login?callbackUrl=/checkout");
    return null;
  }

  if (items.length === 0 && step !== "confirmacao") {
    router.push("/carrinho");
    return null;
  }

  const buscarCep = async (cepValue: string) => {
    const clean = cepValue.replace(/\D/g, "");
    if (clean.length !== 8) return;
    setLoadingCep(true);
    try {
      const res = await fetch(`/api/cep?cep=${clean}`);
      const data = await res.json();
      if (!res.ok) { toast.error("CEP não encontrado"); return; }
      setAddress((prev) => ({
        ...prev,
        street: data.street || "",
        district: data.district || "",
        city: data.city || "",
        state: data.state || "",
      }));
      toast.success("Endereço preenchido!");
    } catch {
      toast.error("Erro ao buscar CEP");
    } finally {
      setLoadingCep(false);
    }
  };

  const criarPedido = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            name: i.name,
            image: i.image,
            price: i.price,
            size: i.size,
            color: i.color.name,
            quantity: i.quantity,
          })),
          couponId: couponId || undefined,
          couponCode: couponCode || undefined,
          subtotal,
          discount: autoDiscount.amount + couponDiscount,
          shipping,
          total,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data.orderId as string;
    } finally {
      setLoading(false);
    }
  };

  const processarPagamento = async (oid: string) => {
    setLoading(true);
    const [firstName, ...rest] = personal.name.trim().split(" ");
    const lastName = rest.join(" ") || firstName;

    try {
      let res: Response;

      if (payMethod === "pix") {
        res = await fetch("/api/pagamentos/pix", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: oid,
            cpf: personal.cpf,
            email: personal.email,
            firstName,
            lastName,
          }),
        });
      } else if (payMethod === "boleto") {
        res = await fetch("/api/pagamentos/boleto", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: oid,
            cpf: personal.cpf,
            email: personal.email,
            firstName,
            lastName,
            address: {
              streetName: address.street,
              streetNumber: address.number,
              zipCode: address.cep,
              city: address.city,
              state: address.state,
            },
          }),
        });
      } else {
        // Cartão — neste exemplo retorna sucesso simulado
        // Em produção: tokenize o cartão com o SDK MP e envie o token
        res = await fetch("/api/pagamentos/cartao", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: oid,
            token: "SIMULADO_TROCAR_PELO_TOKEN_MP", // substituir pelo token real do SDK JS
            installments: parseInt(card.installments),
            paymentMethodId: "visa",
            cpf: personal.cpf,
            email: personal.email,
            firstName,
            lastName,
          }),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      return {
        method: payMethod,
        pixQrCode: data.pixQrCode,
        pixQrCodeText: data.pixQrCodeText,
        boletoUrl: data.boletoUrl,
        boletoBarcode: data.boletoBarcode,
        amount: total,
        orderId: oid,
      } as PaymentResult;
    } finally {
      setLoading(false);
    }
  };

  const handleFinalizarPagamento = async () => {
    try {
      const oid = await criarPedido();
      setOrderId(oid);
      const payResult = await processarPagamento(oid);
      setResult(payResult);
      clearCart();
      setStep("confirmacao");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao processar pedido");
    }
  };

  const currentStepIndex = STEPS.findIndex((s) => s.key === step);

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="container-loja py-8">
        {/* Progress */}
        <div className="flex items-center justify-center gap-0 mb-10">
          {STEPS.map(({ key, label, icon: Icon }, i) => (
            <div key={key} className="flex items-center">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                key === step
                  ? "bg-zinc-900 text-white"
                  : currentStepIndex > i
                  ? "bg-green-600 text-white"
                  : "bg-white text-zinc-400 border border-zinc-200"
              }`}>
                <Icon size={15} />
                <span className="hidden sm:block">{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <ChevronRight size={16} className="text-zinc-300 mx-1" />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Formulário */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {/* STEP 1: Dados pessoais */}
              {step === "dados" && (
                <motion.div
                  key="dados"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-2xl p-6"
                >
                  <h2 className="text-xl font-bold mb-6">Dados pessoais</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-zinc-700 block mb-1">Nome completo *</label>
                      <input
                        value={personal.name}
                        onChange={(e) => setPersonal((p) => ({ ...p, name: e.target.value }))}
                        className="w-full border border-zinc-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-zinc-600"
                        placeholder="Seu nome"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-zinc-700 block mb-1">E-mail *</label>
                      <input
                        type="email"
                        value={personal.email}
                        onChange={(e) => setPersonal((p) => ({ ...p, email: e.target.value }))}
                        className="w-full border border-zinc-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-zinc-600"
                        placeholder="email@exemplo.com"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-zinc-700 block mb-1">CPF *</label>
                      <input
                        value={personal.cpf}
                        onChange={(e) => {
                          const v = e.target.value.replace(/\D/g, "").slice(0, 11);
                          setPersonal((p) => ({ ...p, cpf: formatCpf(v) }));
                        }}
                        className="w-full border border-zinc-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-zinc-600"
                        placeholder="000.000.000-00"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-zinc-700 block mb-1">Telefone</label>
                      <input
                        value={personal.phone}
                        onChange={(e) => setPersonal((p) => ({ ...p, phone: e.target.value }))}
                        className="w-full border border-zinc-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-zinc-600"
                        placeholder="(11) 9 9999-9999"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (!personal.name || !personal.email || !personal.cpf) {
                        return toast.error("Preencha todos os campos obrigatórios");
                      }
                      setStep("endereco");
                    }}
                    className="btn-primary w-full mt-6"
                  >
                    Continuar para endereço
                    <ChevronRight size={16} />
                  </button>
                </motion.div>
              )}

              {/* STEP 2: Endereço */}
              {step === "endereco" && (
                <motion.div
                  key="endereco"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-2xl p-6"
                >
                  <h2 className="text-xl font-bold mb-6">Endereço de entrega</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 sm:col-span-1">
                      <label className="text-sm font-medium text-zinc-700 block mb-1">CEP *</label>
                      <div className="relative">
                        <input
                          value={address.cep}
                          onChange={(e) => {
                            const v = e.target.value.replace(/\D/g, "").slice(0, 8);
                            const formatted = v.replace(/^(\d{5})(\d)/, "$1-$2");
                            setAddress((a) => ({ ...a, cep: formatted }));
                            if (v.length === 8) buscarCep(v);
                          }}
                          className="w-full border border-zinc-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-zinc-600"
                          placeholder="00000-000"
                        />
                        {loadingCep && (
                          <Loader2 size={16} className="absolute right-3 top-3 animate-spin text-zinc-400" />
                        )}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label className="text-sm font-medium text-zinc-700 block mb-1">Rua *</label>
                      <input
                        value={address.street}
                        onChange={(e) => setAddress((a) => ({ ...a, street: e.target.value }))}
                        className="w-full border border-zinc-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-zinc-600"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-zinc-700 block mb-1">Número *</label>
                      <input
                        value={address.number}
                        onChange={(e) => setAddress((a) => ({ ...a, number: e.target.value }))}
                        className="w-full border border-zinc-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-zinc-600"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-zinc-700 block mb-1">Complemento</label>
                      <input
                        value={address.complement}
                        onChange={(e) => setAddress((a) => ({ ...a, complement: e.target.value }))}
                        className="w-full border border-zinc-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-zinc-600"
                        placeholder="Apto, bloco..."
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-zinc-700 block mb-1">Bairro *</label>
                      <input
                        value={address.district}
                        onChange={(e) => setAddress((a) => ({ ...a, district: e.target.value }))}
                        className="w-full border border-zinc-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-zinc-600"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-zinc-700 block mb-1">Cidade *</label>
                      <input
                        value={address.city}
                        onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))}
                        className="w-full border border-zinc-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-zinc-600"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-zinc-700 block mb-1">Estado *</label>
                      <input
                        value={address.state}
                        onChange={(e) => setAddress((a) => ({ ...a, state: e.target.value.toUpperCase().slice(0, 2) }))}
                        className="w-full border border-zinc-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-zinc-600"
                        placeholder="SP"
                        maxLength={2}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button onClick={() => setStep("dados")} className="btn-secondary flex-1">
                      Voltar
                    </button>
                    <button
                      onClick={() => {
                        if (!address.cep || !address.street || !address.number || !address.city) {
                          return toast.error("Preencha o endereço completo");
                        }
                        setStep("pagamento");
                      }}
                      className="btn-primary flex-1"
                    >
                      Ir para pagamento
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Pagamento */}
              {step === "pagamento" && (
                <motion.div
                  key="pagamento"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-2xl p-6"
                >
                  <h2 className="text-xl font-bold mb-6">Forma de pagamento</h2>

                  {/* Tabs de método */}
                  <div className="flex gap-0 border border-zinc-200 rounded-xl overflow-hidden mb-6">
                    {([
                      { key: "pix", label: "PIX", emoji: "⚡" },
                      { key: "cartao", label: "Cartão", emoji: "💳" },
                      { key: "boleto", label: "Boleto", emoji: "📄" },
                    ] as const).map(({ key, label, emoji }) => (
                      <button
                        key={key}
                        onClick={() => setPayMethod(key)}
                        className={`flex-1 py-3 text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                          payMethod === key
                            ? "bg-zinc-900 text-white"
                            : "bg-white text-zinc-600 hover:bg-zinc-50"
                        }`}
                      >
                        {emoji} {label}
                      </button>
                    ))}
                  </div>

                  {/* PIX */}
                  {payMethod === "pix" && (
                    <div className="bg-green-50 border border-green-100 rounded-xl p-5 text-center">
                      <QrCode size={48} className="mx-auto text-green-600 mb-3" />
                      <h3 className="font-bold text-green-800 mb-1">Pagamento via PIX</h3>
                      <p className="text-sm text-green-700 mb-2">
                        O QR Code será gerado após confirmar. Pague em até 30 minutos.
                      </p>
                      <div className="flex flex-wrap justify-center gap-3 text-xs text-green-700">
                        <span>✓ Confirmação imediata</span>
                        <span>✓ Sem taxas</span>
                        <span>✓ 100% seguro</span>
                      </div>
                    </div>
                  )}

                  {/* Cartão */}
                  {payMethod === "cartao" && (
                    <div className="space-y-4">
                      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
                        💳 Os dados do cartão são processados com segurança pelo Mercado Pago.
                      </div>
                      <div>
                        <label className="text-sm font-medium text-zinc-700 block mb-1">Número do cartão</label>
                        <input
                          value={card.number}
                          onChange={(e) => {
                            const v = e.target.value.replace(/\D/g, "").slice(0, 16);
                            setCard((c) => ({ ...c, number: v.replace(/(.{4})/g, "$1 ").trim() }));
                          }}
                          className="w-full border border-zinc-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-zinc-600"
                          placeholder="0000 0000 0000 0000"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-zinc-700 block mb-1">Nome no cartão</label>
                        <input
                          value={card.name}
                          onChange={(e) => setCard((c) => ({ ...c, name: e.target.value.toUpperCase() }))}
                          className="w-full border border-zinc-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-zinc-600 uppercase"
                          placeholder="NOME COMO NO CARTÃO"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-zinc-700 block mb-1">Validade</label>
                          <input
                            value={card.expiry}
                            onChange={(e) => {
                              const v = e.target.value.replace(/\D/g, "").slice(0, 4);
                              setCard((c) => ({ ...c, expiry: v.replace(/^(\d{2})(\d)/, "$1/$2") }));
                            }}
                            className="w-full border border-zinc-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-zinc-600"
                            placeholder="MM/AA"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-zinc-700 block mb-1">CVV</label>
                          <input
                            value={card.cvv}
                            onChange={(e) => setCard((c) => ({ ...c, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                            type="password"
                            className="w-full border border-zinc-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-zinc-600"
                            placeholder="123"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-zinc-700 block mb-1">Parcelas</label>
                        <select
                          value={card.installments}
                          onChange={(e) => setCard((c) => ({ ...c, installments: e.target.value }))}
                          className="w-full border border-zinc-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-zinc-600"
                        >
                          {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                            <option key={n} value={n}>
                              {n}x de {formatPrice(total / n)} sem juros
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Boleto */}
                  {payMethod === "boleto" && (
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-5 text-center">
                      <FileText size={48} className="mx-auto text-amber-600 mb-3" />
                      <h3 className="font-bold text-amber-800 mb-1">Boleto Bancário</h3>
                      <p className="text-sm text-amber-700 mb-2">
                        O boleto será gerado após confirmar. Pague em até 3 dias úteis.
                      </p>
                      <p className="text-xs text-amber-600">
                        ⚠️ O pedido só será processado após confirmação do pagamento.
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3 mt-6">
                    <button onClick={() => setStep("endereco")} className="btn-secondary flex-1">
                      Voltar
                    </button>
                    <button
                      onClick={handleFinalizarPagamento}
                      disabled={loading}
                      className="btn-primary flex-1 gap-2"
                    >
                      {loading ? (
                        <><Loader2 size={16} className="animate-spin" /> Processando...</>
                      ) : (
                        <>Pagar {formatPrice(total)}</>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 4: Confirmação */}
              {step === "confirmacao" && result && (
                <motion.div
                  key="confirmacao"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-2xl p-6 text-center"
                >
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                    <CheckCircle size={40} className="text-green-600" />
                  </div>
                  <h2 className="text-2xl font-black mb-2">Pedido realizado!</h2>
                  <p className="text-zinc-500 mb-6">Pedido #{result.orderId.slice(-8).toUpperCase()}</p>

                  {/* PIX QR Code */}
                  {result.method === "pix" && result.pixQrCode && (
                    <div className="border border-zinc-200 rounded-xl p-6 mb-6">
                      <p className="font-semibold mb-4">Escaneie o QR Code para pagar</p>
                      <Image
                        src={`data:image/png;base64,${result.pixQrCode}`}
                        alt="QR Code PIX"
                        width={200}
                        height={200}
                        className="mx-auto mb-4"
                      />
                      {result.pixQrCodeText && (
                        <div>
                          <p className="text-xs text-zinc-500 mb-2">Ou copie o código Pix:</p>
                          <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3 text-xs font-mono break-all text-zinc-600 mb-3">
                            {result.pixQrCodeText}
                          </div>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(result.pixQrCodeText!);
                              toast.success("Código copiado!");
                            }}
                            className="btn-secondary px-4 py-2 text-xs gap-2"
                          >
                            <Copy size={14} />
                            Copiar código Pix
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Boleto */}
                  {result.method === "boleto" && result.boletoUrl && (
                    <div className="border border-zinc-200 rounded-xl p-6 mb-6">
                      <p className="font-semibold mb-3">Seu boleto está pronto</p>
                      <a
                        href={result.boletoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary inline-flex gap-2"
                      >
                        <FileText size={16} />
                        Abrir boleto
                      </a>
                      {result.boletoBarcode && (
                        <div className="mt-4 bg-zinc-50 border rounded p-3 text-xs font-mono break-all text-zinc-600">
                          {result.boletoBarcode}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Cartão aprovado */}
                  {result.method === "cartao" && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-5 mb-6">
                      <p className="text-green-800 font-semibold">✅ Pagamento aprovado!</p>
                      <p className="text-sm text-green-700 mt-1">
                        Você receberá um e-mail de confirmação em breve.
                      </p>
                    </div>
                  )}

                  <button
                    onClick={() => router.push("/conta/pedidos")}
                    className="btn-secondary w-full mb-3"
                  >
                    Ver meus pedidos
                  </button>
                  <button
                    onClick={() => router.push("/produtos")}
                    className="text-sm text-zinc-500 hover:text-zinc-800 transition-colors"
                  >
                    Continuar comprando
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Resumo lateral */}
          {step !== "confirmacao" && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-5 sticky top-24">
                <h3 className="font-bold mb-4">Resumo</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative w-12 h-16 flex-shrink-0 bg-zinc-100 overflow-hidden rounded">
                        <Image src={item.image} alt={item.name} fill className="object-cover" sizes="48px" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium line-clamp-2">{item.name}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          {item.size} • {item.color.name} • x{item.quantity}
                        </p>
                        <p className="text-xs font-bold mt-0.5">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-1.5 text-sm border-t pt-4">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  {autoDiscount.hasDiscount && (
                    <div className="flex justify-between text-green-600">
                      <span>Desconto 3 peças</span>
                      <span>-{formatPrice(autoDiscount.amount)}</span>
                    </div>
                  )}
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Cupom</span>
                      <span>-{formatPrice(couponDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Frete</span>
                    <span className={shipping === 0 ? "text-green-600" : ""}>
                      {shipping === 0 ? "Grátis" : formatPrice(shipping)}
                    </span>
                  </div>
                  <div className="flex justify-between font-black text-lg pt-2 border-t">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
