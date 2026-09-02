import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { Heart, Menu, Search, ShoppingBag, X } from "lucide-react";
import { formatARS, navLinkToGroup, navLinks, pageShell, scrollToProducts } from "./data";
import { useCallao } from "./callao-store";
import { CartSheet } from "./CartSheet";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const {
    cartCount,
    cartTotal,
    setCartOpen,
    searchQuery,
    setSearchQuery,
    trackSearch,
    setActiveGroup,
    activeGroup,
  } = useCallao();

  const onSearch = (event: FormEvent) => {
    event.preventDefault();
    trackSearch(searchQuery);
    scrollToProducts();
    setOpen(false);
  };

  const onNav = (link: string) => {
    setActiveGroup(navLinkToGroup(link));
    setSearchQuery("");
    scrollToProducts();
    setOpen(false);
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
            <span className="ui-text text-[9.5px] uppercase tracking-[0.24em] text-sepia">
              Libros y papelería · Buenos Aires
            </span>
          </Link>
          <button
            type="button"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            onClick={() => setOpen((v) => !v)}
            className="rounded-sm border border-rule p-2 text-ink lg:hidden"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <form
          onSubmit={onSearch}
          className="flex h-11 w-full max-w-[520px] items-center gap-2.5 justify-self-center rounded-sm border border-ink/20 bg-card px-3.5"
        >
          <Search size={17} className="shrink-0 text-sepia" strokeWidth={1.6} />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onBlur={() => {
              if (searchQuery.trim()) trackSearch(searchQuery);
            }}
            placeholder="Buscar productos…"
            aria-label="Buscar productos"
            className="ui-text min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-muted-foreground"
          />
          <kbd className="ui-text hidden rounded-sm border border-ink/15 px-1.5 py-0.5 text-[10px] tracking-[0.1em] text-muted-foreground sm:block">
            ⌘K
          </kbd>
        </form>

        <div className="ui-text hidden items-center gap-5 lg:flex">
          <span className="flex items-center gap-2 text-[13px] text-ink">
            <Heart size={19} strokeWidth={1.5} />
            <span>Favoritos</span>
          </span>
          <div className="h-5 w-px bg-ink/15" />
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="flex items-center gap-2.5 text-[13px] text-ink"
          >
            <span className="relative block">
              <ShoppingBag size={20} strokeWidth={1.5} />
              {cartCount > 0 ? (
                <span className="absolute -right-2 -top-2 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-primary px-1 text-[10.5px] font-semibold text-primary-foreground">
                  {cartCount}
                </span>
              ) : null}
            </span>
            <span>Carrito</span>
            <span className="text-sepia">{formatARS(cartTotal)}</span>
          </button>
        </div>
      </div>

      <nav className={`${pageShell} ui-text hidden items-center justify-between pb-4 lg:flex`}>
        <div className="flex min-w-0 flex-wrap items-center gap-x-8 gap-y-2">
          {navLinks.map((link) => {
            const active = activeGroup === navLinkToGroup(link);
            return (
              <button
                key={link}
                type="button"
                onClick={() => onNav(link)}
                className={`border-b-2 pb-1 text-[13.5px] uppercase tracking-[0.1em] transition-colors ${
                  active
                    ? "border-primary text-ink"
                    : "border-transparent text-foreground hover:border-gold hover:text-ink"
                }`}
              >
                {link}
              </button>
            );
          })}
        </div>
        <div className="flex shrink-0 items-center gap-6 text-[12.5px] text-sepia">
          <button
            type="button"
            className="hover:text-ink"
            onClick={() => {
              setActiveGroup("Todos");
              scrollToProducts();
            }}
          >
            Novedades
          </button>
          <span className="hover:text-ink">Regalos</span>
          <Link to="/admin/" className="text-ink hover:text-primary">
            Mi cuenta
          </Link>
        </div>
      </nav>

      {open ? (
        <nav className="ui-text flex flex-col gap-1 border-t border-rule px-4 py-4 sm:px-6 lg:hidden">
          {navLinks.map((link) => (
            <button
              key={link}
              type="button"
              onClick={() => onNav(link)}
              className="border-b border-rule py-2.5 text-left text-[13.5px] uppercase tracking-[0.1em] text-ink"
            >
              {link}
            </button>
          ))}
          <Link
            to="/admin/"
            className="border-b border-rule py-2.5 text-[13.5px] uppercase tracking-[0.1em] text-ink"
            onClick={() => setOpen(false)}
          >
            Mi cuenta
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-5 text-[13px] text-ink">
            <span className="flex items-center gap-2">
              <Heart size={17} strokeWidth={1.5} /> Favoritos
            </span>
            <button
              type="button"
              className="flex items-center gap-2"
              onClick={() => {
                setCartOpen(true);
                setOpen(false);
              }}
            >
              <ShoppingBag size={17} strokeWidth={1.5} /> Carrito · {formatARS(cartTotal)}
              {cartCount > 0 ? ` (${cartCount})` : ""}
            </button>
          </div>
        </nav>
      ) : null}

      <CartSheet />
    </header>
  );
}
