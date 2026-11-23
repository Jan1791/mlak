"use client";

import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { useFavorites } from "@/components/favorites-provider";
import { ProductCard } from "@/components/product-card";
import { useCatalog } from "@/lib/use-catalog";

export function FavoritesPage() {
  const products = useCatalog().filter((product) => product.isActive);
  const { favoriteIds } = useFavorites();
  const favorites = products.filter((product) => favoriteIds.includes(product.id));

  return (
    <>
      <section className="page-heading"><span className="eyebrow"><Heart size={14} /> Votre sélection</span><h1>Mes favoris</h1><p>Retrouvez ici les pièces que vous avez enregistrées sur cet appareil.</p></section>
      <section className="content-section favorites-layout">
        {favorites.length ? <div className="product-grid">{favorites.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="empty-state"><Heart size={28} /><h2>Votre sélection est encore vide</h2><p>Ajoutez une pièce à vos favoris avec le cœur affiché sur sa photo.</p><Link href="/boutique" className="primary-button"><ShoppingBag size={16} /> Découvrir la boutique</Link></div>}
      </section>
    </>
  );
}
