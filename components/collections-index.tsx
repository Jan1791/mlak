import Link from "next/link";
import { ArrowRight, Gem, Heart, Footprints, Shirt, ShoppingBag, Sparkles } from "lucide-react";
import { collectionGroups, collectionHref } from "@/lib/collections";

const icons = [Shirt, Sparkles, Footprints, Footprints, Heart, ShoppingBag, Gem, Sparkles];

export function CollectionsIndex() {
  return (
    <>
      <section className="page-heading collections-heading">
        <span className="eyebrow"><Sparkles size={14} /> Maison Lydia AK</span>
        <h1>Nos collections</h1>
        <p>Explorez les styles et les pièces qui vous ressemblent. Les articles et leurs disponibilités sont confirmés avec la boutique.</p>
      </section>
      <section className="content-section collections-index">
        <div className="collections-intro"><span>La sélection Maison Lydia AK</span><strong>Élégance, à votre rythme.</strong></div>
        <div className="collections-grid">
          {collectionGroups.map((group, index) => {
            const Icon = icons[index] ?? Sparkles;
              const allHref = collectionHref({
                  label: group.allLabel ?? group.title,
                  ...(group.category
                      ? { category: group.category }
                      : { query: group.title.toLocaleLowerCase("fr") }),
              });
            return (
              <article className={`collection-group collection-group-${group.id}`} key={group.id}>
                <header><span className="collection-group-icon"><Icon size={19} /></span><div><h2>{group.title}</h2>{group.allLabel && <Link className="collection-all-link" href={allHref}>{group.allLabel} <ArrowRight size={13} /></Link>}</div></header>
                <ul>{group.items.map((item) => <li key={item.label}><Link href={collectionHref(item)}>{item.label}<ArrowRight size={12} /></Link></li>)}</ul>
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}
