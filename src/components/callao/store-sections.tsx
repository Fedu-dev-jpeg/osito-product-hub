import { useMemo, useState, type FormEvent } from "react";
import { catalogFilters, pageShell, scrollToProducts } from "./data";
import { ProductCard } from "./ProductCard";
import { useCallao } from "./callao-store";

export function ProductCatalog() {
  const { products, searchQuery, activeGroup, setActiveGroup, setSearchQuery } = useCallao();

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter((product) => {
      const groupOk = activeGroup === "Todos" || product.group === activeGroup;
      if (!groupOk) return false;
      if (!q) return true;
      const haystack =
        `${product.name} ${product.description} ${product.category} ${product.group}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [products, searchQuery, activeGroup]);

  return (
    <section id="destacados" className="relative z-[2] scroll-mt-4 py-16 md:py-20">
      <div className={pageShell}>
        <div className="flex flex-col gap-5 border-b border-ink/20 pb-5 md:flex-row md:items-end md:justify-between md:gap-10">
          <div>
            <span className="eyebrow mb-3 block">Selección de la casa</span>
            <h2 className="font-display text-4xl font-normal leading-none tracking-[-0.01em] text-ink md:text-[44px]">
              Destacados
            </h2>
          </div>
          <div className="ui-text flex flex-wrap items-center gap-x-6 gap-y-2 text-[12.5px] uppercase tracking-[0.06em] md:pb-1.5">
            {catalogFilters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => {
                  setActiveGroup(filter);
                  if (filter === "Todos") setSearchQuery("");
                }}
                className={
                  activeGroup === filter
                    ? "border-b border-primary pb-0.5 text-ink"
                    : "text-muted-foreground hover:text-ink"
                }
              >
                {filter}
              </button>
            ))}
            <button
              type="button"
              className="text-primary"
              onClick={() => {
                setActiveGroup("Todos");
                setSearchQuery("");
                scrollToProducts();
              }}
            >
              Ver todo ({products.length})
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="mt-10 text-[15px] text-muted-foreground">
            No hay productos para esa búsqueda o categoría.
          </p>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 xl:gap-7">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function NewsletterForm() {
  const { subscribeNewsletter } = useCallao();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const result = subscribeNewsletter(email);
    if (result.ok) {
      setEmail("");
      setError("");
      return;
    }
    setError(result.error);
  };

  return (
    <form
      className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-start"
      onSubmit={onSubmit}
    >
      <div className="min-w-0 flex-1 sm:max-w-[320px]">
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
          }}
          placeholder="tu@correo.com.ar"
          aria-label="Tu correo electrónico"
          aria-invalid={error ? true : undefined}
          className="ui-text h-[46px] w-full rounded-sm border border-ink/25 bg-card px-3.5 text-sm text-ink outline-none placeholder:text-muted-foreground focus:border-gold"
        />
        {error ? <p className="ui-text mt-1.5 text-[12px] text-destructive">{error}</p> : null}
      </div>
      <button
        type="submit"
        className="ui-text inline-flex h-[46px] items-center justify-center rounded-sm bg-primary px-6 text-[13.5px] uppercase tracking-[0.08em] text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Suscribirme
      </button>
    </form>
  );
}
