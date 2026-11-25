"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Gem, Headphones, MessageCircle, ShieldCheck, Truck } from "lucide-react";
import { categories } from "@/lib/catalog";
import { useCatalog } from "@/lib/use-catalog";
import { ProductCard } from "@/components/product-card";

function NewsletterCard() {
  const [email, setEmail] = useState("");
  const [consented, setConsented] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const whatsapp = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "243985986202").replace(/\D/g, "");

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
    <aside className="editorial-newsletter">
      <span className="editorial-newsletter-mark">Le carnet</span>
      <h3>Un peu de Maison Lydia AK dans votre boîte mail.</h3>
      <p>Recevez les nouveautés et les offres de la boutique.</p>
      <form onSubmit={subscribe}>
        <div className="editorial-newsletter-row">
          <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Votre adresse e-mail" aria-label="Votre adresse e-mail" />
          <button disabled={busy || !consented} type="submit" aria-label="S’inscrire à la newsletter">{busy ? "…" : <ArrowRight size={17} />}</button>
        </div>
        <label className="editorial-consent"><input type="checkbox" checked={consented} onChange={(event) => setConsented(event.target.checked)} /> J’accepte de recevoir les actualités.</label>
        <a className="editorial-optout" href={`https://wa.me/${whatsapp}?text=${encodeURIComponent("Bonjour, je souhaite me désinscrire des actualités Maison Lydia AK.")}`} target="_blank" rel="noreferrer">Désinscription à tout moment via WhatsApp</a>
      </form>
      {message && <p className="editorial-form-message" role="status">{message}</p>}
    </aside>
  );
}

function SectionHeading({ eyebrow, title, href, linkLabel }: { eyebrow: string; title: string; href?: string; linkLabel?: string }) {
  return (
    <div className="editorial-section-heading">
      <div><span>{eyebrow}</span><h2>{title}</h2></div>
      {href && linkLabel && <Link href={href}>{linkLabel}<ArrowRight size={16} /></Link>}
    </div>
  );
}

export function StorefrontHome() {
  const products = useCatalog().filter((product) => product.isActive);
  const orderedCategories = [...categories].sort((a, b) => {
    const rank = (name: string) => name === "Robes" ? 0 : name === "Pantalons & jeans" ? 1 : 2;
    return rank(a.name) - rank(b.name) || a.name.localeCompare(b.name, "fr");
  });
  const heroProduct = products.find((product) => product.category === "Robes") ?? products[0];
  const storyProduct = products.find((product) => product.id !== heroProduct?.id && product.category !== heroProduct?.category) ?? products[1];
  const featuredProducts = orderedCategories.flatMap((category) => products.filter((product) => product.category === category.name).slice(0, 2)).slice(0, 4);
  const visibleProducts = featuredProducts.length ? featuredProducts : products.slice(0, 4);
  const whatsapp = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "243985986202").replace(/\D/g, "");

  return (
    <div className="editorial-home">
      <section className="editorial-hero" aria-label="Maison Lydia AK">
        <div className="editorial-hero-copy">
          <span className="editorial-kicker"><i /> La mode choisie à Kisangani</span>
          <h1>L’élégance<br /><em>à votre portée.</em></h1>
          <p>Des pièces soigneusement choisies pour vous accompagner dans les moments qui comptent comme dans le quotidien.</p>
          <div className="editorial-hero-actions">
            <Link href="/boutique" className="editorial-primary-button">Découvrir la boutique <ArrowRight size={17} /></Link>
            <Link href="/collections" className="editorial-secondary-link">Voir les collections</Link>
          </div>
          <div className="editorial-hero-footnote"><span>{products.length} pièces sélectionnées</span><span>Robes · Pantalons & jeans</span></div>
        </div>
        <div className="editorial-hero-visual">
          <Image src={heroProduct?.image ?? "/images/hero-reference.png"} alt={heroProduct?.name ?? "Sélection Maison Lydia AK"} fill priority sizes="(max-width: 800px) 100vw, 55vw" />
          <div className="editorial-hero-shade" />
          <div className="editorial-hero-caption"><span>La sélection</span><strong>{heroProduct?.name ?? "Maison Lydia AK"}</strong></div>
          <span className="editorial-hero-stamp">MLAK<br /><i>Est. Kisangani</i></span>
        </div>
      </section>

      <section className="editorial-trust-strip" aria-label="Nos services">
        <div><Gem /><span><strong>Une sélection soignée</strong><small>Des pièces choisies avec attention</small></span></div>
        <div><Truck /><span><strong>Livraison locale</strong><small>À Kisangani et ses environs</small></span></div>
        <div><Headphones /><span><strong>Conseil personnalisé</strong><small>Notre équipe reste à votre écoute</small></span></div>
        <div><ShieldCheck /><span><strong>Commande accompagnée</strong><small>Prix et disponibilité confirmés avec vous</small></span></div>
      </section>

      <section className="editorial-section editorial-categories" id="collections">
        <SectionHeading eyebrow="Explorer la maison" title="Les collections" href="/collections" linkLabel="Toutes les collections" />
        <div className="editorial-category-grid">
          {orderedCategories.map((category, index) => {
            const count = products.filter((product) => product.category === category.name).length;
            return (
              <Link href={`/boutique?categorie=${encodeURIComponent(category.name)}`} className="editorial-category-card" key={category.slug}>
                <Image src={category.image} alt={category.name} fill sizes="(max-width: 760px) 100vw, 50vw" />
                <span className="editorial-category-shade" />
                <span className="editorial-category-index">0{index + 1} / COLLECTION</span>
                <span className="editorial-category-content"><small>{count} pièces</small><strong>{category.name}</strong><span>Explorer <ArrowRight size={15} /></span></span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="editorial-interlude">
        <div className="editorial-story-card">
          {storyProduct && <Image src={storyProduct.image} alt={storyProduct.name} fill sizes="(max-width: 800px) 100vw, 60vw" />}
          <span className="editorial-story-shade" />
          <div className="editorial-story-copy"><span>Maison Lydia AK · Kisangani</span><h2>Une allure qui<br />vous ressemble.</h2><p>Parcourez les pièces et trouvez votre prochaine tenue préférée.</p><Link href="/boutique">Voir la sélection <ArrowRight size={16} /></Link></div>
        </div>
        <NewsletterCard />
      </section>

      <section className="editorial-section editorial-arrivals" id="nouveautes">
        <SectionHeading eyebrow="La sélection du moment" title="À découvrir" href="/boutique" linkLabel="Voir toute la boutique" />
        <div className="product-grid editorial-product-grid">{visibleProducts.map((product) => <ProductCard product={product} key={product.id} />)}</div>
        <div className="editorial-contact-note"><MessageCircle size={18} /><span>Une pièce vous plaît ? Nous confirmons le prix et la disponibilité avant toute commande.</span><a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer">Écrire à la boutique <ArrowRight size={15} /></a></div>
      </section>
    </div>
  );
}
