import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { pageShell } from "@/components/callao/data";
import { useAuth } from "@/lib/auth";

type LoginSearch = { next?: string };

const ATTEMPTS_KEY = "callao_admin_login_attempts";
const MAX_ATTEMPTS = 5;
const LOCK_MS = 60_000;

function readAttempts() {
  try {
    const raw = sessionStorage.getItem(ATTEMPTS_KEY);
    return raw ? (JSON.parse(raw) as { count: number; until: number }) : { count: 0, until: 0 };
  } catch {
    return { count: 0, until: 0 };
  }
}

function writeAttempts(count: number, until = 0) {
  sessionStorage.setItem(ATTEMPTS_KEY, JSON.stringify({ count, until }));
}

export const Route = createFileRoute("/admin/login")({
  validateSearch: (search: Record<string, unknown>): LoginSearch => {
    const next = typeof search["next"] === "string" ? search["next"] : undefined;
    return next ? { next } : {};
  },
  head: () => ({
    meta: [
      { title: "Ingreso administración | Librería Callao" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const { next } = Route.useSearch();
  const navigate = useNavigate();
  const { session, profile, loading, signIn } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (loading || !session || !profile) return;
    if (profile.role === "admin") {
      void navigate({ to: "/admin" });
      return;
    }
    void navigate({ to: "/" });
  }, [loading, session, profile, navigate, next]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const attempts = readAttempts();
    if (attempts.until > Date.now()) {
      setError("Demasiados intentos. Esperá un minuto e intentá de nuevo.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const message = await signIn(identifier.trim(), password);
      if (message) {
        const count = attempts.count + 1;
        const until = count >= MAX_ATTEMPTS ? Date.now() + LOCK_MS : 0;
        writeAttempts(count >= MAX_ATTEMPTS ? 0 : count, until);
        setError(until ? "Demasiados intentos. Esperá un minuto e intentá de nuevo." : "No se pudo entrar.");
        return;
      }
      writeAttempts(0, 0);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className={`${pageShell} flex min-h-screen items-center justify-center py-12`}>
        <div className="w-full max-w-md rounded-md border border-rule bg-card p-6 md:p-8">
          <p className="ui-text text-[11px] uppercase tracking-[0.2em] text-gold">Administración</p>
          <h1 className="mt-2 font-display text-4xl text-ink">Ingresar</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            El panel de la tienda es privado. Iniciá sesión con una cuenta de administrador.
          </p>
          <form onSubmit={(e) => void onSubmit(e)} className="mt-6 flex flex-col gap-3">
            <label className="ui-text text-[12px] text-sepia">
              Usuario o email
              <input
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                autoComplete="username"
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
                autoComplete="current-password"
                className="mt-1 h-11 w-full rounded-sm border border-ink/20 bg-background px-3 text-sm text-ink outline-none focus:border-gold"
              />
            </label>
            {error ? (
              <p role="alert" className="text-sm text-primary">
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={busy}
              className="ui-text mt-2 h-11 rounded-sm bg-primary text-[13px] uppercase tracking-[0.08em] text-primary-foreground disabled:opacity-60"
            >
              Entrar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
