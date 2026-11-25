import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { categories, demoProducts } from "@/lib/catalog";

export function CollectionsIndex() {
  return (
    <>
      <section className="page-heading editorial-page-heading">
        <span className="eyebrow"><Sparkles size={14} /> Maison Lydia AK · Kisangani</span>
        <h1>Les collections</h1>
        <p>Des pièces choisies avec soin, réunies par envie et par allure.</p>
      </section>
      <section className="content-section editorial-collections-index">
        {categories.map((category, index) => {
          const items = demoProducts.filter((product) => product.category === category.name);
          const firstProduct = items[0];
          return (
            <Link className="editorial-collection-tile" href={`/boutique?categorie=${encodeURIComponent(category.name)}`} key={category.slug}>
              <div className="editorial-collection-photo">
                <Image src={firstProduct?.image ?? category.image} alt={category.name} fill sizes="(max-width: 760px) 100vw, 48vw" />
              </div>
              <div className="editorial-collection-copy">
                <span>Collection 0{index + 1} · {items.length} pièces</span>
                <h2>{category.name}</h2>
                <p>{category.count}</p>
                <strong>Explorer la collection <ArrowRight size={16} /></strong>
              </div>
            </Link>
          );
        })}
      </section>
    </>
  );
}
