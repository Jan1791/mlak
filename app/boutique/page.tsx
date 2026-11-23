import { StoreShell } from "@/components/store-shell";
import { CatalogBrowser } from "@/components/catalog-browser";

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function BoutiquePage({ searchParams }: PageProps) {
  const params = await searchParams;
  return <StoreShell><CatalogBrowser initialQuery={firstParam(params.q)} initialCategory={firstParam(params.categorie)} promotionsOnly={firstParam(params.promotion) === "1"} /></StoreShell>;
}
