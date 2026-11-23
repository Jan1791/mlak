-- Completes the order and newsletter flows for the existing Maison Lydia AK database.
-- The first migration is a full baseline for a new Supabase project; this migration
-- adds only the objects that were missing from the already-provisioned project.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = (select auth.uid()) and role in ('owner', 'admin')
  );
$$;

create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = (select auth.uid()) and role = 'owner'
  );
$$;

create table if not exists public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  old_status text,
  new_status text not null,
  changed_by uuid references auth.users(id) on delete set null,
  changed_at timestamptz not null default now()
);

create index if not exists order_status_history_order_changed_at_idx
  on public.order_status_history (order_id, changed_at);

alter table public.order_status_history enable row level security;

drop policy if exists "Maison Lydia admins read order history" on public.order_status_history;
create policy "Maison Lydia admins read order history" on public.order_status_history
  for select to authenticated using (public.is_admin());

create or replace function public.log_order_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.status is distinct from new.status then
    insert into public.order_status_history (order_id, old_status, new_status, changed_by)
    values (new.id, old.status::text, new.status::text, auth.uid());
  end if;
  return new;
end;
$$;

drop trigger if exists orders_log_status_change on public.orders;
create trigger orders_log_status_change after update of status on public.orders
  for each row execute function public.log_order_status_change();

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "Maison Lydia admins read orders" on public.orders;
create policy "Maison Lydia admins read orders" on public.orders
  for select to authenticated using (public.is_admin());

drop policy if exists "Maison Lydia customers read own orders" on public.orders;
create policy "Maison Lydia customers read own orders" on public.orders
  for select to authenticated using (customer_id = (select auth.uid()));

drop policy if exists "Maison Lydia admins update orders" on public.orders;
create policy "Maison Lydia admins update orders" on public.orders
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Maison Lydia admins read order items" on public.order_items;
create policy "Maison Lydia admins read order items" on public.order_items
  for select to authenticated using (public.is_admin());

grant usage on schema public to anon, authenticated;
grant select, update on public.orders to authenticated;
grant select on public.order_items, public.order_status_history to authenticated;

alter table public.user_roles enable row level security;
drop policy if exists "users can read their own role" on public.user_roles;
create policy "users can read their own role" on public.user_roles
  for select to authenticated using (user_id = (select auth.uid()) or public.is_admin());
drop policy if exists "owner can insert roles" on public.user_roles;
create policy "owner can insert roles" on public.user_roles
  for insert to authenticated with check (public.is_owner());
drop policy if exists "owner can update roles" on public.user_roles;
create policy "owner can update roles" on public.user_roles
  for update to authenticated using (public.is_owner()) with check (public.is_owner());
drop policy if exists "owner can delete roles" on public.user_roles;
create policy "owner can delete roles" on public.user_roles
  for delete to authenticated using (public.is_owner());
grant select, insert, update, delete on public.user_roles to authenticated;

alter table public.products enable row level security;
drop policy if exists "public can read active products" on public.products;
create policy "public can read active products" on public.products
  for select to anon, authenticated using (is_active or public.is_admin());
drop policy if exists "admins manage products" on public.products;
create policy "admins manage products" on public.products
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 10485760, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

drop policy if exists "public can read product images" on storage.objects;
create policy "public can read product images" on storage.objects
  for select to anon, authenticated using (bucket_id = 'product-images');
drop policy if exists "admins upload product images" on storage.objects;
create policy "admins upload product images" on storage.objects
  for insert to authenticated with check (bucket_id = 'product-images' and public.is_admin());
drop policy if exists "admins update product images" on storage.objects;
create policy "admins update product images" on storage.objects
  for update to authenticated using (bucket_id = 'product-images' and public.is_admin())
  with check (bucket_id = 'product-images' and public.is_admin());
drop policy if exists "admins delete product images" on storage.objects;
create policy "admins delete product images" on storage.objects
  for delete to authenticated using (bucket_id = 'product-images' and public.is_admin());

create or replace function public.create_order(
  p_customer_name text,
  p_phone text,
  p_city text,
  p_notes text,
  p_currency text,
  p_contact_consent boolean,
  p_items jsonb
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
  if length(trim(coalesce(p_customer_name, ''))) not between 2 and 100 then
    raise exception 'Nom invalide' using errcode = '22023';
  end if;
  if length(trim(coalesce(p_phone, ''))) not between 7 and 24 then
    raise exception 'Téléphone invalide' using errcode = '22023';
  end if;
  if length(trim(coalesce(p_city, ''))) not between 2 and 80 then
    raise exception 'Ville invalide' using errcode = '22023';
  end if;
  if p_currency is null or p_currency not in ('USD', 'CDF') then
    raise exception 'Monnaie invalide' using errcode = '22023';
  end if;
  if p_contact_consent is distinct from true then
    raise exception 'Consentement de contact requis' using errcode = '22023';
  end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' then
    raise exception 'Sélection invalide' using errcode = '22023';
  end if;
  if jsonb_array_length(p_items) not between 1 and 15 then
    raise exception 'Sélection invalide' using errcode = '22023';
  end if;

  select usd_cdf_rate into v_rate from public.store_settings where id = 1;
  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_product_id := (v_item->>'product_id')::uuid;
    v_quantity := (v_item->>'quantity')::integer;
    if v_quantity not between 1 and 20 then
      raise exception 'Quantité invalide' using errcode = '22023';
    end if;

    select id, title, price_usd, price_cdf, availability
      into v_product from public.products
      where id = v_product_id and is_active = true
      for share;
    if not found then
      raise exception 'Article indisponible' using errcode = '22023';
    end if;
    if v_product.availability::text = 'unavailable' then
      raise exception 'Article indisponible' using errcode = '22023';
    end if;

    v_unit_price := case
      when p_currency = 'USD' then v_product.price_usd
      else coalesce(v_product.price_cdf, v_product.price_usd * v_rate)
    end;
    if v_unit_price is null then
      raise exception 'Prix CDF non configuré' using errcode = '22023';
    end if;

    v_total := v_total + v_unit_price * v_quantity;
    v_snapshots := v_snapshots || jsonb_build_array(jsonb_build_object(
      'product_id', v_product.id,
      'product_name', v_product.title,
      'quantity', v_quantity,
      'size', left(coalesce(v_item->>'size', ''), 30),
      'color', left(coalesce(v_item->>'color', ''), 40),
      'unit_price', v_unit_price,
      'line_total', v_unit_price * v_quantity
    ));
  end loop;

  insert into public.orders (
    customer_id, customer_name, phone, city, notes, contact_consent_at,
    status, currency, exchange_rate_snapshot, total
  ) values (
    auth.uid(), trim(p_customer_name), trim(p_phone), trim(p_city),
    left(coalesce(p_notes, ''), 500), now(), 'received', p_currency, v_rate, v_total
  ) returning id, order_number into v_order_id, v_order_number;

  insert into public.order_status_history (order_id, new_status, changed_by)
    values (v_order_id, 'received', auth.uid());

  insert into public.order_items (
    order_id, product_id, product_name, quantity, size, color, unit_price, line_total
  )
  select v_order_id,
    (snapshot->>'product_id')::uuid,
    snapshot->>'product_name',
    (snapshot->>'quantity')::integer,
    snapshot->>'size',
    snapshot->>'color',
    (snapshot->>'unit_price')::numeric,
    (snapshot->>'line_total')::numeric
  from jsonb_array_elements(v_snapshots) as rows(snapshot);

  return jsonb_build_object(
    'id', v_order_id,
    'order_number', v_order_number,
    'total', v_total,
    'currency', p_currency
  );
end;
$$;

create or replace function public.subscribe_newsletter(p_email text, p_consent boolean)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if p_consent is distinct from true then
    raise exception 'Consentement marketing requis' using errcode = '22023';
  end if;
  if length(trim(coalesce(p_email, ''))) > 254
     or trim(coalesce(p_email, '')) !~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    raise exception 'Adresse e-mail invalide' using errcode = '22023';
  end if;

  insert into public.newsletter_subscribers (email, consented_at)
    values (lower(trim(p_email)), now())
    on conflict (email) do update set consented_at = excluded.consented_at;
end;
$$;

revoke all on function public.is_admin() from public;
revoke all on function public.is_owner() from public;
revoke all on function public.create_order(text, text, text, text, text, boolean, jsonb) from public;
revoke all on function public.subscribe_newsletter(text, boolean) from public;
grant execute on function public.is_admin(), public.is_owner() to authenticated;
grant execute on function public.is_admin() to anon;
grant execute on function public.create_order(text, text, text, text, text, boolean, jsonb) to anon, authenticated;
grant execute on function public.subscribe_newsletter(text, boolean) to anon, authenticated;
