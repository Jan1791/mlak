"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, MessageCircle, ShoppingCart } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { FavoriteButton } from "@/components/favorite-button";
import { demoProducts, hasConfirmedPrice, mapProductRow, productInquiryUrl, type Product } from "@/lib/catalog";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function ProductDetailView({ slug }: { slug: string }) {
  const [product, setProduct] = useState<Product | null>(() => demoProducts.find((item) => item.slug === slug) ?? null);
  const [loading, setLoading] = useState(!demoProducts.some((item) => item.slug === slug));
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [added, setAdded] = useState(false);
  const [optionError, setOptionError] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const { addItem } = useCart();

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) { setLoading(false); return; }
    let cancelled = false;
    void supabase.from("products")
      .select("id,slug,title,description,category,image_urls,price_usd,price_cdf,sizes,colors,availability,promo_label,is_active")
      .eq("slug", slug).eq("is_active", true).maybeSingle()
      .then(({ data }) => {
        if (!cancelled && data) setProduct(mapProductRow(data));
        if (!cancelled) setLoading(false);
      });
    const timeout = window.setTimeout(() => { if (!cancelled) setLoading(false); }, 2500);
    return () => { cancelled = true; window.clearTimeout(timeout); };
  }, [slug]);

  if (loading) return <section className="content-section detail-wrap"><div className="empty-state">Chargement de la fiche produit...</div></section>;
  if (!product) return <section className="content-section detail-wrap"><div className="empty-state"><h2>Article introuvable</h2><p>Cette fiche n'est pas disponible dans la boutique.</p><Link className="secondary-button" href="/boutique"><ArrowLeft size={15} /> Revenir à la boutique</Link></div></section>;
  const hasPrice = hasConfirmedPrice(product);

  function addToCart() {
    if (product!.availability === "unavailable") {
      setOptionError("Cet article est actuellement indisponible.");
      return;
    }
    if ((product!.sizes.length && !size) || (product!.colors.length && !color)) {
      setOptionError("Choisissez les options souhaitées avant l'ajout au panier.");
      return;
    }
    setOptionError("");
    setAdded(false);
    addItem(product!, size, color);
    setAdded(true);
  }

  return (
    <section className="content-section detail-wrap">
      <div className="breadcrumbs"><Link href="/">Accueil</Link><span>›</span><Link href="/boutique">Boutique</Link><span>›</span><span>{product.name}</span></div>
      <div className="product-detail">
        <div className="detail-gallery"><div className="detail-photo"><Image src={product.images[selectedImage] ?? product.image} alt={`${product.name} — photo ${selectedImage + 1}`} width={900} height={1000} priority /></div>{product.images.length > 1 && <div className="detail-thumbnails" aria-label="Photos du produit">{product.images.map((image, index) => <button className={selectedImage === index ? "active" : ""} onClick={() => setSelectedImage(index)} type="button" aria-label={`Afficher la photo ${index + 1}`} key={image}><Image src={image} alt="" width={90} height={90} /></button>)}</div>}</div>
        <div className="detail-info">
          <span className="eyebrow">{product.category}</span>
          <h1>{product.name}</h1>
          <p className="detail-description">{product.description}</p>
          <div className={`detail-price ${hasPrice ? "" : "price-on-request"}`}>{hasPrice ? <><strong>{product.priceUsd.toFixed(2)} USD</strong>{product.priceCdf ? <span>{product.priceCdf.toLocaleString("fr-FR")} CDF</span> : null}</> : <strong>Prix à confirmer avec la boutique</strong>}</div>
          <div className="availability-note"><span /> Disponibilité, prix final et délai à confirmer avec la boutique.</div>
          <div className="detail-options">
            {product.sizes.length > 0 && <label>Taille<select value={size} onChange={(event) => setSize(event.target.value)}><option value="">Choisir une taille</option>{product.sizes.map((item) => <option value={item} key={item}>{item}</option>)}</select></label>}
            {product.colors.length > 0 && <label>Couleur<select value={color} onChange={(event) => setColor(event.target.value)}><option value="">Choisir une couleur</option>{product.colors.map((item) => <option value={item} key={item}>{item}</option>)}</select></label>}
          </div>
          <div className="detail-actions">{hasPrice ? <button className="primary-button" onClick={addToCart} disabled={product.availability === "unavailable"}><ShoppingCart size={17} /> {product.availability === "unavailable" ? "Indisponible" : "Ajouter au panier"}</button> : <a className="primary-button" href={productInquiryUrl(product)} target="_blank" rel="noreferrer"><MessageCircle size={17} /> Demander le prix sur WhatsApp</a>}<FavoriteButton productId={product.id} className="detail-favorite" /></div>
          {optionError && <p className="checkout-error" role="alert">{optionError}</p>}
          {added && <p className="success-note" role="status"><CheckCircle2 size={16} /> Ajouté au panier. <Link href="/panier">Voir mon panier</Link></p>}
          <p className="confirmation-hint">Votre demande n'engage aucun paiement. Maison Lydia AK vous confirme le prix, la disponibilité et le délai avant de préparer votre article.</p>
        </div>
      </div>
    </section>
  );
}
