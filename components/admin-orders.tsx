"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BarChart3, Check, CircleHelp, ClipboardList, LayoutDashboard, LogOut, Package, Search, Settings, ShieldCheck, ShoppingBag, Truck, Users, X } from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type OrderStatus = "received" | "to_check" | "awaiting_confirmation" | "confirmed" | "preparing" | "in_delivery" | "delivered" | "cancelled";
type OrderItem = { product_name: string; quantity: number; size: string; color: string; unit_price: number; line_total: number };
type StatusHistory = { old_status: OrderStatus | null; new_status: OrderStatus; changed_at: string };
type StoreOrder = {
  id: string;
  order_number: number;
  customer_name: string;
  phone: string;
  city: string;
  notes: string;
  currency: "USD" | "CDF";
  total: number;
  status: OrderStatus;
  created_at: string;
  order_items: OrderItem[];
  order_status_history: StatusHistory[];
};

const statuses: { value: OrderStatus; label: string }[] = [
  { value: "received", label: "Reçue" },
  { value: "to_check", label: "À vérifier" },
  { value: "awaiting_confirmation", label: "En attente de confirmation" },
  { value: "confirmed", label: "Confirmée" },
  { value: "preparing", label: "En préparation" },
  { value: "in_delivery", label: "En livraison" },
  { value: "delivered", label: "Livrée" },
  { value: "cancelled", label: "Annulée" },
];

function statusLabel(status: OrderStatus) {
  return statuses.find((item) => item.value === status)?.label ?? status;
}

function formatMoney(amount: number, currency: "USD" | "CDF") {
  return currency === "USD" ? `${Number(amount).toFixed(2)} USD` : `${Number(amount).toLocaleString("fr-FR")} CDF`;
}

export function AdminOrders() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [changingId, setChangingId] = useState("");

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    void supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    if (!supabase) return;
    if (!session) { setRole(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true);
    void supabase.from("user_roles").select("role").eq("user_id", session.user.id).maybeSingle().then(({ data, error: roleError }) => {
      if (cancelled) return;
      if (roleError) setError("La base Supabase n'est pas initialisée. Appliquez la migration avant d'ouvrir les commandes.");
      setRole(data?.role ?? "no-access");
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [session, supabase]);

  const loadOrders = useCallback(async () => {
    if (!supabase) return;
    const { data, error: queryError } = await supabase.from("orders")
      .select("id,order_number,customer_name,phone,city,notes,currency,total,status,created_at,order_items(product_name,quantity,size,color,unit_price,line_total),order_status_history(old_status,new_status,changed_at)")
      .order("created_at", { ascending: false });
    if (queryError) setError("Impossible de charger les demandes. Vérifiez les permissions et la migration Supabase.");
    else setOrders((data ?? []) as StoreOrder[]);
  }, [supabase]);

  useEffect(() => {
    if (role === "owner" || role === "admin") void loadOrders();
  }, [role, loadOrders]);

  async function signIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true); setError("");
    const { error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (authError) setError("Connexion impossible. Vérifiez l'adresse et le mot de passe dans Supabase Auth.");
    setBusy(false);
  }

  async function changeStatus(orderId: string, status: OrderStatus) {
    if (!supabase) return;
    setChangingId(orderId); setError(""); setNotice("");
    const { error: updateError } = await supabase.from("orders").update({ status }).eq("id", orderId);
    if (updateError) setError("Le statut n'a pas pu être modifié. Vérifiez les droits administrateur.");
    else { setNotice("Statut de la demande mis à jour."); await loadOrders(); }
    setChangingId("");
  }

  async function signOut() {
    await supabase?.auth.signOut();
    setSession(null); setRole(null);
  }

  const filtered = orders.filter((order) => {
    const searchText = `#${order.order_number} ${order.customer_name} ${order.phone} ${order.city}`.toLocaleLowerCase("fr");
    return searchText.includes(search.toLocaleLowerCase("fr")) && (!filterStatus || order.status === filterStatus);
  });

  if (!supabase) return <div className="admin-gate"><div className="admin-login-card"><span className="admin-login-mark">♛</span><h1>Maison Lydia AK</h1><p>Ajoutez les variables Supabase dans `.env.local` pour consulter les demandes.</p><Link href="/" className="primary-button">Retour à la boutique</Link></div></div>;
  if (loading) return <div className="admin-gate"><div className="admin-login-card"><span className="admin-login-mark">♛</span><p>Chargement de l'espace sécurisé...</p></div></div>;
  if (!session) return <div className="admin-gate"><form className="admin-login-card" onSubmit={signIn}><span className="admin-login-mark">♛</span><span className="eyebrow">Maison Lydia AK</span><h1>Connexion administrateur</h1><p>Accès réservé aux membres autorisés de la boutique.</p><label>Adresse e-mail<input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label><label>Mot de passe<input type="password" required value={password} onChange={(event) => setPassword(event.target.value)} /></label>{error && <p className="admin-error">{error}</p>}<button className="primary-button" disabled={busy}>{busy ? "Connexion..." : "Se connecter"}</button><Link href="/" className="back-link">← Retour à la boutique</Link></form></div>;
  if (role !== "owner" && role !== "admin") return <div className="admin-gate"><div className="admin-login-card"><span className="admin-login-mark"><ShieldCheck /></span><h1>Accès non autorisé</h1><p>Ce compte ne possède pas de rôle administrateur.</p>{error && <p className="admin-error">{error}</p>}<button className="secondary-button" onClick={signOut}>Se déconnecter</button></div></div>;

  return (
    <div className="admin-app">
      <aside className="admin-sidebar">
        <Link href="/" className="admin-brand"><Image src="/images/logo-maison-lydia.png" alt="Maison Lydia AK — accueil" width={1535} height={1024} className="admin-brand-logo" /></Link>
        <nav><Link href="/admin/products" className="admin-side-link"><LayoutDashboard /> Tableau de bord</Link><Link href="/admin/products" className="admin-side-link"><Package /> Produits</Link><Link href="/admin/orders" className="admin-side-link active"><ClipboardList /> Commandes</Link><Link href="/boutique" className="admin-side-link"><ShoppingBag /> Voir la boutique</Link><span className="admin-nav-separator" /><button disabled title="Disponible dans une prochaine étape" className="admin-side-link muted-link is-disabled"><Users /> Clients</button><button disabled title="Disponible dans une prochaine étape" className="admin-side-link muted-link is-disabled"><Truck /> Fournisseurs</button><button disabled title="Disponible dans une prochaine étape" className="admin-side-link muted-link is-disabled"><BarChart3 /> Rapports</button><button disabled title="Disponible dans une prochaine étape" className="admin-side-link muted-link is-disabled"><Settings /> Paramètres</button><button disabled title="Disponible dans une prochaine étape" className="admin-side-link muted-link is-disabled"><CircleHelp /> Aide & support</button></nav>
        <div className="admin-profile"><span className="profile-avatar">{session.user.email?.slice(0,1).toUpperCase()}</span><div><strong>{session.user.email}</strong><small><span /> {role === "owner" ? "Propriétaire" : "Administrateur"}</small></div><button aria-label="Se déconnecter" onClick={signOut}><LogOut size={16} /></button></div>
      </aside>
      <main className="admin-main">
        <div className="admin-topbar"><label><Search size={17} /><input placeholder="Rechercher par référence, nom ou téléphone..." value={search} onChange={(event) => setSearch(event.target.value)} /></label><div className="admin-top-actions"><span className="admin-user-label">{session.user.email?.split("@")[0]} <ShieldCheck size={15} /></span></div></div>
        <section className="admin-content">
          <div className="admin-page-head"><div><span className="admin-title-icon"><ClipboardList /></span><div><h1>Gestion des commandes</h1><p>Vérifiez les demandes et confirmez les conditions avec vos clients.</p></div></div><Link href="/admin/products" className="admin-outline-button"><Package size={16} /> Gérer les produits</Link></div>
          {error && <div className="admin-flash error-flash">{error}<button onClick={() => setError("")} aria-label="Fermer"><X size={15} /></button></div>}
          {notice && <div className="admin-flash success-flash"><Check size={15} /> {notice}<button onClick={() => setNotice("")} aria-label="Fermer"><X size={15} /></button></div>}
          <div className="orders-toolbar"><div><strong>{orders.length}</strong> demande(s) reçue(s)</div><select value={filterStatus} onChange={(event) => setFilterStatus(event.target.value)} aria-label="Filtrer par statut"><option value="">Tous les statuts</option>{statuses.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}</select></div>
          {filtered.length === 0 ? <div className="admin-table-empty orders-empty">{orders.length ? "Aucune demande ne correspond à ces filtres." : "Aucune demande reçue pour le moment."}</div> : <div className="orders-list">{filtered.map((order) => <article className="order-card" key={order.id}>
            <div className="order-card-head"><div><span className="order-number">Demande #{order.order_number}</span><small>{new Date(order.created_at).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}</small></div><span className={`admin-status ${order.status === "delivered" ? "in-stock" : order.status === "cancelled" ? "out-stock" : "to-check"}`}>{statusLabel(order.status)}</span></div>
            <div className="order-card-grid"><div><h3>{order.customer_name}</h3><p>{order.phone} · {order.city}</p><a className="order-whatsapp" href={`https://wa.me/${order.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">Contacter sur WhatsApp <ArrowRight size={13} /></a></div><div className="order-items-list">{(order.order_items ?? []).map((item, index) => <div key={`${order.id}-${index}`}><span>{item.product_name} × {item.quantity}{item.size ? ` · ${item.size}` : ""}{item.color ? ` · ${item.color}` : ""}</span><strong>{formatMoney(Number(item.line_total), order.currency)}</strong></div>)}</div><div className="order-total"><small>Total indicatif</small><strong>{formatMoney(Number(order.total), order.currency)}</strong><select value={order.status} disabled={changingId === order.id} onChange={(event) => void changeStatus(order.id, event.target.value as OrderStatus)} aria-label={`Statut de la commande ${order.order_number}`}>{statuses.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}</select></div></div>
            {order.notes && <p className="order-notes"><strong>Note du client :</strong> {order.notes}</p>}
            {(order.order_status_history ?? []).length > 0 && <div className="order-history"><strong>Historique :</strong>{[...order.order_status_history].sort((left, right) => new Date(left.changed_at).getTime() - new Date(right.changed_at).getTime()).map((item, index) => <span key={`${order.id}-history-${index}`}>{statusLabel(item.new_status)} · {new Date(item.changed_at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}</span>)}</div>}
          </article>)}</div>}
        </section>
      </main>
    </div>
  );
}
