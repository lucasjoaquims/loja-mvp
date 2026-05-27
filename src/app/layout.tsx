// src/app/layout.tsx
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Loja MVP — Moda Premium",
    template: "%s | Loja MVP",
  },
  description:
    "Roupas, tênis e acessórios premium com entrega rápida. Moda masculina e feminina com os melhores preços.",
  keywords: ["roupas", "moda", "premium", "streetwear", "tênis", "acessórios"],
  openGraph: {
    title: "Loja MVP — Moda Premium",
    description: "Roupas, tênis e acessórios premium com entrega rápida.",
    type: "website",
    locale: "pt_BR",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased bg-white text-zinc-900`}
      >
        <SessionProvider>
          {children}
          <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              style: { fontFamily: "var(--font-geist-sans)" },
            }}
          />
        </SessionProvider>
      </body>
    </html>
  );
}
