import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Breadcrumbs } from "@/components/callao/Breadcrumbs";
import { ProductCard } from "@/components/callao/ProductCard";
import { SiteFooter } from "@/components/callao/SiteFooter";
import { SiteHeader } from "@/components/callao/SiteHeader";
import { MobileStickyCta, WhatsAppFloat } from "@/components/callao/WhatsAppFloat";
import { pageShell } from "@/components/callao/data";
import {
  compactCatalogSearch,
  filterCatalog,
  parseCatalogSearch,
  type CatalogSearch,
} from "@/lib/search";
import { catalogCategories, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";
import { refreshCatalog, setCategory, setQuery, track, useShop } from "@/lib/shop-store";
import { whatsappUrl } from "@/lib/whatsapp";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const sorts = [
  { id: "featured", label: "Destacados" },
  { id: "alpha", label: "Alfabético" },
  { id: "newest", label: "Más nuevos" },
];

export const Route = createFileRoute("/productos/")({
  validateSearch: (search: Record<string, unknown>): CatalogSearch => parseCatalogSearch(search),
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
  const { products, settings, catalogStatus } = useShop();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const categoria = search.categoria ?? "Todos";
  const sub = search.sub ?? "";
  const sort = search.sort ?? "featured";
  const q = search.q ?? "";
  const marca = search.marca ?? "";
  const disp = search.disp ?? "";

  const categories = ["Todos", ...catalogCategories.map((c) => c.name)];
  const current = catalogCategories.find((c) => c.name === categoria);
  const brands = useMemo(() => {
    return Array.from(
      new Set(products.map((product) => product.brand).filter((value): value is string => Boolean(value))),
    ).sort((a, b) => a.localeCompare(b, "es"));
  }, [products]);

  const filtered = useMemo(
    () => filterCatalog(products, search),
    [products, search],
  );

  const tracked = useRef("");
  useEffect(() => {
    setQuery(q);
    if (categoria) setCategory(categoria);
    if (!q) {
      tracked.current = "";
      return;
    }
    const key = `${q}|${filtered.length}|${categoria}|${marca}`;
    if (tracked.current === key) return;
    tracked.current = key;
    track("search", { query: q, results_count: filtered.length });
    if (filtered.length === 0) track("search_no_results", { query: q });
  }, [q, filtered.length, categoria, marca]);

  const patchSearch = (partial: CatalogSearch) => {
    const next = compactCatalogSearch({ ...search, ...partial });
    if (partial.categoria !== undefined) {
      setCategory(partial.categoria || "Todos");
      delete next.sub;
    }
    if (partial.q !== undefined) setQuery(partial.q);
    void navigate({ to: "/productos", search: next });
  };

  const clearFilters = () => {
    const next: CatalogSearch = {};
    if (q) next.q = q;
    void navigate({
      to: "/productos",
      search: compactCatalogSearch(next),
    });
  };

  const crumbs = [
    { label: "Inicio", to: "/" },
    { label: "Productos", to: "/productos" },
    ...(categoria !== "Todos" ? [{ label: categoria, to: "/productos", search: { categoria } }] : []),
    ...(sub ? [{ label: sub, to: "/productos", search: { categoria, sub } }] : []),
    ...(marca ? [{ label: marca }] : []),
    ...(q ? [{ label: `“${q}”` }] : []),
  ];

  const emptyTitle = q ? "No encontramos ese producto" : "Todavía no hay productos publicados en esta categoría.";
  const emptyText = q
    ? "Probá buscando otra marca o producto, o consultanos y te ayudamos a encontrarlo."
    : "Consultanos por WhatsApp y te ayudamos a encontrarlo.";
  const wa = whatsappUrl(q ? { kind: "search", query: q } : { kind: "home" }, settings.whatsapp);

  const filters = (
    <div className="space-y-6">
      <div>
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
      </div>
      {current?.subs.length ? (
        <div className="border-t border-rule pt-4">
          <p className="ui-text mb-2 text-[11px] uppercase tracking-[0.16em] text-gold">Subcategorías</p>
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
      {brands.length ? (
        <div className="border-t border-rule pt-4">
          <p className="ui-text mb-2 text-[11px] uppercase tracking-[0.16em] text-gold">Marca</p>
          <ul className="flex flex-col gap-1.5">
            <li>
              <button
                type="button"
                onClick={() => patchSearch({ marca: "" })}
                className={`ui-text min-h-9 text-left text-[13px] ${
                  !marca ? "text-primary" : "text-ink hover:text-primary"
                }`}
              >
                Todas
              </button>
            </li>
            {brands.map((item) => (
              <li key={item}>
                <button
                  type="button"
                  onClick={() => patchSearch({ marca: item })}
                  className={`ui-text min-h-9 text-left text-[13px] ${
                    marca === item ? "text-primary" : "text-ink hover:text-primary"
                  }`}
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <div className="border-t border-rule pt-4">
        <p className="ui-text mb-2 text-[11px] uppercase tracking-[0.16em] text-gold">Disponibilidad</p>
        {(
          [
            ["", "Todas"],
            ["precio", "Con precio"],
            ["consultar", "A consultar"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={label}
            type="button"
            onClick={() => patchSearch({ disp: value })}
            className={`ui-text block min-h-9 text-left text-[13px] ${
              disp === value ? "text-primary" : "text-ink hover:text-primary"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="grain min-h-screen bg-background text-foreground">
      <div className="ui-text bg-ink px-4 py-2 text-center text-[11.5px] uppercase tracking-[0.08em] text-parchment">
        3 sucursales en Recoleta · Escolar · Comercial · Artística
      </div>
      <SiteHeader />
      <div className={`${pageShell} py-8 md:py-10`}>
        <Breadcrumbs items={crumbs} />
        <div className="mt-4 flex flex-col gap-3 border-b border-rule pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-display text-4xl text-ink md:text-5xl">Productos</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? "producto" : "productos"}
              {categoria !== "Todos" ? ` en ${categoria}` : ""}
              {marca ? ` · ${marca}` : ""}
              {q ? ` para “${q}”` : ""}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              className="ui-text inline-flex min-h-10 items-center rounded-sm border border-ink/20 px-4 text-[12px] uppercase tracking-[0.08em] lg:hidden"
            >
              Filtros
            </button>
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
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="hidden rounded-md border border-rule bg-card p-5 lg:block">{filters}</aside>

          <div>
            {catalogStatus === "loading" && !products.length ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <div key={item} className="aspect-square animate-pulse rounded-md bg-muted" />
                ))}
              </div>
            ) : null}
            {catalogStatus === "error" && !products.length ? (
              <div className="rounded-md border border-rule bg-card px-6 py-10">
                <p className="font-display text-2xl text-ink">No pudimos cargar el catálogo</p>
                <button
                  type="button"
                  onClick={() => void refreshCatalog()}
                  className="ui-text mt-4 inline-flex min-h-11 items-center rounded-sm border border-ink/20 px-5 text-[13px] uppercase tracking-[0.08em]"
                >
                  Reintentar
                </button>
              </div>
            ) : null}
            {catalogStatus !== "loading" || products.length ? (
              filtered.length ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {filtered.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : catalogStatus === "ready" || products.length ? (
                <div className="rounded-md border border-rule bg-card px-6 py-10">
                  <h2 className="font-display text-2xl text-ink">{emptyTitle}</h2>
                  <p className="mt-2 max-w-[48ch] text-sm text-muted-foreground">{emptyText}</p>
                  <a
                    href={wa}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() =>
                      track("click_whatsapp", { source: "empty-search", query: q, category: categoria })
                    }
                    className="ui-text mt-5 inline-flex min-h-11 items-center rounded-sm bg-primary px-5 text-[13px] uppercase tracking-[0.08em] text-primary-foreground"
                  >
                    Consultar por WhatsApp
                  </a>
                </div>
              ) : null
            ) : null}
          </div>
        </div>
      </div>
      <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-xl">
          <SheetHeader>
            <SheetTitle className="font-display text-2xl">Filtros</SheetTitle>
          </SheetHeader>
          <div className="mt-4">{filters}</div>
          <div className="mt-6 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setFiltersOpen(false)}
              className="ui-text inline-flex min-h-11 items-center justify-center rounded-sm bg-primary px-5 text-[13px] uppercase tracking-[0.08em] text-primary-foreground"
            >
              Ver {filtered.length} {filtered.length === 1 ? "producto" : "productos"}
            </button>
            <button
              type="button"
              onClick={() => {
                clearFilters();
                setFiltersOpen(false);
              }}
              className="ui-text inline-flex min-h-11 items-center justify-center text-[13px] uppercase tracking-[0.08em] text-sepia"
            >
              Limpiar filtros
            </button>
          </div>
        </SheetContent>
      </Sheet>
      <SiteFooter />
      <WhatsAppFloat />
      <MobileStickyCta />
    </div>
  );
}
