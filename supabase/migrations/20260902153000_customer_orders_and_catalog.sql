-- Customer accounts, Shopify-like orders, discount codes, and product commerce fields.

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role = any (array['admin'::text, 'vendedor'::text, 'cliente'::text]));
alter table public.profiles alter column role set default 'cliente';

alter table public.products add column if not exists sku text;
alter table public.products add column if not exists compare_at_price integer;
alter table public.products add column if not exists inventory_qty integer not null default 20;

create sequence if not exists private.order_code_seq start with 1001;

create table if not exists public.discount_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text not null default '',
  percent integer,
  amount integer,
  free_shipping boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  customer_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'pendiente',
  fulfillment text not null default 'retiro',
  discount_code text,
  subtotal integer not null default 0,
  shipping integer not null default 0,
  discount integer not null default 0,
  total integer not null default 0,
  notes text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id text not null,
  name text not null,
  quantity integer not null,
  unit_price integer not null,
  image_url text not null default ''
);
