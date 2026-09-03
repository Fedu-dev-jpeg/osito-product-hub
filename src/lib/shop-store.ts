import { useSyncExternalStore } from "react";
import { products as defaultProducts, type Product } from "@/components/callao/data";
import { fetchPublishedProducts } from "@/lib/catalog";
import { fetchHeroSlides, type HeroSlide } from "@/lib/hero";
import { fallbackLocations, fetchStoreLocations, type StoreLocation } from "@/lib/locations";
import { sanitizeId, sanitizeText } from "@/lib/sanitize";
import {
  DEFAULT_EMAIL,
  DEFAULT_WHATSAPP,
  INSTAGRAM_URL,
  GOOGLE_REVIEWS_URL,
  SITE_CUIT,
  SITE_LEGAL_NAME,
  SITE_TAGLINE,
} from "@/lib/site";
import { getSupabase } from "@/lib/supabase";

export const PRODUCT_KEY = "libreria_callao_products_v3";
export const SETTINGS_KEY = "libreria_callao_settings_v3";
export const STATS_KEY = "libreria_callao_stats_v3";
export const CART_KEY = "libreria_callao_cart_v3";
export const FAVORITES_KEY = "libreria_callao_favorites_v3";

const TRACKABLE = new Set([
  "click_whatsapp",
  "click_phone",
  "click_maps",
  "select_store",
  "send_school_list",
  "instagram_click",
  "facebook_click",
  "search",
  "search_no_results",
  "view_item",
  "select_category",
]);

export type CartItem = { id: string; name: string; price: number; qty: number };
export type TrackedEvent = {
  eventName: string;
  details: Record<string, unknown>;
  at: string;
};
export type Stats = Record<string, number | TrackedEvent | undefined> & {
  lastEvent?: TrackedEvent;
};
export type Settings = {
  googleAnalyticsId: string;
  metaPixelId: string;
  whatsapp: string;
  email: string;
  instagramUrl: string;
  facebookUrl: string;
  googleReviewsUrl: string;
  legalName: string;
  cuit: string;
  tagline: string;
  heroEyebrow: string;
  heroTitle: string;
  heroDescription: string;
};

export type CatalogStatus = "loading" | "ready" | "error";

type ShopState = {
  products: Product[];
  locations: StoreLocation[];
  heroSlides: HeroSlide[];
  cart: CartItem[];
  favorites: string[];
  stats: Stats;
  query: string;
  category: string;
  settings: Settings;
  catalogStatus: CatalogStatus;
};

export const defaultSettings: Settings = {
  googleAnalyticsId: "",
  metaPixelId: "",
  whatsapp: DEFAULT_WHATSAPP,
  email: DEFAULT_EMAIL,
  instagramUrl: INSTAGRAM_URL,
  facebookUrl: "",
  googleReviewsUrl: GOOGLE_REVIEWS_URL,
  legalName: SITE_LEGAL_NAME,
  cuit: SITE_CUIT,
  tagline: SITE_TAGLINE,
  heroEyebrow: "3 sucursales en Recoleta",
  heroTitle: "Todo para estudiar, trabajar y crear",
  heroDescription:
    "Librería escolar, comercial y artística. Papelería, escritura, oficina, impresión y mucho más en tres sucursales de Recoleta.",
};

const initialState: ShopState = {
  products: defaultProducts,
  locations: fallbackLocations(),
  heroSlides: [],
  cart: [],
  favorites: [],
  stats: {},
  query: "",
  category: "Todos",
  settings: defaultSettings,
  catalogStatus: "loading",
};

let state: ShopState = initialState;
let hydrated = false;
const listeners = new Set<() => void>();

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage lleno o no disponible
  }
}

function cleanSettings(partial: Partial<Settings> | null | undefined): Settings {
  const merged = { ...defaultSettings, ...(partial ?? {}) };
  if (/4372.?0000/.test(merged.whatsapp) || /hola@libreriacallao/.test(merged.email)) {
    merged.whatsapp = DEFAULT_WHATSAPP;
    merged.email = DEFAULT_EMAIL;
  }
  return {
    ...merged,
    googleAnalyticsId: sanitizeId(merged.googleAnalyticsId),
    metaPixelId: sanitizeId(merged.metaPixelId),
    whatsapp: sanitizeText(merged.whatsapp, 20).replace(/\D/g, "") || DEFAULT_WHATSAPP,
    email: sanitizeText(merged.email, 80) || DEFAULT_EMAIL,
    instagramUrl: sanitizeText(merged.instagramUrl, 200) || INSTAGRAM_URL,
    facebookUrl: sanitizeText(merged.facebookUrl, 200),
    googleReviewsUrl: sanitizeText(merged.googleReviewsUrl, 400) || GOOGLE_REVIEWS_URL,
    legalName: sanitizeText(merged.legalName, 80) || SITE_LEGAL_NAME,
    cuit: sanitizeText(merged.cuit, 20) || SITE_CUIT,
    tagline: sanitizeText(merged.tagline, 80) || SITE_TAGLINE,
    heroEyebrow: sanitizeText(merged.heroEyebrow, 80),
    heroTitle: sanitizeText(merged.heroTitle, 120),
    heroDescription: sanitizeText(merged.heroDescription, 400),
  };
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  const storedProducts = read<Product[] | null>(PRODUCT_KEY, null);
  const products = Array.isArray(storedProducts) ? storedProducts : [];
  state = {
    ...state,
    products,
    cart: read<CartItem[]>(CART_KEY, []),
    favorites: read<string[]>(FAVORITES_KEY, []),
    stats: read<Stats>(STATS_KEY, {}),
    settings: cleanSettings(read<Partial<Settings>>(SETTINGS_KEY, {})),
    catalogStatus: products.length ? "ready" : "loading",
  };
  void refreshCatalog();
  void refreshSettings();
  void refreshLocations();
  void refreshHero();
}

function emit() {
  listeners.forEach((listener) => listener());
}

function setState(partial: Partial<ShopState>) {
  state = { ...state, ...partial };
  emit();
}

function subscribe(listener: () => void) {
  hydrate();
  listeners.add(listener);
  emit();
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return state;
}

function getServerSnapshot() {
  return initialState;
}

export function useShop(): ShopState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function getShop(): ShopState {
  hydrate();
  return state;
}

export function track(eventName: string, details: Record<string, unknown> = {}) {
  hydrate();
  const stats: Stats = { ...state.stats };
  const current = stats[eventName];
  stats[eventName] = (typeof current === "number" ? current : 0) + 1;
  stats.lastEvent = { eventName, details, at: new Date().toISOString() };
  write(STATS_KEY, stats);
  setState({ stats });
  if (typeof window !== "undefined") {
    const w = window as unknown as {
      gtag?: (...args: unknown[]) => void;
      fbq?: (...args: unknown[]) => void;
    };
    w.gtag?.("event", eventName, details);
    w.fbq?.("trackCustom", eventName, details);
  }
  if (TRACKABLE.has(eventName)) {
    void Promise.resolve(
      getSupabase().from("site_events").insert({ event_name: eventName, details }),
    ).catch(() => undefined);
  }
}

export function setProducts(products: Product[]) {
  hydrate();
  write(PRODUCT_KEY, products);
  setState({ products });
}

export async function refreshCatalog() {
  try {
    const products = await fetchPublishedProducts();
    setProducts(products);
    setState({ catalogStatus: "ready" });
  } catch {
    setState({ catalogStatus: state.products.length ? "ready" : "error" });
  }
}

export async function refreshLocations() {
  try {
    const locations = await fetchStoreLocations(false);
    setState({ locations });
  } catch {
    if (!state.locations.length) setState({ locations: fallbackLocations() });
  }
}

export async function refreshHero() {
  try {
    const heroSlides = await fetchHeroSlides(false);
    setState({ heroSlides });
  } catch {
    // Keep fallback slides in the carousel.
  }
}

export async function refreshSettings() {
  try {
    const { data, error } = await getSupabase()
      .from("site_settings")
      .select("payload")
      .eq("id", "default")
      .maybeSingle();
    if (error || !data) return;
    const next = cleanSettings(data.payload as Partial<Settings>);
    write(SETTINGS_KEY, next);
    setState({ settings: next });
  } catch {
    // Keep local settings.
  }
}

export function saveProduct(product: Product) {
  hydrate();
  const existing = state.products.some((item) => item.id === product.id);
  const next = existing
    ? state.products.map((item) => (item.id === product.id ? product : item))
    : [...state.products, product];
  setProducts(next);
  track(existing ? "admin_product_update" : "admin_product_create", { productId: product.id });
}

export function deleteProduct(id: string) {
  hydrate();
  setProducts(state.products.filter((item) => item.id !== id));
  track("admin_product_delete", { productId: id });
}

export function addToCart(product: Product) {
  hydrate();
  const cart = [...state.cart];
  const existing = cart.find((item) => item.id === product.id);
  if (existing) existing.qty += 1;
  else cart.push({ id: product.id, name: product.name, price: product.price, qty: 1 });
  write(CART_KEY, cart);
  setState({ cart });
}

export function setCartQty(id: string, qty: number) {
  hydrate();
  const cart =
    qty <= 0
      ? state.cart.filter((item) => item.id !== id)
      : state.cart.map((item) => (item.id === id ? { ...item, qty } : item));
  write(CART_KEY, cart);
  setState({ cart });
}

export function removeFromCart(id: string) {
  hydrate();
  const cart = state.cart.filter((item) => item.id !== id);
  write(CART_KEY, cart);
  setState({ cart });
}

export function clearCart() {
  hydrate();
  write(CART_KEY, []);
  setState({ cart: [] });
}

export function toggleFavorite(productId: string) {
  hydrate();
  const favorites = state.favorites.includes(productId)
    ? state.favorites.filter((id) => id !== productId)
    : [...state.favorites, productId];
  write(FAVORITES_KEY, favorites);
  setState({ favorites });
}

export function setQuery(query: string) {
  setState({ query });
}

export function setCategory(category: string) {
  hydrate();
  if (state.category !== category) {
    setState({ category });
    if (category && category !== "Todos") track("select_category", { category });
  }
}

export function getSettings(): Settings {
  hydrate();
  return state.settings;
}

export async function saveSettings(settings: Settings) {
  const next = cleanSettings(settings);
  write(SETTINGS_KEY, next);
  setState({ settings: next });
  track("admin_settings_update");
  const { error } = await getSupabase()
    .from("site_settings")
    .upsert({ id: "default", payload: next, updated_at: new Date().toISOString() });
  if (error) throw error;
}

export async function fetchEventCounts() {
  const { data, error } = await getSupabase().from("site_events").select("event_name");
  if (error) throw error;
  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    const name = (row as { event_name: string }).event_name;
    counts[name] = (counts[name] ?? 0) + 1;
  }
  return counts;
}

export async function fetchSearchNoResults(): Promise<{ query: string; count: number }[]> {
  const { data, error } = await getSupabase()
    .from("site_events")
    .select("details")
    .eq("event_name", "search_no_results");
  if (error) throw error;
  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    const details = (row as { details?: { query?: unknown } }).details;
    const query = String(details?.query ?? "")
      .trim()
      .toLowerCase();
    if (!query) continue;
    counts.set(query, (counts.get(query) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([query, count]) => ({ query, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 50);
}
