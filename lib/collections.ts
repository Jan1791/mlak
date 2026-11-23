export type CollectionLink = { label: string; query?: string; category?: string };
export type CollectionGroup = {
  id: string;
  title: string;
  category?: string;
  allLabel?: string;
  items: CollectionLink[];
};

export const collectionGroups: CollectionGroup[] = [
  {
    id: "vetements",
    title: "Vêtements",
    category: "Vêtements",
    allLabel: "Voir tous les vêtements",
    items: ["Robes", "Combinaisons", "Tops, t-shirts", "Chemisiers, blouses", "Pantalons", "Jeans", "Jupes", "Trenchs", "Vestes", "Gilets, cardigans", "Pulls", "Manteaux", "Sweat-shirts", "Leggings", "Shorts"].map((label) => ({ label, query: label.toLocaleLowerCase("fr"), category: "Vêtements" })),
  },
  {
    id: "selection-mode",
    title: "Collections & sélection mode",
    category: "Vêtements",
    items: ["Ensembles", "Grandes tailles (44 et +)", "Les basiques", "Sport", "Robes de soirée", "Robes pull", "Tendance costume", "Asymétrie stylée", "Check ton dressing", "Denim Forever", "Tendance cuir", "Brown is the new black", "Fausse fourrure", "Imprimé animal", "Tenues cérémonies", "Pois et plumetis", "Nuances de bordeaux", "Élégance satinée", "Nuances de beige"].map((label) => ({ label, query: label.toLocaleLowerCase("fr"), category: "Vêtements" })),
  },
  {
    id: "chaussures",
    title: "Chaussures",
    category: "Chaussures",
    allLabel: "Voir toutes les chaussures",
    items: ["Bottes, cuissardes", "Bottines", "Mocassins", "Ballerines", "Escarpins", "Baskets, slip-on", "Sandales, nu-pieds", "Tongs, mules", "Espadrilles", "Derbies, richelieus"].map((label) => ({ label, query: label.toLocaleLowerCase("fr"), category: "Chaussures" })),
  },
  {
    id: "collections-chaussures",
    title: "Collections chaussures",
    category: "Chaussures",
    items: ["Santiags", "Slingback", "Chaussures de soirée", "Grandes tailles (41–44)", "Chaussures d'hiver, boots", "Chaussons", "Compensées"].map((label) => ({ label, query: label.toLocaleLowerCase("fr"), category: "Chaussures" })),
  },
  {
    id: "lingerie",
    title: "Lingerie",
    allLabel: "Voir toute la lingerie",
    items: ["Ensembles lingerie", "Bodys", "Pyjamas, nuisettes", "Culottes, strings", "Soutiens-gorge", "Bas, collants", "Chaussettes", "Lingerie sculptante", "Maillots de bain"].map((label) => ({ label, query: label.toLocaleLowerCase("fr") })),
  },
  {
    id: "sacs",
    title: "Sacs",
    category: "Sacs & accessoires",
    allLabel: "Voir tous les sacs",
    items: ["Pochettes", "Portefeuilles", "Sacs à dos, bananes", "Sacs à main", "Sacs cabas", "Sacs de plage", "Sacs en bandoulière"].map((label) => ({ label, query: label.toLocaleLowerCase("fr"), category: "Sacs & accessoires" })),
  },
  {
    id: "bijoux",
    title: "Bijoux",
    category: "Bijoux",
    allLabel: "Voir tous les bijoux",
    items: ["Boucles d'oreilles", "Bracelets", "Colliers"].map((label) => ({ label, query: label.toLocaleLowerCase("fr"), category: "Bijoux" })),
  },
  {
    id: "accessoires",
    title: "Accessoires",
    category: "Sacs & accessoires",
    allLabel: "Voir tous les accessoires",
    items: ["Articles de cheveux", "Bonnets, chapeaux", "Ceintures", "Foulards, écharpes", "Gants, moufles", "Lunettes de soleil", "Porte-clés"].map((label) => ({ label, query: label.toLocaleLowerCase("fr"), category: "Sacs & accessoires" })),
  },
];

export function collectionHref(item: CollectionLink) {
  const params = new URLSearchParams();
  if (item.category) params.set("categorie", item.category);
  if (item.query) params.set("q", item.query);
  const query = params.toString();
  return `/boutique${query ? `?${query}` : ""}`;
}
