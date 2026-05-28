// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed da Loja MVP...");

  // ─── CATEGORIAS ────────────────────────────────────────────────────────────
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "camisetas" },
      update: {},
      create: {
        name: "Camisetas",
        slug: "camisetas",
        description: "Camisetas modernas para todos os estilos",
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
      },
    }),
    prisma.category.upsert({
      where: { slug: "calcas" },
      update: {},
      create: {
        name: "Calças",
        slug: "calcas",
        description: "Calças jeans, moletom e alfaiataria",
        image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400",
      },
    }),
    prisma.category.upsert({
      where: { slug: "moletons" },
      update: {},
      create: {
        name: "Moletons",
        slug: "moletons",
        description: "Moletons e hoodies premium",
        image: "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=400",
      },
    }),
    prisma.category.upsert({
      where: { slug: "tenis" },
      update: {},
      create: {
        name: "Tênis",
        slug: "tenis",
        description: "Tênis para estilo e performance",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
      },
    }),
    prisma.category.upsert({
      where: { slug: "acessorios" },
      update: {},
      create: {
        name: "Acessórios",
        slug: "acessorios",
        description: "Bonés, bolsas, cintos e mais",
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400",
      },
    }),
    prisma.category.upsert({
      where: { slug: "feminino" },
      update: {},
      create: {
        name: "Feminino",
        slug: "feminino",
        description: "Coleção feminina exclusiva",
        image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400",
      },
    }),
  ]);

  const [catCamisetas, catCalcas, catMoletons, catTenis, catAcessorios, catFeminino] = categories;

  // ─── PRODUTOS ──────────────────────────────────────────────────────────────
  const produtos = [
    // CAMISETAS
    {
      name: "Camiseta Essentials Off-White",
      slug: "camiseta-essentials-off-white",
      description: "A base de qualquer guarda-roupa moderno. Algodão pima 180g com caimento perfeito. Corte regular levemente oversized, costuras duplas reforçadas e toque acetinado que não perde após lavagens.",
      price: 89.90,
      originalPrice: 119.90,
      sku: "CAM-ESS-OW-001",
      stock: 45,
      sold: 312,
      featured: true,
      isNew: false,
      categoryId: catCamisetas.id,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600",
        "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600",
        "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600",
      ]),
      sizes: JSON.stringify(["PP","P","M","G","GG","XG"]),
      colors: JSON.stringify([
        { name: "Off-White", hex: "#F5F0E8" },
        { name: "Preto", hex: "#0A0A0A" },
        { name: "Cinza Mescla", hex: "#9B9B9B" },
      ]),
    },
    {
      name: "Camiseta Oversized Drop Shoulder",
      slug: "camiseta-oversized-drop-shoulder",
      description: "Modelagem oversized com ombro caído para aquele look streetwear autêntico. Malha densa 220g, tingimento reativo que intensifica a cor com cada lavagem.",
      price: 109.90,
      originalPrice: null,
      sku: "CAM-OVR-DS-002",
      stock: 30,
      sold: 189,
      featured: true,
      isNew: true,
      categoryId: catCamisetas.id,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600",
        "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600",
      ]),
      sizes: JSON.stringify(["P","M","G","GG","XG"]),
      colors: JSON.stringify([
        { name: "Preto", hex: "#0A0A0A" },
        { name: "Areia", hex: "#C4A882" },
        { name: "Verde Militar", hex: "#4A5240" },
      ]),
    },
    {
      name: "Camiseta Gráfica Urban Arts",
      slug: "camiseta-grafica-urban-arts",
      description: "Estampa artesanal serigrafada à mão por artistas urbanos locais. Cada peça tem pequenas variações que a tornam única. Algodão orgânico certificado.",
      price: 129.90,
      originalPrice: 159.90,
      sku: "CAM-GRF-UA-003",
      stock: 22,
      sold: 97,
      featured: false,
      isNew: true,
      categoryId: catCamisetas.id,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=600",
        "https://images.unsplash.com/photo-1527719327859-c6ce80353573?w=600",
      ]),
      sizes: JSON.stringify(["PP","P","M","G","GG"]),
      colors: JSON.stringify([
        { name: "Branco", hex: "#FFFFFF" },
        { name: "Preto", hex: "#0A0A0A" },
      ]),
    },
    {
      name: "Camiseta Polo Premium Piqué",
      slug: "camiseta-polo-premium-pique",
      description: "Polo clássica revisitada com tecido piqué de alta gramatura. Gola e punhos em rib resistente. Bordado discreto no peito com acabamento impecável.",
      price: 149.90,
      originalPrice: 189.90,
      sku: "CAM-POL-PQ-004",
      stock: 38,
      sold: 224,
      featured: true,
      isNew: false,
      categoryId: catCamisetas.id,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=600",
        "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600",
      ]),
      sizes: JSON.stringify(["PP","P","M","G","GG","XG"]),
      colors: JSON.stringify([
        { name: "Branco", hex: "#FFFFFF" },
        { name: "Azul Marinho", hex: "#1B2A4A" },
        { name: "Preto", hex: "#0A0A0A" },
        { name: "Vinho", hex: "#6B2737" },
      ]),
    },
    // CALÇAS
    {
      name: "Calça Jeans Slim Dark",
      slug: "calca-jeans-slim-dark",
      description: "Denim japão 12oz com lavagem escura exclusiva. Elastano 2% para mobilidade sem perder a forma. Cinco bolsos funcionais, zíper YKK e rebites de cobre.",
      price: 219.90,
      originalPrice: 279.90,
      sku: "CAL-JNS-SL-001",
      stock: 25,
      sold: 445,
      featured: true,
      isNew: false,
      categoryId: catCalcas.id,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600",
        "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600",
      ]),
      sizes: JSON.stringify(["36","38","40","42","44","46"]),
      colors: JSON.stringify([
        { name: "Índigo Escuro", hex: "#1A237E" },
        { name: "Preto", hex: "#0A0A0A" },
      ]),
    },
    {
      name: "Calça Moletom Jogger Relaxed",
      slug: "calca-moletom-jogger-relaxed",
      description: "A calça mais confortável que você vai usar. Moletom pesado 320g, elástico waistband duplo e bolsos laterais com zíper. Do sofá para a rua sem esforço.",
      price: 169.90,
      originalPrice: null,
      sku: "CAL-MOL-JG-002",
      stock: 40,
      sold: 321,
      featured: true,
      isNew: false,
      categoryId: catCalcas.id,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600",
        "https://images.unsplash.com/photo-1547949003-9792a18a2601?w=600",
      ]),
      sizes: JSON.stringify(["PP","P","M","G","GG","XG"]),
      colors: JSON.stringify([
        { name: "Cinza Chumbo", hex: "#4A4A4A" },
        { name: "Preto", hex: "#0A0A0A" },
        { name: "Bege", hex: "#C9B99A" },
      ]),
    },
    {
      name: "Calça Cargo Utilitária",
      slug: "calca-cargo-utilitaria",
      description: "Estilo funcional com múltiplos bolsos utilitários. Sarja de algodão resistente, acabamento militar e caimento relaxado que domina o streetwear atual.",
      price: 239.90,
      originalPrice: 289.90,
      sku: "CAL-CRG-UT-003",
      stock: 18,
      sold: 156,
      featured: false,
      isNew: true,
      categoryId: catCalcas.id,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1560243563-062bfc001d68?w=600",
        "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600",
      ]),
      sizes: JSON.stringify(["PP","P","M","G","GG"]),
      colors: JSON.stringify([
        { name: "Verde Militar", hex: "#4A5240" },
        { name: "Bege", hex: "#C9B99A" },
        { name: "Preto", hex: "#0A0A0A" },
      ]),
    },
    // MOLETONS
    {
      name: "Moletom Hoodie Essential",
      slug: "moletom-hoodie-essential",
      description: "O hoodie definitivo. Fleece 400g com interior peluciado, capuz estruturado com cordão achatado e bolso canguru espaçoso. Não encolhe, não empola.",
      price: 249.90,
      originalPrice: 319.90,
      sku: "MOL-HOD-ES-001",
      stock: 35,
      sold: 567,
      featured: true,
      isNew: false,
      categoryId: catMoletons.id,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600",
        "https://images.unsplash.com/photo-1615397349754-cfa2066a298e?w=600",
        "https://images.unsplash.com/photo-1509942774463-acf339cf87d5?w=600",
      ]),
      sizes: JSON.stringify(["PP","P","M","G","GG","XG"]),
      colors: JSON.stringify([
        { name: "Preto", hex: "#0A0A0A" },
        { name: "Cinza Mescla", hex: "#9B9B9B" },
        { name: "Off-White", hex: "#F5F0E8" },
        { name: "Navy", hex: "#1B2A4A" },
      ]),
    },
    {
      name: "Moletom Crewneck Vintage",
      slug: "moletom-crewneck-vintage",
      description: "Gola redonda com visual vintage intencionalmente desbotado. Bordado tonal no peito, interior felpudo e bainhas em rib duplo. Lavagem especial que simula anos de uso.",
      price: 219.90,
      originalPrice: 259.90,
      sku: "MOL-CRW-VT-002",
      stock: 28,
      sold: 203,
      featured: false,
      isNew: true,
      categoryId: catMoletons.id,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1532347231146-80afc9e3df2b?w=600",
        "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=600",
      ]),
      sizes: JSON.stringify(["P","M","G","GG","XG"]),
      colors: JSON.stringify([
        { name: "Azul Vintage", hex: "#5C7A9F" },
        { name: "Bordo Vintage", hex: "#7B3F52" },
        { name: "Verde Vintage", hex: "#5E7A5F" },
      ]),
    },
    {
      name: "Moletom Zip Full Premium",
      slug: "moletom-zip-full-premium",
      description: "Moletom com zíper integral YKK, dois bolsos laterais com zíper e capuz estruturado. Tecnologia anti-pilling que mantém a superfície lisa por anos.",
      price: 289.90,
      originalPrice: 359.90,
      sku: "MOL-ZIP-PR-003",
      stock: 20,
      sold: 134,
      featured: true,
      isNew: false,
      categoryId: catMoletons.id,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600",
        "https://images.unsplash.com/photo-1631541911232-be4f35e4c7f4?w=600",
      ]),
      sizes: JSON.stringify(["PP","P","M","G","GG","XG"]),
      colors: JSON.stringify([
        { name: "Preto", hex: "#0A0A0A" },
        { name: "Cinza Escuro", hex: "#3A3A3A" },
      ]),
    },
    // TÊNIS
    {
      name: "Tênis Runner Pro All-Day",
      slug: "tenis-runner-pro-all-day",
      description: "Solado EVA de alto retorno com amortecimento zoned para corrida e uso diário. Upper em mesh respirável, entressola leve de 195g e tração multidirecional.",
      price: 349.90,
      originalPrice: 449.90,
      sku: "TEN-RUN-PR-001",
      stock: 22,
      sold: 388,
      featured: true,
      isNew: false,
      categoryId: catTenis.id,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
        "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600",
        "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600",
      ]),
      sizes: JSON.stringify(["37","38","39","40","41","42","43","44"]),
      colors: JSON.stringify([
        { name: "Branco/Preto", hex: "#FFFFFF" },
        { name: "Preto Total", hex: "#0A0A0A" },
        { name: "Cinza/Laranja", hex: "#9B9B9B" },
      ]),
    },
    {
      name: "Tênis Chunky Platform",
      slug: "tenis-chunky-platform",
      description: "Solado tratorado de 4cm com visual chunky que domina as ruas. Cabedal em couro sintético premium, ilhós metálicos e palmilha anatômica removível.",
      price: 399.90,
      originalPrice: 479.90,
      sku: "TEN-CHK-PL-002",
      stock: 15,
      sold: 167,
      featured: true,
      isNew: true,
      categoryId: catTenis.id,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600",
        "https://images.unsplash.com/photo-1518894781321-630e638d0742?w=600",
      ]),
      sizes: JSON.stringify(["36","37","38","39","40","41","42","43"]),
      colors: JSON.stringify([
        { name: "Branco", hex: "#FFFFFF" },
        { name: "Preto", hex: "#0A0A0A" },
      ]),
    },
    {
      name: "Tênis Skate Low Top",
      slug: "tenis-skate-low-top",
      description: "Clássico do skate revisitado com suede e lona vulcanizada. Palmilha Ortholite de dupla camada, lateral reforçada e olival flat original.",
      price: 279.90,
      originalPrice: null,
      sku: "TEN-SKT-LT-003",
      stock: 30,
      sold: 290,
      featured: false,
      isNew: false,
      categoryId: catTenis.id,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1467043237213-65f2da53396f?w=600",
        "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600",
      ]),
      sizes: JSON.stringify(["37","38","39","40","41","42","43","44","45"]),
      colors: JSON.stringify([
        { name: "Camelo", hex: "#C19A6B" },
        { name: "Preto", hex: "#0A0A0A" },
        { name: "Branco/Gum", hex: "#F5F0E8" },
      ]),
    },
    // ACESSÓRIOS
    {
      name: "Boné Dad Hat Washed",
      slug: "bone-dad-hat-washed",
      description: "Dad hat com lavagem especial que entrega o look usado desde o primeiro uso. Fecho ajustável em metal, interior em suor wicking e aba pré-curvada.",
      price: 89.90,
      originalPrice: 109.90,
      sku: "ACE-BON-DH-001",
      stock: 50,
      sold: 412,
      featured: false,
      isNew: false,
      categoryId: catAcessorios.id,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600",
        "https://images.unsplash.com/photo-1521369909029-2afed882baee?w=600",
      ]),
      sizes: JSON.stringify(["Único"]),
      colors: JSON.stringify([
        { name: "Preto", hex: "#0A0A0A" },
        { name: "Areia", hex: "#C4A882" },
        { name: "Verde Militar", hex: "#4A5240" },
        { name: "Azul Marinho", hex: "#1B2A4A" },
      ]),
    },
    {
      name: "Mochila Tática Urbana 25L",
      slug: "mochila-tatica-urbana-25l",
      description: "25 litros de capacidade com compartimento acolchoado para notebook 15', organizador frontal, alça esternal e costas ventiladas. Material 600D resistente à água.",
      price: 279.90,
      originalPrice: 349.90,
      sku: "ACE-MOC-TU-002",
      stock: 18,
      sold: 145,
      featured: true,
      isNew: false,
      categoryId: catAcessorios.id,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600",
        "https://images.unsplash.com/photo-1491637639811-60e2756cc1c7?w=600",
      ]),
      sizes: JSON.stringify(["Único"]),
      colors: JSON.stringify([
        { name: "Preto", hex: "#0A0A0A" },
        { name: "Cinza", hex: "#6B6B6B" },
        { name: "Verde Militar", hex: "#4A5240" },
      ]),
    },
    {
      name: "Cinto Couro Genuíno 3.5cm",
      slug: "cinto-couro-genuino",
      description: "Couro bovino curtido ao vegetal com 4mm de espessura. Fivela em aço inox escovado, borda pintada à mão e 5 furos com espaçamento perfeito.",
      price: 119.90,
      originalPrice: null,
      sku: "ACE-CIN-CG-003",
      stock: 35,
      sold: 198,
      featured: false,
      isNew: false,
      categoryId: catAcessorios.id,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600",
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600",
      ]),
      sizes: JSON.stringify(["85cm","90cm","95cm","100cm","105cm","110cm"]),
      colors: JSON.stringify([
        { name: "Preto", hex: "#0A0A0A" },
        { name: "Marrom", hex: "#6B4226" },
      ]),
    },
    // FEMININO
    {
      name: "Vestido Midi Transpassado",
      slug: "vestido-midi-transpassado",
      description: "Viscose fluida com caimento impecável. Decote V transpassado, cinto ajustável incluso e comprimento midi versátil. Do trabalho ao jantar sem trocar de roupa.",
      price: 199.90,
      originalPrice: 259.90,
      sku: "FEM-VES-MD-001",
      stock: 25,
      sold: 334,
      featured: true,
      isNew: false,
      categoryId: catFeminino.id,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600",
        "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600",
      ]),
      sizes: JSON.stringify(["PP","P","M","G","GG"]),
      colors: JSON.stringify([
        { name: "Preto", hex: "#0A0A0A" },
        { name: "Terracota", hex: "#C1603A" },
        { name: "Verde Sage", hex: "#87A878" },
      ]),
    },
    {
      name: "Blazer Alfaiataria Slim",
      slug: "blazer-alfaiataria-slim",
      description: "Blend de lã e poliéster com caimento slim profissional. Lapela notch, dois botões frontais, bolsos com aba e forro em acetato suave. Atemporal e versátil.",
      price: 379.90,
      originalPrice: 479.90,
      sku: "FEM-BLZ-AL-002",
      stock: 15,
      sold: 112,
      featured: true,
      isNew: true,
      categoryId: catFeminino.id,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600",
        "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=600",
      ]),
      sizes: JSON.stringify(["PP","P","M","G","GG"]),
      colors: JSON.stringify([
        { name: "Preto", hex: "#0A0A0A" },
        { name: "Off-White", hex: "#F5F0E8" },
        { name: "Camel", hex: "#C19A6B" },
      ]),
    },
    {
      name: "Calça Wide Leg Linho",
      slug: "calca-wide-leg-linho",
      description: "Blend de linho e viscose com modelagem wide leg fluida. Cintura alta com cós largo, bolsos laterais e barra reta. Levíssima para o calor brasileiro.",
      price: 229.90,
      originalPrice: 279.90,
      sku: "FEM-CAL-WL-003",
      stock: 20,
      sold: 267,
      featured: false,
      isNew: true,
      categoryId: catFeminino.id,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600",
        "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600",
      ]),
      sizes: JSON.stringify(["PP","P","M","G","GG"]),
      colors: JSON.stringify([
        { name: "Off-White", hex: "#F5F0E8" },
        { name: "Camel", hex: "#C19A6B" },
        { name: "Preto", hex: "#0A0A0A" },
        { name: "Azul Claro", hex: "#A8C5DA" },
      ]),
    },
    {
      name: "Top Cropped Ribana Premium",
      slug: "top-cropped-ribana-premium",
      description: "Ribana stretch de alta qualidade com 8% elastano. Alça fina ajustável, bojo removível e comprimento cropped que combina com qualquer saia ou calça de cintura alta.",
      price: 79.90,
      originalPrice: 99.90,
      sku: "FEM-TOP-CR-004",
      stock: 45,
      sold: 523,
      featured: true,
      isNew: false,
      categoryId: catFeminino.id,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1583496661160-fb5886a773f2?w=600",
        "https://images.unsplash.com/photo-1571513722275-4b41940f54b8?w=600",
      ]),
      sizes: JSON.stringify(["PP","P","M","G","GG"]),
      colors: JSON.stringify([
        { name: "Preto", hex: "#0A0A0A" },
        { name: "Branco", hex: "#FFFFFF" },
        { name: "Bege", hex: "#C9B99A" },
        { name: "Rosa Antigo", hex: "#C4A0A0" },
        { name: "Verde Sage", hex: "#87A878" },
      ]),
    },
    {
      name: "Jaqueta Corta-Vento Técnica",
      slug: "jaqueta-corta-vento-tecnica",
      description: "Shell em nylon ripstop com tecnologia DWR repelente à água. Respirável, empacotável no próprio bolso e com costura selada nas emendas principais.",
      price: 319.90,
      originalPrice: 399.90,
      sku: "CAM-JAQ-CV-005",
      stock: 22,
      sold: 178,
      featured: true,
      isNew: false,
      categoryId: catCamisetas.id,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600",
        "https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=600",
      ]),
      sizes: JSON.stringify(["PP","P","M","G","GG","XG"]),
      colors: JSON.stringify([
        { name: "Preto", hex: "#0A0A0A" },
        { name: "Verde Floresta", hex: "#2D4A2D" },
        { name: "Azul Marinho", hex: "#1B2A4A" },
      ]),
    },
  ];

  for (const produto of produtos) {
    await prisma.product.upsert({
      where: { slug: produto.slug },
      update: {},
      create: produto,
    });
  }

  console.log(`✅ ${produtos.length} produtos criados`);

  // ─── CUPONS ────────────────────────────────────────────────────────────────
  await prisma.coupon.upsert({
    where: { code: "BEMVINDO10" },
    update: {},
    create: {
      code: "BEMVINDO10",
      type: "PERCENTAGE",
      value: 10,
      minOrder: 100,
      maxUses: 500,
      active: true,
    },
  });

  await prisma.coupon.upsert({
    where: { code: "FRETE20" },
    update: {},
    create: {
      code: "FRETE20",
      type: "FIXED",
      value: 20,
      minOrder: 150,
      maxUses: null,
      active: true,
    },
  });

  await prisma.coupon.upsert({
    where: { code: "VIP15" },
    update: {},
    create: {
      code: "VIP15",
      type: "PERCENTAGE",
      value: 15,
      minOrder: 200,
      maxUses: 100,
      active: true,
    },
  });

  console.log("✅ 3 cupons criados");

  // ─── BANNERS ───────────────────────────────────────────────────────────────
  await prisma.banner.createMany({
    data: [
      {
        title: "Nova Coleção Inverno 2025",
        subtitle: "Até 40% OFF em peças selecionadas",
        image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200",
        link: "/produtos?categoria=moletons",
        active: true,
        order: 1,
      },
      {
        title: "Streetwear Autêntico",
        subtitle: "Looks que definem quem você é",
        image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200",
        link: "/produtos",
        active: true,
        order: 2,
      },
      {
        title: "Feminino Poderoso",
        subtitle: "Coleção exclusiva para mulheres que mandam",
        image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200",
        link: "/produtos?categoria=feminino",
        active: true,
        order: 3,
      },
    ],
    
  });

  console.log("✅ 3 banners criados");

  // ─── ADMIN ─────────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash("Admin@123", 12);
  await prisma.user.upsert({
    where: { email: "admin@lojamvp.com" },
    update: {},
    create: {
      name: "Admin Loja MVP",
      email: "admin@lojamvp.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  console.log("✅ Admin criado: admin@lojamvp.com / Admin@123");
  console.log("🎉 Seed concluído com sucesso!");
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
