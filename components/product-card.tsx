"use client";

import Image from "next/image";
import Link from "next/link";
import { MessageCircle, ShoppingCart } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { FavoriteButton } from "@/components/favorite-button";
import { hasConfirmedPrice, productInquiryUrl, type Product } from "@/lib/catalog";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const hasPrice = hasConfirmedPrice(product);

  function handleAdd() {
    if (product.availability === "unavailable") return;
    if (product.sizes.length || product.colors.length) {
      window.location.href = `/produit/${product.slug}`;
      return;
    }
    addItem(product);
  }

  return (
    <article className="product-card">
      <div className="product-image-wrap">
      <Link className="product-image-link" href={`/produit/${product.slug}`} aria-label={`Voir ${product.name}`}>
        <Image src={product.image} alt={product.name} width={600} height={400} className="product-image" sizes="(max-width: 640px) 48vw, (max-width: 1024px) 30vw, 250px" />
      </Link>
      <FavoriteButton productId={product.id} compact className="product-favorite" />
      </div>
      <div className="product-details">
        <div className="product-card-heading"><Link href={`/produit/${product.slug}`}>{product.name}</Link>{product.promoLabel && <span className={`product-tag ${product.promoLabel.toLowerCase() === "promo" ? "tag-promo" : ""}`}>{product.promoLabel}</span>}</div>
        <div className={`product-prices ${hasPrice ? "" : "price-on-request"}`}>{hasPrice ? <><strong>{product.priceUsd.toFixed(2)} USD</strong>{product.priceCdf ? <span>{product.priceCdf.toLocaleString("fr-FR")} CDF</span> : null}</> : <strong>Prix sur demande</strong>}</div>
        <div className="availability-note"><span /> Disponibilité à confirmer</div>
        {!hasPrice ? <a className="add-to-cart-button inquiry-button" href={productInquiryUrl(product)} target="_blank" rel="noreferrer"><MessageCircle size={16} /> Demander le prix</a>
          : <button className="add-to-cart-button" onClick={handleAdd} disabled={product.availability === "unavailable"}><ShoppingCart size={16} /> {product.availability === "unavailable" ? "Indisponible" : product.sizes.length || product.colors.length ? "Choisir les options" : "Ajouter au panier"}</button>}
      </div>
    </article>
  );
}
