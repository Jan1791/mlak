"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, MessageCircle } from "lucide-react";
import { useCart } from "@/components/cart-provider";

type Currency = "USD" | "CDF";

export function CheckoutPage() {
  const { items, totalUsd, totalCdf, clearCart } = useCart();
  const [currency, setCurrency] = useState<Currency>("USD");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("Kisangani");
  const [notes, setNotes] = useState("");
  const [consented, setConsented] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [whatsappUrl, setWhatsappUrl] = useState("");

  const message = useMemo(() => {
    const lines = items.map((item) => `• ${item.name}${item.size ? `, taille ${item.size}` : ""}${item.color ? `, ${item.color}` : ""} × ${item.quantity}`);
    return [
      `Bonjour Maison Lydia AK, je souhaite vérifier la disponibilité de cette sélection :`,
      ...lines,
      `Montant indicatif : ${currency === "USD" ? `${totalUsd.toFixed(2)} USD` : `${totalCdf.toLocaleString("fr-FR")} CDF`}`,
      `Nom : ${name}`,
      `Téléphone : ${phone}`,
      `Ville : ${city}`,
      notes ? `Note : ${notes}` : "",
      "Merci de me confirmer la disponibilité, le prix final et le délai avant toute préparation.",
    ].filter(Boolean).join("\n");
  }, [items, currency, totalUsd, totalCdf, name, phone, city, notes]);

  async function sendRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!consented) {
      setError("Confirmez que la boutique peut vous contacter au sujet de cette demande.");
      return;
    }
    setBusy(true);
    const whatsapp = `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "243985986202"}?text=${encodeURIComponent(message)}`;
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          customerName: name,
          phone,
          city,
          notes,
          currency,
          contactConsent: consented,
          items: items.map((item) => ({ productId: item.productId, quantity: item.quantity, size: item.size, color: item.color })),
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        setWhatsappUrl(whatsapp);
        setError(result.error ?? "La demande en ligne est momentanément indisponible. Vous pouvez la transmettre par WhatsApp.");
        return;
      }
      setOrderNumber(result.orderNumber ? String(result.orderNumber) : "");
      setWhatsappUrl(whatsapp);
      clearCart();
    } catch {
      setWhatsappUrl(whatsapp);
      setError("Connexion indisponible. Vous pouvez transmettre votre demande par WhatsApp.");
    } finally {
      setBusy(false);
    }
  }

  if (orderNumber !== null) return (
    <section className="content-section checkout-layout"><div className="order-complete"><CheckCircle2 size={42} /><h1>Demande reçue</h1><p>{orderNumber ? `Votre référence est ${orderNumber}.` : "Votre demande a bien été enregistrée."} Maison Lydia AK vérifie la disponibilité et reviendra vers vous pour confirmer le prix final et le délai.</p><a className="primary-button" href={whatsappUrl} target="_blank" rel="noreferrer"><MessageCircle size={17} /> Continuer sur WhatsApp</a><p>Aucun paiement n'a été effectué. La commande sera confirmée après échange avec la boutique.</p></div></section>
  );

  if (!items.length) return <section className="content-section cart-page"><div className="empty-cart"><h2>Aucune demande à transmettre</h2><p>Ajoutez un article à votre panier pour commencer.</p><Link href="/boutique" className="primary-button">Retourner à la boutique <ArrowRight size={16} /></Link></div></section>;

  return (
    <>
      <section className="page-heading"><span className="eyebrow">Dernière étape</span><h1>Votre demande</h1><p>La boutique vérifiera les articles avant de confirmer le montant et le délai.</p></section>
      <section className="content-section checkout-layout">
        <form className="checkout-form" onSubmit={sendRequest}>
          <h2>Comment vous joindre ?</h2><p>La création d'un compte n'est pas nécessaire. L'adresse de livraison et le mode de paiement seront confirmés ensuite avec la boutique.</p>
          <label>Nom complet<input required minLength={2} maxLength={100} value={name} onChange={(event) => setName(event.target.value)} placeholder="Votre nom" /></label>
          <label>Téléphone WhatsApp<input required minLength={7} maxLength={24} value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+243 ..." inputMode="tel" /></label>
          <label>Ville<select value={city} onChange={(event) => setCity(event.target.value)}><option>Kisangani</option><option>Autre ville (à confirmer)</option></select></label>
          <label>Note facultative<textarea maxLength={500} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Une précision sur votre demande" /></label>
          <label>Monnaie indicative<select value={currency} onChange={(event) => setCurrency(event.target.value as Currency)}><option value="USD">Dollar américain (USD)</option><option value="CDF">Franc congolais (CDF)</option></select></label>
          <label className="consent-line"><input type="checkbox" checked={consented} onChange={(event) => setConsented(event.target.checked)} /> J'accepte que Maison Lydia AK me contacte au sujet de cette demande.</label>
          {error && <p className="checkout-error" role="alert">{error}</p>}
          {whatsappUrl ? <a className="primary-button checkout-submit" href={whatsappUrl} target="_blank" rel="noreferrer"><MessageCircle size={17} /> Transmettre par WhatsApp</a> : <button disabled={busy} className="primary-button checkout-submit" type="submit">{busy ? "Transmission..." : "Envoyer ma demande"} <ArrowRight size={16} /></button>}
          <Link className="back-link" href="/panier"><ArrowLeft size={14} /> Retour au panier</Link>
        </form>
        <aside className="order-summary"><h2>Votre sélection</h2>{items.map((item) => <div className="summary-row" key={`${item.productId}-${item.size}-${item.color}`}><span>{item.name} × {item.quantity}</span><strong>{currency === "USD" ? `${(item.priceUsd * item.quantity).toFixed(2)} $` : `${((item.priceCdf ?? 0) * item.quantity).toLocaleString("fr-FR")} CDF`}</strong></div>)}<div className="summary-row total"><span>Total indicatif</span><span>{currency === "USD" ? `${totalUsd.toFixed(2)} USD` : `${totalCdf.toLocaleString("fr-FR")} CDF`}</span></div><p className="summary-note">Disponibilité, frais de livraison, prix final et paiement seront confirmés par Maison Lydia AK. Aucun paiement en ligne n'est traité ici.</p></aside>
      </section>
    </>
  );
}
