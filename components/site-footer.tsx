import Image from "next/image";
import Link from "next/link";
import { Crown, Gem, Heart, MapPin, Phone, ShieldCheck, Truck } from "lucide-react";
import { collectionGroups, collectionHref } from "@/lib/collections";
import { SocialLinks } from "@/components/social-links";

const phone = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "243985986202").replace(/\D/g, "");

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-promise">
        <div><Heart /><span>Votre satisfaction<br />notre priorité</span></div>
        <div><Crown /><span>Mode tendance<br />et raffinée</span></div>
        <div><Gem /><span>Des pièces choisies<br />avec soin</span></div>
        <div><Truck /><span>Une boutique<br />à votre écoute</span></div>
      </div>
      <div className="footer-main">
        <div className="footer-brand" id="maison">
          <Link href="/" aria-label="Maison Lydia AK, accueil"><Image src="/images/logo-maison-lydia.png" alt="Maison Lydia AK — L'élégance à votre portée" width={1535} height={1024} className="footer-logo-image" /></Link>
          <p>Ensemble, faisons briller la mode en RDC.</p>
          <SocialLinks compact />
        </div>
          <div className="footer-column">
              <h3>Collections</h3>
              <Link href="/collections">Toutes les collections</Link>
              {collectionGroups
                  .filter((group) => group.allLabel)
                  .slice(0, 4)
                  .map((group) => (
                      <Link
                          key={group.id}
                          href={collectionHref({
                              label: group.allLabel!,
                              ...(group.category
                                  ? { category: group.category }
                                  : { query: group.title.toLocaleLowerCase("fr") }),
                          })}
                      >
                          {group.allLabel}
                      </Link>
                  ))}
          </div>
        <div className="footer-column"><h3>Maison Lydia AK</h3><Link href="/">Accueil</Link><Link href="/boutique">Boutique</Link><Link href="/boutique?promotion=1">Promotions</Link><Link href="/compte">Mon compte</Link><Link href="/favoris">Mes favoris</Link></div>
        <div className="footer-column"><h3>Besoin d'aide ?</h3><a href={`https://wa.me/${phone}?text=${encodeURIComponent("Bonjour Maison Lydia AK, j'ai une question au sujet de la boutique.")}`} target="_blank" rel="noreferrer">Service client WhatsApp</a><span>Livraison à Kisangani</span><span>Guide des tailles sur demande</span><a href={`tel:+${phone}`}>Appeler la boutique</a></div>
        <div className="footer-contact"><h3>Contact & paiement</h3><span><MapPin size={16} /> Kisangani, RDC</span><a href={`tel:+${phone}`}><Phone size={16} /> +{phone}</a><span><ShieldCheck size={16} /> Paiement à convenir avec la boutique</span><small>Aucun paiement en ligne n'est traité sur ce site.</small><a className="footer-whatsapp" href={`https://wa.me/${phone}`} target="_blank" rel="noreferrer">Nous écrire sur WhatsApp</a></div>
      </div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} Maison Lydia AK. Tous droits réservés.</span><span>Conçu avec soin à Kisangani</span></div>
    </footer>
  );
}
