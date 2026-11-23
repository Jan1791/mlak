"use client";

import { useMemo, useState } from "react";
import { Search, Sparkles } from "lucide-react";
import { categories } from "@/lib/catalog";
import { useCatalog } from "@/lib/use-catalog";
import { ProductCard } from "@/components/product-card";

export function CatalogBrowser({ initialQuery = "", initialCategory = "", promotionsOnly = false }: { initialQuery?: string; initialCategory?: string; promotionsOnly?: boolean }) {
  const products = useCatalog().filter((product) => product.isActive);
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const filtered = useMemo(() => products.filter((product) => {
    const matchesQuery = `${product.name} ${product.description} ${product.category}`.toLocaleLowerCase("fr").includes(query.trim().toLocaleLowerCase("fr"));
    const matchesCategory = !category || product.category === category;
    return matchesQuery && matchesCategory && (!promotionsOnly || Boolean(product.promoLabel));
  }), [products, query, category, promotionsOnly]);

  return (
    <>
      <section className="page-heading"><span className="eyebrow"><Sparkles size={14} /> Maison Lydia AK</span><h1>La boutique</h1><p>Des pièces choisies avec soin pour révéler votre élégance. La disponibilité et le délai sont confirmés avec vous avant la commande.</p></section>
      <section className="content-section catalog-layout">
        <div className="catalog-toolbar">
          <label className="catalog-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher un article..." aria-label="Rechercher dans le catalogue" /></label>
          <div className="category-filters" aria-label="Filtrer par catégorie">
            <button className={`filter-chip ${!category ? "active" : ""}`} onClick={() => setCategory("")}>Tout voir</button>
            {categories.map((item) => <button key={item.slug} className={`filter-chip ${category === item.name ? "active" : ""}`} onClick={() => setCategory(item.name)}>{item.name}</button>)}
          </div>
        </div>
        <p className="catalog-count">{filtered.length} article{filtered.length === 1 ? "" : "s"}{promotionsOnly ? " en promotion" : " dans la sélection"}</p>
        {filtered.length ? <div className="product-grid">{filtered.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="empty-state"><h2>Aucun article trouvé</h2><p>Essayez un autre mot ou parcourez toutes les catégories.</p><button className="secondary-button" onClick={() => { setQuery(""); setCategory(""); }}>Effacer les filtres</button></div>}
      </section>
    </>
  );
}
