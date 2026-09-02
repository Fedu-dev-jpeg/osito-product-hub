import { pageShell } from "./data";
import { branches, INSTAGRAM_HANDLE, INSTAGRAM_URL, SITE_NAME, SITE_TAGLINE } from "@/lib/site";
import { track, useShop } from "@/lib/shop-store";

export function SiteFooter() {
  const { settings } = useShop();
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-[2] bg-secondary pb-16 md:pb-0">
      <div
        className={`${pageShell} grid grid-cols-1 gap-10 pb-8 pt-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr] lg:gap-12 lg:pt-14`}
      >
        <div className="min-w-0">
          <span className="mb-2 block font-display text-xl font-medium tracking-[0.13em] text-primary">
            {SITE_NAME.toUpperCase()}
          </span>
          <p className="ui-text mb-4 text-[11px] uppercase tracking-[0.14em] text-gold">
            {settings.tagline || SITE_TAGLINE}
          </p>
          <p className="max-w-[36ch] text-[13px] leading-[1.7] text-foreground/75">
            Recoleta · CABA
            <br />
            Tres sucursales para estudiar, trabajar y crear.
          </p>
        </div>
        <div className="ui-text flex min-w-0 flex-col gap-2.5">
          <span className="mb-1 text-[10.5px] uppercase tracking-[0.2em] text-gold">Sucursales</span>
          {branches.map((branch) => (
            <a
              key={branch.id}
              href={`/#${branch.id}`}
              className="text-[13px] text-foreground hover:text-primary"
            >
              {branch.address}
            </a>
          ))}
        </div>
        <div className="ui-text flex min-w-0 flex-col gap-2.5">
          <span className="mb-1 text-[10.5px] uppercase tracking-[0.2em] text-gold">Contacto</span>
          <a
            href={settings.instagramUrl || INSTAGRAM_URL}
            target="_blank"
            rel="noreferrer"
            onClick={() => track("instagram_click", { source: "footer" })}
            className="text-[13px] text-foreground hover:text-primary"
          >
            Instagram {INSTAGRAM_HANDLE}
          </a>
          {settings.facebookUrl ? (
            <a
              href={settings.facebookUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() => track("facebook_click", { source: "footer" })}
              className="text-[13px] text-foreground hover:text-primary"
            >
              Facebook: Librería Callao
            </a>
          ) : (
            <span className="text-[13px] text-foreground">Facebook: Librería Callao</span>
          )}
          <a
            href={`mailto:${settings.email}`}
            className="text-[13px] text-foreground hover:text-primary"
          >
            {settings.email}
          </a>
          <a href="/lista-escolar" className="text-[13px] text-foreground hover:text-primary">
            Lista escolar
          </a>
          <a href="/productos" className="text-[13px] text-foreground hover:text-primary">
            Productos
          </a>
        </div>
      </div>
      <div
        className={`${pageShell} ui-text flex flex-col gap-3 border-t border-rule pb-8 pt-4 text-[11.5px] text-muted-foreground md:flex-row md:items-center md:justify-between`}
      >
        <span>
          © {year} {settings.legalName} · CUIT {settings.cuit}
        </span>
        <span>Recoleta · Ciudad Autónoma de Buenos Aires</span>
      </div>
    </footer>
  );
}
