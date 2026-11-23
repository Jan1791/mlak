import { StoreShell } from "@/components/store-shell";
import { ProductDetailView } from "@/components/product-detail-view";

type PageProps = { params: Promise<{ slug: string }> };

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  return <StoreShell><ProductDetailView slug={slug} /></StoreShell>;
}
