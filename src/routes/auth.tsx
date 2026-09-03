import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { pageShell } from "@/components/callao/data";
import { homePathForRole, useAuth } from "@/lib/auth";

type AuthSearch = {
  next?: string;
};

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): AuthSearch => {
    const next = typeof search["next"] === "string" ? search["next"] : undefined;
    return next ? { next } : {};
  },
  head: () => ({
    meta: [{ title: "Mi cuenta — Librería Callao" }, { name: "robots", content: "noindex" }],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { next } = Route.useSearch();
  const navigate = useNavigate();
  const { session, profile, loading, signIn, signUp, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<"login" | "signup" | "vendedor">("login");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (loading || !session || !profile) return;
    const fallback = homePathForRole(profile.role);
    const storefront =
      next &&
      (next.startsWith("/checkout") || next.startsWith("/cuenta") || next.startsWith("/productos"));
    if (profile.role === "admin") {
      void navigate({ to: "/admin" });
      return;
    }
    if (profile.role === "vendedor") {
      void navigate({ to: "/vendedor" });
      return;
    }
    if (storefront && next === "/checkout") void navigate({ to: "/checkout" });
    else if (storefront && next === "/cuenta") void navigate({ to: "/cuenta" });
    else if (storefront && next.startsWith("/productos")) void navigate({ to: "/productos" });
    else if (fallback === "/cuenta") void navigate({ to: "/cuenta" });
    else void navigate({ to: "/" });
  }, [loading, session, profile, next, navigate]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const message =
        mode === "login"
          ? await signIn(identifier, password)
          : await signUp(identifier, password, mode === "vendedor" ? "vendedor" : "cliente");
      if (message) setError(message);
    } finally {
      setBusy(false);
    }
  };

  const onGoogle = async () => {
    setBusy(true);
    setError("");
    const message = await signInWithGoogle();
    if (message) {
      setError(message);
      setBusy(false);
    }
  };

  const title =
    mode === "login" ? "Iniciar sesión" : mode === "vendedor" ? "Cuenta vendedor" : "Crear cuenta";

  return (
    <div className="grain min-h-screen bg-background text-foreground">
      <div className={`${pageShell} flex min-h-screen items-center justify-center py-12`}>
        <div className="w-full max-w-md rounded-md border border-rule bg-card p-6 shadow-sm md:p-8">
          <p className="ui-text text-[11px] uppercase tracking-[0.2em] text-gold">Mi cuenta</p>
          <h1 className="mt-2 font-display text-4xl text-ink">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Clientes: pedidos y códigos de descuento. Si entras con usuario <strong>admin</strong>{" "}
            vas al panel de la tienda.
          </p>

          <button
            type="button"
            onClick={() => void onGoogle()}
            disabled={busy}
            className="ui-text mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-sm border border-ink/20 bg-background text-[13px] uppercase tracking-[0.08em] text-ink hover:border-gold disabled:opacity-60"
          >
            Continuar con Google
          </button>

          <div className="ui-text my-5 flex items-center gap-3 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            <span className="h-px flex-1 bg-rule" />
            o con email
            <span className="h-px flex-1 bg-rule" />
          </div>

          <form onSubmit={(e) => void onSubmit(e)} className="flex flex-col gap-3">
            <label className="ui-text text-[12px] text-sepia">
              {mode === "login" ? "Usuario o email" : "Email"}
              <input
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                autoComplete={mode === "login" ? "username" : "email"}
                placeholder={mode === "login" ? "admin o tu@correo.com" : "tu@correo.com"}
                className="mt-1 h-11 w-full rounded-sm border border-ink/20 bg-background px-3 text-sm text-ink outline-none focus:border-gold"
              />
            </label>
            <label className="ui-text text-[12px] text-sepia">
              Contraseña
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                className="mt-1 h-11 w-full rounded-sm border border-ink/20 bg-background px-3 text-sm text-ink outline-none focus:border-gold"
              />
            </label>
            {error ? <p className="ui-text text-[12px] text-destructive">{error}</p> : null}
            <button
              type="submit"
              disabled={busy}
              className="ui-text mt-1 h-11 rounded-sm bg-primary text-[13px] uppercase tracking-[0.08em] text-primary-foreground disabled:opacity-60"
            >
              {mode === "login"
                ? "Entrar"
                : mode === "vendedor"
                  ? "Registrarme como vendedor"
                  : "Crear cuenta"}
            </button>
          </form>

          <div className="mt-4 flex flex-col gap-2">
            <button
              type="button"
              className="ui-text text-left text-[12px] text-sepia hover:text-ink"
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                setError("");
              }}
            >
              {mode === "login" ? "¿Primera vez? Crear cuenta" : "Ya tengo cuenta"}
            </button>
            {mode !== "vendedor" ? (
              <button
                type="button"
                className="ui-text text-left text-[12px] text-sepia hover:text-ink"
                onClick={() => {
                  setMode("vendedor");
                  setError("");
                }}
              >
                ¿Sos vendedor? Crear cuenta de carga
              </button>
            ) : null}
          </div>

          <Link to="/" className="ui-text mt-6 block text-[12px] text-primary">
            Volver a la tienda
          </Link>
        </div>
      </div>
    </div>
  );
}
