"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Session } from "@supabase/supabase-js";
import { ArrowLeft, CheckCircle2, LogOut, ShieldCheck, UserRound } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type AccountMode = "signin" | "signup";

export function AccountPage({ initialMode = "signup" }: { initialMode?: AccountMode }) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [mode, setMode] = useState<AccountMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    void supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => subscription.unsubscribe();
  }, [supabase]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true); setMessage(""); setError("");
    try {
      if (mode === "signup") {
        const { data, error: authError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { full_name: name.trim() }, emailRedirectTo: `${window.location.origin}/compte` },
        });
        if (authError) setError("Création impossible. Vérifiez l'adresse e-mail ou essayez de vous connecter.");
        else if (data.session) setMessage("Votre compte est prêt. Vos favoris sont enregistrés sur cet appareil.");
        else setMessage("Un lien de confirmation vient d'être envoyé à votre adresse e-mail.");
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (authError) setError("Connexion impossible. Vérifiez votre adresse et votre mot de passe.");
        else setMessage("Vous êtes connecté à Maison Lydia AK.");
      }
    } catch {
      setError("Connexion indisponible. Réessayez dans un instant.");
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    await supabase?.auth.signOut();
    setSession(null); setMessage("Vous êtes déconnecté.");
  }

  if (loading) return <section className="content-section account-layout"><div className="account-card">Chargement de votre espace…</div></section>;
  if (!supabase) return <section className="content-section account-layout"><div className="account-card"><UserRound size={30} /><h1>Votre compte Maison Lydia AK</h1><p>La création de compte sera disponible après la configuration de Supabase Auth.</p><Link className="primary-button" href="/boutique">Continuer la visite</Link></div></section>;
  if (session) return (
    <section className="content-section account-layout"><div className="account-card"><span className="account-card-icon"><CheckCircle2 size={28} /></span><span className="eyebrow"><ShieldCheck size={14} /> Espace client</span><h1>Bienvenue</h1><p>Connecté avec <strong>{session.user.email}</strong></p><p>Vos favoris restent enregistrés sur cet appareil. Vous pouvez aussi parcourir les collections et envoyer une demande à la boutique.</p><div className="account-card-actions"><Link className="primary-button" href="/favoris">Voir mes favoris</Link><Link className="secondary-button" href="/boutique">Continuer mes achats</Link><button className="account-signout" onClick={signOut}><LogOut size={15} /> Se déconnecter</button></div>{message && <p className="form-message" role="status">{message}</p>}</div></section>
  );

  return (
    <section className="content-section account-layout">
      <form className="account-card account-form" onSubmit={submit}>
        <span className="account-card-icon"><UserRound size={27} /></span>
        <span className="eyebrow">Maison Lydia AK</span>
        <h1>{mode === "signup" ? "Créer mon compte" : "Me connecter"}</h1>
        <p>{mode === "signup" ? "Enregistrez vos favoris et retrouvez-les lors de vos prochaines visites." : "Connectez-vous pour accéder à votre espace Maison Lydia AK."}</p>
        {mode === "signup" && <label>Votre nom<input autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} maxLength={100} required /></label>}
        <label>Adresse e-mail<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
        <label>Mot de passe<input type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required /><small>8 caractères minimum.</small></label>
        {error && <p className="account-error" role="alert">{error}</p>}
        {message && <p className="account-message" role="status">{message}</p>}
        <button className="primary-button account-submit" disabled={busy}>{busy ? "Veuillez patienter…" : mode === "signup" ? "Créer mon compte" : "Me connecter"}</button>
        <button type="button" className="account-mode-toggle" onClick={() => { setMode(mode === "signup" ? "signin" : "signup"); setError(""); setMessage(""); }}>{mode === "signup" ? "J'ai déjà un compte — Me connecter" : "Nouveau chez Maison Lydia AK ? Créer un compte"}</button>
        <Link className="back-link" href="/"><ArrowLeft size={14} /> Retour à la boutique</Link>
      </form>
    </section>
  );
}
