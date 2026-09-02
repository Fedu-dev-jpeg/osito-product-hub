import { MessageCircle } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { formatARS, type Product } from "./data";
import { track, useShop } from "@/lib/shop-store";
import { whatsappUrl } from "@/lib/whatsapp";

export function ProductCard({ product }: { product: Product }) {
  const { settings } = useShop();
  const slug = product.slug || product.id;
  const onSale = Boolean(product.compareAtPrice && product.compareAtPrice > product.price);
  const badge = product.badge || (product.isNew ? "Novedad" : product.isOffer ? "Oferta" : "");
  const hasPrice = product.price > 0;
  const href = whatsappUrl({ kind: "product", name: product.name }, settings.whatsapp);

  return (
    <article className="flex min-w-0 flex-col overflow-hidden rounded-md border border-ink/15 bg-card transition-all hover:border-gold/75 hover:shadow-md">
      <div className="relative aspect-square border-b border-ink/10 bg-secondary sm:aspect-[4/5] lg:aspect-square">
        <Link
          to="/productos/$slug"
          params={{ slug }}
          className="block h-full w-full"
          onClick={() => track("view_item", { item_name: product.name, item_id: product.id })}
        >
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
              <span className="text-center font-display text-2xl italic text-sepia">{product.name}</span>
            </div>
          )}
        </Link>
        {badge ? (
          <span className="ui-text pointer-events-none absolute left-3 top-3 z-[2] rounded-[2px] bg-ink px-2.5 py-1.5 text-[9.5px] uppercase tracking-[0.16em] text-parchment">
            {badge}
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4 pb-5">
        <span className="ui-text text-[9.5px] uppercase tracking-[0.2em] text-gold">
          {product.brand ? `${product.brand} · ` : ""}
          {product.category}
          {product.subcategory ? ` · ${product.subcategory}` : ""}
        </span>
        <Link to="/productos/$slug" params={{ slug }}>
          <h3 className="font-display text-xl font-semibold leading-tight text-ink hover:text-primary">
            {product.name}
          </h3>
        </Link>
        {product.description ? (
          <p className="line-clamp-2 text-[12.5px] leading-relaxed text-muted-foreground">
            {product.description}
          </p>
        ) : null}
        <div className="mt-auto flex items-end justify-between gap-2.5 pt-3.5">
          {hasPrice ? (
            <span className="ui-text flex flex-col text-[17px] font-semibold tabular-nums text-primary">
              {formatARS(product.price)}
              {onSale ? (
                <span className="text-[12px] font-normal text-muted-foreground line-through">
                  {formatARS(product.compareAtPrice ?? 0)}
                </span>
              ) : null}
            </span>
          ) : (
            <span className="ui-text text-[12px] text-sepia">Consultar precio</span>
          )}
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            onClick={() => track("click_whatsapp", { product: product.name, source: "card" })}
            className="ui-text inline-flex min-h-10 items-center gap-1.5 rounded-sm border border-ink/25 px-3 py-1.5 text-[11.5px] uppercase tracking-[0.08em] text-ink transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
          >
            <MessageCircle size={14} />
            Consultar
          </a>
        </div>
      </div>
    </article>
  );
}
