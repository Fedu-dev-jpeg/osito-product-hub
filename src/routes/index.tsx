import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck, Store, Truck } from "lucide-react";
import heroImg from "@/assets/hero.jpg";
import tiendaImg from "@/assets/tienda.jpg";
import { SiteHeader } from "@/components/callao/SiteHeader";
import { NewsletterForm, ProductCatalog } from "@/components/callao/store-sections";
import { pageShell } from "@/components/callao/data";

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
  return (
    <div className="grain relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <div className="ui-text flex flex-wrap items-center justify-center gap-x-7 gap-y-1 bg-ink px-4 py-2.5 text-center text-[11.5px] uppercase tracking-[0.06em] text-parchment sm:px-6 md:text-[12.5px]">
        <span>Envío sin cargo desde $80.000</span>
        <span className="hidden opacity-35 sm:inline">·</span>
        <span className="hidden sm:inline">Retiro en Av. Callao 1234, Buenos Aires</span>
        <span className="hidden opacity-35 sm:inline">·</span>
        <span className="text-gold-soft">3 y 6 cuotas sin interés</span>
      </div>

      <SiteHeader />

      <section className="relative z-[2] border-b border-rule">
        <div className={`${pageShell} grid grid-cols-1 lg:grid-cols-2`}>
          <div className="flex min-w-0 flex-col justify-center py-12 sm:py-14 lg:border-r lg:border-rule lg:py-20 lg:pr-12">
            <span className="eyebrow mb-5">Desde 1948 · Barrio de Callao</span>
            <h1 className="mb-6 font-display text-[34px] font-normal leading-[1.04] tracking-[-0.015em] text-pretty text-ink sm:text-5xl lg:text-6xl">
              Todo lo que necesitás para{" "}
              <em className="italic text-primary">leer, estudiar y crear</em>
            </h1>
            <p className="mb-8 max-w-[38ch] text-base leading-[1.72] text-pretty text-foreground/80 md:text-[16.5px]">
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
                href="#destacados"
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
          <div className="flex min-w-0 items-center pb-12 lg:py-14 lg:pl-12">
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
                <h3 className="mb-1 font-display text-lg font-semibold leading-tight text-ink">
                  {title}
                </h3>
                <p className="text-[13.5px] leading-relaxed text-foreground/75">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <ProductCatalog />

      <section className="relative z-[2] bg-ink text-parchment">
        <div className={`${pageShell} grid grid-cols-1 items-center lg:grid-cols-2`}>
          <div className="min-w-0 py-14 lg:py-[72px] lg:pr-16">
            <span className="ui-text mb-5 block text-[10.5px] uppercase tracking-[0.26em] text-gold-soft">
              La casa
            </span>
            <h2 className="mb-5 font-display text-3xl font-normal leading-tight text-pretty text-background md:text-[40px]">
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
                href="#destacados"
                className="ui-text inline-flex items-center gap-2 rounded-sm border border-gold-soft px-6 py-3 text-[13.5px] uppercase tracking-[0.08em] text-gold-soft transition-colors hover:bg-gold-soft/15"
              >
                Conocer la librería
              </a>
              <span className="ui-text text-[12.5px] text-parchment/55">
                Av. Callao 1234 · Lun a sáb 9–20 h
              </span>
            </div>
          </div>
          <div className="min-w-0 pb-14 lg:py-14">
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

      <section className="relative z-[2] border-b border-rule py-14 md:py-16">
        <div
          className={`${pageShell} grid grid-cols-1 items-center gap-8 lg:grid-cols-[1fr_auto] lg:gap-16`}
        >
          <div className="min-w-0">
            <h2 className="mb-2 font-display text-3xl font-normal leading-tight text-ink md:text-[32px]">
              Cartas de la librería
            </h2>
            <p className="max-w-[56ch] text-[14.5px] leading-relaxed text-foreground/75">
              Una vez por mes: novedades, recomendados de los libreros y avisos de reposición de
              papelería. Sin spam.
            </p>
          </div>
          <NewsletterForm />
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
      <div
        className={`${pageShell} grid grid-cols-1 gap-10 pb-8 pt-12 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr] lg:gap-12 lg:pt-14`}
      >
        <div className="min-w-0">
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
          <div key={col.title} className="ui-text flex min-w-0 flex-col gap-2.5">
            <span className="mb-1 text-[10.5px] uppercase tracking-[0.2em] text-gold">
              {col.title}
            </span>
            {col.links.map((link) => (
              <a
                key={link}
                href="#destacados"
                className="text-[13px] text-foreground hover:text-primary"
              >
                {link}
              </a>
            ))}
          </div>
        ))}
      </div>
      <div
        className={`${pageShell} ui-text flex flex-col gap-3 border-t border-rule pb-8 pt-4 text-[11.5px] text-muted-foreground md:flex-row md:items-center md:justify-between`}
      >
        <span>© 2026 Librería Callao · Buenos Aires, Argentina</span>
        <div className="flex flex-wrap gap-x-5 gap-y-1">
          <span>Precios en pesos argentinos (ARS), IVA incluido</span>
          <a href="#" className="hover:text-ink">
            Términos
          </a>
          <a href="#" className="hover:text-ink">
            Privacidad
          </a>
        </div>
      </div>
    </footer>
  );
}
