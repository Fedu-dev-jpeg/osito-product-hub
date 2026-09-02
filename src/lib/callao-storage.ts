import { products as seedProducts, type Product } from "@/components/callao/data";

export const STORAGE_KEYS = {
  products: "callao.products",
  cart: "callao.cart",
  settings: "callao.settings",
  events: "callao.events",
  lastEvent: "callao.lastEvent",
  searches: "callao.searches",
  cartAdds: "callao.cartAdds",
  subscriptions: "callao.subscriptions",
  adminEvents: "callao.adminEvents",
} as const;

export type CartItem = {
  productId: string;
  qty: number;
};

export type Campaign = {
  id: string;
  name: string;
  source: string;
  medium: string;
  spend: string;
  notes: string;
};

export type CallaoSettings = {
  gaId: string;
  metaPixelId: string;
  campaigns: Campaign[];
};

export type TrackingType = "search" | "add_to_cart" | "subscribe" | "admin" | "click";

export type TrackingEvent = {
  id: string;
  type: TrackingType;
  label: string;
  at: number;
};

export const defaultSettings: CallaoSettings = {
  gaId: "",
  metaPixelId: "",
  campaigns: [],
};

export function loadJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Quota or private mode — keep the in-memory state.
  }
}

function normalizeProduct(product: Product): Product {
  if (product.group) return product;
  const first = (product.category.split("·")[0] ?? "Libros").trim();
  const group = first === "Librería" ? "Libros" : first || "Libros";
  return { ...product, group };
}

export function loadProducts(): Product[] {
  if (typeof window === "undefined") return seedProducts;
  const raw = window.localStorage.getItem(STORAGE_KEYS.products);
  if (raw == null) return seedProducts;
  try {
    const parsed = JSON.parse(raw) as Product[];
    return Array.isArray(parsed) ? parsed.map(normalizeProduct) : seedProducts;
  } catch {
    return seedProducts;
  }
}

export function loadSettings(): CallaoSettings {
  const loaded = loadJson<Partial<CallaoSettings>>(STORAGE_KEYS.settings, {});
  return {
    gaId: typeof loaded.gaId === "string" ? loaded.gaId : "",
    metaPixelId: typeof loaded.metaPixelId === "string" ? loaded.metaPixelId : "",
    campaigns: Array.isArray(loaded.campaigns) ? loaded.campaigns : [],
  };
}

export function newId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function parsePrice(value: string): number {
  const n = Number(value.replace(/[^\d]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export async function fileToDataUrl(file: File): Promise<string> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("No se pudo leer la imagen"));
      el.src = objectUrl;
    });
    const max = 900;
    let width = img.naturalWidth || img.width;
    let height = img.naturalHeight || img.height;
    if (width > max || height > max) {
      const scale = Math.min(max / width, max / height);
      width = Math.max(1, Math.round(width * scale));
      height = Math.max(1, Math.round(height * scale));
    }
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return objectUrl;
    ctx.drawImage(img, 0, 0, width, height);
    return canvas.toDataURL("image/jpeg", 0.72);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
