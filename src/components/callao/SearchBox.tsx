import { useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { catalogCategories } from "@/lib/site";
import { compactCatalogSearch, matchesQuery, type CatalogSearch } from "@/lib/search";
import { setQuery, useShop } from "@/lib/shop-store";

type Suggestion =
  | { type: "product"; label: string; slug: string }
  | { type: "brand"; label: string }
  | { type: "category"; label: string };

export function SearchBox() {
  const { products, query } = useShop();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = useMemo(() => {
    const q = query.trim();
    if (q.length < 1) return [] as Suggestion[];
    const fromProducts = products
      .filter((product) =>
        matchesQuery(
          `${product.name} ${product.brand ?? ""} ${product.sku ?? ""} ${product.category} ${product.subcategory ?? ""} ${product.description}`,
          q,
        ),
      )
      .slice(0, 4)
      .map((product) => ({ type: "product" as const, label: product.name, slug: product.slug }));
    const brands = Array.from(
      new Set(products.map((product) => product.brand).filter((brand): brand is string => Boolean(brand))),
    )
      .filter((brand) => matchesQuery(brand, q))
      .slice(0, 3)
      .map((label) => ({ type: "brand" as const, label }));
    const cats = catalogCategories
      .filter(
        (cat) =>
          products.some((product) => product.category === cat.name) &&
          (matchesQuery(cat.name, q) || cat.subs.some((sub) => matchesQuery(sub, q))),
      )
      .slice(0, 3)
      .map((cat) => ({ type: "category" as const, label: cat.name }));
    return [...brands, ...fromProducts, ...cats];
  }, [products, query]);

  const goSearch = (nextQuery: string, extra?: { categoria?: string; marca?: string }) => {
    setQuery(nextQuery);
    setOpen(false);
    const next: CatalogSearch = {};
    if (nextQuery) next.q = nextQuery;
    if (extra?.categoria) next.categoria = extra.categoria;
    if (extra?.marca) next.marca = extra.marca;
    void navigate({
      to: "/productos",
      search: compactCatalogSearch(next),
    });
  };

  const apply = (item: Suggestion) => {
    if (item.type === "product") {
      setOpen(false);
      void navigate({ to: "/productos/$slug", params: { slug: item.slug } });
      return;
    }
    if (item.type === "category") goSearch("", { categoria: item.label });
    else goSearch("", { marca: item.label });
  };

  const grouped = {
    Marcas: suggestions.filter((item) => item.type === "brand"),
    Productos: suggestions.filter((item) => item.type === "product"),
    Categorías: suggestions.filter((item) => item.type === "category"),
  };

  return (
    <div className="relative w-full max-w-[520px] justify-self-center">
      <form
        className="flex h-11 w-full items-center gap-2 rounded-sm border border-ink/20 bg-card px-2.5 focus-within:border-gold"
        onSubmit={(e) => {
          e.preventDefault();
          goSearch(query.trim());
        }}
      >
        <label className="sr-only" htmlFor="site-search">
          Buscar productos
        </label>
        <input
          id="site-search"
          ref={inputRef}
          type="search"
          value={query}
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls="search-suggestions"
          placeholder="Buscar Sharpie, agenda, cartuchera…"
          autoComplete="off"
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActive(0);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setOpen(false);
              return;
            }
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
              setActive((value) => Math.min(value + 1, Math.max(suggestions.length - 1, 0)));
            }
            if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((value) => Math.max(value - 1, 0));
            }
            if (e.key === "Enter" && open && suggestions[active]) {
              e.preventDefault();
              apply(suggestions[active]);
            }
          }}
          className="ui-text min-w-0 flex-1 bg-transparent px-1 text-sm text-ink outline-none placeholder:text-muted-foreground"
        />
        <button
          type="submit"
          aria-label="Buscar"
          className="flex h-9 w-9 items-center justify-center rounded-sm text-sepia hover:text-ink"
        >
          <Search size={17} strokeWidth={1.6} />
        </button>
      </form>
      {open && suggestions.length ? (
        <div
          id="search-suggestions"
          role="listbox"
          className="absolute z-30 mt-1 w-full overflow-hidden rounded-sm border border-rule bg-card shadow-lg"
        >
          {Object.entries(grouped).map(([group, items]) =>
            items.length ? (
              <div key={group} className="border-b border-rule last:border-b-0">
                <p className="ui-text px-3.5 pt-2 text-[10px] uppercase tracking-[0.14em] text-gold">{group}</p>
                <ul>
                  {items.map((item) => {
                    const flatIndex = suggestions.findIndex(
                      (candidate) =>
                        candidate.type === item.type &&
                        candidate.label === item.label &&
                        (candidate.type !== "product" ||
                          item.type !== "product" ||
                          candidate.slug === item.slug),
                    );
                    return (
                      <li key={`${item.type}-${item.label}`}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={flatIndex === active}
                          className={`ui-text flex w-full items-center justify-between px-3.5 py-2.5 text-left text-[13px] ${
                            flatIndex === active ? "bg-secondary text-ink" : "text-ink hover:bg-secondary"
                          }`}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => apply(item)}
                        >
                          <span>{item.label}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : null,
          )}
        </div>
      ) : null}
      {open && query.trim() && !suggestions.length ? (
        <p className="absolute z-30 mt-1 w-full rounded-sm border border-rule bg-card px-3.5 py-3 text-sm text-muted-foreground">
          Sin sugerencias. Presioná Enter para buscar “{query.trim()}”.
        </p>
      ) : null}
    </div>
  );
}

