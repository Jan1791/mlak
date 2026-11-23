"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type FavoritesContextValue = {
  favoriteIds: string[];
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (productId: string) => void;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);
const FAVORITES_KEY = "maison-lydia-favorites-v1";

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const value = window.localStorage.getItem(FAVORITES_KEY);
      const parsed = value ? JSON.parse(value) as unknown : [];
      if (Array.isArray(parsed)) setFavoriteIds(parsed.filter((item): item is string => typeof item === "string"));
    } catch {
      window.localStorage.removeItem(FAVORITES_KEY);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(favoriteIds));
  }, [favoriteIds, hydrated]);

  const isFavorite = useCallback((productId: string) => favoriteIds.includes(productId), [favoriteIds]);
  const toggleFavorite = useCallback((productId: string) => {
    setFavoriteIds((current) => current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId]);
  }, []);
  const value = useMemo(() => ({ favoriteIds, isFavorite, toggleFavorite }), [favoriteIds, isFavorite, toggleFavorite]);

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error("useFavorites must be used within FavoritesProvider");
  return context;
}
