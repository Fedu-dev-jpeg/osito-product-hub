import { Heart } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { formatARS, type Product } from "./data";
import { addToCart, toggleFavorite, useShop } from "@/lib/shop-store";

export function ProductCard({ product }: { product: Product }) {
  const { favorites } = useShop();
  const isFavorite = favorites.includes(product.id);
  const slug = product.slug || product.id;
  const onSale = Boolean(product.compareAtPrice && product.compareAtPrice > product.price);

  return (
    <article className="flex min-w-0 flex-col overflow-hidden rounded-md border border-ink/15 bg-card transition-all hover:border-gold/75 hover:shadow-md">
      <div className="relative aspect-square border-b border-ink/10 bg-secondary sm:aspect-[4/5] lg:aspect-square">
        <Link to="/productos/$slug" params={{ slug }} className="block h-full w-full">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              width={800}
              height={800}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-secondary px-4">
              <span className="text-center font-display text-2xl italic text-sepia">
                {product.name}
              </span>
            </div>
          )}
        </Link>
        {product.badge ? (
          <span className="ui-text pointer-events-none absolute left-3 top-3 z-[2] rounded-[2px] bg-ink px-2.5 py-1.5 text-[9.5px] uppercase tracking-[0.16em] text-parchment">
            {product.badge}
          </span>
        ) : null}
        {onSale ? (
          <span className="ui-text pointer-events-none absolute left-3 top-11 z-[2] rounded-[2px] bg-primary px-2 py-1 text-[9.5px] uppercase tracking-[0.14em] text-primary-foreground">
            Oferta
          </span>
        ) : null}
        <button
          type="button"
          aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
          aria-pressed={isFavorite}
          onClick={() => toggleFavorite(product.id)}
          className={`absolute right-3 top-3 z-[2] rounded-full border p-2 transition-colors ${
            isFavorite
              ? "border-primary bg-primary text-primary-foreground"
              : "border-ink/20 bg-card/90 text-ink hover:border-primary hover:text-primary"
          }`}
        >
          <Heart size={15} strokeWidth={1.8} fill={isFavorite ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4 pb-5">
        <span className="ui-text text-[9.5px] uppercase tracking-[0.2em] text-gold">
          {product.category}
          {product.subcategory ? ` · ${product.subcategory}` : ""}
        </span>
        <Link to="/productos/$slug" params={{ slug }}>
          <h3 className="font-display text-xl font-semibold leading-tight text-ink hover:text-primary">
            {product.name}
          </h3>
        </Link>
        <p className="line-clamp-2 text-[12.5px] leading-relaxed text-muted-foreground">
          {product.description}
        </p>
        <div className="mt-auto flex items-center justify-between gap-2.5 pt-3.5">
          <span className="ui-text flex flex-col text-[17px] font-semibold tabular-nums text-primary">
            {formatARS(product.price)}
            {onSale ? (
              <span className="text-[12px] font-normal text-muted-foreground line-through">
                {formatARS(product.compareAtPrice ?? 0)}
              </span>
            ) : null}
          </span>
          <button
            type="button"
            onClick={() => {
              addToCart(product);
              toast.success(`Agregaste ${product.name}`);
            }}
            className="ui-text rounded-sm border border-ink/25 px-3 py-1.5 text-[11.5px] uppercase tracking-[0.08em] text-ink transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
          >
            Agregar
          </button>
        </div>
      </div>
    </article>
  );
}
