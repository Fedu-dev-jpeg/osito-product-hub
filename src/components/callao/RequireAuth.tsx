import { Link } from "@tanstack/react-router";
import type { UserRole } from "@/lib/auth";
import { useAuth } from "@/lib/auth";

export function RequireAuth({ role, children }: { role?: UserRole; children: React.ReactNode }) {
  const { loading, session, profile } = useAuth();
  const next = typeof window === "undefined" ? "/" : window.location.pathname;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Cargando sesión…
      </div>
    );
  }

  if (!session || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md text-center">
          <h1 className="font-display text-3xl text-ink">Necesitás entrar</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Iniciá sesión para ver tus pedidos. Si entras como admin vas al panel de la tienda.
          </p>
          <Link
            to="/auth"
            search={{ next }}
            className="ui-text mt-5 inline-flex rounded-sm bg-primary px-5 py-2.5 text-[13px] uppercase tracking-[0.08em] text-primary-foreground"
          >
            Ir a /auth
          </Link>
        </div>
      </div>
    );
  }

  if (role && profile.role !== role && !(role === "vendedor" && profile.role === "admin")) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md text-center">
          <h1 className="font-display text-3xl text-ink">Sin permiso</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Tu cuenta es {profile.role}. Esta página es para {role}.
          </p>
          <Link to="/" className="ui-text mt-5 inline-block text-primary">
            Volver a la tienda
          </Link>
        </div>
      </div>
    );
  }

  return children;
}
