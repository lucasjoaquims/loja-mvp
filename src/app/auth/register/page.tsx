"use client";
// src/app/auth/register/page.tsx
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const passwordRules = [
    { label: "Mínimo 8 caracteres", ok: form.password.length >= 8 },
    { label: "Letra maiúscula", ok: /[A-Z]/.test(form.password) },
    { label: "Número", ok: /[0-9]/.test(form.password) },
    { label: "Senhas iguais", ok: form.password === form.confirmPassword && form.password.length > 0 },
  ];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordRules.every((r) => r.ok)) {
      toast.error("Verifique os requisitos de senha");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Erro ao criar conta");
        return;
      }

      toast.success("Conta criada! Fazendo login...");

      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (result?.ok) {
        router.push("/");
        router.refresh();
      }
    } catch {
      toast.error("Erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => signIn("google", { callbackUrl: "/" });

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-black tracking-widest uppercase">
            LOJA MVP
          </Link>
          <h2 className="text-2xl font-black mt-4">Criar conta</h2>
          <p className="text-zinc-500 text-sm mt-1">
            Já tem conta?{" "}
            <Link href="/auth/login" className="text-zinc-900 font-semibold hover:underline">
              Entrar
            </Link>
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-6">
          {/* Google */}
          <button
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 border border-zinc-300 py-3 rounded-xl text-sm font-medium hover:bg-zinc-50 transition-colors mb-5"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Cadastrar com Google
          </button>

          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-100" />
            </div>
            <div className="relative flex justify-center text-xs text-zinc-400 uppercase tracking-widest">
              <span className="bg-white px-3">ou preencha</span>
            </div>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-zinc-700 block mb-1">Nome completo</label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
                className="w-full border border-zinc-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-zinc-600 transition-all"
                placeholder="Seu nome completo"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-700 block mb-1">E-mail</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                required
                className="w-full border border-zinc-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-zinc-600 transition-all"
                placeholder="seu@email.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-700 block mb-1">Senha</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  required
                  className="w-full border border-zinc-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-zinc-600 transition-all pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-700"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-700 block mb-1">Confirmar senha</label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                required
                className="w-full border border-zinc-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-zinc-600 transition-all"
                placeholder="••••••••"
              />
            </div>

            {/* Regras de senha */}
            {form.password.length > 0 && (
              <div className="grid grid-cols-2 gap-1.5">
                {passwordRules.map((rule) => (
                  <div key={rule.label} className={`flex items-center gap-1.5 text-xs ${rule.ok ? "text-green-600" : "text-zinc-400"}`}>
                    <Check size={12} className={rule.ok ? "text-green-600" : "text-zinc-300"} />
                    {rule.label}
                  </div>
                ))}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !passwordRules.every((r) => r.ok)}
              className="btn-primary w-full rounded-xl gap-2 mt-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? "Criando conta..." : "Criar conta grátis"}
            </button>
          </form>
        </div>

        <p className="text-xs text-zinc-400 text-center mt-4">
          Ao criar uma conta, você concorda com nossos{" "}
          <Link href="#" className="underline hover:text-zinc-700">Termos de uso</Link>{" "}
          e{" "}
          <Link href="#" className="underline hover:text-zinc-700">Política de privacidade</Link>.
        </p>
      </motion.div>
    </div>
  );
}
