"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Heart, ImageUp, MapPin, Menu, MessageCircle, Phone, Search, ShoppingCart, Truck, UserRound, X } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { useFavorites } from "@/components/favorites-provider";
import { ImageSearchDialog } from "@/components/image-search-dialog";
import { SocialLinks } from "@/components/social-links";

export function SiteHeader() {
  const { itemCount } = useCart();
  const { favoriteIds } = useFavorites();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [imageSearchOpen, setImageSearchOpen] = useState(false);

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
          <a href={`tel:+${(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "243985986202").replace(/\D/g, "")}`}><Phone size={14} /> <span>+243 985 986 202</span></a>
          <span className="utility-delivery"><Truck size={16} /> <span>Livraison à Kisangani</span></span>
          <a className="utility-whatsapp" href={`https://wa.me/${(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "243985986202").replace(/\D/g, "")}`} target="_blank" rel="noreferrer"><MessageCircle size={15} /> Écrivez-nous</a>
          <div className="utility-social"><span>Suivez-nous :</span><SocialLinks /></div>
        </div>
      </div>
      <div className="navigation-wrap">
        <div className="navigation-inner">
          <Link href="/" className="brand-lockup" aria-label="Maison Lydia AK, accueil">
            <Image src="/images/logo-maison-lydia.png" alt="Maison Lydia AK — L'élégance à votre portée" width={1535} height={1024} priority className="brand-logo-image" />
          </Link>
          <nav className={`main-nav ${menuOpen ? "is-open" : ""}`} aria-label="Navigation principale">
            <Link className={pathname === "/" ? "nav-current" : undefined} aria-current={pathname === "/" ? "page" : undefined} href="/" onClick={() => setMenuOpen(false)}>Accueil</Link>
            <Link className={pathname === "/boutique" ? "nav-current" : undefined} aria-current={pathname === "/boutique" ? "page" : undefined} href="/boutique" onClick={() => setMenuOpen(false)}>Boutique</Link>
            <Link className={pathname === "/collections" ? "nav-current" : undefined} aria-current={pathname === "/collections" ? "page" : undefined} href="/collections" onClick={() => setMenuOpen(false)}>Collections</Link>
            <Link href="/boutique?promotion=1" onClick={() => setMenuOpen(false)}>Promotions</Link>
            <Link href="/#maison" onClick={() => setMenuOpen(false)}>À propos</Link>
            <a href={`https://wa.me/${(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "243985986202").replace(/\D/g, "")}`} target="_blank" rel="noreferrer" onClick={() => setMenuOpen(false)}>Contact</a>
          </nav>
          <div className="nav-actions">
            <button className="icon-button" aria-label="Rechercher" onClick={() => setSearchOpen((open) => !open)}><Search size={23} /></button>
            <button className="icon-button" aria-label="Rechercher par image" onClick={() => setImageSearchOpen(true)}><ImageUp size={22} /></button>
            <Link className="icon-button favorites-link" aria-label={`Mes favoris, ${favoriteIds.length} article(s)`} href="/favoris"><Heart size={22} /><span className="favorites-count">{favoriteIds.length}</span></Link>
            <Link className="icon-button account-button" aria-label="Mon compte" href="/compte"><UserRound size={23} /></Link>
            <Link className="icon-button cart-icon" aria-label={`Panier, ${itemCount} article(s)`} href="/panier"><ShoppingCart size={24} /><span className="cart-count">{itemCount}</span></Link>
            <button className="mobile-menu-toggle" aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"} onClick={() => setMenuOpen((open) => !open)}>{menuOpen ? <X /> : <Menu />}</button>
          </div>
        </div>
        {searchOpen && <form className="header-search" onSubmit={submitSearch}><Search size={18} /><input autoFocus value={searchValue} onChange={(event) => setSearchValue(event.target.value)} placeholder="Rechercher un article..." aria-label="Recherche produit" /><button type="submit">Rechercher</button></form>}
      </div>
      {imageSearchOpen && <ImageSearchDialog onClose={() => setImageSearchOpen(false)} />}
    </header>
  );
}
