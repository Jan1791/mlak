"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, MapPin, Menu, MessageCircle, Phone, Search, ShoppingCart, Truck, UserRound, X } from "lucide-react";
import { useCart } from "@/components/cart-provider";

export function SiteHeader() {
  const { itemCount } = useCart();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push(`/boutique?q=${encodeURIComponent(searchValue.trim())}`);
    setSearchOpen(false);
    setMenuOpen(false);
  }

  return (
    <header className="site-header">
      <div className="utility-bar">
        <div className="utility-inner">
          <span><MapPin size={14} /> <span>Kisangani, RDC</span></span>
          <a href="tel:+243985986202"><Phone size={14} /> <span>+243 985 986 202</span></a>
          <span className="utility-delivery"><Truck size={16} /> <span>Livraison à Kisangani</span></span>
          <a className="utility-whatsapp" href="https://wa.me/243985986202" target="_blank" rel="noreferrer"><MessageCircle size={15} /> Écrivez-nous</a>
        </div>
      </div>
      <div className="navigation-wrap">
        <div className="navigation-inner">
          <Link href="/" className="brand-lockup" aria-label="Maison Lydia AK, accueil">
            <span className="brand-crown">♛</span>
            <span className="brand-maison">Maison</span>
            <span className="brand-name">Lydia AK</span>
            <span className="brand-tagline">L'élégance à votre portée.</span>
          </Link>
          <nav className={`main-nav ${menuOpen ? "is-open" : ""}`} aria-label="Navigation principale">
            <Link className="nav-current" href="/" onClick={() => setMenuOpen(false)}>Accueil</Link>
            <Link href="/boutique" onClick={() => setMenuOpen(false)}>Boutique <ChevronDown size={13} /></Link>
            <Link href="/boutique" onClick={() => setMenuOpen(false)}>Catégories <ChevronDown size={13} /></Link>
            <Link href="/boutique?promotion=1" onClick={() => setMenuOpen(false)}>Promotions</Link>
            <Link href="/#maison" onClick={() => setMenuOpen(false)}>À propos</Link>
            <a href="https://wa.me/243985986202" target="_blank" rel="noreferrer" onClick={() => setMenuOpen(false)}>Contact</a>
          </nav>
          <div className="nav-actions">
            <button className="icon-button" aria-label="Rechercher" onClick={() => setSearchOpen((open) => !open)}><Search size={23} /></button>
            <Link className="icon-button account-button" aria-label="Espace administrateur" href="/admin/products"><UserRound size={23} /></Link>
            <Link className="icon-button cart-icon" aria-label={`Panier, ${itemCount} article(s)`} href="/panier"><ShoppingCart size={24} /><span className="cart-count">{itemCount}</span></Link>
            <button className="mobile-menu-toggle" aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"} onClick={() => setMenuOpen((open) => !open)}>{menuOpen ? <X /> : <Menu />}</button>
          </div>
        </div>
        {searchOpen && <form className="header-search" onSubmit={submitSearch}><Search size={18} /><input autoFocus value={searchValue} onChange={(event) => setSearchValue(event.target.value)} placeholder="Rechercher un article..." aria-label="Recherche produit" /><button type="submit">Rechercher</button></form>}
      </div>
    </header>
  );
}
