import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { ProductCard } from "@/components/callao/ProductCard";
import { SiteFooter } from "@/components/callao/SiteFooter";
import { SiteHeader } from "@/components/callao/SiteHeader";
import { formatARS, pageShell } from "@/components/callao/data";
import { setCategory, setQuery, useShop } from "@/lib/shop-store";

type ProductosSearch = {
  q?: string;
  categoria?: string;
  sort?: string;
  min?: string;
  max?: string;
  stock?: string;
};

const sorts = [
  { id: "featured", label: "Destacados" },
  { id: "price-asc", label: "Precio: menor a mayor" },
  { id: "price-desc", label: "Precio: mayor a menor" },
  { id: "alpha", label: "Alfabético" },
  { id: "newest", label: "Más nuevos" },
];

export const Route = createFileRoute("/productos/")({
  validateSearch: (search: Record<string, unknown>): ProductosSearch => {
    const next: ProductosSearch = {};
    if (typeof search["q"] === "string" && search["q"]) next.q = search["q"];
    if (typeof search["categoria"] === "string" && search["categoria"])
      next.categoria = search["categoria"];
    if (typeof search["sort"] === "string" && search["sort"]) next.sort = search["sort"];
    if (typeof search["min"] === "string" && search["min"]) next.min = search["min"];
    if (typeof search["max"] === "string" && search["max"]) next.max = search["max"];
    if (typeof search["stock"] === "string" && search["stock"]) next.stock = search["stock"];
    return next;
  },
  head: () => ({
    meta: [
      { title: "Productos — Librería Callao" },
      {
        name: "description",
        content: "Catálogo de libros, papelería, escritura y agendas. Filtrá por tipo y precio.",
      },
    ],
  }),
  component: ProductosPage,
});

function ProductosPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const { products } = useShop();
  const categoria = search.categoria ?? "Todos";
  const sort = search.sort ?? "featured";
  const q = search.q ?? "";

  const categories = ["Todos", ...Array.from(new Set(products.map((p) => p.category)))];
  const maxCatalog = products.reduce((max, p) => Math.max(max, p.price), 0);
  const minPrice = Number(search.min) || 0;
  const maxPrice = Number(search.max) || maxCatalog;

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    const list = products.filter((product) => {
      const matchesCategory = categoria === "Todos" || product.category === categoria;
      const haystack =
        `${product.name} ${product.category} ${product.subcategory ?? ""} ${product.description} ${product.sku ?? ""}`.toLowerCase();
      const matchesQuery = !query || haystack.includes(query);
      const matchesPrice =
        product.price >= minPrice && product.price <= (maxPrice || product.price);
      const matchesStock = search.stock !== "1" || (product.inventory ?? 1) > 0;
      return matchesCategory && matchesQuery && matchesPrice && matchesStock;
    });
    const ordered = [...list];
    if (sort === "price-asc") ordered.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") ordered.sort((a, b) => b.price - a.price);
    if (sort === "alpha") ordered.sort((a, b) => a.name.localeCompare(b.name, "es"));
    return ordered;
  }, [products, categoria, q, minPrice, maxPrice, search.stock, sort]);

  const patchSearch = (partial: ProductosSearch) => {
    const next = { ...search, ...partial };
    (Object.keys(next) as (keyof ProductosSearch)[]).forEach((key) => {
      if (!next[key] || next[key] === "Todos" || next[key] === "featured") delete next[key];
    });
    if (partial.categoria) setCategory(partial.categoria);
    if (partial.q !== undefined) setQuery(partial.q);
    void navigate({ to: "/productos", search: next });
  };

  return (
    <div className="grain min-h-screen bg-background text-foreground">
      <div className="ui-text bg-ink px-4 py-2 text-center text-[11.5px] uppercase tracking-[0.08em] text-parchment">
        Envío sin cargo desde $80.000 · Retiro en Av. Callao 1234
      </div>
      <SiteHeader />
      <div className={`${pageShell} py-8 md:py-10`}>
        <nav className="ui-text text-[12px] text-sepia">
          <Link to="/" className="hover:text-ink">
            Inicio
          </Link>
          <span className="px-2">/</span>
          <span className="text-ink">Productos</span>
        </nav>
        <div className="mt-4 flex flex-col gap-3 border-b border-rule pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-display text-4xl text-ink md:text-5xl">Productos</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? "producto" : "productos"}
              {categoria !== "Todos" ? ` en ${categoria}` : ""}
            </p>
          </div>
          <label className="ui-text text-[12px] text-sepia">
            Ordenar
            <select
              value={sort}
              onChange={(e) => patchSearch({ sort: e.target.value })}
              className="ml-2 h-10 rounded-sm border border-ink/20 bg-card px-2 text-sm text-ink"
            >
              {sorts.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="rounded-md border border-rule bg-card p-5">
            <h2 className="ui-text text-[11px] uppercase tracking-[0.16em] text-gold">Filtros</h2>
            <div className="mt-4 flex flex-col gap-5">
              <div>
                <p className="ui-text mb-2 text-[12px] text-sepia">Tipo de producto</p>
                <ul className="flex flex-col gap-1.5">
                  {categories.map((cat) => (
                    <li key={cat}>
                      <button
                        type="button"
                        onClick={() => patchSearch({ categoria: cat })}
                        className={`ui-text text-[13px] ${
                          categoria === cat ? "text-primary" : "text-ink hover:text-primary"
                        }`}
                      >
                        {cat}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <label className="ui-text text-[12px] text-sepia">
                Precio mínimo
                <input
                  type="number"
                  min={0}
                  value={search.min ?? ""}
                  placeholder="0"
                  onChange={(e) => patchSearch({ min: e.target.value })}
                  className="mt-1 h-9 w-full rounded-sm border border-ink/20 px-2 text-sm"
                />
              </label>
              <label className="ui-text text-[12px] text-sepia">
                Precio máximo
                <input
                  type="number"
                  min={0}
                  value={search.max ?? ""}
                  placeholder={maxCatalog ? String(maxCatalog) : ""}
                  onChange={(e) => patchSearch({ max: e.target.value })}
                  className="mt-1 h-9 w-full rounded-sm border border-ink/20 px-2 text-sm"
                />
              </label>
              <label className="ui-text flex items-center gap-2 text-[13px] text-ink">
                <input
                  type="checkbox"
                  checked={search.stock === "1"}
                  onChange={(e) => patchSearch(e.target.checked ? { stock: "1" } : { stock: "" })}
                />
                Solo en stock
              </label>
              <p className="ui-text text-[11px] text-muted-foreground">
                Hasta {formatARS(maxCatalog || 0)}
              </p>
            </div>
          </aside>

          <div>
            {filtered.length ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <p className="rounded-md border border-rule bg-card px-6 py-10 text-sm text-muted-foreground">
                No hay productos con esos filtros.
              </p>
            )}
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
