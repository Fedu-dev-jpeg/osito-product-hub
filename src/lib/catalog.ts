import type { Product } from "@/components/callao/data";
import { slugify } from "@/components/callao/data";
import { getSupabase } from "@/lib/supabase";

export type ProductRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  subcategory: string | null;
  price: number;
  image_url: string;
  badge: string | null;
  published: boolean;
  owner_id: string;
  created_at: string;
  updated_at: string;
  sku: string | null;
  compare_at_price: number | null;
  inventory_qty: number;
};

export type ProductInput = {
  id?: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  price: number;
  image_url?: string;
  badge?: string;
  published?: boolean;
  sku?: string;
  compare_at_price?: number;
  inventory_qty?: number;
};

export function rowToProduct(row: ProductRow): Product {
  const product: Product = {
    id: row.id,
    slug: row.slug,
    category: row.category,
    name: row.name,
    description: row.description,
    price: row.price,
    image: row.image_url,
  };
  return {
    ...product,
    ...(row.subcategory ? { subcategory: row.subcategory } : {}),
    ...(row.badge ? { badge: row.badge } : {}),
    ...(row.sku ? { sku: row.sku } : {}),
    ...(row.compare_at_price ? { compareAtPrice: row.compare_at_price } : {}),
    ...(typeof row.inventory_qty === "number" ? { inventory: row.inventory_qty } : {}),
  };
}

export async function fetchPublishedProducts(): Promise<Product[]> {
  const { data, error } = await getSupabase()
    .from("products")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as ProductRow[]).map(rowToProduct);
}

export async function fetchManagedProducts(ownerId?: string): Promise<ProductRow[]> {
  let query = getSupabase().from("products").select("*").order("created_at", { ascending: false });
  if (ownerId) query = query.eq("owner_id", ownerId);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as ProductRow[];
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await getSupabase()
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToProduct(data as ProductRow) : null;
}

export async function uploadProductImage(file: File, ownerId: string): Promise<string> {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${ownerId}/${Date.now()}.${ext}`;
  const { error } = await getSupabase()
    .storage.from("product-images")
    .upload(path, file, {
      upsert: true,
      contentType: file.type || "image/jpeg",
    });
  if (error) throw error;
  const { data } = getSupabase().storage.from("product-images").getPublicUrl(path);
  return data.publicUrl;
}

export async function saveCatalogProduct(
  input: ProductInput,
  ownerId: string,
): Promise<ProductRow> {
  const slugBase = slugify(input.name);
  const payload = {
    slug: input.id ? undefined : `${slugBase}-${Math.random().toString(36).slice(2, 6)}`,
    name: input.name.trim(),
    description: input.description.trim(),
    category: input.category,
    subcategory: input.subcategory?.trim() || null,
    price: input.price,
    image_url: input.image_url ?? "",
    badge: input.badge?.trim() || null,
    published: Boolean(input.published),
    owner_id: ownerId,
    sku: input.sku?.trim() || null,
    compare_at_price:
      input.compare_at_price && input.compare_at_price > 0 ? input.compare_at_price : null,
    inventory_qty: Number.isFinite(input.inventory_qty) ? Number(input.inventory_qty) : 0,
  };

  if (input.id) {
    const { data, error } = await getSupabase()
      .from("products")
      .update({
        name: payload.name,
        description: payload.description,
        category: payload.category,
        subcategory: payload.subcategory,
        price: payload.price,
        image_url: payload.image_url,
        badge: payload.badge,
        published: payload.published,
        sku: payload.sku,
        compare_at_price: payload.compare_at_price,
        inventory_qty: payload.inventory_qty,
      })
      .eq("id", input.id)
      .select("*")
      .single();
    if (error) throw error;
    return data as ProductRow;
  }

  const { data, error } = await getSupabase()
    .from("products")
    .insert({
      slug: payload.slug,
      name: payload.name,
      description: payload.description,
      category: payload.category,
      subcategory: payload.subcategory,
      price: payload.price,
      image_url: payload.image_url,
      badge: payload.badge,
      published: payload.published,
      owner_id: payload.owner_id,
      sku: payload.sku,
      compare_at_price: payload.compare_at_price,
      inventory_qty: payload.inventory_qty,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as ProductRow;
}

export async function setProductPublished(id: string, published: boolean): Promise<void> {
  const { error } = await getSupabase().from("products").update({ published }).eq("id", id);
  if (error) throw error;
}

export async function deleteCatalogProduct(id: string): Promise<void> {
  const { error } = await getSupabase().from("products").delete().eq("id", id);
  if (error) throw error;
}
