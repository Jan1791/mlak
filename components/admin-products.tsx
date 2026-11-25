"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BarChart3, Check, CircleHelp, ClipboardList, Eye, ImagePlus, LayoutDashboard, LogOut, Package, Pencil, Plus, Search, Settings, ShieldCheck, ShoppingBag, Trash2, Truck, Users, X } from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import { categories, mapProductRow, type Availability, type Product } from "@/lib/catalog";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const availabilityOptions: { value: Availability; label: string }[] = [
  { value: "available", label: "Disponible" },
  { value: "check", label: "Disponibilité à vérifier" },
  { value: "preorder", label: "Sur commande" },
  { value: "unavailable", label: "Indisponible" },
];

function slugify(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function AdminProducts() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterVisibility, setFilterVisibility] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(categories[0].name);
  const [priceUsd, setPriceUsd] = useState("");
  const [priceCdf, setPriceCdf] = useState("");
  const [sizes, setSizes] = useState("");
  const [colors, setColors] = useState("");
  const [availability, setAvailability] = useState<Availability>("check");
  const [promoLabel, setPromoLabel] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [files, setFiles] = useState<File[]>([]);

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
      if (roleError) setError("La base Supabase n'est pas encore initialisée. Appliquez la migration du projet, puis reconnectez-vous.");
      setRole(data?.role ?? "no-access");
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [session, supabase]);

  useEffect(() => {
    if (!supabase || !session || !["owner", "admin"].includes(role ?? "")) return;
    let cancelled = false;
    setLoadingProducts(true);
    void supabase.from("products")
      .select("id,slug,title,description,category,image_urls,price_usd,price_cdf,sizes,colors,availability,promo_label,is_active")
      .order("created_at", { ascending: false })
      .then(({ data, error: queryError }) => {
        if (cancelled) return;
        if (queryError) setError("Impossible de charger les produits. Vérifiez la migration Supabase et les permissions du compte.");
        else setProducts((data ?? []).map((row) => mapProductRow(row)));
        setLoadingProducts(false);
      });
    return () => { cancelled = true; };
  }, [role, session, supabase]);

  async function signIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true); setError("");
    const { error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (authError) setError("Connexion impossible. Vérifiez l'adresse, le mot de passe et l'activation de l'utilisateur dans Supabase Auth.");
    setBusy(false);
  }

  async function signOut() {
    await supabase?.auth.signOut();
    setSession(null); setRole(null);
  }

  function editProduct(product: Product) {
    setEditingId(product.id); setName(product.name); setDescription(product.description); setCategory(product.category);
    setPriceUsd(String(product.priceUsd)); setPriceCdf(product.priceCdf === null ? "" : String(product.priceCdf));
    setSizes(product.sizes.join(", ")); setColors(product.colors.join(", ")); setAvailability(product.availability);
    setPromoLabel(product.promoLabel ?? ""); setIsActive(product.isActive); setFiles([]); setFormOpen(true); setError(""); setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function clearForm() {
    setEditingId(null); setName(""); setDescription(""); setCategory(categories[0].name); setPriceUsd(""); setPriceCdf("");
    setSizes(""); setColors(""); setAvailability("check"); setPromoLabel(""); setIsActive(true); setFiles([]);
  }

  async function saveProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !name.trim() || priceUsd === "") return;
    setBusy(true); setError(""); setNotice("");
    if (!editingId && files.length === 0) {
      setBusy(false);
      setError("Ajoutez au moins une photo pour ce produit.");
      return;
    }
    if (files.some((file) => file.size > 10 * 1024 * 1024)) {
      setBusy(false);
      setError("Chaque photo doit faire 10 Mo ou moins.");
      return;
    }
    const imageUrls = editingId ? products.find((item) => item.id === editingId)?.images ?? [] : [];
    const uploadedUrls: string[] = [...imageUrls];
    try {
      for (const file of files.slice(0, 10)) {
        const safeName = file.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9._-]/g, "-");
        const path = `${Date.now()}-${crypto.randomUUID()}-${safeName}`;
        const { error: uploadError } = await supabase.storage.from("product-images").upload(path, file, { upsert: false, contentType: file.type });
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from("product-images").getPublicUrl(path);
        uploadedUrls.push(data.publicUrl);
      }
      const record = {
        slug: slugify(name), title: name.trim(), description: description.trim(), category,
        image_urls: uploadedUrls, price_usd: Number(priceUsd), price_cdf: priceCdf ? Number(priceCdf) : null,
        sizes: sizes.split(",").map((item) => item.trim()).filter(Boolean),
        colors: colors.split(",").map((item) => item.trim()).filter(Boolean),
        availability, promo_label: promoLabel.trim() || null, is_active: isActive,
      };
      const result = editingId
        ? await supabase.from("products").update(record).eq("id", editingId)
        : await supabase.from("products").insert(record);
      if (result.error) throw result.error;
      setNotice(editingId ? "Produit modifié." : "Produit ajouté.");
      clearForm();
      const { data } = await supabase.from("products").select("id,slug,title,description,category,image_urls,price_usd,price_cdf,sizes,colors,availability,promo_label,is_active").order("created_at", { ascending: false });
      setProducts((data ?? []).map((row) => mapProductRow(row)));
    } catch {
      setError("Enregistrement impossible. Vérifiez les champs, les droits administrateur et le bucket product-images.");
    } finally {
      setBusy(false);
    }
  }

  async function deleteProduct(product: Product) {
    if (!supabase || !window.confirm(`Supprimer « ${product.name} » ?`)) return;
    const { error: deleteError } = await supabase.from("products").delete().eq("id", product.id);
    if (deleteError) setError("La suppression a échoué. Vérifiez les autorisations.");
    else { setProducts((current) => current.filter((item) => item.id !== product.id)); setNotice("Produit supprimé."); }
  }

  const filtered = products.filter((product) =>
    `${product.name} ${product.category}`.toLocaleLowerCase("fr").includes(search.toLocaleLowerCase("fr"))
    && (!filterCategory || product.category === filterCategory)
    && (!filterVisibility || (filterVisibility === "visible" ? product.isActive : !product.isActive))
  );

  if (!supabase) return <div className="admin-gate"><div className="admin-login-card"><span className="admin-login-mark">♛</span><h1>Maison Lydia AK</h1><p>La connexion Supabase n'est pas configurée. Ajoutez les variables de `.env.local` et relancez le serveur.</p><Link href="/" className="primary-button">Retour à la boutique</Link></div></div>;
  if (loading) return <div className="admin-gate"><div className="admin-login-card"><span className="admin-login-mark">♛</span><p>Chargement de l'espace sécurisé...</p></div></div>;
  if (!session) return <div className="admin-gate"><form className="admin-login-card" onSubmit={signIn}><span className="admin-login-mark">♛</span><span className="eyebrow">Maison Lydia AK</span><h1>Connexion administrateur</h1><p>Accès réservé aux membres autorisés de la boutique.</p><label>Adresse e-mail<input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nom@exemple.com" /></label><label>Mot de passe<input type="password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Votre mot de passe" /></label>{error && <p className="admin-error">{error}</p>}<button className="primary-button" disabled={busy}>{busy ? "Connexion..." : "Se connecter"}</button><Link href="/" className="back-link">← Retour à la boutique</Link></form></div>;
  if (role !== "owner" && role !== "admin") return <div className="admin-gate"><div className="admin-login-card"><span className="admin-login-mark"><ShieldCheck /></span><h1>Accès non autorisé</h1><p>Ce compte ne possède pas de rôle administrateur. Le propriétaire peut attribuer les rôles dans Supabase.</p>{error && <p className="admin-error">{error}</p>}<button className="secondary-button" onClick={signOut}>Se déconnecter</button></div></div>;

  return (
    <div className="admin-app">
      <aside className="admin-sidebar">
        <Link href="/" className="admin-brand"><Image src="/images/logo-maison-lydia.png" alt="Maison Lydia AK — accueil" width={1535} height={1024} className="admin-brand-logo" /></Link>
        <nav><Link href="/admin/products" className="admin-side-link"><LayoutDashboard /> Tableau de bord</Link><Link href="/admin/products" className="admin-side-link active"><Package /> Produits</Link><button className="admin-side-link sublink" onClick={() => { clearForm(); setFormOpen(true); window.scrollTo({ top: 0, behavior: "smooth" }); }}><Plus /> Ajouter un produit</button><Link href="/boutique" className="admin-side-link"><ShoppingBag /> Voir la boutique</Link><span className="admin-nav-separator" /><Link href="/admin/orders" className="admin-side-link"><ClipboardList /> Commandes</Link><button disabled title="Disponible dans une prochaine étape" className="admin-side-link muted-link is-disabled"><Users /> Clients</button><button disabled title="Disponible dans une prochaine étape" className="admin-side-link muted-link is-disabled"><Truck /> Fournisseurs</button><button disabled title="Disponible dans une prochaine étape" className="admin-side-link muted-link is-disabled"><BarChart3 /> Rapports</button><button disabled title="Disponible dans une prochaine étape" className="admin-side-link muted-link is-disabled"><Settings /> Paramètres</button><button disabled title="Disponible dans une prochaine étape" className="admin-side-link muted-link is-disabled"><CircleHelp /> Aide & support</button></nav>
        <div className="admin-side-card"><span>♛</span><strong>Maison Lydia AK</strong><p>Ensemble, faisons briller la mode en RDC.</p></div>
        <div className="admin-profile"><span className="profile-avatar">{session.user.email?.slice(0,1).toUpperCase()}</span><div><strong>{session.user.email}</strong><small><span /> {role === "owner" ? "Propriétaire" : "Administrateur"}</small></div><button aria-label="Se déconnecter" onClick={signOut}><LogOut size={16} /></button></div>
      </aside>
      <main className="admin-main">
        <div className="admin-topbar"><label><Search size={17} /><input placeholder="Rechercher un produit..." value={search} onChange={(event) => setSearch(event.target.value)} /></label><div className="admin-top-actions"><span className="admin-user-label">{session.user.email?.split("@")[0]} <ShieldCheck size={15} /></span></div></div>
        <section className="admin-content">
          <div className="admin-page-head"><div><span className="admin-title-icon"><ShoppingBag /></span><div><h1>Gestion des produits</h1><p>Ajoutez, modifiez et gérez vos produits facilement.</p></div></div><div className="admin-head-actions"><Link href="/" className="admin-outline-button"><Eye size={16} /> Voir le site</Link><button className="admin-gold-button" onClick={() => { clearForm(); setFormOpen(true); }}><Plus size={18} /> Ajouter un produit</button></div></div>
          {error && <div className="admin-flash error-flash">{error}<button onClick={() => setError("")} aria-label="Fermer"><X size={15} /></button></div>}
          {notice && <div className="admin-flash success-flash"><Check size={15} /> {notice}<button onClick={() => setNotice("")} aria-label="Fermer"><X size={15} /></button></div>}
          {formOpen && <form className="admin-product-form" onSubmit={saveProduct}>
            <div className="form-heading"><h2><ShoppingBag size={18} /> {editingId ? "Modifier le produit" : "Ajouter un produit"}</h2><button type="button" aria-label="Masquer le formulaire" onClick={() => setFormOpen(false)}><X size={18} /></button></div>
            <div className="admin-form-grid">
              <div className="admin-photos"><label>Photos du produit (jusqu'à 10 photos)<input type="file" accept="image/png,image/jpeg,image/webp" multiple onChange={(event) => setFiles(Array.from(event.target.files ?? []).slice(0, 10))} /></label><div className="upload-drop"><ImagePlus size={26} /><strong>{files.length ? `${files.length} photo(s) choisie(s)` : "Ajouter des photos"}</strong><small>PNG, JPG ou WebP · 10 Mo maximum par photo</small></div></div>
              <div className="admin-fields"><label>Nom du produit *<input required minLength={2} maxLength={140} value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex. Robe de soirée Prestige" /></label><label>Catégorie *<select value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map((item) => <option key={item.slug}>{item.name}</option>)}</select></label><div className="admin-field-pair"><label>Prix de vente (USD) *<input required type="number" min="0" step="0.01" value={priceUsd} onChange={(event) => setPriceUsd(event.target.value)} placeholder="0 = sur demande" /></label><label>Prix en CDF<input type="number" min="0" step="1" value={priceCdf} onChange={(event) => setPriceCdf(event.target.value)} placeholder="À confirmer" /></label></div><label>Tailles disponibles<input value={sizes} onChange={(event) => setSizes(event.target.value)} placeholder="S, M, L, XL" /></label><label>Couleurs<input value={colors} onChange={(event) => setColors(event.target.value)} placeholder="Rose, noir, champagne" /></label><label>Disponibilité<select value={availability} onChange={(event) => setAvailability(event.target.value as Availability)}>{availabilityOptions.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}</select></label></div>
              <div className="admin-side-fields"><label>Fournisseur<select disabled><option>À associer dans la gestion fournisseurs</option></select></label><div className="admin-toggle-row"><strong>Promotion</strong><label className="toggle"><input type="checkbox" checked={Boolean(promoLabel)} onChange={(event) => setPromoLabel(event.target.checked ? "Promo" : "")} /><span /></label></div>{promoLabel && <label>Libellé de promotion<input value={promoLabel} onChange={(event) => setPromoLabel(event.target.value)} /></label>}<label>Description du produit *<textarea required minLength={5} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Décrivez la matière, la coupe et les détails." /></label><label>Visibilité<select value={isActive ? "active" : "hidden"} onChange={(event) => setIsActive(event.target.value === "active")}><option value="active">Visible dans la boutique</option><option value="hidden">Masqué</option></select></label><div className="admin-form-actions"><button className="admin-outline-button" type="button" onClick={clearForm}>Annuler</button><button className="admin-gold-button" disabled={busy}>{busy ? "Enregistrement..." : editingId ? "Enregistrer les modifications" : "Enregistrer le produit"}</button></div></div>
            </div>
          </form>}
          <section className="admin-product-list"><div className="list-heading"><h2><span>♛</span> Liste des produits</h2><div className="list-filters"><label><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher un produit..." /></label><select aria-label="Filtrer par catégorie" value={filterCategory} onChange={(event) => setFilterCategory(event.target.value)}><option value="">Toutes catégories</option>{categories.map((item) => <option key={item.slug}>{item.name}</option>)}</select><select aria-label="Filtrer par statut" value={filterVisibility} onChange={(event) => setFilterVisibility(event.target.value)}><option value="">Toutes visibilités</option><option value="visible">Visible</option><option value="hidden">Masqué</option></select></div></div>
            <div className="admin-table-wrap"><table><thead><tr><th>Image</th><th>Nom du produit</th><th>Catégorie</th><th>Prix (USD)</th><th>Disponibilité</th><th>Visibilité</th><th>Actions</th></tr></thead><tbody>{loadingProducts ? <tr><td colSpan={7} className="admin-table-empty">Chargement des produits...</td></tr> : filtered.length === 0 ? <tr><td colSpan={7} className="admin-table-empty">Aucun produit enregistré. Ajoutez votre première fiche.</td></tr> : filtered.map((product) => <tr key={product.id}><td><Image src={product.image} alt="" width={58} height={48} unoptimized /></td><td><strong>{product.name}</strong></td><td><span className="admin-category-pill">{product.category}</span></td><td><strong>{product.priceUsd > 0 ? `${product.priceUsd.toFixed(2)} $` : "À tarifer"}</strong></td><td><span className={`admin-status ${product.availability === "available" ? "in-stock" : product.availability === "unavailable" ? "out-stock" : "to-check"}`}>{product.availability === "available" ? "Disponible" : product.availability === "unavailable" ? "Indisponible" : product.availability === "preorder" ? "Sur commande" : "À vérifier"}</span></td><td><span className={`admin-status ${product.isActive ? "in-stock" : "out-stock"}`}>{product.isActive ? "Visible" : "Masqué"}</span></td><td><div className="admin-row-actions"><Link aria-label={`Voir ${product.name}`} href={`/produit/${product.slug}`}><Eye size={16} /></Link><button aria-label={`Modifier ${product.name}`} onClick={() => editProduct(product)}><Pencil size={16} /></button><button aria-label={`Supprimer ${product.name}`} onClick={() => void deleteProduct(product)}><Trash2 size={16} /></button></div></td></tr>)}</tbody></table></div>
            <div className="admin-table-footer"><span>Affichage : {filtered.length} produit(s)</span><Link href="/boutique">Ouvrir la boutique <ArrowRightIcon /></Link></div>
          </section>
        </section>
      </main>
    </div>
  );
}

function ArrowRightIcon() { return <span aria-hidden="true">→</span>; }
