"use client";
// src/app/auth/login/page.tsx
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      toast.error("Email ou senha incorretos");
      return;
    }

    toast.success("Login realizado!");
    router.push(callbackUrl);
    router.refresh();
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    await signIn("google", { callbackUrl });
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      {/* Visual lateral */}
      <div className="hidden lg:flex lg:flex-1 bg-zinc-900 items-center justify-center p-12">
        <div className="text-center text-white">
          <h1 className="text-5xl font-black tracking-widest uppercase mb-4">LOJA MVP</h1>
          <p className="text-zinc-400 text-lg">Moda premium para quem tem estilo</p>
          <div className="mt-8 flex justify-center gap-4">
            {["Camisetas", "Moletons", "Tênis", "Acessórios"].map((c) => (
              <span key={c} className="px-3 py-1 border border-zinc-700 text-zinc-400 text-xs rounded-full">
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Formulário */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <Link href="/" className="text-2xl font-black tracking-widest uppercase lg:hidden">
              LOJA MVP
            </Link>
            <h2 className="text-2xl font-black mt-4 lg:mt-0">Entrar na sua conta</h2>
            <p className="text-zinc-500 text-sm mt-1">
              Não tem conta?{" "}
              <Link href="/auth/register" className="text-zinc-900 font-semibold hover:underline">
                Cadastre-se
              </Link>
            </p>
          </div>

          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 border border-zinc-300 py-3 rounded-xl text-sm font-medium hover:bg-zinc-50 transition-colors mb-6"
          >
            {googleLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            Continuar com Google
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200" />
            </div>
            <div className="relative flex justify-center text-xs text-zinc-400 uppercase tracking-widest">
              <span className="bg-zinc-50 px-3">ou</span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-zinc-700 block mb-1">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-zinc-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-zinc-600 focus:ring-2 focus:ring-zinc-100 transition-all"
                placeholder="seu@email.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-700 block mb-1">Senha</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full border border-zinc-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-zinc-600 focus:ring-2 focus:ring-zinc-100 transition-all pr-12"
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

            <div className="flex justify-end">
              <Link href="/auth/forgot-password" className="text-xs text-zinc-500 hover:text-zinc-800 hover:underline">
                Esqueci minha senha
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full rounded-xl gap-2"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <p className="text-xs text-zinc-400 text-center mt-6">
            Admin de teste:{" "}
            <button
              onClick={() => { setEmail("admin@lojamvp.com"); setPassword("Admin@123"); }}
              className="underline hover:text-zinc-700"
            >
              usar credenciais
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
