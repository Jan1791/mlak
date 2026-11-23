"use client";

import { Heart } from "lucide-react";
import { useFavorites } from "@/components/favorites-provider";

export function FavoriteButton({ productId, className = "", compact = false }: { productId: string; className?: string; compact?: boolean }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const active = isFavorite(productId);
  return (
    <button
      type="button"
      className={`favorite-button ${active ? "is-favorite" : ""} ${compact ? "favorite-button-compact" : ""} ${className}`}
      aria-label={active ? "Retirer des favoris" : "Ajouter aux favoris"}
      aria-pressed={active}
      onClick={() => toggleFavorite(productId)}
    ><Heart size={compact ? 18 : 17} fill={active ? "currentColor" : "none"} /></button>
  );
}
