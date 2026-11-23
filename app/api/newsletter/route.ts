import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Adresse e-mail invalide." }, { status: 400 });
  }
  const data = body as { email?: unknown; consent?: unknown } | null;
  const email = typeof data?.email === "string" ? data.email.trim().toLowerCase() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return Response.json({ error: "Indiquez une adresse e-mail valide." }, { status: 400 });
  if (data?.consent !== true) return Response.json({ error: "Votre consentement est nécessaire pour l'inscription." }, { status: 400 });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return Response.json({ error: "L'inscription est momentanément indisponible." }, { status: 503 });

  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { error } = await supabase.rpc("subscribe_newsletter", { p_email: email, p_consent: true });
  if (error) return Response.json({ error: "L'inscription est momentanément indisponible." }, { status: 503 });
  return Response.json({ ok: true }, { status: 201 });
}
