# 🛍️ Loja MVP — E-commerce Premium Full Stack

> E-commerce moderno e profissional construído com Next.js 15, Prisma, Mercado Pago e TailwindCSS.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma)
![Mercado Pago](https://img.shields.io/badge/Mercado%20Pago-Integrado-009EE3?style=flat-square)

---

## ✨ Funcionalidades

### 🛒 Storefront
- **Home premium** com hero slider, categorias, destaques e depoimentos
- **Catálogo completo** com filtros por tamanho, cor, preço, categoria e promoção
- **Página de produto** com galeria de imagens, seletor de tamanho/cor e avaliações
- **Busca inteligente** com autocomplete
- **Carrinho persistido** no localStorage com Zustand
- **Desconto automático**: leve 3+ peças e ganhe 10% OFF automático
- **Sistema de cupons** com validação em tempo real
- **Cálculo de frete** por CEP via ViaCEP
- **Wishlist/Favoritos** sincronizados com conta

### 💳 Pagamentos (Mercado Pago)
- **PIX** com QR Code e código copia-e-cola
- **Cartão de crédito** em até 12x sem juros
- **Boleto bancário** com vencimento em 3 dias
- **Webhook automático** para confirmação de pagamentos
- Telas de sucesso/falha com feedback visual

### 🔐 Autenticação
- Login com **Google OAuth**
- Login com **email e senha**
- Registro de conta com validação de senha
- Sessão persistida com JWT (NextAuth v5)
- Middleware de proteção de rotas

### 🎛️ Painel Admin
- **Dashboard** com métricas, gráfico de vendas e produtos mais vendidos
- **CRUD de produtos** com ativação/desativação e upload de imagens
- **Gestão de pedidos** com atualização de status em tempo real
- **Sistema de cupons** completo (criar, ativar/desativar, excluir)
- **Gestão de usuários**

### 🚀 Performance & SEO
- Server Components para dados críticos
- Lazy loading de imagens com Next/Image
- Loading skeletons em todas as listagens
- Metadata dinâmica e OpenGraph
- URLs amigáveis com slugs

---

## 🏗️ Arquitetura

```
src/
├── app/
│   ├── (store)/          # Layout público com Navbar + Footer
│   │   ├── page.tsx      # Home
│   │   ├── produtos/     # Catálogo
│   │   ├── produto/[slug]/ # Produto individual
│   │   ├── carrinho/     # Carrinho
│   │   ├── checkout/     # Checkout multi-step
│   │   ├── conta/        # Área do cliente
│   │   └── favoritos/    # Wishlist
│   ├── admin/            # Painel administrativo
│   │   ├── page.tsx      # Dashboard
│   │   ├── pedidos/      # Gestão de pedidos
│   │   ├── produtos/     # Gestão de produtos
│   │   └── cupons/       # Gestão de cupons
│   ├── auth/             # Páginas de autenticação
│   │   ├── login/
│   │   └── register/
│   └── api/              # API Routes
│       ├── auth/         # NextAuth handlers
│       ├── produtos/     # CRUD produtos
│       ├── pedidos/      # Gestão de pedidos
│       ├── pagamentos/   # PIX | Cartão | Boleto | Webhook
│       ├── cep/          # ViaCEP proxy
│       ├── cupons/       # Validação de cupons
│       └── admin/        # APIs do painel admin
├── components/
│   ├── layout/           # Navbar, Footer
│   ├── home/             # Seções da home
│   ├── produto/          # Cards, galeria
│   ├── carrinho/         # Componentes do carrinho
│   ├── checkout/         # Steps do checkout
│   └── pagamento/        # Formulários de pagamento
├── lib/
│   ├── prisma.ts         # Client singleton
│   ├── auth.ts           # NextAuth config
│   └── mercadopago.ts    # MP integration
├── store/
│   └── cartStore.ts      # Zustand + persist
├── schemas/              # Schemas Zod
├── types/                # Types TypeScript
└── utils/                # Formatação, helpers
prisma/
├── schema.prisma         # Models do banco
└── seed.ts               # Seed com 20+ produtos
```

---

## 🚀 Instalação e Setup Local

### Pré-requisitos
- Node.js 20+
- npm ou pnpm

### 1. Clone e instale dependências

```bash
# Clone o projeto
git clone https://github.com/seu-usuario/loja-mvp.git
cd loja-mvp

# Instale as dependências
npm install
```

### 2. Configure as variáveis de ambiente

```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite o .env com suas credenciais
nano .env
```

**Variáveis obrigatórias:**

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | `file:./dev.db` (SQLite) ou PostgreSQL URL |
| `NEXTAUTH_SECRET` | String aleatória longa (use `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | `http://localhost:3000` |
| `MERCADOPAGO_ACCESS_TOKEN` | Access Token do Mercado Pago |
| `MERCADOPAGO_PUBLIC_KEY` | Public Key do Mercado Pago |
| `NEXT_PUBLIC_MP_PUBLIC_KEY` | Mesma Public Key (client-side) |

**Variáveis opcionais:**

| Variável | Descrição |
|---|---|
| `GOOGLE_CLIENT_ID` | Para login com Google |
| `GOOGLE_CLIENT_SECRET` | Para login com Google |
| `CLOUDINARY_CLOUD_NAME` | Para upload de imagens no admin |

### 3. Configure o banco de dados

```bash
# Gera o cliente Prisma
npm run db:generate

# Cria as tabelas (SQLite)
npm run db:push

# Popula com dados de exemplo (20+ produtos)
npm run db:seed
```

### 4. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

Acesse: **http://localhost:3000**

**Credenciais de admin para teste:**
- Email: `admin@lojamvp.com`
- Senha: `Admin@123`

---

## 💳 Configuração do Mercado Pago

### Para PIX e Boleto
Funcionam diretamente com as credenciais de produção. Não é necessária configuração adicional.

### Para Cartão de Crédito
O cartão requer tokenização no frontend com o SDK JS do Mercado Pago. Adicione no `<head>`:

```html
<script src="https://sdk.mercadopago.com/js/v2"></script>
```

E inicialize na página de checkout:
```javascript
const mp = new MercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY);
const cardForm = mp.cardForm({ ... });
// O token gerado é enviado para /api/pagamentos/cartao
```

### Webhook (produção)
Configure no painel do Mercado Pago a URL:
```
https://seudominio.com/api/pagamentos/webhook
```

---

## 🌐 Deploy em Produção

### Vercel (recomendado para frontend)

```bash
# Instale a CLI da Vercel
npm i -g vercel

# Deploy
vercel

# Configure as variáveis de ambiente no painel da Vercel
```

### Banco de dados em produção

**Neon.tech (PostgreSQL gratuito):**
1. Acesse [neon.tech](https://neon.tech) e crie uma conta
2. Crie um novo projeto
3. Copie a connection string
4. Atualize `DATABASE_URL` no `.env` da Vercel
5. Troque `provider = "sqlite"` para `provider = "postgresql"` no `schema.prisma`
6. Execute `npx prisma migrate deploy`

**Railway (alternativa):**
1. Acesse [railway.app](https://railway.app)
2. New Project → PostgreSQL
3. Copie a DATABASE_URL

---

## 📋 Scripts disponíveis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build para produção
npm run start        # Servidor de produção
npm run db:generate  # Gera cliente Prisma
npm run db:push      # Sincroniza schema com banco
npm run db:migrate   # Cria migration
npm run db:seed      # Popula banco com dados
npm run db:studio    # Abre o Prisma Studio (GUI do banco)
npm run db:reset     # Reset completo do banco + seed
```

---

## 🗄️ Models do Banco

| Model | Descrição |
|---|---|
| `User` | Usuários com suporte OAuth e email/senha |
| `Account` / `Session` | NextAuth adapters |
| `Product` | Produtos com imagens, tamanhos e cores em JSON |
| `Category` | Categorias de produtos |
| `Order` | Pedidos com status |
| `OrderItem` | Itens de cada pedido |
| `Payment` | Pagamentos com dados do MP (QR, barcode, etc.) |
| `Address` | Endereços de entrega |
| `Coupon` | Cupons de desconto |
| `CartItem` | Carrinho persistido no banco |
| `WishlistItem` | Favoritos por usuário |
| `Review` | Avaliações de produtos |
| `Banner` | Banners da home |

---

## 🎨 Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 15 (App Router) |
| Linguagem | TypeScript 5 |
| Estilização | TailwindCSS 3 |
| Banco de dados | SQLite (dev) / PostgreSQL (prod) |
| ORM | Prisma 5 |
| Autenticação | NextAuth v5 (Auth.js) |
| Estado | Zustand com persist |
| Formulários | React Hook Form + Zod |
| Animações | Framer Motion |
| Pagamentos | Mercado Pago SDK v2 |
| Gráficos | Recharts |
| Notificações | Sonner |
| Ícones | Lucide React |

---

## 📦 Dados de Seed

O seed cria automaticamente:
- **6 categorias**: Camisetas, Calças, Moletons, Tênis, Acessórios, Feminino
- **21 produtos** com imagens reais do Unsplash, descrições detalhadas e variações de cor/tamanho
- **3 cupons**: `BEMVINDO10` (10%), `FRETE20` (R$20), `VIP15` (15%)
- **3 banners** para a home
- **1 admin**: admin@lojamvp.com / Admin@123

---

## 🔒 Segurança

- Senhas com bcrypt (12 rounds)
- JWT com rotação automática
- Validação Zod em todos os endpoints
- Middleware de autenticação nas rotas protegidas
- Proteção de rotas admin por role
- Soft delete para produtos (nunca apaga dados)
- Webhook validado por status do pedido

---

## 📄 Licença

MIT — desenvolvido com ❤️ para ser usado e adaptado livremente.
