import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { ProductCard } from "@/components/callao/ProductCard";
import { SiteFooter } from "@/components/callao/SiteFooter";
import { SiteHeader } from "@/components/callao/SiteHeader";
import { MobileStickyCta, WhatsAppFloat } from "@/components/callao/WhatsAppFloat";
import { pageShell, productHaystack } from "@/components/callao/data";
import { catalogCategories, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";
import { setCategory, setQuery, track, useShop } from "@/lib/shop-store";
import { whatsappUrl } from "@/lib/whatsapp";

type ProductosSearch = {
  q?: string;
  categoria?: string;
  sub?: string;
  sort?: string;
};

const sorts = [
  { id: "featured", label: "Destacados" },
  { id: "alpha", label: "Alfabético" },
  { id: "newest", label: "Más nuevos" },
];

export const Route = createFileRoute("/productos/")({
  validateSearch: (search: Record<string, unknown>): ProductosSearch => {
    const next: ProductosSearch = {};
    if (typeof search["q"] === "string" && search["q"]) next.q = search["q"];
    if (typeof search["categoria"] === "string" && search["categoria"])
      next.categoria = search["categoria"];
    if (typeof search["sub"] === "string" && search["sub"]) next.sub = search["sub"];
    if (typeof search["sort"] === "string" && search["sort"]) next.sort = search["sort"];
    return next;
  },
  head: () => ({
    meta: [
      { title: `Productos — ${SITE_NAME}` },
      { name: "description", content: SITE_DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: "/productos" }],
  }),
  component: ProductosPage,
});

function ProductosPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const { products, settings } = useShop();
  const categoria = search.categoria ?? "Todos";
  const sub = search.sub ?? "";
  const sort = search.sort ?? "featured";
  const q = search.q ?? "";

  useEffect(() => {
    setQuery(q);
    if (categoria) setCategory(categoria);
    if (q) track("search", { query: q });
  }, [q, categoria]);

  const categories = ["Todos", ...catalogCategories.map((c) => c.name)];
  const current = catalogCategories.find((c) => c.name === categoria);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    const list = products.filter((product) => {
      const matchesCategory = categoria === "Todos" || product.category === categoria;
      const matchesSub = !sub || product.subcategory === sub;
      const matchesQuery = !query || productHaystack(product).includes(query);
      return matchesCategory && matchesSub && matchesQuery;
    });
    const ordered = [...list];
    if (sort === "alpha") ordered.sort((a, b) => a.name.localeCompare(b.name, "es"));
    if (sort === "featured") {
      ordered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    }
    return ordered;
  }, [products, categoria, sub, q, sort]);

  const patchSearch = (partial: ProductosSearch) => {
    const next = { ...search, ...partial };
    (Object.keys(next) as (keyof ProductosSearch)[]).forEach((key) => {
      if (!next[key] || next[key] === "Todos" || next[key] === "featured") delete next[key];
    });
    if (partial.categoria !== undefined) {
      setCategory(partial.categoria || "Todos");
      delete next.sub;
    }
    if (partial.q !== undefined) setQuery(partial.q);
    void navigate({ to: "/productos", search: next });
  };

  const emptyMessage = q
    ? "¿No encontraste lo que buscabas?"
    : "Todavía no hay productos publicados en esta categoría.";
  const wa = whatsappUrl(q ? { kind: "search", query: q } : { kind: "home" }, settings.whatsapp);

  return (
    <div className="grain min-h-screen bg-background text-foreground">
      <div className="ui-text bg-ink px-4 py-2 text-center text-[11.5px] uppercase tracking-[0.08em] text-parchment">
        3 sucursales en Recoleta · Escolar · Comercial · Artística
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
              {q ? ` para “${q}”` : ""}
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
            <h2 className="ui-text text-[11px] uppercase tracking-[0.16em] text-gold">Categorías</h2>
            <ul className="mt-4 flex flex-col gap-1.5">
              {categories.map((cat) => (
                <li key={cat}>
                  <button
                    type="button"
                    onClick={() => patchSearch({ categoria: cat, sub: "" })}
                    className={`ui-text min-h-10 text-left text-[13px] ${
                      categoria === cat ? "text-primary" : "text-ink hover:text-primary"
                    }`}
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
            {current?.subs.length ? (
              <div className="mt-5 border-t border-rule pt-4">
                <p className="ui-text mb-2 text-[11px] uppercase tracking-[0.16em] text-gold">
                  Subcategorías
                </p>
                <ul className="flex flex-col gap-1.5">
                  {current.subs.map((item) => (
                    <li key={item}>
                      <button
                        type="button"
                        onClick={() => patchSearch({ sub: item })}
                        className={`ui-text min-h-9 text-left text-[13px] ${
                          sub === item ? "text-primary" : "text-ink hover:text-primary"
                        }`}
                      >
                        {item}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </aside>

          <div>
            {filtered.length ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="rounded-md border border-rule bg-card px-6 py-10">
                <p className="font-display text-2xl text-ink">{emptyMessage}</p>
                <p className="mt-2 max-w-[48ch] text-sm text-muted-foreground">
                  Consultanos por WhatsApp y te ayudamos a encontrarlo.
                </p>
                <a
                  href={wa}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() =>
                    track("click_whatsapp", { source: "empty-search", query: q, category: categoria })
                  }
                  className="ui-text mt-5 inline-flex min-h-11 items-center rounded-sm bg-primary px-5 text-[13px] uppercase tracking-[0.08em] text-primary-foreground"
                >
                  Consultanos por WhatsApp
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
      <SiteFooter />
      <WhatsAppFloat />
      <MobileStickyCta />
    </div>
  );
}
