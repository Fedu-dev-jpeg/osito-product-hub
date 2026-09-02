import { Link } from "@tanstack/react-router";
import type { UserRole } from "@/lib/auth";
import { useAuth } from "@/lib/auth";

export function RequireAuth({
  role,
  loginTo = "/auth",
  children,
}: {
  role?: UserRole;
  loginTo?: "/auth" | "/admin/login";
  children: React.ReactNode;
}) {
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
    if (typeof window !== "undefined") {
      const target = `${loginTo}?next=${encodeURIComponent(next)}`;
      window.location.replace(target);
    }
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Redirigiendo…
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
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return children;
}
