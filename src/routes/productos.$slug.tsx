import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { SiteFooter } from "@/components/callao/SiteFooter";
import { SiteHeader } from "@/components/callao/SiteHeader";
import { formatARS, pageShell } from "@/components/callao/data";
import { addToCart, useShop } from "@/lib/shop-store";

export const Route = createFileRoute("/productos/$slug")({
  head: ({ params }) => ({
    meta: [{ title: `${params.slug} — Librería Callao` }],
  }),
  component: ProductDetailPage,
});

function ProductDetailPage() {
  const { slug } = Route.useParams();
  const { products } = useShop();
  const [qty, setQty] = useState(1);
  const product = useMemo(
    () => products.find((item) => item.slug === slug || item.id === slug),
    [products, slug],
  );

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className={`${pageShell} py-20 text-center`}>
          <h1 className="font-display text-3xl text-ink">Producto no encontrado</h1>
          <Link to="/productos" className="ui-text mt-4 inline-block text-primary">
            Volver al catálogo
          </Link>
        </div>
      </div>
    );
  }

  const onSale = Boolean(product.compareAtPrice && product.compareAtPrice > product.price);
  const inStock = (product.inventory ?? 1) > 0;

  return (
    <div className="grain min-h-screen bg-background text-foreground">
      <SiteHeader />
      <div className={`${pageShell} py-8 md:py-12`}>
        <nav className="ui-text text-[12px] text-sepia">
          <Link to="/" className="hover:text-ink">
            Inicio
          </Link>
          <span className="px-2">/</span>
          <Link to="/productos" className="hover:text-ink">
            Productos
          </Link>
          <span className="px-2">/</span>
          <span className="text-ink">{product.name}</span>
        </nav>

        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div className="overflow-hidden rounded-md border border-rule bg-secondary">
            {product.image ? (
              <img src={product.image} alt={product.name} className="w-full object-cover" />
            ) : (
              <div className="flex aspect-square items-center justify-center font-display text-4xl italic text-sepia">
                {product.name}
              </div>
            )}
          </div>
          <div>
            <p className="ui-text text-[11px] uppercase tracking-[0.18em] text-gold">
              {product.category}
              {product.subcategory ? ` · ${product.subcategory}` : ""}
            </p>
            <h1 className="mt-2 font-display text-4xl text-ink md:text-5xl">{product.name}</h1>
            {product.sku ? (
              <p className="ui-text mt-2 text-[12px] text-muted-foreground">SKU {product.sku}</p>
            ) : null}
            <div className="mt-4 flex items-end gap-3">
              <span className="ui-text text-3xl font-semibold tabular-nums text-primary">
                {formatARS(product.price)}
              </span>
              {onSale ? (
                <span className="ui-text text-lg text-muted-foreground line-through">
                  {formatARS(product.compareAtPrice ?? 0)}
                </span>
              ) : null}
            </div>
            <p className="mt-5 max-w-[52ch] text-[15px] leading-relaxed text-foreground/80">
              {product.description}
            </p>
            <p className="ui-text mt-4 text-[12px] text-sepia">
              {inStock
                ? `En stock${product.inventory ? ` · ${product.inventory} disponibles` : ""}`
                : "Sin stock"}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <label className="ui-text text-[12px] text-sepia">
                Cantidad
                <input
                  type="number"
                  min={1}
                  max={product.inventory ?? 99}
                  value={qty}
                  onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
                  className="ml-2 h-11 w-20 rounded-sm border border-ink/20 px-2 text-sm"
                />
              </label>
              <button
                type="button"
                disabled={!inStock}
                onClick={() => {
                  for (let i = 0; i < qty; i += 1) addToCart(product);
                  toast.success(`Agregaste ${product.name}`);
                }}
                className="ui-text h-11 rounded-sm bg-primary px-6 text-[13px] uppercase tracking-[0.08em] text-primary-foreground disabled:opacity-50"
              >
                Agregar al carrito
              </button>
            </div>
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
