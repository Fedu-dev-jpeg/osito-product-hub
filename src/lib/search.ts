import type { Product } from "@/components/callao/data";

export type CatalogSearch = {
  q?: string;
  categoria?: string;
  marca?: string;
  sub?: string;
  sort?: string;
  disp?: string;
};

export function normalizeSearch(value: string) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function productSearchText(product: Product) {
  return [
    product.name,
    product.brand,
    product.category,
    product.subcategory,
    product.sku,
    product.description,
  ]
    .filter(Boolean)
    .join(" ");
}

export function matchesQuery(haystack: string, query: string) {
  const q = normalizeSearch(query);
  if (!q) return true;
  const h = normalizeSearch(haystack);
  return q.split(" ").filter(Boolean).every((part) => h.includes(part));
}

export function productMatchesQuery(product: Product, query: string) {
  return matchesQuery(productSearchText(product), query);
}

export function filterCatalog(products: Product[], search: CatalogSearch) {
  const categoria = search.categoria && search.categoria !== "Todos" ? search.categoria : "";
  const marca = search.marca ?? "";
  const sub = search.sub ?? "";
  const q = search.q ?? "";
  const disp = search.disp ?? "";
  const list = products.filter((product) => {
    const matchesCategory = !categoria || product.category === categoria;
    const matchesBrand = !marca || normalizeSearch(product.brand ?? "") === normalizeSearch(marca);
    const matchesSub = !sub || product.subcategory === sub;
    const matchesQ = productMatchesQuery(product, q);
    const matchesDisp =
      !disp ||
      disp === "todos" ||
      (disp === "precio" && product.price > 0) ||
      (disp === "consultar" && !(product.price > 0));
    return matchesCategory && matchesBrand && matchesSub && matchesQ && matchesDisp;
  });
  const ordered = [...list];
  if (search.sort === "alpha") ordered.sort((a, b) => a.name.localeCompare(b.name, "es"));
  else if (search.sort === "newest") {
    ordered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
  } else {
    ordered.sort(
      (a, b) =>
        (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
    );
  }
  return ordered;
}

export function parseCatalogSearch(search: Record<string, unknown>): CatalogSearch {
  const next: CatalogSearch = {};
  if (typeof search["q"] === "string" && search["q"]) next.q = search["q"];
  if (typeof search["categoria"] === "string" && search["categoria"])
    next.categoria = search["categoria"];
  if (typeof search["marca"] === "string" && search["marca"]) next.marca = search["marca"];
  if (typeof search["sub"] === "string" && search["sub"]) next.sub = search["sub"];
  if (typeof search["sort"] === "string" && search["sort"]) next.sort = search["sort"];
  if (typeof search["disp"] === "string" && search["disp"]) next.disp = search["disp"];
  return next;
}

export function compactCatalogSearch(search: CatalogSearch): CatalogSearch {
  const next = { ...search };
  (Object.keys(next) as (keyof CatalogSearch)[]).forEach((key) => {
    if (!next[key] || next[key] === "Todos" || (key === "sort" && next[key] === "featured")) {
      delete next[key];
    }
  });
  return next;
}
