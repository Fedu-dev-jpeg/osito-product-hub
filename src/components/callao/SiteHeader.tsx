import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Heart, Menu, Search, ShoppingBag, X } from "lucide-react";
import { formatARS, navLinks, pageShell } from "./data";
import { useAuth } from "@/lib/auth";
import { setCategory, setQuery, track, useShop } from "@/lib/shop-store";
import { CartSheet } from "./CartSheet";

const navCategoryMap: Record<string, string> = {
  Productos: "Todos",
  Librería: "Libros",
  Escolar: "Escolar",
  Oficina: "Escritura",
  Papelería: "Papelería",
  Agendas: "Agendas",
};

function AccountLink({ className, onClick }: { className?: string; onClick?: () => void }) {
  const { session, profile } = useAuth();
  if (!session || !profile) {
    return (
      <Link to="/auth" onClick={onClick} className={className}>
        Mi cuenta
      </Link>
    );
  }
  if (profile.role === "admin") {
    return (
      <Link to="/admin" onClick={onClick} className={className}>
        Admin
      </Link>
    );
  }
  if (profile.role === "vendedor") {
    return (
      <Link to="/vendedor" onClick={onClick} className={className}>
        Vendedor
      </Link>
    );
  }
  return (
    <Link to="/cuenta" onClick={onClick} className={className}>
      Cuenta
    </Link>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const navigate = useNavigate();
  const { cart, favorites, query, category } = useShop();
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const goToCollection = (nextCategory: string, nextQuery = "") => {
    setCategory(nextCategory);
    setQuery(nextQuery);
    setOpen(false);
    const search = nextCategory && nextCategory !== "Todos" ? { categoria: nextCategory } : {};
    void navigate({
      to: "/productos",
      search: nextQuery ? { ...search, q: nextQuery } : search,
    });
  };

  const handleNav = (label: string) => {
    goToCollection(navCategoryMap[label] ?? "Todos");
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

        <div className="flex h-11 w-full max-w-[520px] items-center gap-2.5 justify-self-center rounded-sm border border-ink/20 bg-card px-3.5 focus-within:border-gold">
          <Search size={17} className="shrink-0 text-sepia" strokeWidth={1.6} />
          <input
            type="search"
            value={query}
            aria-label="Buscar productos"
            placeholder="Buscar productos…"
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                track("search", { query });
                goToCollection(category || "Todos", query.trim());
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
              goToCollection("Todos");
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
            onClick={() => {
              setCartOpen(true);
              track("cart_view", { items: cartCount, total: cartTotal });
            }}
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
          {navLinks.map((link) => (
            <button
              key={link}
              type="button"
              onClick={() => handleNav(link)}
              className={`border-b-2 pb-1 text-[13.5px] uppercase tracking-[0.1em] transition-colors ${
                (link === "Productos" && category === "Todos") || category === navCategoryMap[link]
                  ? "border-primary text-ink"
                  : "border-transparent text-foreground hover:border-gold hover:text-ink"
              }`}
            >
              {link}
            </button>
          ))}
        </div>
        <div className="flex shrink-0 items-center gap-6 text-[12.5px] text-sepia">
          <button
            type="button"
            onClick={() => {
              track("novedades_view");
              goToCollection("Todos");
            }}
            className="hover:text-ink"
          >
            Novedades
          </button>
          <AccountLink className="text-ink hover:text-primary" />
        </div>
      </nav>

      {open ? (
        <nav className="ui-text flex flex-col gap-1 border-t border-rule px-4 py-4 sm:px-6 lg:hidden">
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
          <AccountLink
            onClick={() => setOpen(false)}
            className="border-b border-rule py-2.5 text-[13.5px] uppercase tracking-[0.1em] text-ink"
          />
          <div className="mt-2 flex flex-wrap items-center gap-5 text-[13px] text-ink">
            <span className="flex items-center gap-2">
              <Heart size={17} strokeWidth={1.5} /> Favoritos ({favorites.length})
            </span>
            <button
              type="button"
              className="flex items-center gap-2"
              onClick={() => {
                setCartOpen(true);
                setOpen(false);
                track("cart_view", { items: cartCount, total: cartTotal });
              }}
            >
              <ShoppingBag size={17} strokeWidth={1.5} /> Carrito · {formatARS(cartTotal)}
              {cartCount > 0 ? ` (${cartCount})` : ""}
            </button>
          </div>
        </nav>
      ) : null}

      <CartSheet open={cartOpen} onOpenChange={setCartOpen} />
    </header>
  );
}
