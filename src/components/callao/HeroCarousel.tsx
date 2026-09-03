import { useEffect, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, MessageCircle, Pause, Play } from "lucide-react";
import { Link } from "@tanstack/react-router";
import heroImg from "@/assets/hero-papeleria.webp";
import p2 from "@/assets/p2.jpg";
import p3 from "@/assets/p3.jpg";
import p5 from "@/assets/p5.jpg";
import { pageShell } from "./data";
import type { HeroSlide } from "@/lib/hero";
import { track, useShop } from "@/lib/shop-store";
import { whatsappUrl } from "@/lib/whatsapp";

const FALLBACK: HeroSlide[] = [
  {
    id: "default-1",
    eyebrow: "3 sucursales en Recoleta",
    title: "Todo para estudiar, trabajar y crear",
    description:
      "Librería escolar, comercial y artística. Papelería, escritura, oficina, impresión y mucho más en tres sucursales de Recoleta.",
    ctaLabel: "Ver productos",
    ctaUrl: "/productos",
    secondaryCtaLabel: "Consultar por WhatsApp",
    secondaryCtaUrl: "whatsapp",
    imageUrl: heroImg,
    active: true,
    sortOrder: 1,
  },
  {
    id: "default-2",
    eyebrow: "Lista escolar",
    title: "Todo para la vuelta al cole",
    description: "Mandanos tu lista y te ayudamos a encontrar lo que necesitás en nuestras sucursales.",
    ctaLabel: "Enviar lista",
    ctaUrl: "/lista-escolar",
    secondaryCtaLabel: "Consultar por WhatsApp",
    secondaryCtaUrl: "whatsapp-school",
    imageUrl: p2,
    active: true,
    sortOrder: 2,
  },
  {
    id: "default-3",
    eyebrow: "Artística y escritura",
    title: "Escritura, arte y creatividad",
    description: "Materiales para dibujo, pintura, escritura y proyectos en tres sucursales de Recoleta.",
    ctaLabel: "Ver artística",
    ctaUrl: "/productos?categoria=Artística",
    secondaryCtaLabel: "Ver escritura",
    secondaryCtaUrl: "/productos?categoria=Escritura",
    imageUrl: p3,
    active: true,
    sortOrder: 3,
  },
  {
    id: "default-4",
    eyebrow: "Recoleta · CABA",
    title: "Tres sucursales en Recoleta",
    description: "Av. Callao 1588, Av. Callao 1377 y Ayacucho 1762. Lun a vie 9 a 20. Sábados a la mañana.",
    ctaLabel: "Ver sucursales",
    ctaUrl: "/sucursales",
    secondaryCtaLabel: "Cómo llegar",
    secondaryCtaUrl: "/sucursales#mapa",
    imageUrl: p5,
    active: true,
    sortOrder: 4,
  },
];

const SLIDE_MS = 3000;

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const { settings } = useShop();
  const items = slides.length ? slides : FALLBACK;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [touchX, setTouchX] = useState<number | null>(null);
  const current: HeroSlide = items[index] ?? items[0] ?? {
    id: "default-1",
    eyebrow: "3 sucursales en Recoleta",
    title: "Todo para estudiar, trabajar y crear",
    description:
      "Librería escolar, comercial y artística. Papelería, escritura, oficina, impresión y mucho más en tres sucursales de Recoleta.",
    ctaLabel: "Ver productos",
    ctaUrl: "/productos",
    secondaryCtaLabel: "Consultar por WhatsApp",
    secondaryCtaUrl: "whatsapp",
    imageUrl: heroImg,
    active: true,
    sortOrder: 1,
  };
  const reduced = prefersReducedMotion();

  useEffect(() => {
    setPaused(false);
    setIndex(0);
  }, []);

  useEffect(() => {
    if (reduced || paused || items.length < 2) return;

    let timer = 0;
    const start = () => {
      window.clearInterval(timer);
      if (typeof document !== "undefined" && document.hidden) return;
      timer = window.setInterval(() => {
        setIndex((value) => (value + 1) % items.length);
      }, SLIDE_MS);
    };

    start();
    document.addEventListener("visibilitychange", start);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", start);
    };
  }, [items.length, paused, reduced]);

  const go = (next: number) => {
    setIndex((next + items.length) % items.length);
  };

  const ctaHref = (url: string) => {
    if (url === "whatsapp") return whatsappUrl({ kind: "home" }, settings.whatsapp);
    if (url === "whatsapp-school") return whatsappUrl({ kind: "school" }, settings.whatsapp);
    return url;
  };

  return (
    <section
      className="relative z-[2] border-b border-rule"
      aria-roledescription="carousel"
      aria-label="Destacados"
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") go(index - 1);
        if (event.key === "ArrowRight") go(index + 1);
      }}
    >
      <div className={`${pageShell} grid grid-cols-1 lg:grid-cols-2`}>
        <div className="flex min-w-0 flex-col justify-center py-12 sm:py-14 lg:border-r lg:border-rule lg:py-20 lg:pr-12">
          <div key={current.id} className={reduced ? "" : "hero-fade"}>
            {current.eyebrow ? <span className="eyebrow mb-5 block">{current.eyebrow}</span> : null}
            <h1 className="mb-6 font-display text-[34px] font-normal leading-[1.04] tracking-[-0.015em] text-pretty text-ink sm:text-5xl lg:text-6xl">
              {current.title}
            </h1>
            {current.description ? (
              <p className="mb-8 max-w-[42ch] text-base leading-[1.72] text-pretty text-foreground/80 md:text-[16.5px]">
                {current.description}
              </p>
            ) : null}
            <div className="flex flex-wrap items-center gap-4">
              <LinkOrA
                href={ctaHref(current.ctaUrl)}
                className="ui-text inline-flex min-h-12 items-center gap-2.5 rounded-sm bg-primary px-7 py-3.5 text-sm uppercase tracking-[0.08em] text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {current.ctaLabel || "Ver productos"}
                <ArrowRight size={16} strokeWidth={1.7} />
              </LinkOrA>
              {current.secondaryCtaLabel ? (
                <LinkOrA
                  href={ctaHref(current.secondaryCtaUrl)}
                  onClick={() => {
                    if (current.secondaryCtaUrl.startsWith("whatsapp")) {
                      track("click_whatsapp", { source: "hero" });
                    }
                  }}
                  className="ui-text inline-flex min-h-12 items-center gap-2 border-b border-ink/35 pb-0.5 text-sm text-ink transition-colors hover:border-gold hover:text-primary"
                >
                  {current.secondaryCtaUrl.startsWith("whatsapp") ? <MessageCircle size={16} /> : null}
                  {current.secondaryCtaLabel}
                </LinkOrA>
              ) : null}
            </div>
          </div>
          <div className="ui-text mt-10 flex flex-wrap items-center gap-4 border-t border-rule pt-6 text-[11.5px] tracking-[0.05em] text-sepia">
            <span>3 sucursales en Recoleta</span>
            <span>Gran variedad de marcas</span>
            <span>Atención personalizada</span>
          </div>
        </div>
        <div className="flex min-w-0 items-center pb-12 lg:py-14 lg:pl-12">
          <figure className="relative m-0 w-full">
            <div
              className="plate-color relative aspect-[4/3] w-full overflow-hidden rounded-[2px] lg:aspect-[5/4]"
              onTouchStart={(e) => setTouchX(e.changedTouches[0]?.clientX ?? null)}
              onTouchEnd={(e) => {
                const start = touchX;
                const end = e.changedTouches[0]?.clientX ?? 0;
                if (start != null && Math.abs(end - start) > 40) go(end < start ? index + 1 : index - 1);
                setTouchX(null);
              }}
            >
              {items.map((slide, i) => (
                <img
                  key={slide.id}
                  src={slide.imageUrl || heroImg}
                  alt={slide.title}
                  width={1400}
                  height={933}
                  fetchPriority={i === 0 ? "high" : "low"}
                  loading={i === 0 ? "eager" : "lazy"}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 motion-reduce:transition-none ${
                    i === index ? "opacity-100" : "opacity-0"
                  }`}
                />
              ))}
              {items.length > 1 ? (
                <>
                  <button
                    type="button"
                    aria-label="Imagen anterior"
                    onClick={() => go(index - 1)}
                    className="absolute left-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-card/85 text-ink shadow-sm md:flex"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    aria-label="Imagen siguiente"
                    onClick={() => go(index + 1)}
                    className="absolute right-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-card/85 text-ink shadow-sm md:flex"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              ) : null}
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex gap-1.5" role="tablist" aria-label="Slides del hero">
                {items.map((slide, i) => (
                  <button
                    key={slide.id}
                    type="button"
                    aria-label={`Ir al slide ${i + 1}`}
                    aria-selected={i === index}
                    onClick={() => go(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      i === index ? "w-6 bg-primary" : "w-2 bg-ink/20"
                    }`}
                  />
                ))}
              </div>
              {items.length > 1 && !reduced ? (
                <button
                  type="button"
                  aria-label={paused ? "Reanudar carrusel" : "Pausar carrusel"}
                  onClick={() => setPaused((value) => !value)}
                  className="text-sepia"
                >
                  {paused ? <Play size={14} /> : <Pause size={14} />}
                </button>
              ) : null}
            </div>
          </figure>
        </div>
      </div>
    </section>
  );
}

function LinkOrA({
  href,
  className,
  children,
  onClick,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  if (href.startsWith("http") || href.startsWith("https://wa.me")) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={className} onClick={onClick}>
        {children}
      </a>
    );
  }
  if (href.startsWith("/productos")) {
    const url = new URL(href, "https://libreriacallao.local");
    const categoria = url.searchParams.get("categoria") ?? undefined;
    const marca = url.searchParams.get("marca") ?? undefined;
    const q = url.searchParams.get("q") ?? undefined;
    return (
      <Link
        to="/productos"
        search={{ ...(categoria ? { categoria } : {}), ...(marca ? { marca } : {}), ...(q ? { q } : {}) }}
        className={className}
        onClick={onClick}
      >
        {children}
      </Link>
    );
  }
  if (href.startsWith("/sucursales") || href.startsWith("/lista-escolar")) {
    return (
      <a href={href} className={className} onClick={onClick}>
        {children}
      </a>
    );
  }
  return (
    <a href={href} className={className} onClick={onClick}>
      {children}
    </a>
  );
}
