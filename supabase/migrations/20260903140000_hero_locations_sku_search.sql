-- Hero slides, editable store locations, unique SKUs, and search_no_results.
-- Applied on project qkdspyxsfctqsboylwai.

create unique index if not exists products_sku_unique
  on public.products (lower(btrim(sku)))
  where sku is not null and btrim(sku) <> '';

alter table public.site_events drop constraint if exists site_events_name_check;
alter table public.site_events add constraint site_events_name_check
  check (event_name = any (array[
    'click_whatsapp'::text,
    'click_phone'::text,
    'click_maps'::text,
    'select_store'::text,
    'send_school_list'::text,
    'instagram_click'::text,
    'facebook_click'::text,
    'search'::text,
    'search_no_results'::text,
    'view_item'::text,
    'select_category'::text
  ]));

create table if not exists public.hero_slides (
  id uuid primary key default gen_random_uuid(),
  eyebrow text not null default '',
  title text not null default '',
  description text not null default '',
  cta_label text not null default 'Ver productos',
  cta_url text not null default '/productos',
  secondary_cta_label text not null default '',
  secondary_cta_url text not null default '',
  image_url text not null default '',
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.store_locations (
  id text primary key,
  name text not null,
  address text not null,
  neighborhood text not null default 'Recoleta',
  city text not null default 'CABA',
  phone_display text not null default '',
  phone_e164 text not null default '',
  secondary_phone_display text,
  secondary_phone_e164 text,
  weekday_hours text not null default '',
  saturday_hours text not null default '',
  sunday_hours text not null default 'Domingos: cerrado',
  maps_query text not null default '',
  lat double precision not null,
  lng double precision not null,
  opening_hours text[] not null default '{}',
  whatsapp_enabled boolean not null default false,
  review_url text not null default '',
  active boolean not null default true,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

insert into public.store_locations (
  id, name, address, neighborhood, city, phone_display, phone_e164,
  secondary_phone_display, secondary_phone_e164, weekday_hours, saturday_hours,
  sunday_hours, maps_query, lat, lng, opening_hours, whatsapp_enabled, sort_order
) values
  (
    'callao-1588', 'Av. Callao 1588', 'Av. Callao 1588', 'Recoleta', 'CABA',
    '11 6849-9976', '+541168499976', null, null,
    'Lunes a viernes: 9:00 a 20:00', 'Sábados: 9:30 a 13:00', 'Domingos: cerrado',
    'Av. Callao 1588, Recoleta, CABA', -34.5896, -58.3926,
    array['Mo-Fr 09:00-20:00', 'Sa 09:30-13:00'], true, 1
  ),
  (
    'callao-1377', 'Av. Callao 1377', 'Av. Callao 1377', 'Recoleta', 'CABA',
    '11 4815-3186', '+541148153186', '11 5030-7824', '+541150307824',
    'Lunes a viernes: 9:00 a 20:00', 'Sábados: 9:30 a 13:00', 'Domingos: cerrado',
    'Av. Callao 1377, Recoleta, CABA', -34.5917, -58.3928,
    array['Mo-Fr 09:00-20:00', 'Sa 09:30-13:00'], false, 2
  ),
  (
    'ayacucho-1762', 'Ayacucho 1762', 'Ayacucho 1762', 'Recoleta', 'CABA',
    '11 3927-1244', '+541139271244', null, null,
    'Lunes a viernes: 9:00 a 20:00', 'Sábados: 9:00 a 13:00', 'Domingos: cerrado',
    'Ayacucho 1762, Recoleta, CABA', -34.5888, -58.3959,
    array['Mo-Fr 09:00-20:00', 'Sa 09:00-13:00'], false, 3
  )
on conflict (id) do nothing;

alter table public.hero_slides enable row level security;
alter table public.store_locations enable row level security;

drop policy if exists hero_slides_public_read on public.hero_slides;
create policy hero_slides_public_read
  on public.hero_slides for select
  to anon, authenticated
  using (true);

drop policy if exists hero_slides_admin_write on public.hero_slides;
create policy hero_slides_admin_write
  on public.hero_slides for all
  to authenticated
  using (private.is_admin())
  with check (private.is_admin());

drop policy if exists store_locations_public_read on public.store_locations;
create policy store_locations_public_read
  on public.store_locations for select
  to anon, authenticated
  using (true);

drop policy if exists store_locations_admin_write on public.store_locations;
create policy store_locations_admin_write
  on public.store_locations for all
  to authenticated
  using (private.is_admin())
  with check (private.is_admin());

grant select on public.hero_slides to anon, authenticated;
grant insert, update, delete on public.hero_slides to authenticated;
grant select on public.store_locations to anon, authenticated;
grant insert, update, delete on public.store_locations to authenticated;
