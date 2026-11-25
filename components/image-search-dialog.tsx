"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, ImageUp, Search, X } from "lucide-react";
import { hasConfirmedPrice } from "@/lib/catalog";
import { useCatalog } from "@/lib/use-catalog";
import { findVisualMatches } from "@/lib/image-search";

export function ImageSearchDialog({ onClose }: { onClose: () => void }) {
  const products = useCatalog().filter((product) => product.isActive);
  const [preview, setPreview] = useState("");
  const [results, setResults] = useState<Awaited<ReturnType<typeof findVisualMatches>>>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  async function chooseImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessage("Choisissez une photo au format image.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setMessage("Cette image dépasse la limite de 10 Mo.");
      return;
    }
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
    setResults([]);
    setMessage("");
    setLoading(true);
    try {
      const matches = await findVisualMatches(file, products);
      setResults(matches);
      if (!matches.length) setMessage("Aucune image du catalogue n'a pu être comparée. Essayez une autre photo.");
    } catch {
      setMessage("La recherche visuelle n'a pas abouti. Essayez une image JPG, PNG ou WebP.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="dialog-backdrop image-search-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="image-search-dialog" role="dialog" aria-modal="true" aria-labelledby="image-search-title">
        <button className="dialog-close" type="button" onClick={onClose} aria-label="Fermer la recherche par image"><X size={19} /></button>
        <span className="eyebrow"><Search size={14} /> Recherche visuelle</span>
        <h2 id="image-search-title">Trouvez une pièce à partir d'une photo</h2>
        <p>Choisissez une photo. Nous comparons ses couleurs avec les images du catalogue directement sur votre appareil.</p>
        <label className="image-upload-control"><ImageUp size={20} /><span>Choisir une image</span><small>JPG, PNG ou WebP · 10 Mo maximum</small><input type="file" accept="image/*" onChange={chooseImage} /></label>
        {preview && <div className="image-search-preview"><Image src={preview} alt="Votre photo pour la recherche visuelle" width={160} height={130} unoptimized /><span>{loading ? "Comparaison des images…" : "Photo sélectionnée"}</span></div>}
        {message && <p className="image-search-message" role="status">{message}</p>}
        {results.length > 0 && <div className="image-search-results"><h3>{loading ? "Recherche en cours" : "Teintes proches dans notre catalogue"}</h3>{results.map(({ product }) => <Link href={`/produit/${product.slug}`} className="image-search-result" key={product.id} onClick={onClose}><Image src={product.image} alt="" width={58} height={58} /><span><strong>{product.name}</strong><small>{product.category} · {hasConfirmedPrice(product) ? `${product.priceUsd.toFixed(2)} USD` : "Prix sur demande"}</small></span><ArrowRight size={15} /></Link>)}</div>}
        <small className="image-search-privacy">Votre photo reste dans votre navigateur et n'est pas envoyée.</small>
      </section>
    </div>
  );
}
