export type Product = {
  id: string;
  slug: string;
  category: string;
  subcategory?: string;
  brand?: string;
  name: string;
  description: string;
  price: number;
  image: string;
  images?: string[];
  badge?: string;
  sku?: string;
  compareAtPrice?: number;
  inventory?: number;
  featured?: boolean;
  isNew?: boolean;
  isOffer?: boolean;
  sortOrder?: number;
};

export const products: Product[] = [];

export const money = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

export const formatARS = (value: number) => money.format(value);

export const pageShell = "mx-auto w-full max-w-[1280px] px-4 sm:px-6 md:px-8";

export function slugify(value: string) {
  return (
    String(value || "producto")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 64) || "producto"
  );
}

export function productHaystack(product: Product) {
  return [
    product.name,
    product.brand,
    product.category,
    product.subcategory,
    product.sku,
    product.description,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}
