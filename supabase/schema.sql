-- Librería Callao catalog (applied on project qkdspyxsfctqsboylwai).
-- Public REST: published products are readable without a session.
-- Only role=admin can insert/update rows with published=true.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  username text unique,
  role text not null default 'vendedor' check (role in ('admin', 'vendedor')),
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  category text not null default 'Libros',
  subcategory text,
  price integer not null default 0 check (price >= 0),
  image_url text not null default '',
  badge text,
  published boolean not null default false,
  owner_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_owner_id_idx on public.products (owner_id);
create index if not exists products_published_created_idx
  on public.products (created_at desc)
  where published = true;

alter table public.profiles enable row level security;
alter table public.products enable row level security;
