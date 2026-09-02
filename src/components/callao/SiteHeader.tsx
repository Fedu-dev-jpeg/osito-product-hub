import { useState } from "react";
import { Heart, Menu, Search, ShoppingBag, X } from "lucide-react";
import { navLinks } from "./data";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="relative z-20 border-b border-rule bg-background">
      <div className="mx-auto flex max-w-[1240px] flex-col gap-4 px-5 py-5 md:px-12 md:py-6 lg:grid lg:grid-cols-[auto_1fr_auto] lg:items-center lg:gap-12">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="font-display text-xl font-medium leading-none tracking-[0.13em] text-primary md:text-[27px]">
              LIBRERÍA CALLAO
            </span>
            <span className="ui-text text-[9.5px] uppercase tracking-[0.24em] text-sepia">
              Libros y papelería · Buenos Aires
            </span>
          </div>
          <button
            type="button"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            onClick={() => setOpen((v) => !v)}
            className="rounded-sm border border-rule p-2 text-ink lg:hidden"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <div className="flex h-11 w-full max-w-[520px] items-center gap-2.5 justify-self-center rounded-sm border border-ink/20 bg-card px-3.5">
          <Search size={17} className="text-sepia" strokeWidth={1.6} />
          <span className="ui-text flex-1 text-sm text-muted-foreground">Buscar productos…</span>
          <span className="ui-text hidden rounded-sm border border-ink/15 px-1.5 py-0.5 text-[10px] tracking-[0.1em] text-muted-foreground sm:block">
            ⌘K
          </span>
        </div>

        <div className="ui-text hidden items-center gap-5 lg:flex">
          <a href="#" className="flex items-center gap-2 text-[13px] text-ink">
            <Heart size={19} strokeWidth={1.5} />
            <span>Favoritos</span>
          </a>
          <div className="h-5 w-px bg-ink/15" />
          <a href="#" className="flex items-center gap-2.5 text-[13px] text-ink">
            <span className="relative block">
              <ShoppingBag size={20} strokeWidth={1.5} />
              <span className="absolute -right-2 -top-2 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-primary px-1 text-[10.5px] font-semibold text-primary-foreground">
                3
              </span>
            </span>
            <span>Carrito</span>
            <span className="text-sepia">$41.650</span>
          </a>
        </div>
      </div>

      <nav className="ui-text mx-auto hidden max-w-[1240px] items-center justify-between px-12 pb-4 lg:flex">
        <div className="flex items-center gap-8">
          {navLinks.map((link, i) => (
            <a
              key={link}
              href="#"
              className={`border-b-2 pb-1 text-[13.5px] uppercase tracking-[0.1em] transition-colors ${
                i === 0
                  ? "border-primary text-ink"
                  : "border-transparent text-foreground hover:border-gold hover:text-ink"
              }`}
            >
              {link}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-6 text-[12.5px] text-sepia">
          <a href="#" className="hover:text-ink">Novedades</a>
          <a href="#" className="hover:text-ink">Regalos</a>
          <a href="#" className="text-ink">Mi cuenta</a>
        </div>
      </nav>

      {open && (
        <nav className="ui-text flex flex-col gap-1 border-t border-rule px-5 py-4 lg:hidden">
          {[...navLinks, "Novedades", "Regalos", "Mi cuenta"].map((link) => (
            <a
              key={link}
              href="#"
              className="border-b border-rule py-2.5 text-[13.5px] uppercase tracking-[0.1em] text-ink last:border-0"
            >
              {link}
            </a>
          ))}
          <div className="mt-2 flex items-center gap-5 text-[13px] text-ink">
            <span className="flex items-center gap-2"><Heart size={17} strokeWidth={1.5} /> Favoritos</span>
            <span className="flex items-center gap-2"><ShoppingBag size={17} strokeWidth={1.5} /> Carrito · $41.650</span>
          </div>
        </nav>
      )}
    </header>
  );
}
