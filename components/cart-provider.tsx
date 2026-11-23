"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/catalog";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  image: string;
  priceUsd: number;
  priceCdf: number | null;
  quantity: number;
  size: string;
  color: string;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  totalUsd: number;
  totalCdf: number;
  addItem: (product: Product, size?: string, color?: string) => void;
  removeItem: (productId: string, size: string, color: string) => void;
  changeQuantity: (productId: string, size: string, color: string, quantity: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const CART_KEY = "maison-lydia-cart-v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(CART_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as CartItem[];
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch {
      window.localStorage.removeItem(CART_KEY);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [hydrated, items]);

  const addItem = useCallback((product: Product, size = "", color = "") => {
    setItems((current) => {
      const found = current.find((item) => item.productId === product.id && item.size === size && item.color === color);
      if (found) return current.map((item) => item === found ? { ...item, quantity: item.quantity + 1 } : item);
      return [...current, {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        image: product.image,
        priceUsd: product.priceUsd,
        priceCdf: product.priceCdf,
        quantity: 1,
        size,
        color,
      }];
    });
  }, []);

  const removeItem = useCallback((productId: string, size: string, color: string) => {
    setItems((current) => current.filter((item) => !(item.productId === productId && item.size === size && item.color === color)));
  }, []);

  const changeQuantity = useCallback((productId: string, size: string, color: string, quantity: number) => {
    if (quantity < 1) return removeItem(productId, size, color);
    setItems((current) => current.map((item) => item.productId === productId && item.size === size && item.color === color
      ? { ...item, quantity: Math.min(quantity, 20) }
      : item));
  }, [removeItem]);

  const clearCart = useCallback(() => setItems([]), []);
  const value = useMemo(() => ({
    items,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    totalUsd: items.reduce((sum, item) => sum + item.priceUsd * item.quantity, 0),
    totalCdf: items.reduce((sum, item) => sum + (item.priceCdf ?? 0) * item.quantity, 0),
    addItem,
    removeItem,
    changeQuantity,
    clearCart,
  }), [items, addItem, removeItem, changeQuantity, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
