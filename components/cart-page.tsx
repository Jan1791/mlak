"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/components/cart-provider";

export function CartPage() {
  const { items, totalUsd, totalCdf, removeItem, changeQuantity } = useCart();

  return (
    <>
      <section className="page-heading"><span className="eyebrow">Votre sélection</span><h1>Votre panier</h1><p>Parcourez votre sélection avant de transmettre une demande à la boutique.</p></section>
      <section className="content-section cart-page">
        {items.length === 0 ? <div className="empty-cart"><h2>Votre panier est encore vide</h2><p>Parcourez les nouveautés et trouvez la pièce qui vous ressemble.</p><Link href="/boutique" className="primary-button">Découvrir la boutique <ArrowRight size={16} /></Link></div> : <div className="cart-layout">
          <div className="cart-list"><h2>Articles sélectionnés ({items.length})</h2>
            {items.map((item) => <div className="cart-line" key={`${item.productId}-${item.size}-${item.color}`}>
              <Image src={item.image} alt={item.name} width={160} height={120} />
              <div><h3>{item.name}</h3>{(item.size || item.color) && <p>{[item.size && `Taille ${item.size}`, item.color].filter(Boolean).join(" · ")}</p>}<p>{item.priceUsd.toFixed(2)} USD · {item.priceCdf?.toLocaleString("fr-FR")} CDF</p>
                <div className="quantity-control"><button aria-label="Diminuer la quantité" onClick={() => changeQuantity(item.productId, item.size, item.color, item.quantity - 1)}><Minus size={13} /></button><span>{item.quantity}</span><button aria-label="Augmenter la quantité" onClick={() => changeQuantity(item.productId, item.size, item.color, item.quantity + 1)}><Plus size={13} /></button><button className="remove-item" aria-label={`Retirer ${item.name}`} onClick={() => removeItem(item.productId, item.size, item.color)}><Trash2 size={15} /></button></div>
              </div>
              <div className="cart-line-total">{(item.priceUsd * item.quantity).toFixed(2)} USD<br /><span>{((item.priceCdf ?? 0) * item.quantity).toLocaleString("fr-FR")} CDF</span></div>
            </div>)}
          </div>
          <aside className="order-summary"><h2>Récapitulatif</h2><div className="summary-row"><span>Sous-total</span><strong>{totalUsd.toFixed(2)} USD</strong></div><div className="summary-row"><span>Équivalent indiqué</span><strong>{totalCdf.toLocaleString("fr-FR")} CDF</strong></div><div className="summary-row"><span>Livraison</span><span>À confirmer</span></div><div className="summary-row total"><span>Total indicatif</span><span>{totalUsd.toFixed(2)} USD</span></div><Link className="primary-button" href="/commande">Transmettre ma demande <ArrowRight size={16} /></Link><p className="summary-note">La boutique confirme disponibilité, prix final, livraison et délai avant tout paiement.</p></aside>
        </div>}
      </section>
    </>
  );
}
