import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Heart, Menu, Search, ShoppingBag, X } from "lucide-react";
import { formatARS, navLinks } from "./data";
import { setCategory, setQuery, track, useShop } from "@/lib/shop-store";

const navCategoryMap: Record<string, string> = {
  Librería: "Libros",
  Escolar: "Escolar",
  Oficina: "Escritura",
  Papelería: "Papelería",
  Agendas: "Agendas",
};

function scrollToProducts() {
  document.getElementById("destacados")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { cart, favorites, query, category } = useShop();
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const handleNav = (label: string) => {
    setCategory(navCategoryMap[label] ?? label);
    setOpen(false);
    scrollToProducts();
  };

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

        <div className="flex h-11 w-full max-w-[520px] items-center gap-2.5 justify-self-center rounded-sm border border-ink/20 bg-card px-3.5 focus-within:border-gold">
          <Search size={17} className="shrink-0 text-sepia" strokeWidth={1.6} />
          <input
            type="search"
            value={query}
            aria-label="Buscar productos"
            placeholder="Buscar productos…"
            onChange={(e) => {
              setQuery(e.target.value);
              if (e.target.value.trim()) scrollToProducts();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                track("search", { query });
                scrollToProducts();
              }
            }}
            className="ui-text min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-muted-foreground"
          />
          <span className="ui-text hidden rounded-sm border border-ink/15 px-1.5 py-0.5 text-[10px] tracking-[0.1em] text-muted-foreground sm:block">
            ⌘K
          </span>
        </div>

        <div className="ui-text hidden items-center gap-5 lg:flex">
          <button
            type="button"
            onClick={() => {
              scrollToProducts();
              track("favorites_view");
            }}
            className="flex items-center gap-2 text-[13px] text-ink"
          >
            <Heart size={19} strokeWidth={1.5} />
            <span>Favoritos ({favorites.length})</span>
          </button>
          <div className="h-5 w-px bg-ink/15" />
          <button
            type="button"
            onClick={() => track("cart_view", { items: cartCount, total: cartTotal })}
            className="flex items-center gap-2.5 text-[13px] text-ink"
          >
            <span className="relative block">
              <ShoppingBag size={20} strokeWidth={1.5} />
              <span className="absolute -right-2 -top-2 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-primary px-1 text-[10.5px] font-semibold text-primary-foreground">
                {cartCount}
              </span>
            </span>
            <span>Carrito</span>
            <span className="text-sepia">{formatARS(cartTotal)}</span>
          </button>
        </div>
      </div>

      <nav className="ui-text mx-auto hidden max-w-[1240px] items-center justify-between px-12 pb-4 lg:flex">
        <div className="flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link}
              type="button"
              onClick={() => handleNav(link)}
              className={`border-b-2 pb-1 text-[13.5px] uppercase tracking-[0.1em] transition-colors ${
                category === navCategoryMap[link]
                  ? "border-primary text-ink"
                  : "border-transparent text-foreground hover:border-gold hover:text-ink"
              }`}
            >
              {link}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-6 text-[12.5px] text-sepia">
          <button
            type="button"
            onClick={() => {
              setCategory("Todos");
              track("novedades_view");
              scrollToProducts();
            }}
            className="hover:text-ink"
          >
            Novedades
          </button>
          <button
            type="button"
            onClick={() => {
              track("regalos_view");
              scrollToProducts();
            }}
            className="hover:text-ink"
          >
            Regalos
          </button>
          <Link to="/admin" className="text-ink">
            Mi cuenta
          </Link>
        </div>
      </nav>

      {open && (
        <nav className="ui-text flex flex-col gap-1 border-t border-rule px-5 py-4 lg:hidden">
          {navLinks.map((link) => (
            <button
              key={link}
              type="button"
              onClick={() => handleNav(link)}
              className="border-b border-rule py-2.5 text-left text-[13.5px] uppercase tracking-[0.1em] text-ink"
            >
              {link}
            </button>
          ))}
          <Link
            to="/admin"
            onClick={() => setOpen(false)}
            className="py-2.5 text-[13.5px] uppercase tracking-[0.1em] text-ink"
          >
            Mi cuenta
          </Link>
          <div className="mt-2 flex items-center gap-5 text-[13px] text-ink">
            <span className="flex items-center gap-2">
              <Heart size={17} strokeWidth={1.5} /> Favoritos ({favorites.length})
            </span>
            <span className="flex items-center gap-2">
              <ShoppingBag size={17} strokeWidth={1.5} /> Carrito · {formatARS(cartTotal)}
            </span>
          </div>
        </nav>
      )}
    </header>
  );
}
