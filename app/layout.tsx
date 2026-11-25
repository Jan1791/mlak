import type { Metadata, Viewport } from "next";
import { CartProvider } from "@/components/cart-provider";
import { FavoritesProvider } from "@/components/favorites-provider";
import { PwaRegister } from "@/components/pwa-register";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Maison Lydia AK — L'élégance à votre portée",
    template: "%s | Maison Lydia AK",
  },
  description: "Découvrez les vêtements, accessoires et nouveautés Maison Lydia AK à Kisangani.",
  applicationName: "Maison Lydia AK",
  manifest: "/manifest.json",
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#733846",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr-CD">
      <body>
        <CartProvider><FavoritesProvider><PwaRegister />{children}</FavoritesProvider></CartProvider>
      </body>
    </html>
  );
}
