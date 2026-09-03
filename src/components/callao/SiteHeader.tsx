import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { pageShell } from "./data";
import { SearchBox } from "./SearchBox";
import { navLinks, SITE_TAGLINE } from "@/lib/site";
import { useAuth } from "@/lib/auth";
import { setCategory, setQuery, track, useShop } from "@/lib/shop-store";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { category, settings } = useShop();
  const { session, profile } = useAuth();

  const goToCollection = (nextCategory: string, nextQuery = "") => {
    setCategory(nextCategory || "Todos");
    setQuery(nextQuery);
    setOpen(false);
    const search =
      nextCategory && nextCategory !== "Todos" ? { categoria: nextCategory } : {};
    void navigate({
      to: "/productos",
      search: nextQuery ? { ...search, q: nextQuery } : search,
    });
  };

  return (
    <header className="relative z-20 border-b border-rule bg-background">
      <div
        className={`${pageShell} flex flex-col gap-4 py-5 md:py-6 lg:grid lg:grid-cols-[auto_1fr_auto] lg:items-center lg:gap-8`}
      >
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="flex min-w-0 flex-col gap-1">
            <span className="font-display text-xl font-medium leading-none tracking-[0.13em] text-primary md:text-[27px]">
              LIBRERÍA CALLAO
            </span>
            <span className="ui-text text-[9.5px] uppercase tracking-[0.18em] text-sepia">
              {settings.tagline || SITE_TAGLINE}
            </span>
          </Link>
          <button
            type="button"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="rounded-sm border border-rule p-2.5 text-ink lg:hidden"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <SearchBox />

        <div className="ui-text hidden items-center gap-4 lg:flex">
          <Link
            to="/sucursales"
            className="text-[13px] text-ink hover:text-primary"
            onClick={() => track("select_store", { source: "header" })}
          >
            3 sucursales
          </Link>
          {session && profile?.role === "admin" ? (
            <Link to="/admin" className="text-[13px] text-sepia hover:text-ink">
              Admin
            </Link>
          ) : null}
          {session && profile?.role === "vendedor" ? (
            <Link to="/vendedor" className="text-[13px] text-sepia hover:text-ink">
              Vendedor
            </Link>
          ) : null}
        </div>
      </div>

      <nav
        className={`${pageShell} ui-text hidden items-center justify-between gap-4 pb-4 lg:flex`}
        aria-label="Categorías"
      >
        <div className="flex min-w-0 flex-wrap items-center gap-x-7 gap-y-2">
          {navLinks.map((link) =>
            link.href === "/lista-escolar" ? (
              <Link
                key={link.label}
                to="/lista-escolar"
                className="border-b-2 border-transparent pb-1 text-[13px] uppercase tracking-[0.1em] text-foreground hover:border-gold hover:text-ink"
              >
                {link.label}
              </Link>
            ) : link.href === "/productos" ? (
              link.category && link.category !== "Todos" ? (
                <Link
                  key={link.label}
                  to="/productos"
                  search={{ categoria: link.category }}
                  onClick={() => goToCollection(link.category)}
                  className={`border-b-2 pb-1 text-[13px] uppercase tracking-[0.1em] transition-colors ${
                    category === link.category
                      ? "border-primary text-ink"
                      : "border-transparent text-foreground hover:border-gold hover:text-ink"
                  }`}
                >
                  {link.label}
                </Link>
              ) : (
                <Link
                  key={link.label}
                  to="/productos"
                  onClick={() => goToCollection("Todos")}
                  className={`border-b-2 pb-1 text-[13px] uppercase tracking-[0.1em] transition-colors ${
                    link.label === "Productos" && category === "Todos"
                      ? "border-primary text-ink"
                      : "border-transparent text-foreground hover:border-gold hover:text-ink"
                  }`}
                >
                  {link.label}
                </Link>
              )
            ) : (
              <a
                key={link.label}
                href={link.href}
                className="border-b-2 border-transparent pb-1 text-[13px] uppercase tracking-[0.1em] text-foreground hover:border-gold hover:text-ink"
              >
                {link.label}
              </a>
            ),
          )}
        </div>
      </nav>

      {open ? (
        <nav className="ui-text flex flex-col gap-1 border-t border-rule px-4 py-4 sm:px-6 lg:hidden">
          {navLinks.map((link) =>
            link.category ? (
              <button
                key={link.label}
                type="button"
                onClick={() => goToCollection(link.category)}
                className="min-h-11 border-b border-rule py-2.5 text-left text-[13.5px] uppercase tracking-[0.1em] text-ink"
              >
                {link.label}
              </button>
            ) : (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="flex min-h-11 items-center border-b border-rule py-2.5 text-[13.5px] uppercase tracking-[0.1em] text-ink"
              >
                {link.label}
              </a>
            ),
          )}
        </nav>
      ) : null}
    </header>
  );
}
