"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Crown, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function AccountVisitPrompt() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(false);
    if (pathname !== "/") return;
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;
    let cancelled = false;
    let timer: number | undefined;
    void supabase.auth.getSession().then(({ data }) => {
      if (!cancelled && !data.session) timer = window.setTimeout(() => setVisible(true), 1800);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) setVisible(false);
    });
    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, [pathname]);

  if (!visible) return null;
  return (
    <div className="dialog-backdrop account-prompt-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setVisible(false); }}>
      <section className="account-prompt" role="dialog" aria-modal="true" aria-labelledby="account-prompt-title">
        <button type="button" className="dialog-close" onClick={() => setVisible(false)} aria-label="Fermer"><X size={18} /></button>
        <span className="account-prompt-crown"><Crown size={26} /></span>
        <span className="eyebrow">Le Club Maison Lydia AK</span>
        <h2 id="account-prompt-title">Votre sélection vous attend</h2>
        <p>Créez un compte pour retrouver vos favoris sur cet appareil lors de vos prochaines visites. Vous avez déjà un compte ? Connectez-vous.</p>
        <div className="account-prompt-actions"><Link className="primary-button" href="/compte" onClick={() => setVisible(false)}>Créer mon compte <ArrowRight size={15} /></Link><Link className="account-prompt-login" href="/compte?mode=signin" onClick={() => setVisible(false)}>Me connecter</Link></div>
      </section>
    </div>
  );
}
