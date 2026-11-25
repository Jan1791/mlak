"use client";

import { useEffect, useState } from "react";
import { demoProducts, mapProductRow, type Product } from "@/lib/catalog";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function useCatalog() {
  const [products, setProducts] = useState<Product[]>(demoProducts);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;
    let cancelled = false;

    void supabase
      .from("products")
      .select("id,slug,title,description,category,image_urls,price_usd,price_cdf,sizes,colors,availability,promo_label,is_active")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (cancelled || error || !data?.length) return;
        const databaseProducts = data.map((row) => mapProductRow(row));
        const generatedSlugs = new Set(demoProducts.map((product) => product.slug));
        const catalogMigrationApplied = databaseProducts.some((product) => generatedSlugs.has(product.slug));
        if (catalogMigrationApplied || demoProducts.length === 0) {
          setProducts(databaseProducts);
        } else {
          // Until the matching catalog migration is applied, show the shipped collection files.
          setProducts(demoProducts);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return products;
}
