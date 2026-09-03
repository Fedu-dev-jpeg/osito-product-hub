import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SiteFooter } from "@/components/callao/SiteFooter";
import { SiteHeader } from "@/components/callao/SiteHeader";
import { MobileStickyCta, WhatsAppFloat } from "@/components/callao/WhatsAppFloat";
import { pageShell } from "@/components/callao/data";
import { locationDirectionsUrl, mapsEmbedUrl, type StoreLocation } from "@/lib/locations";
import { SITE_NAME, telHref } from "@/lib/site";
import { track, useShop } from "@/lib/shop-store";
import { whatsappUrl } from "@/lib/whatsapp";

type Search = { local?: string };

export const Route = createFileRoute("/sucursales")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    ...(typeof search["local"] === "string" && search["local"] ? { local: search["local"] } : {}),
  }),
  head: () => ({
    meta: [
      { title: `Sucursales | ${SITE_NAME}` },
      {
        name: "description",
        content: `Tres sucursales de ${SITE_NAME} en Recoleta: Av. Callao 1588, Av. Callao 1377 y Ayacucho 1762. Horarios, teléfono y mapa.`,
      },
    ],
    links: [{ rel: "canonical", href: "/sucursales" }],
  }),
  component: SucursalesPage,
});

function SucursalesPage() {
  const { local } = Route.useSearch();
  const { locations, settings } = useShop();
  const active = locations.filter((item) => item.active);
  const selected = useMemo(
    () => active.find((item) => item.id === local) ?? active[0] ?? null,
    [active, local],
  );
  const [focused, setFocused] = useState<StoreLocation | null>(selected);

  useEffect(() => {
    setFocused(selected);
  }, [selected]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash === "#mapa") {
      document.getElementById("mapa")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [local]);

  const embed = focused ? mapsEmbedUrl(focused) : "";
  const reviews = active.filter((item) => item.reviewUrl);

  return (
    <div className="grain min-h-screen bg-background text-foreground">
      <div className="ui-text bg-ink px-4 py-2 text-center text-[11.5px] uppercase tracking-[0.08em] text-parchment">
        3 sucursales en Recoleta · Escolar · Comercial · Artística
      </div>
      <SiteHeader />
      <main>
        <section className="relative z-[2] border-b border-rule">
          <div className={`${pageShell} py-12 md:py-16`}>
            <span className="eyebrow mb-3 block">Recoleta · CABA</span>
            <h1 className="font-display text-4xl font-normal leading-none tracking-[-0.01em] text-ink md:text-[44px]">
              Nuestras sucursales
            </h1>
            <p className="mt-4 max-w-[58ch] text-[15.5px] leading-relaxed text-foreground/80">
              Tres locales en Recoleta. Elegí una sucursal para verla en el mapa de esta página. Si
              necesitás la ruta, usá Cómo llegar.
            </p>
          </div>
        </section>

        <section className={`${pageShell} relative z-[2] py-10 md:py-14`}>
          {active.length === 0 ? (
            <div className="rounded-md border border-rule bg-card px-6 py-10">
              <p className="font-display text-2xl text-ink">No hay sucursales publicadas</p>
              <a
                href={whatsappUrl({ kind: "home" }, settings.whatsapp)}
                className="ui-text mt-4 inline-flex min-h-11 items-center text-primary"
              >
                Consultanos por WhatsApp
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:items-start">
              <div className="space-y-3">
                {active.map((branch) => {
                  const on = focused?.id === branch.id;
                  return (
                    <article
                      key={branch.id}
                      id={branch.id}
                      className={`rounded-md border p-5 transition-colors ${
                        on ? "border-gold bg-card shadow-sm" : "border-rule bg-card"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="ui-text text-[10.5px] uppercase tracking-[0.18em] text-gold">
                            {branch.neighborhood}
                          </p>
                          <h2 className="font-display mt-1 text-2xl text-ink">{branch.name}</h2>
                        </div>
                        {on ? (
                          <span className="ui-text rounded-sm bg-ink px-2 py-1 text-[10px] uppercase tracking-wider text-parchment">
                            En mapa
                          </span>
                        ) : null}
                      </div>
                      <ul className="mt-4 space-y-1 text-[13.5px] leading-relaxed text-foreground/80">
                        <li>{branch.address}</li>
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
                              onClick={() =>
                                track("click_phone", { store: branch.address, secondary: true })
                              }
                              className="text-primary hover:underline"
                            >
                              {branch.secondaryPhoneDisplay}
                            </a>
                          </li>
                        ) : null}
                      </ul>
                      <div className="mt-4 flex flex-col gap-2">
                        <Link
                          to="/sucursales"
                          search={{ local: branch.id }}
                          hash="mapa"
                          onClick={() => {
                            setFocused(branch);
                            track("select_store", { store: branch.address, source: "sucursales" });
                          }}
                          className={`ui-text inline-flex min-h-11 items-center justify-center rounded-sm px-4 text-[12px] uppercase tracking-[0.08em] ${
                            on
                              ? "bg-primary text-primary-foreground"
                              : "border border-ink/20 text-ink"
                          }`}
                        >
                          Ver mapa
                        </Link>
                        <a
                          href={locationDirectionsUrl(branch)}
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => track("click_maps", { store: branch.address, source: "directions" })}
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
                              href={whatsappUrl({ kind: "branch", address: branch.address }, settings.whatsapp)}
                              target="_blank"
                              rel="noreferrer"
                              onClick={() => track("click_whatsapp", { store: branch.address })}
                              className="ui-text inline-flex min-h-11 items-center justify-center rounded-sm border border-ink/20 px-3 text-[12px] uppercase tracking-[0.08em] text-ink"
                            >
                              WhatsApp
                            </a>
                          ) : (
                            <span className="ui-text inline-flex min-h-11 items-center justify-center px-3 text-[12px] uppercase tracking-[0.08em] text-muted-foreground">
                              Sin WhatsApp
                            </span>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              <div id="mapa" className="scroll-mt-24">
                <div className="overflow-hidden rounded-md border border-rule bg-muted">
                  {embed ? (
                    <iframe
                      title={focused ? `Mapa de ${focused.name}` : "Mapa de sucursales"}
                      src={embed}
                      className="h-[260px] w-full border-0 md:h-[340px] lg:h-[520px]"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      allowFullScreen
                    />
                  ) : (
                    <div className="flex h-[260px] items-center justify-center p-6 text-sm text-muted-foreground lg:h-[520px]">
                      El mapa no está disponible.
                    </div>
                  )}
                </div>
                {focused ? (
                  <p className="mt-3 text-sm text-muted-foreground">
                    {focused.name} · {focused.address}. {focused.weekdayHours}. {focused.saturdayHours}.
                  </p>
                ) : null}
                <p className="mt-2 text-xs text-muted-foreground">
                  El mapa está integrado en el sitio (Google Maps Embed, sin clave pública). Cómo llegar
                  abre Google Maps con la ruta.
                </p>
              </div>
            </div>
          )}

          {reviews.length ? (
            <div className="mt-12 rounded-md border border-rule bg-card p-6">
              <h2 className="font-display text-2xl text-ink">Reseñas en Google</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Enlaces a la ficha de cada sucursal, únicamente cuando está confirmada.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {reviews.map((branch) => (
                  <a
                    key={branch.id}
                    href={branch.reviewUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="ui-text inline-flex min-h-10 items-center rounded-sm border border-ink/20 px-4 text-[12px] uppercase tracking-[0.08em] text-ink"
                  >
                    Reseñas {branch.name}
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      </main>
      <SiteFooter />
      <WhatsAppFloat context={{ kind: "home" }} />
      <MobileStickyCta />
    </div>
  );
}
