import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createHash } from "node:crypto";
import sharp from "sharp";

const repo = process.cwd();
const source = path.resolve(repo, process.argv[2] ?? "public/images/collections");
const manifestPath = path.join(repo, "lib/collection-products.generated.json");
const migrationPath = path.join(repo, "supabase/migrations/202611250003_replace_catalog.sql");
const supportedImage = /\.(png|jpe?g|webp)$/i;

function slugify(value) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function stableUuid(value) {
  const bytes = createHash("sha1").update(`maison-lydia-ak:${value}`).digest().subarray(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function publicPath(category, folder, file) {
  const encode = (part) => encodeURIComponent(part).replaceAll("'", "%27");
  return `/images/collections/${encode(category)}/${encode(folder)}/${encode(file)}`;
}

function quoteTag(value) {
  let tag = "$MLAK_CATALOG$";
  while (value.includes(tag)) tag = `$MLAK_CATALOG_${Math.random().toString(36).slice(2)}$`;
  return tag;
}

async function optimizeImage(file, output) {
  const image = sharp(file, { failOn: "none" }).rotate();
  const meta = await image.metadata();
  await image.resize({ width: 1400, height: 1800, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 84, effort: 5 })
    .toFile(output);
  return meta;
}

const products = [];
const missingDescriptions = [];
const emptyFolders = [];
let originalBytes = 0;
let optimizedBytes = 0;

for (const categoryFolder of (await fs.readdir(source, { withFileTypes: true })).filter((entry) => entry.isDirectory()).sort((a, b) => a.name.localeCompare(b.name))) {
  for (const productFolder of (await fs.readdir(path.join(source, categoryFolder.name), { withFileTypes: true })).filter((entry) => entry.isDirectory()).sort((a, b) => a.name.localeCompare(b.name))) {
    const dir = path.join(source, categoryFolder.name, productFolder.name);
    const allImages = (await fs.readdir(dir)).filter((file) => supportedImage.test(file)).sort((a, b) => a.localeCompare(b, "fr", { numeric: true }));
    const sourceImages = allImages.filter((file) => !/^opt-\d{2}\.webp$/i.test(file));
    const files = sourceImages.length ? sourceImages : allImages.filter((file) => /^opt-\d{2}\.webp$/i.test(file));
    if (!files.length) { emptyFolders.push(`${categoryFolder.name}/${productFolder.name}`); continue; }

    const descriptionPath = path.join(dir, "description");
    try { await fs.access(descriptionPath); } catch { missingDescriptions.push(`${categoryFolder.name}/${productFolder.name}`); continue; }
    const raw = (await fs.readFile(descriptionPath, "utf8")).replace(/^\uFEFF/, "").trim();
    const lines = raw.split(/\r?\n/);
    const titleLine = lines.find((line) => /^\s*titre\s*:/i.test(line));
    const title = titleLine?.replace(/^\s*titre\s*:\s*/i, "").trim();
    if (!title) {
      missingDescriptions.push(`${categoryFolder.name}/${productFolder.name} (titre manquant)`);
      continue;
    }

    const description = lines.filter((line) => !/^\s*titre\s*:/i.test(line)).map((line) => line.trimEnd()).join("\n").trim();
    const category = categoryFolder.name === "robes" ? "Robes" : categoryFolder.name === "pants-jeans" ? "Pantalons & jeans" : categoryFolder.name;
    const slug = `${slugify(category)}-${slugify(productFolder.name)}`;
    const imageUrls = [];
    for (let index = 0; index < files.length; index += 1) {
      const file = files[index];
      const outputName = sourceImages.length ? `opt-${String(index + 1).padStart(2, "0")}.webp` : file;
      const output = path.join(dir, outputName);
      const inputPath = path.join(dir, file);
      if (sourceImages.length) {
        const meta = await optimizeImage(inputPath, output);
        if (!meta.width || !meta.height) throw new Error(`Image illisible : ${inputPath}`);
        originalBytes += (await fs.stat(inputPath)).size;
        optimizedBytes += (await fs.stat(output)).size;
      } else {
        optimizedBytes += (await fs.stat(output)).size;
      }
      imageUrls.push(publicPath(categoryFolder.name, productFolder.name, outputName));
    }

    products.push({
      id: stableUuid(slug),
      slug,
      title: title.length <= 140 ? title : `${title.slice(0, 137).trimEnd()}…`,
      description,
      category,
      image_urls: imageUrls,
      price_usd: 0,
      price_cdf: null,
      sizes: [],
      colors: [],
      availability: "check",
      promo_label: null,
      is_active: true,
    });
  }
}

if (missingDescriptions.length) {
  throw new Error(`Ajoutez une description avec un titre pour chaque produit illustré : ${missingDescriptions.join(", ")}`);
}
if (!products.length) throw new Error(`Aucun produit illustré trouvé dans ${source}`);

await fs.writeFile(manifestPath, `${JSON.stringify(products, null, 2)}\n`);

const json = JSON.stringify(products);
const dollarTag = quoteTag(json);
const sql = `-- Generated from public/images/collections/*/*/description and product images.
-- Price fields are deliberately zero until Maison Lydia AK sets each price in the admin.

update public.products set is_active = false where is_active = true;

with imported as (
  select * from jsonb_to_recordset(${dollarTag}${json}${dollarTag}::jsonb) as x(
    id uuid, slug text, title text, description text, category text, image_urls jsonb,
    price_usd numeric, price_cdf numeric, sizes jsonb, colors jsonb,
    availability text, promo_label text, is_active boolean
  )
)
insert into public.products (id, slug, title, description, category, image_urls, price_usd, price_cdf, sizes, colors, availability, promo_label, is_active)
select id, slug, title, description, category,
  coalesce(array(select jsonb_array_elements_text(image_urls)), array[]::text[]),
  price_usd, price_cdf,
  coalesce(array(select jsonb_array_elements_text(sizes)), array[]::text[]),
  coalesce(array(select jsonb_array_elements_text(colors)), array[]::text[]),
  availability, promo_label, is_active
from imported
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  category = excluded.category,
  image_urls = excluded.image_urls,
  price_usd = excluded.price_usd,
  price_cdf = excluded.price_cdf,
  sizes = excluded.sizes,
  colors = excluded.colors,
  availability = excluded.availability,
  promo_label = excluded.promo_label,
  is_active = excluded.is_active,
  updated_at = now();

create or replace function public.create_order(
  p_customer_name text, p_phone text, p_city text, p_notes text,
  p_currency text, p_contact_consent boolean, p_items jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_item jsonb;
  v_product record;
  v_product_id uuid;
  v_quantity integer;
  v_unit_price numeric(14,2);
  v_total numeric(14,2) := 0;
  v_rate numeric(14,2);
  v_snapshots jsonb := '[]'::jsonb;
  v_order_id uuid;
  v_order_number bigint;
begin
  if length(trim(coalesce(p_customer_name, ''))) not between 2 and 100 then raise exception 'Nom invalide' using errcode = '22023'; end if;
  if length(trim(coalesce(p_phone, ''))) not between 7 and 24 then raise exception 'Téléphone invalide' using errcode = '22023'; end if;
  if length(trim(coalesce(p_city, ''))) not between 2 and 80 then raise exception 'Ville invalide' using errcode = '22023'; end if;
  if p_currency is null or p_currency not in ('USD', 'CDF') then raise exception 'Monnaie invalide' using errcode = '22023'; end if;
  if p_contact_consent is distinct from true then raise exception 'Consentement de contact requis' using errcode = '22023'; end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) not between 1 and 15 then raise exception 'Sélection invalide' using errcode = '22023'; end if;

  select usd_cdf_rate into v_rate from public.store_settings where id = 1;
  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_product_id := (v_item->>'product_id')::uuid;
    v_quantity := (v_item->>'quantity')::integer;
    if v_quantity not between 1 and 20 then raise exception 'Quantité invalide' using errcode = '22023'; end if;
    select id, title, price_usd, price_cdf, availability into v_product
      from public.products where id = v_product_id and is_active = true for share;
    if not found then raise exception 'Article indisponible' using errcode = '22023'; end if;
    if v_product.availability::text = 'unavailable' then raise exception 'Article indisponible' using errcode = '22023'; end if;
    v_unit_price := case when p_currency = 'USD' then v_product.price_usd else coalesce(v_product.price_cdf, v_product.price_usd * v_rate) end;
    if v_unit_price is null or v_unit_price <= 0 then raise exception 'Prix à confirmer avec la boutique' using errcode = '22023'; end if;
    v_total := v_total + v_unit_price * v_quantity;
    v_snapshots := v_snapshots || jsonb_build_array(jsonb_build_object(
      'product_id', v_product.id, 'product_name', v_product.title,
      'quantity', v_quantity, 'size', left(coalesce(v_item->>'size', ''), 30),
      'color', left(coalesce(v_item->>'color', ''), 40),
      'unit_price', v_unit_price, 'line_total', v_unit_price * v_quantity
    ));
  end loop;

  insert into public.orders (customer_id, customer_name, phone, city, notes, contact_consent_at, status, currency, exchange_rate_snapshot, total)
    values (auth.uid(), trim(p_customer_name), trim(p_phone), trim(p_city), left(coalesce(p_notes, ''), 500), now(), 'received', p_currency, v_rate, v_total)
    returning id, order_number into v_order_id, v_order_number;
  insert into public.order_status_history (order_id, new_status, changed_by) values (v_order_id, 'received', auth.uid());
  insert into public.order_items (order_id, product_id, product_name, quantity, size, color, unit_price, line_total)
    select v_order_id, (snapshot->>'product_id')::uuid, snapshot->>'product_name',
      (snapshot->>'quantity')::integer, snapshot->>'size', snapshot->>'color',
      (snapshot->>'unit_price')::numeric, (snapshot->>'line_total')::numeric
    from jsonb_array_elements(v_snapshots) as rows(snapshot);
  return jsonb_build_object('id', v_order_id, 'order_number', v_order_number, 'total', v_total, 'currency', p_currency);
end;
$$;

revoke all on function public.create_order(text, text, text, text, text, boolean, jsonb) from public;
grant execute on function public.create_order(text, text, text, text, text, boolean, jsonb) to anon, authenticated;
`;
await fs.writeFile(migrationPath, sql);

console.log(`Créé ${path.relative(repo, manifestPath)} avec ${products.length} articles et ${products.reduce((count, product) => count + product.image_urls.length, 0)} images.`);
console.log(`Créé ${path.relative(repo, migrationPath)} pour mise à jour Supabase.`);
console.log(`Images optimisées : ${(originalBytes / 1024 / 1024).toFixed(1)} Mo → ${(optimizedBytes / 1024 / 1024).toFixed(1)} Mo.`);
if (emptyFolders.length) console.log(`Dossiers sans photo ignorés : ${emptyFolders.join(", ")}`);
