import { sanitizeText } from "@/lib/sanitize";
import { getSupabase } from "@/lib/supabase";

export type HeroSlide = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaUrl: string;
  secondaryCtaLabel: string;
  secondaryCtaUrl: string;
  imageUrl: string;
  active: boolean;
  sortOrder: number;
};

export type HeroSlideInput = Omit<HeroSlide, "id"> & { id?: string };

function cell(row: Record<string, unknown>, key: string) {
  return row[key];
}

function rowToSlide(row: Record<string, unknown>): HeroSlide {
  return {
    id: String(cell(row, "id")),
    eyebrow: String(cell(row, "eyebrow") ?? ""),
    title: String(cell(row, "title") ?? ""),
    description: String(cell(row, "description") ?? ""),
    ctaLabel: String(cell(row, "cta_label") ?? "Ver productos"),
    ctaUrl: String(cell(row, "cta_url") ?? "/productos"),
    secondaryCtaLabel: String(cell(row, "secondary_cta_label") ?? ""),
    secondaryCtaUrl: String(cell(row, "secondary_cta_url") ?? ""),
    imageUrl: String(cell(row, "image_url") ?? ""),
    active: cell(row, "active") !== false,
    sortOrder: Number(cell(row, "sort_order")) || 0,
  };
}

export async function fetchHeroSlides(includeInactive = false): Promise<HeroSlide[]> {
  const { data, error } = await getSupabase()
    .from("hero_slides")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  const rows = ((data ?? []) as Record<string, unknown>[]).map(rowToSlide);
  return includeInactive ? rows : rows.filter((row) => row.active && (row.imageUrl || row.title));
}

export async function saveHeroSlide(input: HeroSlideInput): Promise<HeroSlide> {
  const payload = {
    eyebrow: sanitizeText(input.eyebrow, 80),
    title: sanitizeText(input.title, 140),
    description: sanitizeText(input.description, 400),
    cta_label: sanitizeText(input.ctaLabel, 40) || "Ver productos",
    cta_url: sanitizeText(input.ctaUrl, 200) || "/productos",
    secondary_cta_label: sanitizeText(input.secondaryCtaLabel, 40),
    secondary_cta_url: sanitizeText(input.secondaryCtaUrl, 200),
    image_url: sanitizeText(input.imageUrl, 500),
    active: Boolean(input.active),
    sort_order: Number(input.sortOrder) || 0,
    updated_at: new Date().toISOString(),
  };
  if (input.id) {
    const { data, error } = await getSupabase()
      .from("hero_slides")
      .update(payload)
      .eq("id", input.id)
      .select("*")
      .single();
    if (error) throw error;
    return rowToSlide(data as Record<string, unknown>);
  }
  const { data, error } = await getSupabase().from("hero_slides").insert(payload).select("*").single();
  if (error) throw error;
  return rowToSlide(data as Record<string, unknown>);
}

export async function deleteHeroSlide(id: string): Promise<void> {
  const { error } = await getSupabase().from("hero_slides").delete().eq("id", id);
  if (error) throw error;
}

export async function reorderHeroSlides(ids: string[]): Promise<void> {
  await Promise.all(
    ids.map((id, index) =>
      getSupabase().from("hero_slides").update({ sort_order: index + 1 }).eq("id", id),
    ),
  );
}

export async function uploadHeroImage(file: File, ownerId: string): Promise<string> {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${ownerId}/hero/${Date.now()}.${ext}`;
  const { error } = await getSupabase().storage.from("product-images").upload(path, file, {
    upsert: true,
    contentType: file.type || "image/jpeg",
  });
  if (error) throw error;
  return getSupabase().storage.from("product-images").getPublicUrl(path).data.publicUrl;
}
