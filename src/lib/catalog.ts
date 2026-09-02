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
};

export function rowToProduct(row: ProductRow): Product {
  const product: Product = {
    id: row.id,
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
