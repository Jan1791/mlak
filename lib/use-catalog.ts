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
        if (!cancelled && !error && data?.length) setProducts(data.map((row) => mapProductRow(row)));
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return products;
}
