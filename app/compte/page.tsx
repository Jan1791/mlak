import { StoreShell } from "@/components/store-shell";
import { AccountPage } from "@/components/account-page";

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function ComptePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const mode = (Array.isArray(params.mode) ? params.mode[0] : params.mode) === "signin" ? "signin" : "signup";
  return <StoreShell><AccountPage initialMode={mode} /></StoreShell>;
}
