"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Gem, Headphones, ShieldCheck, Truck } from "lucide-react";
import { categories } from "@/lib/catalog";
import { useCatalog } from "@/lib/use-catalog";
import { ProductCard } from "@/components/product-card";

function NewsletterCard() {
  const [email, setEmail] = useState("");
  const [consented, setConsented] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function subscribe(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!consented) {
      setMessage("Merci de confirmer votre inscription aux actualités.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, consent: consented }),
      });
      const result = await response.json();
      setMessage(response.ok ? "Merci, votre inscription est enregistrée." : (result.error ?? "Inscription momentanément indisponible."));
      if (response.ok) setEmail("");
    } catch {
      setMessage("Connexion indisponible. Réessayez dans un instant.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="newsletter-card">
      <div className="newsletter-crown">♛</div>
      <h3>Rejoignez<br />le Club Maison Lydia AK</h3>
      <p>Recevez nos nouveautés<br />et promotions en avant-première !</p>
      <form onSubmit={subscribe}>
        <div className="newsletter-form-row"><input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Votre e-mail" aria-label="Votre adresse e-mail" /><button disabled={busy || !consented} type="submit">{busy ? "..." : "S'inscrire"} <ArrowRight size={14} /></button></div>
        <label className="consent-line"><input type="checkbox" checked={consented} onChange={(event) => setConsented(event.target.checked)} /> J'accepte de recevoir les actualités.</label>
        <a className="newsletter-optout" href="https://wa.me/243985986202?text=Bonjour%2C%20je%20souhaite%20me%20d%C3%A9sinscrire%20des%20actualit%C3%A9s%20Maison%20Lydia%20AK." target="_blank" rel="noreferrer">Désinscription à tout moment via WhatsApp</a>
      </form>
      {message && <p className="form-message" role="status">{message}</p>}
    </div>
  );
}

export function StorefrontHome() {
  const products = useCatalog().filter((product) => product.isActive).slice(0, 4);

  return (
    <>
      <section className="hero-section" aria-label="Maison Lydia AK">
        <Image src="/images/hero-reference.png" alt="Maison Lydia AK, l'élégance à votre portée" width={1024} height={414} priority className="hero-image" sizes="100vw" />
        <Link href="/boutique" className="hero-cta" aria-label="Découvrir la collection">Découvrir la collection <ArrowRight size={19} /></Link>
      </section>
      <section className="service-strip" aria-label="Nos engagements">
        <div><Gem /><span><strong>Qualité Premium</strong><small>Mode d'exception</small></span></div>
        <div><Truck /><span><strong>Livraison rapide</strong><small>À Kisangani</small></span></div>
        <div><Headphones /><span><strong>Service client</strong><small>À votre écoute</small></span></div>
        <div><ShieldCheck /><span><strong>Paiement à convenir</strong><small>Modalités confirmées avec vous</small></span></div>
      </section>
      <section className="content-section category-section">
        <div className="section-title"><span /><h1>Nos Catégories</h1><span /></div>
        <div className="category-grid">
          {categories.map((category) => <Link href={`/boutique?categorie=${encodeURIComponent(category.name)}`} className="category-card" key={category.slug}>
            <span className="category-image-frame"><Image src={category.image} alt={category.name} width={200} height={200} /></span>
            <span className="category-label">{category.name}<ArrowRight size={14} /></span>
            <small>{category.count}</small>
          </Link>)}
        </div>
      </section>
      <section className="promo-newsletter content-section">
        <Link href="/boutique" className="collection-banner" aria-label="Découvrir la collection Prestige"><Image src="/images/collection-banner.png" alt="Collection Prestige, élégance, raffinement et beauté" width={666} height={173} sizes="(max-width: 760px) 100vw, 66vw" /></Link>
        <NewsletterCard />
      </section>
      <section className="content-section new-arrivals-section">
        <div className="section-title section-title-with-action"><span /><h2>Nos Nouveautés</h2><span /><Link href="/boutique">Voir tout <ArrowRight size={15} /></Link></div>
        <div className="product-grid home-products">{products.map((product) => <ProductCard product={product} key={product.id} />)}</div>
        <div className="availability-banner"><span>Une pièce vous plaît ?</span> Envoyez votre demande : nous confirmons la disponibilité, le prix final et le délai avec vous. <a href="https://wa.me/243985986202" target="_blank" rel="noreferrer">Écrire sur WhatsApp <ArrowRight size={15} /></a></div>
      </section>
    </>
  );
}
