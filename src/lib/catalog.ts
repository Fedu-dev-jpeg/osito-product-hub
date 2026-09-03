import type { Product } from "@/components/callao/data";
import { slugify } from "@/components/callao/data";
import { sanitizeMultiline, sanitizeText } from "@/lib/sanitize";
import { getSupabase } from "@/lib/supabase";

export type ProductRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  subcategory: string | null;
  brand: string | null;
  price: number;
  image_url: string;
  image_urls: string[] | null;
  badge: string | null;
  published: boolean;
  featured: boolean;
  is_new: boolean;
  is_offer: boolean;
  sort_order: number;
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
  brand?: string;
  price: number;
  image_url?: string;
  image_urls?: string[];
  badge?: string;
  published?: boolean;
  featured?: boolean;
  is_new?: boolean;
  is_offer?: boolean;
  sort_order?: number;
  sku?: string;
  compare_at_price?: number;
  inventory_qty?: number;
};

export function rowToProduct(row: ProductRow): Product {
  const images = (row.image_urls ?? []).filter(Boolean);
  const image = row.image_url || images[0] || "";
  return {
    id: row.id,
    slug: row.slug,
    category: row.category,
    name: row.name,
    description: row.description,
    price: row.price,
    image,
    ...(images.length ? { images } : {}),
    ...(row.subcategory ? { subcategory: row.subcategory } : {}),
    ...(row.brand ? { brand: row.brand } : {}),
    ...(row.badge ? { badge: row.badge } : {}),
    ...(row.sku ? { sku: row.sku } : {}),
    ...(row.compare_at_price ? { compareAtPrice: row.compare_at_price } : {}),
    ...(typeof row.inventory_qty === "number" ? { inventory: row.inventory_qty } : {}),
    featured: Boolean(row.featured),
    isNew: Boolean(row.is_new),
    isOffer: Boolean(row.is_offer),
    sortOrder: row.sort_order ?? 0,
  };
}

export async function fetchPublishedProducts(): Promise<Product[]> {
  const { data, error } = await getSupabase()
    .from("products")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as ProductRow[]).map(rowToProduct);
}

export async function fetchManagedProducts(ownerId?: string): Promise<ProductRow[]> {
  let query = getSupabase()
    .from("products")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
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
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
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
  const name = sanitizeText(input.name, 160);
  const description = sanitizeMultiline(input.description, 4000);
  const category = sanitizeText(input.category, 80) || "Escolar";
  const images = (input.image_urls ?? []).map((url) => sanitizeText(url, 500)).filter(Boolean);
  const imageUrl = sanitizeText(input.image_url, 500) || images[0] || "";
  const payload = {
    slug: input.id ? undefined : `${slugBase}-${Math.random().toString(36).slice(2, 6)}`,
    name,
    description,
    category,
    subcategory: sanitizeText(input.subcategory, 80) || null,
    brand: sanitizeText(input.brand, 80) || null,
    price: Math.max(0, Math.floor(Number(input.price) || 0)),
    image_url: imageUrl,
    image_urls: images.length ? images : imageUrl ? [imageUrl] : [],
    badge: sanitizeText(input.badge, 40) || null,
    published: Boolean(input.published),
    featured: Boolean(input.featured),
    is_new: Boolean(input.is_new),
    is_offer: Boolean(input.is_offer),
    sort_order: Number.isFinite(input.sort_order) ? Number(input.sort_order) : 0,
    owner_id: ownerId,
    sku: sanitizeText(input.sku, 64) || null,
    compare_at_price:
      input.compare_at_price && input.compare_at_price > 0 ? Math.floor(input.compare_at_price) : null,
    inventory_qty: Number.isFinite(input.inventory_qty) ? Math.max(0, Number(input.inventory_qty)) : 0,
  };

  if (input.id) {
    const { data, error } = await getSupabase()
      .from("products")
      .update({
        name: payload.name,
        description: payload.description,
        category: payload.category,
        subcategory: payload.subcategory,
        brand: payload.brand,
        price: payload.price,
        image_url: payload.image_url,
        image_urls: payload.image_urls,
        badge: payload.badge,
        published: payload.published,
        featured: payload.featured,
        is_new: payload.is_new,
        is_offer: payload.is_offer,
        sort_order: payload.sort_order,
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
      brand: payload.brand,
      price: payload.price,
      image_url: payload.image_url,
      image_urls: payload.image_urls,
      badge: payload.badge,
      published: payload.published,
      featured: payload.featured,
      is_new: payload.is_new,
      is_offer: payload.is_offer,
      sort_order: payload.sort_order,
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

export async function bulkUpdateProducts(
  ids: string[],
  patch: Partial<{
    published: boolean;
    featured: boolean;
    category: string;
    brand: string;
  }>,
): Promise<void> {
  if (!ids.length) return;
  const { error } = await getSupabase().from("products").update(patch).in("id", ids);
  if (error) throw error;
}

export async function bulkDeleteProducts(ids: string[]): Promise<void> {
  if (!ids.length) return;
  const { error } = await getSupabase().from("products").delete().in("id", ids);
  if (error) throw error;
}

export async function fetchProductsBySkus(skus: string[]): Promise<ProductRow[]> {
  const clean = skus.map((sku) => sku.trim()).filter(Boolean);
  if (!clean.length) return [];
  const { data, error } = await getSupabase().from("products").select("*").in("sku", clean);
  if (error) throw error;
  return (data ?? []) as ProductRow[];
}

export async function importCatalogRows(
  rows: {
    sku: string;
    name: string;
    brand: string;
    category: string;
    subcategory: string;
    description: string;
    price: number;
    compare: number;
    published: boolean;
    featured: boolean;
    isNew: boolean;
    badge: string;
    image: string;
    inventory: number;
    sortOrder: number;
  }[],
  ownerId: string,
  mode: "update" | "skip",
): Promise<void> {
  const existing = await fetchManagedProducts();
  const bySku = new Map(
    existing
      .filter((row) => row.sku)
      .map((row) => [String(row.sku).trim().toLowerCase(), row]),
  );
  for (const row of rows) {
    const current = bySku.get(row.sku.toLowerCase());
    if (current && mode === "skip") continue;
    await saveCatalogProduct(
      {
        ...(current ? { id: current.id } : {}),
        name: row.name,
        description: row.description,
        category: row.category,
        subcategory: row.subcategory,
        brand: row.brand,
        price: row.price,
        image_url: row.image || current?.image_url || "",
        badge: row.badge,
        published: row.published,
        featured: row.featured,
        is_new: row.isNew,
        sku: row.sku,
        compare_at_price: row.compare,
        inventory_qty: row.inventory,
        sort_order: row.sortOrder,
      },
      current?.owner_id ?? ownerId,
    );
  }
}
