import { createClient } from "@supabase/supabase-js";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "La demande n'est pas valide." }, { status: 400 });
  }
  if (!body || typeof body !== "object") return Response.json({ error: "La demande n'est pas valide." }, { status: 400 });
  const data = body as Record<string, unknown>;
  const items = data.items;
  if (typeof data.customerName !== "string" || data.customerName.trim().length < 2 || data.customerName.length > 100) return Response.json({ error: "Indiquez votre nom complet." }, { status: 400 });
  if (typeof data.phone !== "string" || data.phone.trim().length < 7 || data.phone.length > 24) return Response.json({ error: "Indiquez un numéro de téléphone valide." }, { status: 400 });
  if (typeof data.city !== "string" || data.city.length > 80) return Response.json({ error: "Indiquez une ville valide." }, { status: 400 });
  if (typeof data.currency !== "string" || !["USD", "CDF"].includes(data.currency)) return Response.json({ error: "Choisissez une monnaie valide." }, { status: 400 });
  if (data.contactConsent !== true) return Response.json({ error: "Autorisez Maison Lydia AK à vous contacter au sujet de cette demande." }, { status: 400 });
  if (!Array.isArray(items) || items.length < 1 || items.length > 15) return Response.json({ error: "Votre sélection ne peut pas être traitée." }, { status: 400 });
  const validItems = items.every((item) => item && typeof item === "object" && uuidPattern.test(String(item.productId)) && Number.isInteger(item.quantity) && item.quantity > 0 && item.quantity <= 20 && typeof item.size === "string" && item.size.length <= 30 && typeof item.color === "string" && item.color.length <= 40);
  if (!validItems) return Response.json({ error: "Un article ou une quantité n'est pas valide." }, { status: 400 });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return Response.json({ error: "La transmission en ligne n'est pas configurée. Vous pouvez transmettre la demande par WhatsApp." }, { status: 503 });

  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: result, error } = await supabase.rpc("create_order", {
    p_customer_name: data.customerName.trim(),
    p_phone: data.phone.trim(),
    p_city: data.city.trim(),
    p_notes: typeof data.notes === "string" ? data.notes.slice(0, 500) : "",
    p_currency: data.currency,
    p_contact_consent: true,
    p_items: items.map((item: Record<string, unknown>) => ({ product_id: item.productId, quantity: item.quantity, size: item.size, color: item.color })),
  });
  if (error) return Response.json({ error: "La transmission en ligne est indisponible. Vous pouvez envoyer votre demande par WhatsApp." }, { status: 503 });
  const order = result as { order_number?: number | string } | null;
  return Response.json({ orderNumber: order?.order_number ?? "" }, { status: 201 });
}
