import { formatARS, type Product } from "./data";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-md border border-ink/15 bg-card transition-all hover:border-gold/75 hover:shadow-md">
      <div className="relative aspect-square border-b border-ink/10 bg-secondary sm:aspect-[4/5] lg:aspect-square">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          width={800}
          height={800}
          className="h-full w-full object-cover"
        />
        {product.badge && (
          <span className="ui-text pointer-events-none absolute left-3 top-3 z-[2] rounded-[2px] bg-ink px-2.5 py-1.5 text-[9.5px] uppercase tracking-[0.16em] text-parchment">
            {product.badge}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4 pb-5">
        <span className="ui-text text-[9.5px] uppercase tracking-[0.2em] text-gold">
          {product.category}
        </span>
        <h3 className="font-display text-xl font-semibold leading-tight text-ink">{product.name}</h3>
        <p className="text-[12.5px] leading-relaxed text-muted-foreground">{product.description}</p>
        <div className="mt-auto flex items-center justify-between gap-2.5 pt-3.5">
          <span className="ui-text text-[17px] font-semibold tabular-nums text-primary">
            {formatARS(product.price)}
          </span>
          <button
            type="button"
            className="ui-text rounded-sm border border-ink/25 px-3 py-1.5 text-[11.5px] uppercase tracking-[0.08em] text-ink transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
          >
            Agregar
          </button>
        </div>
      </div>
    </article>
  );
}
