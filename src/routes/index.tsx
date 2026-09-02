import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, ShieldCheck, Store, Truck } from "lucide-react";
import heroImg from "@/assets/hero.jpg";
import tiendaImg from "@/assets/tienda.jpg";
import { SiteHeader } from "@/components/callao/SiteHeader";
import { ProductCard } from "@/components/callao/ProductCard";
import { setCategory, track, useShop } from "@/lib/shop-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Librería Callao — Libros y papelería en Buenos Aires" },
      {
        name: "description",
        content:
          "Libros, útiles escolares, agendas y papelería seleccionados a mano. Envíos a todo el país y retiro en Av. Callao 1234, CABA.",
      },
      { property: "og:title", content: "Librería Callao — Libros y papelería" },
      {
        property: "og:description",
        content:
          "Desde 1948 en Av. Callao. Libros, papelería y objetos de escritura elegidos con criterio.",
      },
    ],
  }),
  component: Index,
});

const beneficios = [
  {
    icon: Store,
    title: "Retiro en sucursal",
    text: "Comprá online y retirá en Av. Callao 1234 dentro de las 24 h, sin cargo.",
  },
  {
    icon: Truck,
    title: "Envíos a todo el país",
    text: "Correo Argentino y Andreani. CABA y GBA en 48 h, interior de 3 a 5 días.",
  },
  {
    icon: ShieldCheck,
    title: "Compra segura",
    text: "Pago protegido, factura A o B y cambios sin vueltas dentro de los 30 días.",
  },
];

function Index() {
  const { products, query, category } = useShop();
  const categories = ["Todos", ...Array.from(new Set(products.map((p) => p.category)))];
  const normalizedQuery = query.trim().toLowerCase();
  const filtered = products.filter((product) => {
    const matchesCategory = category === "Todos" || product.category === category;
    const haystack =
      `${product.name} ${product.category} ${product.subcategory ?? ""} ${product.description}`.toLowerCase();
    return matchesCategory && (!normalizedQuery || haystack.includes(normalizedQuery));
  });

  return (
    <div className="grain relative min-h-screen bg-background text-foreground">
      <div className="ui-text flex flex-wrap items-center justify-center gap-x-7 gap-y-1 bg-ink px-5 py-2.5 text-center text-[11.5px] uppercase tracking-[0.06em] text-parchment md:text-[12.5px]">
        <span>Envío sin cargo desde $80.000</span>
        <span className="hidden opacity-35 sm:inline">·</span>
        <span className="hidden sm:inline">Retiro en Av. Callao 1234, Buenos Aires</span>
        <span className="hidden opacity-35 sm:inline">·</span>
        <span className="text-gold-soft">3 y 6 cuotas sin interés</span>
      </div>

      <SiteHeader />

      {/* Hero */}
      <section className="relative z-[2] border-b border-rule">
        <div className="mx-auto grid max-w-[1240px] grid-cols-1 px-5 md:px-12 lg:grid-cols-[minmax(420px,0.86fr)_minmax(0,1.14fr)]">
          <div className="flex flex-col justify-center py-14 lg:border-r lg:border-rule lg:py-20 lg:pr-14">
            <span className="eyebrow mb-5">Desde 1948 · Barrio de Callao</span>
            <h1 className="mb-6 font-display text-[38px] font-normal leading-[1.04] tracking-[-0.015em] text-ink text-pretty sm:text-5xl lg:text-6xl">
              Todo lo que necesitás para{" "}
              <em className="italic text-primary">leer, estudiar y crear</em>
            </h1>
            <p className="mb-8 max-w-[38ch] text-base leading-[1.72] text-foreground/80 text-pretty md:text-[16.5px]">
              Libros, útiles y objetos que inspiran. Seleccionados con criterio, elegidos para vos.
            </p>
            <div className="flex flex-wrap items-center gap-5">
              <a
                href="#destacados"
                className="ui-text inline-flex items-center gap-2.5 rounded-sm bg-primary px-7 py-3.5 text-sm uppercase tracking-[0.08em] text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Ver productos
                <ArrowRight size={16} strokeWidth={1.7} />
              </a>
              <a
                href="#"
                className="ui-text border-b border-ink/35 pb-0.5 text-sm text-ink transition-colors hover:border-gold hover:text-primary"
              >
                Ver catálogo escolar 2026
              </a>
            </div>
            <div className="ui-text mt-10 flex flex-wrap gap-6 border-t border-rule pt-6 text-[11.5px] tracking-[0.05em] text-sepia md:mt-12 md:gap-10">
              <span>+12.000 títulos</span>
              <span>Envíos a todo el país</span>
              <span>Atención por WhatsApp</span>
            </div>
          </div>
          <div className="flex items-center pb-12 lg:py-14 lg:pl-14">
            <figure className="m-0 w-full">
              <div className="plate aspect-[4/3] w-full rounded-[2px] lg:aspect-[5/4]">
                <img
                  src={heroImg}
                  alt="Libros apilados, un cuaderno abierto y una pluma sobre lino claro"
                  width={1200}
                  height={900}
                  className="h-full w-full object-cover"
                />
              </div>
              <figcaption className="ui-text mt-3 text-right text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
                Mesa de novedades · Av. Callao
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section className="relative z-[2] border-b border-rule bg-secondary">
        <div className="mx-auto grid max-w-[1240px] grid-cols-1 px-5 md:px-12 lg:grid-cols-3">
          {beneficios.map(({ icon: Icon, title, text }, i) => (
            <div
              key={title}
              className={`flex items-start gap-4 border-b border-rule py-7 last:border-b-0 lg:border-b-0 ${
                i === 1 ? "lg:border-x lg:border-rule lg:px-10" : ""
              } ${i === 0 ? "lg:pr-10" : ""} ${i === 2 ? "lg:pl-10" : ""}`}
            >
              <Icon size={26} strokeWidth={1.3} className="mt-0.5 shrink-0 text-gold" />
              <div>
                <h3 className="mb-1 font-display text-lg font-semibold leading-tight text-ink">
                  {title}
                </h3>
                <p className="text-[13.5px] leading-relaxed text-foreground/75">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Destacados */}
      <section id="destacados" className="relative z-[2] py-16 md:py-20">
        <div className="mx-auto max-w-[1240px] px-5 md:px-12">
          <div className="flex flex-col gap-5 border-b border-ink/20 pb-5 md:flex-row md:items-end md:justify-between md:gap-10">
            <div>
              <span className="eyebrow mb-3 block">Selección de la casa</span>
              <h2 className="font-display text-4xl font-normal leading-none tracking-[-0.01em] text-ink md:text-[44px]">
                Destacados
              </h2>
            </div>
            <div className="ui-text flex flex-wrap items-center gap-x-6 gap-y-2 text-[12.5px] uppercase tracking-[0.06em] md:pb-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={
                    category === cat
                      ? "border-b border-primary pb-0.5 text-ink"
                      : "text-muted-foreground transition-colors hover:text-ink"
                  }
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {filtered.length > 0 ? (
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 xl:gap-7">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p className="mt-8 rounded-md border border-rule bg-card px-6 py-7 text-sm text-muted-foreground">
              No encontramos productos para esa búsqueda.
            </p>
          )}
        </div>
      </section>

      {/* La casa */}
      <section className="relative z-[2] bg-ink text-parchment">
        <div className="mx-auto grid max-w-[1240px] grid-cols-1 items-center px-5 md:px-12 lg:grid-cols-2">
          <div className="py-14 lg:py-[72px] lg:pr-16">
            <span className="ui-text mb-5 block text-[10.5px] uppercase tracking-[0.26em] text-gold-soft">
              La casa
            </span>
            <h2 className="mb-5 font-display text-3xl font-normal leading-tight text-background text-pretty md:text-[40px]">
              Tres cuadras de Corrientes, setenta y ocho años en la misma esquina
            </h2>
            <p className="mb-4 max-w-[52ch] text-[15.5px] leading-[1.78] text-parchment/75 hyphens-auto md:text-justify">
              Abrimos en 1948 frente al mismo cordón de Av. Callao donde seguimos hoy. Elegimos cada
              título y cada cuaderno a mano: si no lo usaríamos nosotros, no entra a la mesa de
              novedades.
            </p>
            <p className="mb-8 max-w-[52ch] text-[15.5px] leading-[1.78] text-parchment/75 hyphens-auto md:text-justify">
              Nuestros libreros responden por WhatsApp de lunes a sábado y armamos pedidos escolares
              completos por lista de colegio.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="#"
                className="ui-text inline-flex items-center gap-2 rounded-sm border border-gold-soft px-6 py-3 text-[13.5px] uppercase tracking-[0.08em] text-gold-soft transition-colors hover:bg-gold-soft/15"
              >
                Conocer la librería
              </a>
              <span className="ui-text text-[12.5px] text-parchment/55">
                Av. Callao 1234 · Lun a sáb 9–20 h
              </span>
            </div>
          </div>
          <div className="pb-14 lg:py-14">
            <div className="plate aspect-[4/3] w-full rounded-[2px] border-ink/40">
              <img
                src={tiendaImg}
                alt="Interior de la librería con estanterías de madera y mesa de novedades"
                loading="lazy"
                width={1200}
                height={900}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="relative z-[2] border-b border-rule py-14 md:py-16">
        <div className="mx-auto grid max-w-[1240px] grid-cols-1 items-center gap-8 px-5 md:px-12 lg:grid-cols-[1fr_auto] lg:gap-16">
          <div>
            <h2 className="mb-2 font-display text-3xl font-normal leading-tight text-ink md:text-[32px]">
              Cartas de la librería
            </h2>
            <p className="max-w-[56ch] text-[14.5px] leading-relaxed text-foreground/75">
              Una vez por mes: novedades, recomendados de los libreros y avisos de reposición de
              papelería. Sin spam.
            </p>
          </div>
          <form
            className="flex flex-col gap-3 sm:flex-row sm:items-center"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder="tu@correo.com.ar"
              aria-label="Tu correo electrónico"
              className="ui-text h-[46px] w-full rounded-sm border border-ink/25 bg-card px-3.5 text-sm text-ink outline-none placeholder:text-muted-foreground focus:border-gold sm:w-[320px]"
            />
            <button
              type="submit"
              className="ui-text inline-flex h-[46px] items-center justify-center rounded-sm bg-primary px-6 text-[13.5px] uppercase tracking-[0.08em] text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Suscribirme
            </button>
          </form>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

const footerCols = [
  { title: "Comprar", links: ["Librería", "Escolar", "Oficina", "Papelería", "Agendas"] },
  {
    title: "Ayuda",
    links: [
      "Envíos y retiro",
      "Medios de pago",
      "Cambios y devoluciones",
      "Listas escolares",
      "Preguntas frecuentes",
    ],
  },
  {
    title: "La casa",
    links: [
      "Nuestra historia",
      "Encuentros y firmas",
      "Venta institucional",
      "Trabajá con nosotros",
    ],
  },
];

function SiteFooter() {
  return (
    <footer className="relative z-[2] bg-secondary">
      <div className="mx-auto grid max-w-[1240px] grid-cols-1 gap-10 px-5 pb-8 pt-12 sm:grid-cols-2 md:px-12 lg:grid-cols-[1.3fr_1fr_1fr_1fr] lg:gap-12 lg:pt-14">
        <div>
          <span className="mb-3 block font-display text-xl font-medium tracking-[0.13em] text-primary">
            LIBRERÍA CALLAO
          </span>
          <p className="mb-3.5 max-w-[34ch] text-[13px] leading-[1.7] text-foreground/75">
            Av. Callao 1234, C1023 CABA
            <br />
            Lunes a sábado de 9 a 20 h
          </p>
          <p className="text-[13px] leading-[1.7] text-foreground/75">
            +54 11 4372 0000
            <br />
            hola@libreriacallao.com.ar
          </p>
        </div>
        {footerCols.map((col) => (
          <div key={col.title} className="ui-text flex flex-col gap-2.5">
            <span className="mb-1 text-[10.5px] uppercase tracking-[0.2em] text-gold">
              {col.title}
            </span>
            {col.links.map((link) => (
              <a key={link} href="#" className="text-[13px] text-foreground hover:text-primary">
                {link}
              </a>
            ))}
          </div>
        ))}
      </div>
      <div className="ui-text mx-auto flex max-w-[1240px] flex-col gap-3 border-t border-rule px-5 pb-8 pt-4 text-[11.5px] text-muted-foreground md:flex-row md:items-center md:justify-between md:px-12">
        <span>© 2026 Librería Callao · Buenos Aires, Argentina</span>
        <div className="flex flex-wrap gap-x-5 gap-y-1">
          <span>Precios en pesos argentinos (ARS), IVA incluido</span>
          <a href="#" className="hover:text-ink">Términos</a>
          <a href="#" className="hover:text-ink">Privacidad</a>
        </div>
      </div>
    </footer>
  );
}
