export type Availability = "available" | "check" | "preorder" | "unavailable";

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  image: string;
  images: string[];
  priceUsd: number;
  priceCdf: number | null;
  sizes: string[];
  colors: string[];
  availability: Availability;
  promoLabel?: string | null;
  isActive: boolean;
};

export const categories = [
  { name: "Vêtements", slug: "vetements", image: "/images/category-1.png", count: "Élégance au quotidien" },
  { name: "Perruques", slug: "perruques", image: "/images/category-2.png", count: "Beauté & caractère" },
  { name: "Chaussures", slug: "chaussures", image: "/images/category-3.png", count: "Le détail qui change tout" },
  { name: "Sacs & accessoires", slug: "sacs-accessoires", image: "/images/category-4.png", count: "Vos essentiels précieux" },
  { name: "Bijoux", slug: "bijoux", image: "/images/category-5.png", count: "Une touche d'éclat" },
];

export const demoProducts: Product[] = [
  {
    id: "00000000-0000-4000-8000-000000000001",
    slug: "robe-de-soiree-elegance",
    name: "Robe de soirée Élégance",
    description: "Une silhouette lumineuse et raffinée, pensée pour vos plus beaux moments.",
    category: "Vêtements",
    image: "/images/product-1.png",
    images: ["/images/product-1.png"],
    priceUsd: 89.99,
    priceCdf: 135000,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Bordeaux", "Rose poudré"],
    availability: "check",
    promoLabel: "Nouveau",
    isActive: true,
  },
  {
    id: "00000000-0000-4000-8000-000000000002",
    slug: "robe-princesse-chic",
    name: "Robe Princesse Chic",
    description: "Une robe rose délicate aux détails précieux, pour une allure inoubliable.",
    category: "Vêtements",
    image: "/images/product-2.png",
    images: ["/images/product-2.png"],
    priceUsd: 79.99,
    priceCdf: 120000,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Rose", "Champagne"],
    availability: "check",
    promoLabel: "Promo",
    isActive: true,
  },
  {
    id: "00000000-0000-4000-8000-000000000003",
    slug: "robe-royale",
    name: "Robe Royale",
    description: "Un noir profond et une coupe élégante pour une présence remarquée.",
    category: "Vêtements",
    image: "/images/product-3.png",
    images: ["/images/product-3.png"],
    priceUsd: 94.99,
    priceCdf: 145000,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Noir"],
    availability: "check",
    promoLabel: "Nouveau",
    isActive: true,
  },
  {
    id: "00000000-0000-4000-8000-000000000004",
    slug: "robe-soleil-dor",
    name: "Robe Soleil d'Or",
    description: "Une robe dorée pleine de grâce, imaginée pour les célébrations.",
    category: "Vêtements",
    image: "/images/product-4.png",
    images: ["/images/product-4.png"],
    priceUsd: 74.99,
    priceCdf: 110000,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Or"],
    availability: "check",
    promoLabel: "Promo",
    isActive: true,
  },
  {
    id: "00000000-0000-4000-8000-000000000005",
    slug: "perruque-glamour-lace",
    name: "Perruque Glamour Lace",
    description: "Une finition soignée pour un style naturel et plein d'assurance.",
    category: "Perruques",
    image: "/images/category-2.png",
    images: ["/images/category-2.png"],
    priceUsd: 79.99,
    priceCdf: 120000,
    sizes: [],
    colors: ["Noir naturel"],
    availability: "check",
    promoLabel: null,
    isActive: true,
  },
  {
    id: "00000000-0000-4000-8000-000000000006",
    slug: "chaussures-elegance",
    name: "Chaussures Élégance",
    description: "Une paire féminine pour compléter une tenue avec délicatesse.",
    category: "Chaussures",
    image: "/images/category-3.png",
    images: ["/images/category-3.png"],
    priceUsd: 69.99,
    priceCdf: 105000,
    sizes: ["36", "37", "38", "39", "40"],
    colors: ["Rose poudré", "Noir"],
    availability: "check",
    promoLabel: null,
    isActive: true,
  },
  {
    id: "00000000-0000-4000-8000-000000000007",
    slug: "sac-chic-prestige",
    name: "Sac Chic Prestige",
    description: "Un sac structuré et lumineux pour accompagner toutes vos sorties.",
    category: "Sacs & accessoires",
    image: "/images/category-4.png",
    images: ["/images/category-4.png"],
    priceUsd: 59.99,
    priceCdf: 90000,
    sizes: [],
    colors: ["Rose", "Champagne"],
    availability: "check",
    promoLabel: null,
    isActive: true,
  },
  {
    id: "00000000-0000-4000-8000-000000000008",
    slug: "parure-eclat",
    name: "Parure Éclat",
    description: "Une parure délicate qui apporte une touche de lumière à votre tenue.",
    category: "Bijoux",
    image: "/images/category-5.png",
    images: ["/images/category-5.png"],
    priceUsd: 39.99,
    priceCdf: 60000,
    sizes: [],
    colors: ["Doré"],
    availability: "check",
    promoLabel: null,
    isActive: true,
  },
];

export function mapProductRow(row: Record<string, unknown>): Product {
  const imageList = Array.isArray(row.image_urls) ? row.image_urls.filter((item): item is string => typeof item === "string") : [];
  const usd = Number(row.price_usd ?? 0);
  const cdfValue = row.price_cdf === null || row.price_cdf === undefined ? null : Number(row.price_cdf);
  const availability = ["available", "check", "preorder", "unavailable"].includes(String(row.availability))
    ? (row.availability as Availability)
    : "check";

  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.title),
    description: String(row.description ?? ""),
    category: String(row.category),
    image: imageList[0] ?? "/images/product-1.png",
    images: imageList.length ? imageList : ["/images/product-1.png"],
    priceUsd: Number.isFinite(usd) ? usd : 0,
    priceCdf: cdfValue !== null && Number.isFinite(cdfValue) ? cdfValue : null,
    sizes: Array.isArray(row.sizes) ? row.sizes.filter((item): item is string => typeof item === "string") : [],
    colors: Array.isArray(row.colors) ? row.colors.filter((item): item is string => typeof item === "string") : [],
    availability,
    promoLabel: typeof row.promo_label === "string" ? row.promo_label : null,
    isActive: row.is_active !== false,
  };
}
