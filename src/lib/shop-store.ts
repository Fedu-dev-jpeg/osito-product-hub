import { useSyncExternalStore } from "react";
import { products as defaultProducts, type Product } from "@/components/callao/data";
import { fetchPublishedProducts } from "@/lib/catalog";

export const PRODUCT_KEY = "libreria_callao_products";
export const SETTINGS_KEY = "libreria_callao_settings";
export const STATS_KEY = "libreria_callao_stats";
export const CART_KEY = "libreria_callao_cart";
export const FAVORITES_KEY = "libreria_callao_favorites";

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
  freeShippingFrom: number;
  campaignName: string;
  campaignBudget: string;
  campaignAudience: string;
};

type ShopState = {
  products: Product[];
  cart: CartItem[];
  favorites: string[];
  stats: Stats;
  query: string;
  category: string;
};

const initialState: ShopState = {
  products: defaultProducts,
  cart: [],
  favorites: [],
  stats: {},
  query: "",
  category: "Todos",
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

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  const storedProducts = read<Product[] | null>(PRODUCT_KEY, null);
  state = {
    ...state,
    products:
      Array.isArray(storedProducts) && storedProducts.length ? storedProducts : defaultProducts,
    cart: read<CartItem[]>(CART_KEY, []),
    favorites: read<string[]>(FAVORITES_KEY, []),
    stats: read<Stats>(STATS_KEY, {}),
  };
  void refreshCatalog();
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
}

export function setProducts(products: Product[]) {
  hydrate();
  write(PRODUCT_KEY, products);
  setState({ products });
}

export async function refreshCatalog() {
  try {
    const products = await fetchPublishedProducts();
    if (products.length) setProducts(products);
  } catch {
    // Keep the last known catalog if the backend is unreachable.
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
  track("add_to_cart", { productId: product.id, price: product.price });
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

export function toggleFavorite(productId: string) {
  hydrate();
  const favorites = state.favorites.includes(productId)
    ? state.favorites.filter((id) => id !== productId)
    : [...state.favorites, productId];
  write(FAVORITES_KEY, favorites);
  setState({ favorites });
  track("favorite_toggle", { productId });
}

export function setQuery(query: string) {
  setState({ query });
}

export function setCategory(category: string) {
  hydrate();
  if (state.category !== category) {
    setState({ category });
    track("category_click", { category });
  }
}

export const defaultSettings: Settings = {
  googleAnalyticsId: "",
  metaPixelId: "",
  whatsapp: "+541143720000",
  freeShippingFrom: 80000,
  campaignName: "",
  campaignBudget: "",
  campaignAudience: "",
};

export function getSettings(): Settings {
  return { ...defaultSettings, ...read<Partial<Settings>>(SETTINGS_KEY, {}) };
}

export function saveSettings(settings: Settings) {
  write(SETTINGS_KEY, settings);
  track("admin_settings_update");
}
