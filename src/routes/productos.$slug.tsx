import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SiteFooter } from "@/components/callao/SiteFooter";
import { SiteHeader } from "@/components/callao/SiteHeader";
import { MobileStickyCta, WhatsAppFloat } from "@/components/callao/WhatsAppFloat";
import { formatARS, pageShell } from "@/components/callao/data";
import { SITE_NAME } from "@/lib/site";
import { track, useShop } from "@/lib/shop-store";
import { whatsappUrl } from "@/lib/whatsapp";

export const Route = createFileRoute("/productos/$slug")({
  head: ({ params }) => ({
    meta: [{ title: `${params.slug} — ${SITE_NAME}` }],
  }),
  component: ProductDetailPage,
});

function ProductDetailPage() {
  const { slug } = Route.useParams();
  const { products, settings } = useShop();
  const product = useMemo(
    () => products.find((item) => item.slug === slug || item.id === slug),
    [products, slug],
  );
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (product) track("view_item", { item_name: product.name, item_id: product.id });
  }, [product]);

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className={`${pageShell} py-20 text-center`}>
          <h1 className="font-display text-3xl text-ink">Producto no encontrado</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            ¿No encontraste lo que buscabas? Consultanos por WhatsApp y te ayudamos a encontrarlo.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <Link to="/productos" className="ui-text text-primary">
              Volver al catálogo
            </Link>
          </div>
        </div>
        <WhatsAppFloat />
        <MobileStickyCta />
      </div>
    );
  }

  const onSale = Boolean(product.compareAtPrice && product.compareAtPrice > product.price);
  const images = product.images?.length ? product.images : product.image ? [product.image] : [];
  const wa = whatsappUrl({ kind: "product", name: product.name }, settings.whatsapp);

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
          <div>
            <div className="overflow-hidden rounded-md border border-rule bg-secondary">
              {images[active] ? (
                <img
                  src={images[active]}
                  alt={product.name}
                  className="w-full object-cover"
                  width={900}
                  height={900}
                />
              ) : (
                <div className="flex aspect-square items-center justify-center font-display text-4xl italic text-sepia">
                  {product.name}
                </div>
              )}
            </div>
            {images.length > 1 ? (
              <div className="mt-3 flex gap-2">
                {images.map((src, i) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setActive(i)}
                    className={`h-16 w-16 overflow-hidden rounded-sm border ${
                      i === active ? "border-primary" : "border-rule"
                    }`}
                  >
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <div>
            <p className="ui-text text-[11px] uppercase tracking-[0.18em] text-gold">
              {product.brand ? `${product.brand} · ` : ""}
              {product.category}
              {product.subcategory ? ` · ${product.subcategory}` : ""}
            </p>
            <h1 className="mt-2 font-display text-4xl text-ink md:text-5xl">{product.name}</h1>
            {product.sku ? (
              <p className="ui-text mt-2 text-[12px] text-muted-foreground">SKU {product.sku}</p>
            ) : null}
            {product.price > 0 ? (
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
            ) : (
              <p className="ui-text mt-4 text-sm text-sepia">Consultá disponibilidad y precio</p>
            )}
            {product.description ? (
              <p className="mt-5 max-w-[52ch] text-[15px] leading-relaxed text-foreground/80">
                {product.description}
              </p>
            ) : null}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href={wa}
                target="_blank"
                rel="noreferrer"
                onClick={() => track("click_whatsapp", { product: product.name, source: "pdp" })}
                className="ui-text inline-flex h-12 items-center rounded-sm bg-primary px-6 text-[13px] uppercase tracking-[0.08em] text-primary-foreground"
              >
                Consultar por WhatsApp
              </a>
              <Link
                to="/productos"
                search={{ categoria: product.category }}
                className="ui-text text-[13px] text-sepia hover:text-ink"
              >
                Ver más de {product.category}
              </Link>
            </div>
          </div>
        </div>
      </div>
      <SiteFooter />
      <WhatsAppFloat context={{ kind: "product", name: product.name }} />
      <MobileStickyCta />
    </div>
  );
}
