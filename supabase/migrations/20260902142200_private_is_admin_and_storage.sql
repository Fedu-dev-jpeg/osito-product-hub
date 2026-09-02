-- Move is_admin() into the private schema so it is not exposed as RPC,
-- restrict product-image uploads to the owner's folder, and index lookups.

create schema if not exists private;

revoke all on schema private from public;
grant usage on schema private to postgres, authenticated;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select role from public.profiles where id = auth.uid()), '') = 'admin';
$$;

revoke all on function private.is_admin() from public;
grant execute on function private.is_admin() to authenticated;

drop policy if exists products_delete_owner_or_admin on public.products;
create policy products_delete_owner_or_admin
  on public.products for delete
  to authenticated
  using ((owner_id = auth.uid()) or private.is_admin());

drop policy if exists products_insert_authenticated on public.products;
create policy products_insert_authenticated
  on public.products for insert
  to authenticated
  with check ((owner_id = auth.uid()) and (private.is_admin() or published = false));

drop policy if exists products_owner_or_admin_read on public.products;
create policy products_owner_or_admin_read
  on public.products for select
  to authenticated
  using ((owner_id = auth.uid()) or private.is_admin());

drop policy if exists products_update_owner_or_admin on public.products;
create policy products_update_owner_or_admin
  on public.products for update
  to authenticated
  using ((owner_id = auth.uid()) or private.is_admin())
  with check (private.is_admin() or ((owner_id = auth.uid()) and published = false));

drop policy if exists profiles_select_own_or_admin on public.profiles;
create policy profiles_select_own_or_admin
  on public.profiles for select
  to authenticated
  using ((id = auth.uid()) or private.is_admin());

drop function if exists public.is_admin();
drop function if exists public."current_role"();

create index if not exists products_owner_id_idx on public.products (owner_id);
create index if not exists products_published_created_idx
  on public.products (created_at desc)
  where published = true;

drop policy if exists product_images_auth_insert on storage.objects;
drop policy if exists product_images_auth_update on storage.objects;
drop policy if exists product_images_auth_delete on storage.objects;

create policy product_images_auth_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy product_images_auth_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy product_images_auth_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

revoke all on function public.set_updated_at() from public;
revoke all on function public.set_updated_at() from anon;
revoke all on function public.set_updated_at() from authenticated;
