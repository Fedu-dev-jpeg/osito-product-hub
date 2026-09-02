import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { productHaystack } from "./data";
import { catalogCategories, knownBrands, searchHints } from "@/lib/site";
import { setCategory, setQuery, track, useShop } from "@/lib/shop-store";

export function SearchBox({ compact = false }: { compact?: boolean }) {
  const { products, query } = useShop();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 1) return searchHints.slice(0, 6).map((label) => ({ type: "hint" as const, label }));
    const fromProducts = products
      .filter((product) => productHaystack(product).includes(q))
      .slice(0, 5)
      .map((product) => ({ type: "product" as const, label: product.name, slug: product.slug }));
    const fromCats = catalogCategories
      .filter(
        (cat) =>
          cat.name.toLowerCase().includes(q) ||
          cat.subs.some((sub) => sub.toLowerCase().includes(q)),
      )
      .slice(0, 3)
      .map((cat) => ({ type: "category" as const, label: cat.name }));
    const fromBrands = knownBrands
      .filter((brand) => brand.toLowerCase().includes(q))
      .slice(0, 3)
      .map((label) => ({ type: "brand" as const, label }));
    return [...fromProducts, ...fromCats, ...fromBrands].slice(0, 8);
  }, [products, query]);

  const go = (nextQuery: string, categoria?: string) => {
    setQuery(nextQuery);
    if (categoria) setCategory(categoria);
    track("search", { query: nextQuery, category: categoria ?? "" });
    setOpen(false);
    void navigate({
      to: "/productos",
      search: {
        ...(nextQuery ? { q: nextQuery } : {}),
        ...(categoria && categoria !== "Todos" ? { categoria } : {}),
      },
    });
  };

  return (
    <div className={`relative w-full ${compact ? "" : "max-w-[520px] justify-self-center"}`}>
      <div className="flex h-11 w-full items-center gap-2.5 rounded-sm border border-ink/20 bg-card px-3.5 focus-within:border-gold">
        <Search size={17} className="shrink-0 text-sepia" strokeWidth={1.6} />
        <input
          type="search"
          value={query}
          aria-label="Buscar productos por nombre, marca, categoría o SKU"
          placeholder="Buscar Sharpie, agenda, cartuchera…"
          autoComplete="off"
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 160)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") go(query.trim());
          }}
          className="ui-text min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-muted-foreground"
        />
      </div>
      {open && suggestions.length ? (
        <ul
          role="listbox"
          className="absolute z-30 mt-1 w-full overflow-hidden rounded-sm border border-rule bg-card shadow-lg"
        >
          {suggestions.map((item) => (
            <li key={`${item.type}-${item.label}`}>
              <button
                type="button"
                className="ui-text flex w-full items-center justify-between px-3.5 py-2.5 text-left text-[13px] text-ink hover:bg-secondary"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  if (item.type === "product") {
                    setOpen(false);
                    void navigate({ to: "/productos/$slug", params: { slug: item.slug } });
                    return;
                  }
                  if (item.type === "category") go("", item.label);
                  else go(item.label);
                }}
              >
                <span>{item.label}</span>
                <span className="text-[10px] uppercase tracking-[0.12em] text-sepia">
                  {item.type === "hint"
                    ? "Sugerencia"
                    : item.type === "product"
                      ? "Producto"
                      : item.type === "category"
                        ? "Categoría"
                        : "Marca"}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
