import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { AccountVisitPrompt } from "@/components/account-visit-prompt";

export function StoreShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
      <AccountVisitPrompt />
    </>
  );
}
