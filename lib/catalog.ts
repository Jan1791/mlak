import collectionProducts from "@/lib/collection-products.generated.json";

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

export function hasConfirmedPrice(product: Pick<Product, "priceUsd">) {
  return product.priceUsd > 0;
}

export function productInquiryUrl(product: Pick<Product, "name" | "slug">) {
  const phone = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "243985986202").replace(/\D/g, "");
  const message = `Bonjour Maison Lydia AK, je souhaite connaître le prix et la disponibilité de « ${product.name} » (${product.slug}).`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

type CollectionProductSource = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  image_urls: string[];
  price_usd: number;
  price_cdf: number | null;
  sizes: string[];
  colors: string[];
  availability: Availability;
  promo_label: string | null;
  is_active: boolean;
};

export const demoProducts: Product[] = (collectionProducts as CollectionProductSource[]).map((row) => ({
  id: row.id,
  slug: row.slug,
  name: row.title,
  description: row.description,
  category: row.category,
  image: row.image_urls[0] ?? "/images/category-1.png",
  images: row.image_urls,
  priceUsd: Number(row.price_usd ?? 0),
  priceCdf: row.price_cdf === null ? null : Number(row.price_cdf),
  sizes: row.sizes ?? [],
  colors: row.colors ?? [],
  availability: row.availability,
  promoLabel: row.promo_label,
  isActive: row.is_active,
}));

const categoryNames = demoProducts.length
  ? [...new Set(demoProducts.map((product) => product.category))]
  : ["Robes", "Pantalons & jeans"];

export const categories = categoryNames.map((name, index) => ({
  name,
  slug: name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("fr").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
  image: demoProducts.find((product) => product.category === name)?.image ?? (index === 0 ? "/images/category-1.png" : "/images/category-3.png"),
  count: "Découvrez la sélection Maison Lydia AK",
}));

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
