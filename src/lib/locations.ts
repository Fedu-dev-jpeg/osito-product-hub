import { branches as defaultBranches, type Branch } from "@/lib/site";
import { sanitizeText } from "@/lib/sanitize";
import { getSupabase } from "@/lib/supabase";

export type StoreLocation = Branch & {
  active: boolean;
  sortOrder: number;
  reviewUrl: string;
};

export type StoreLocationInput = {
  id: string;
  name: string;
  address: string;
  neighborhood: string;
  city: string;
  phoneDisplay: string;
  phoneE164: string;
  secondaryPhoneDisplay?: string;
  secondaryPhoneE164?: string;
  weekdayHours: string;
  saturdayHours: string;
  sundayHours: string;
  mapsQuery: string;
  lat: number;
  lng: number;
  whatsappEnabled: boolean;
  reviewUrl?: string;
  active: boolean;
  sortOrder: number;
};

function cell(row: Record<string, unknown>, key: string) {
  return row[key];
}

function rowToLocation(row: Record<string, unknown>): StoreLocation {
  const secondaryDisplay = cell(row, "secondary_phone_display");
  const secondaryE164 = cell(row, "secondary_phone_e164");
  const opening = cell(row, "opening_hours");
  return {
    id: String(cell(row, "id")),
    name: String(cell(row, "name")),
    address: String(cell(row, "address")),
    neighborhood: String(cell(row, "neighborhood") ?? "Recoleta"),
    city: String(cell(row, "city") ?? "CABA"),
    phoneDisplay: String(cell(row, "phone_display") ?? ""),
    phoneE164: String(cell(row, "phone_e164") ?? ""),
    ...(secondaryDisplay ? { secondaryPhoneDisplay: String(secondaryDisplay) } : {}),
    ...(secondaryE164 ? { secondaryPhoneE164: String(secondaryE164) } : {}),
    weekdayHours: String(cell(row, "weekday_hours") ?? ""),
    saturdayHours: String(cell(row, "saturday_hours") ?? ""),
    sundayHours: String(cell(row, "sunday_hours") ?? "Domingos: cerrado"),
    mapsQuery: String(cell(row, "maps_query") ?? ""),
    geo: { lat: Number(cell(row, "lat")) || -34.5896, lng: Number(cell(row, "lng")) || -58.3926 },
    openingHours: Array.isArray(opening) ? (opening as string[]) : [],
    whatsappEnabled: Boolean(cell(row, "whatsapp_enabled")),
    active: cell(row, "active") !== false,
    sortOrder: Number(cell(row, "sort_order")) || 0,
    reviewUrl: String(cell(row, "review_url") ?? ""),
  };
}

export function fallbackLocations(): StoreLocation[] {
  return defaultBranches.map((branch, index) => ({
    ...branch,
    active: true,
    sortOrder: index + 1,
    reviewUrl: "",
  }));
}

export async function fetchStoreLocations(includeInactive = false): Promise<StoreLocation[]> {
  const { data, error } = await getSupabase()
    .from("store_locations")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  const rows = ((data ?? []) as Record<string, unknown>[]).map(rowToLocation);
  if (!rows.length) return fallbackLocations();
  return includeInactive ? rows : rows.filter((row) => row.active);
}

export async function saveStoreLocation(input: StoreLocationInput): Promise<void> {
  const payload = {
    id: sanitizeText(input.id, 40) || crypto.randomUUID(),
    name: sanitizeText(input.name, 80),
    address: sanitizeText(input.address, 120),
    neighborhood: sanitizeText(input.neighborhood, 80) || "Recoleta",
    city: sanitizeText(input.city, 40) || "CABA",
    phone_display: sanitizeText(input.phoneDisplay, 40),
    phone_e164: sanitizeText(input.phoneE164, 24),
    secondary_phone_display: sanitizeText(input.secondaryPhoneDisplay, 40) || null,
    secondary_phone_e164: sanitizeText(input.secondaryPhoneE164, 24) || null,
    weekday_hours: sanitizeText(input.weekdayHours, 80),
    saturday_hours: sanitizeText(input.saturdayHours, 80),
    sunday_hours: sanitizeText(input.sundayHours, 80) || "Domingos: cerrado",
    maps_query: sanitizeText(input.mapsQuery, 160) || `${input.address}, Recoleta, CABA`,
    lat: Number(input.lat),
    lng: Number(input.lng),
    opening_hours: [],
    whatsapp_enabled: Boolean(input.whatsappEnabled),
    review_url: sanitizeText(input.reviewUrl, 400),
    active: Boolean(input.active),
    sort_order: Number(input.sortOrder) || 0,
    updated_at: new Date().toISOString(),
  };
  const { error } = await getSupabase().from("store_locations").upsert(payload);
  if (error) throw error;
}

export function mapsEmbedUrl(location: Pick<StoreLocation, "geo" | "mapsQuery">) {
  const query = location.mapsQuery || `${location.geo.lat},${location.geo.lng}`;
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=16&output=embed`;
}

export function mapsEmbedMultiUrl(locations: StoreLocation[]) {
  const first = locations[0];
  if (!first) return "";
  return mapsEmbedUrl(first);
}

export function locationQuery(location: Pick<StoreLocation, "mapsQuery" | "address" | "neighborhood" | "city" | "geo">) {
  return (
    location.mapsQuery ||
    `${location.address}, ${location.neighborhood}, ${location.city}` ||
    `${location.geo.lat},${location.geo.lng}`
  );
}

export function locationDirectionsUrl(
  location: Pick<StoreLocation, "mapsQuery" | "address" | "neighborhood" | "city" | "geo">,
) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(locationQuery(location))}`;
}

export function locationPlaceUrl(
  location: Pick<StoreLocation, "mapsQuery" | "address" | "neighborhood" | "city" | "geo">,
) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationQuery(location))}`;
}
