import Image from "next/image";
import Link from "next/link";
import { Crown, Heart, MapPin, Phone, ShieldCheck, Truck } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-promise">
        <div><Heart /><span>Votre satisfaction<br />notre priorité</span></div>
        <div><Crown /><span>Mode tendance<br />et raffinée</span></div>
        <div><span className="gift-icon">✿</span><span>Emballage soigné<br />et élégant</span></div>
        <div><Truck /><span>Une boutique<br />à votre écoute</span></div>
      </div>
      <div className="footer-main">
        <div className="footer-brand" id="maison">
          <Link href="/" aria-label="Maison Lydia AK, accueil"><Image src="/images/logo-hero.png" alt="Maison Lydia AK — L'élégance à votre portée" width={700} height={467} className="footer-logo-image" /></Link>
          <p>Ensemble, faisons briller la mode en RDC.</p>
        </div>
        <div><h3>Votre boutique</h3><Link href="/boutique">Tous les articles</Link><Link href="/boutique?promotion=1">Promotions</Link><a href="https://wa.me/243985986202" target="_blank" rel="noreferrer">Nous contacter</a></div>
        <div><h3>Besoin d'aide ?</h3><a href="https://wa.me/243985986202" target="_blank" rel="noreferrer">Commande et disponibilité</a><span>Livraison à Kisangani</span><span>Disponibilité confirmée avec vous</span></div>
        <div className="footer-contact"><h3>Maison Lydia AK</h3><span><MapPin size={16} /> Kisangani, RDC</span><a href="tel:+243985986202"><Phone size={16} /> +243 985 986 202</a><span><ShieldCheck size={16} /> Paiement confirmé avec la boutique</span></div>
      </div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} Maison Lydia AK. Tous droits réservés.</span><span>Conçu avec soin à Kisangani</span></div>
    </footer>
  );
}
