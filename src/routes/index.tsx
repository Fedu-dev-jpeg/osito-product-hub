import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, Palette, Pencil, Store } from "lucide-react";
import p2 from "@/assets/p2.jpg";
import p3 from "@/assets/p3.jpg";
import p4 from "@/assets/p4.jpg";
import p5 from "@/assets/p5.jpg";
import { HeroCarousel } from "@/components/callao/HeroCarousel";
import { LocalBusinessJsonLd } from "@/components/callao/LocalBusinessJsonLd";
import { ProductCarousel } from "@/components/callao/ProductCarousel";
import { SiteFooter } from "@/components/callao/SiteFooter";
import { SiteHeader } from "@/components/callao/SiteHeader";
import { MobileStickyCta, WhatsAppFloat } from "@/components/callao/WhatsAppFloat";
import { pageShell } from "@/components/callao/data";
import { locationDirectionsUrl } from "@/lib/locations";
import { normalizeSearch } from "@/lib/search";
import {
  catalogCategories,
  INSTAGRAM_HANDLE,
  INSTAGRAM_URL,
  knownBrands,
  seoKeywords,
  SITE_DESCRIPTION,
  SITE_TITLE,
  siteServices,
  telHref,
} from "@/lib/site";
import { setCategory, track, useShop } from "@/lib/shop-store";
import { whatsappUrl } from "@/lib/whatsapp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: SITE_TITLE },
      { name: "description", content: SITE_DESCRIPTION },
      { name: "keywords", content: seoKeywords() },
      { property: "og:title", content: SITE_TITLE },
      { property: "og:description", content: SITE_DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: SITE_TITLE },
      { name: "twitter:description", content: SITE_DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

const beneficios = [
  { icon: Store, title: "3 sucursales en Recoleta", text: "Av. Callao 1588, Av. Callao 1377 y Ayacucho 1762." },
  { icon: Palette, title: "Gran variedad de marcas", text: "Trabajamos con marcas como Sharpie, Stabilo, Giotto, HP y más." },
  { icon: Pencil, title: "Atención personalizada", text: "Te ayudamos a armar listas escolares y a encontrar lo que necesitás." },
];

function Index() {
  const { products, settings, heroSlides, locations, catalogStatus } = useShop();
  const featured = products
    .filter((p) => p.featured)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  const newest = products.filter((p) => p.isNew);
  const featuredIds = new Set(featured.map((p) => p.id));
  const uniqueNew = newest.filter((p) => !featuredIds.has(p.id));
  const showNovedades = newest.length >= 4 && uniqueNew.length >= 3;
  const publishedBrands = knownBrands.filter((brand) =>
    products.some((product) => normalizeSearch(product.brand ?? "") === normalizeSearch(brand)),
  );
  const branches = locations.filter((item) => item.active);
  const reviewBranches = branches.filter((item) => item.reviewUrl);
  const waHome = whatsappUrl({ kind: "home" }, settings.whatsapp);

  return (
    <div className="grain relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <LocalBusinessJsonLd />
      <div className="ui-text flex flex-wrap items-center justify-center gap-x-7 gap-y-1 bg-ink px-4 py-2.5 text-center text-[11.5px] uppercase tracking-[0.06em] text-parchment sm:px-6 md:text-[12.5px]">
        <span>3 sucursales en Recoleta</span>
        <span className="hidden opacity-35 sm:inline">·</span>
        <span className="hidden sm:inline">Escolar · Comercial · Artística · Papelería</span>
        <span className="hidden opacity-35 sm:inline">·</span>
        <span className="text-gold-soft">Atención personalizada</span>
      </div>

      <SiteHeader />

      <HeroCarousel slides={heroSlides} />

      <section className="relative z-[2] border-b border-rule bg-secondary">
        <div className={`${pageShell} grid grid-cols-1 lg:grid-cols-3`}>
          {beneficios.map(({ icon: Icon, title, text }, i) => (
            <div
              key={title}
              className={`flex min-w-0 items-start gap-4 border-b border-rule py-7 last:border-b-0 lg:border-b-0 ${
                i === 1 ? "lg:border-x lg:border-rule lg:px-8" : ""
              } ${i === 0 ? "lg:pr-8" : ""} ${i === 2 ? "lg:pl-8" : ""}`}
            >
              <Icon size={26} strokeWidth={1.3} className="mt-0.5 shrink-0 text-gold" />
              <div className="min-w-0">
                <h3 className="mb-1 font-display text-lg font-semibold leading-tight text-ink">{title}</h3>
                <p className="text-[13.5px] leading-relaxed text-foreground/75">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-[2] border-b border-rule py-16 md:py-20">
        <div className={pageShell}>
          <span className="eyebrow mb-3 block">Categorías</span>
          <h2 className="mb-8 font-display text-4xl font-normal leading-none tracking-[-0.01em] text-ink md:text-[44px]">
            Encontrá lo que necesitás
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {catalogCategories.map((cat) => (
              <Link
                key={cat.slug}
                to="/productos"
                search={{ categoria: cat.name }}
                onClick={() => {
                  setCategory(cat.name);
                  track("select_category", { category: cat.name });
                }}
                className="group min-h-[7.5rem] rounded-md border border-rule bg-card p-4 transition-colors hover:border-gold"
              >
                <h3 className="font-display text-xl font-semibold text-ink group-hover:text-primary">
                  {cat.name}
                </h3>
                <p className="mt-1 text-[13px] leading-relaxed text-foreground/70">{cat.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {catalogStatus === "loading" && !products.length ? (
        <section className="relative z-[2] border-b border-rule py-16 md:py-20">
          <div className={pageShell}>
            <div className="h-8 w-48 animate-pulse rounded-sm bg-muted" />
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="aspect-square animate-pulse rounded-md bg-muted" />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {catalogStatus === "error" && !products.length ? (
        <section className="relative z-[2] border-b border-rule py-16">
          <div className={pageShell}>
            <p className="font-display text-2xl text-ink">No pudimos cargar el catálogo</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="ui-text mt-4 inline-flex min-h-11 items-center rounded-sm border border-ink/20 px-5 text-[13px] uppercase tracking-[0.08em]"
            >
              Reintentar
            </button>
          </div>
        </section>
      ) : null}

      {featured.length ? (
        <section id="destacados" className="relative z-[2] scroll-mt-4 border-b border-rule py-16 md:py-20">
          <div className={pageShell}>
            <div className="flex flex-col gap-3 border-b border-ink/20 pb-5 md:flex-row md:items-end md:justify-between">
              <div>
                <span className="eyebrow mb-3 block">Catálogo</span>
                <h2 className="font-display text-4xl font-normal leading-none tracking-[-0.01em] text-ink md:text-[44px]">
                  Destacados
                </h2>
              </div>
              <Link to="/productos" className="ui-text text-[12.5px] uppercase tracking-[0.06em] text-primary">
                Ver todos
              </Link>
            </div>
            <div className="mt-8">
              <ProductCarousel products={featured} label="destacados" />
            </div>
          </div>
        </section>
      ) : null}

      {showNovedades ? (
        <section className="relative z-[2] border-b border-rule py-16 md:py-20">
          <div className={pageShell}>
            <div className="flex flex-col gap-3 border-b border-ink/20 pb-5 md:flex-row md:items-end md:justify-between">
              <div>
                <span className="eyebrow mb-3 block">Catálogo</span>
                <h2 className="font-display text-4xl font-normal leading-none tracking-[-0.01em] text-ink md:text-[44px]">
                  Novedades
                </h2>
              </div>
              <Link
                to="/productos"
                search={{ sort: "newest" }}
                className="ui-text text-[12.5px] uppercase tracking-[0.06em] text-primary"
              >
                Ver todas
              </Link>
            </div>
            <div className="mt-8">
              <ProductCarousel products={newest} label="novedades" />
            </div>
          </div>
        </section>
      ) : null}

      {!products.length && catalogStatus === "ready" ? (
        <section className="relative z-[2] border-b border-rule py-16 md:py-20">
          <div className={pageShell}>
            <span className="eyebrow mb-3 block">Catálogo</span>
            <h2 className="font-display text-4xl font-normal leading-none tracking-[-0.01em] text-ink md:text-[44px]">
              Productos
            </h2>
            <div className="mt-8 rounded-md border border-rule bg-card px-6 py-10">
              <p className="font-display text-2xl text-ink">Estamos cargando el catálogo</p>
              <p className="mt-2 max-w-[52ch] text-sm leading-relaxed text-muted-foreground">
                Mientras tanto, consultanos por WhatsApp o acercate a cualquiera de las tres sucursales
                en Recoleta.
              </p>
              <a
                href={waHome}
                target="_blank"
                rel="noreferrer"
                onClick={() => track("click_whatsapp", { source: "empty-catalog" })}
                className="ui-text mt-5 inline-flex min-h-11 items-center rounded-sm bg-primary px-5 text-[13px] uppercase tracking-[0.08em] text-primary-foreground"
              >
                Consultar por WhatsApp
              </a>
            </div>
          </div>
        </section>
      ) : null}

      <section className="relative z-[2] border-b border-rule py-14 md:py-16">
        <div className={pageShell}>
          <span className="eyebrow mb-3 block">Marcas</span>
          <h2 className="mb-2 font-display text-3xl font-normal text-ink md:text-[36px]">
            Marcas que encontrás en Librería Callao
          </h2>
          <p className="mb-8 max-w-[60ch] text-[14.5px] text-foreground/75">
            Trabajamos con marcas como estas. La disponibilidad puede variar según sucursal y temporada.
          </p>
          {publishedBrands.length ? (
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-rule bg-rule sm:grid-cols-4 lg:grid-cols-8">
              {publishedBrands.map((brand) => (
                <Link
                  key={brand}
                  to="/productos"
                  search={{ marca: brand }}
                  onClick={() => track("select_category", { brand })}
                  className="flex min-h-[72px] items-center justify-center bg-card px-3 py-4 font-display text-lg text-ink hover:bg-secondary"
                >
                  {brand}
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Trabajamos con marcas como Sharpie, Stabilo, Giotto, HP y más. La disponibilidad se va a
              ver en el catálogo a medida que publiquemos productos.
            </p>
          )}
        </div>
      </section>

      <section id="sucursales" className="relative z-[2] scroll-mt-6 border-b border-rule bg-secondary py-16 md:py-20">
        <div className={pageShell}>
          <span className="eyebrow mb-3 block">Recoleta · CABA</span>
          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <h2 className="font-display text-4xl font-normal text-ink md:text-[44px]">
              Encontranos en Recoleta
            </h2>
            <Link to="/sucursales" className="ui-text text-[12.5px] uppercase tracking-[0.06em] text-primary">
              Ver sucursales
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {branches.map((branch) => {
              const waBranch = whatsappUrl(
                { kind: "branch", address: branch.address },
                settings.whatsapp,
              );
              return (
                <article
                  key={branch.id}
                  id={branch.id}
                  className="flex flex-col rounded-md border border-rule bg-card p-5 md:p-6"
                >
                  <MapPin className="mb-3 text-gold" size={22} strokeWidth={1.5} />
                  <h3 className="font-display text-2xl font-semibold text-ink">{branch.name}</h3>
                  <p className="mt-1 text-sm text-foreground/75">
                    {branch.neighborhood}, {branch.city}
                  </p>
                  <ul className="mt-4 space-y-1 text-[13.5px] leading-relaxed text-foreground/80">
                    <li>{branch.weekdayHours}</li>
                    <li>{branch.saturdayHours}</li>
                    <li>{branch.sundayHours}</li>
                    <li>
                      Tel.:{" "}
                      <a
                        href={telHref(branch.phoneE164)}
                        onClick={() => track("click_phone", { store: branch.address })}
                        className="text-primary hover:underline"
                      >
                        {branch.phoneDisplay}
                      </a>
                    </li>
                    {branch.secondaryPhoneDisplay ? (
                      <li>
                        Contacto general:{" "}
                        <a
                          href={telHref(branch.secondaryPhoneE164 ?? "")}
                          onClick={() => track("click_phone", { store: branch.address, secondary: true })}
                          className="text-primary hover:underline"
                        >
                          {branch.secondaryPhoneDisplay}
                        </a>
                      </li>
                    ) : null}
                  </ul>
                  <div className="mt-5 flex flex-col gap-2">
                    <Link
                      to="/sucursales"
                      search={{ local: branch.id }}
                      hash="mapa"
                      onClick={() => track("select_store", { store: branch.address, source: "home-map" })}
                      className="ui-text inline-flex min-h-11 items-center justify-center rounded-sm bg-primary px-4 text-[12px] uppercase tracking-[0.08em] text-primary-foreground"
                    >
                      Ver mapa
                    </Link>
                    <a
                      href={locationDirectionsUrl(branch)}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => {
                        track("click_maps", { store: branch.address, source: "directions" });
                        track("select_store", { store: branch.address });
                      }}
                      className="ui-text inline-flex min-h-11 items-center justify-center rounded-sm border border-ink/20 px-4 text-[12px] uppercase tracking-[0.08em] text-ink"
                    >
                      Cómo llegar
                    </a>
                    <div className="grid grid-cols-2 gap-2">
                      <a
                        href={telHref(branch.phoneE164)}
                        onClick={() => track("click_phone", { store: branch.address, source: "card" })}
                        className="ui-text inline-flex min-h-11 items-center justify-center rounded-sm border border-ink/20 px-3 text-[12px] uppercase tracking-[0.08em] text-ink"
                      >
                        Llamar
                      </a>
                      {branch.whatsappEnabled ? (
                        <a
                          href={waBranch}
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => track("click_whatsapp", { store: branch.address })}
                          className="ui-text inline-flex min-h-11 items-center justify-center rounded-sm border border-ink/20 px-3 text-[12px] uppercase tracking-[0.08em] text-ink"
                        >
                          WhatsApp
                        </a>
                      ) : (
                        <Link
                          to="/sucursales"
                          search={{ local: branch.id }}
                          hash="mapa"
                          className="ui-text inline-flex min-h-11 items-center justify-center rounded-sm border border-ink/20 px-3 text-[12px] uppercase tracking-[0.08em] text-ink"
                        >
                          Ver sucursal
                        </Link>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative z-[2] border-b border-rule py-16 md:py-20">
        <div className={pageShell}>
          <h2 className="mb-8 font-display text-4xl font-normal text-ink md:text-[44px]">
            Mucho más que una librería
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {siteServices.map((service) => (
              <article key={service.title} className="rounded-md border border-rule bg-card p-5">
                <h3 className="font-display text-xl font-semibold text-ink">{service.title}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-foreground/75">{service.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="lista-escolar" className="relative z-[2] scroll-mt-6 bg-ink py-16 text-parchment md:py-20">
        <div className={`${pageShell} grid grid-cols-1 items-center gap-8 lg:grid-cols-[1.2fr_auto]`}>
          <div>
            <span className="ui-text mb-4 block text-[10.5px] uppercase tracking-[0.26em] text-gold-soft">
              Temporada escolar
            </span>
            <h2 className="mb-4 font-display text-4xl font-normal text-background md:text-[44px]">
              ¿Tenés una lista escolar?
            </h2>
            <p className="max-w-[52ch] text-[16px] leading-relaxed text-parchment/80">
              Mandanos tu lista y te ayudamos a encontrar todo lo que necesitás.
            </p>
          </div>
          <Link
            to="/lista-escolar"
            onClick={() => track("send_school_list", { source: "home" })}
            className="ui-text inline-flex min-h-12 items-center justify-center rounded-sm bg-gold-soft px-6 text-[13px] uppercase tracking-[0.08em] text-ink"
          >
            Enviar lista por WhatsApp
          </Link>
        </div>
      </section>

      <section className="relative z-[2] border-b border-rule py-16 md:py-20">
        <div className={`${pageShell} grid grid-cols-1 items-center gap-10 lg:grid-cols-2`}>
          <div>
            <span className="eyebrow mb-3 block">El barrio</span>
            <h2 className="mb-5 font-display text-4xl font-normal text-ink md:text-[40px]">
              Librería de barrio, todos los días
            </h2>
            <p className="max-w-[52ch] text-[15.5px] leading-[1.78] text-foreground/80">
              Estamos en Recoleta para acompañarte en el estudio, el trabajo y tus proyectos. En Librería
              Callao encontrás artículos escolares, comerciales y artísticos, papelería, escritura y mucho
              más en tres sucursales del barrio.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { src: p2, alt: "Cuadernos de papelería sobre una mesa" },
              { src: p3, alt: "Lapiceras y artículos de escritura" },
              { src: p4, alt: "Marcadores de colores para uso escolar y artístico" },
              { src: p5, alt: "Agenda y útiles de escritorio" },
            ].map((img) => (
              <div key={img.alt} className="plate-color aspect-square overflow-hidden rounded-[2px]">
                <img src={img.src} alt={img.alt} loading="lazy" width={400} height={400} className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-[2] border-b border-rule py-16 md:py-20">
        <div className={pageShell}>
          <h2 className="mb-3 font-display text-4xl font-normal text-ink md:text-[40px]">
            Lo que valoran nuestros clientes
          </h2>
          <p className="mb-6 max-w-[56ch] text-[15px] leading-relaxed text-foreground/75">
            Variedad, amplio surtido, productos difíciles de conseguir y atención personalizada. Mirá las
            reseñas reales en Google.
          </p>
          {reviewBranches.length ? (
            <div className="flex flex-wrap gap-2">
              {reviewBranches.map((branch) => (
                <a
                  key={branch.id}
                  href={branch.reviewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="ui-text inline-flex min-h-11 items-center rounded-sm border border-ink/25 px-5 text-[13px] uppercase tracking-[0.08em] text-ink hover:border-gold"
                >
                  Reseñas {branch.name}
                </a>
              ))}
            </div>
          ) : (
            <a
              href={settings.googleReviewsUrl}
              target="_blank"
              rel="noreferrer"
              className="ui-text inline-flex min-h-11 items-center rounded-sm border border-ink/25 px-5 text-[13px] uppercase tracking-[0.08em] text-ink hover:border-gold"
            >
              Ver reseñas en Google
            </a>
          )}
        </div>
      </section>

      <section className="relative z-[2] py-16 md:py-20">
        <div className={pageShell}>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="eyebrow mb-3 block">Redes</span>
              <h2 className="font-display text-3xl font-normal text-ink md:text-[36px]">
                Seguinos en Instagram
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">{INSTAGRAM_HANDLE}</p>
            </div>
            <a
              href={settings.instagramUrl || INSTAGRAM_URL}
              target="_blank"
              rel="noreferrer"
              onClick={() => track("instagram_click", { source: "home-grid" })}
              className="ui-text text-[13px] uppercase tracking-[0.08em] text-primary"
            >
              Abrir Instagram
            </a>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
            {[p2, p3, p4, p5].map((src, i) => (
              <a
                key={src}
                href={settings.instagramUrl || INSTAGRAM_URL}
                target="_blank"
                rel="noreferrer"
                onClick={() => track("instagram_click", { source: "grid", index: i })}
                className="plate-color aspect-square overflow-hidden rounded-[2px]"
              >
                <img
                  src={src}
                  alt="Papelería y útiles de Librería Callao"
                  loading="lazy"
                  width={400}
                  height={400}
                  className="h-full w-full object-cover"
                />
              </a>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
      <WhatsAppFloat context={{ kind: "home" }} />
      <MobileStickyCta />
    </div>
  );
}
