import { createFileRoute, Link } from "@tanstack/react-router";
import { ProductManager } from "@/components/callao/ProductManager";
import { RequireAuth } from "@/components/callao/RequireAuth";
import { pageShell } from "@/components/callao/data";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/vendedor")({
  head: () => ({
    meta: [{ title: "Vendedor — Librería Callao" }, { name: "robots", content: "noindex" }],
  }),
  component: VendedorPage,
});

function VendedorPage() {
  return (
    <RequireAuth role="vendedor">
      <VendedorDashboard />
    </RequireAuth>
  );
}

function VendedorDashboard() {
  const { profile, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-rule bg-ink text-parchment">
        <div className={`${pageShell} flex flex-wrap items-center justify-between gap-3 py-5`}>
          <div>
            <p className="ui-text text-[10px] uppercase tracking-[0.22em] text-gold-soft">
              Panel vendedor
            </p>
            <h1 className="font-display text-3xl font-normal">Cargar productos</h1>
            <p className="ui-text mt-1 text-[12px] text-parchment/70">{profile?.email}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile?.role === "admin" ? (
              <Link
                to="/admin"
                className="ui-text rounded-sm border border-gold-soft px-4 py-2 text-[12px] uppercase tracking-[0.08em] text-gold-soft"
              >
                Admin
              </Link>
            ) : null}
            <Link
              to="/"
              className="ui-text rounded-sm border border-gold-soft px-4 py-2 text-[12px] uppercase tracking-[0.08em] text-gold-soft"
            >
              Tienda
            </Link>
            <button
              type="button"
              onClick={() => void signOut()}
              className="ui-text rounded-sm bg-primary px-4 py-2 text-[12px] uppercase tracking-[0.08em] text-primary-foreground"
            >
              Salir
            </button>
          </div>
        </div>
      </header>
      <div className={`${pageShell} py-8`}>
        <ProductManager canPublish={false} />
      </div>
    </div>
  );
}
