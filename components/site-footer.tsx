import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin, Phone, ShieldCheck } from "lucide-react";
import { categories } from "@/lib/catalog";
import { SocialLinks } from "@/components/social-links";

const phone = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "243985986202").replace(/\D/g, "");

export function SiteFooter() {
  return (
    <footer className="site-footer editorial-footer">
      <div className="footer-main editorial-footer-main">
        <div className="footer-brand editorial-footer-brand" id="maison">
          <Link href="/" aria-label="Maison Lydia AK, accueil"><Image src="/images/logo-maison-lydia.png" alt="Maison Lydia AK — L'élégance à votre portée" width={1535} height={1024} className="footer-logo-image" /></Link>
          <p>L’élégance à votre portée.</p>
          <span className="editorial-footer-location"><MapPin size={14} /> Kisangani, RDC</span>
          <SocialLinks compact />
        </div>
        <div className="footer-column">
          <h3>Collections</h3>
          {categories.map((category) => <Link key={category.slug} href={`/boutique?categorie=${encodeURIComponent(category.name)}`}>{category.name}</Link>)}
          <Link href="/collections">Toutes les collections <ArrowUpRight size={13} /></Link>
        </div>
        <div className="footer-column">
          <h3>La maison</h3>
          <Link href="/boutique">La boutique</Link>
          <Link href="/compte">Mon compte</Link>
          <Link href="/favoris">Mes favoris</Link>
          <a href={`https://wa.me/${phone}?text=${encodeURIComponent("Bonjour Maison Lydia AK, j'ai une question au sujet de la boutique.")}`} target="_blank" rel="noreferrer">Service client <ArrowUpRight size={13} /></a>
        </div>
        <div className="footer-contact">
          <h3>Contact & commande</h3>
          <a href={`tel:+${phone}`}><Phone size={15} /> +{phone}</a>
          <a href={`https://wa.me/${phone}`} target="_blank" rel="noreferrer">Nous écrire sur WhatsApp <ArrowUpRight size={13} /></a>
          <span><ShieldCheck size={15} /> Prix et modalités confirmés avec la boutique</span>
          <small>Aucun paiement en ligne n’est traité sur le site.</small>
        </div>
      </div>
      <div className="footer-bottom editorial-footer-bottom"><span>© {new Date().getFullYear()} Maison Lydia AK. Tous droits réservés.</span><span>Conçu avec soin à Kisangani</span></div>
    </footer>
  );
}
