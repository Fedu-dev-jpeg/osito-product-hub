import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import {
  getSupabase,
  loginIdentifierToEmail,
  SUPABASE_PUBLISHABLE_KEY,
  SUPABASE_URL,
} from "@/lib/supabase";

export type UserRole = "admin" | "vendedor";

export type Profile = {
  id: string;
  email: string | null;
  username: string | null;
  role: UserRole;
};

type AuthContextValue = {
  loading: boolean;
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  role: UserRole | null;
  signIn: (identifier: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string) => Promise<string | null>;
  signInWithGoogle: () => Promise<string | null>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function loadProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await getSupabase()
    .from("profiles")
    .select("id, email, username, role")
    .eq("id", userId)
    .maybeSingle();
  if (error || !data) return null;
  const role = data.role === "admin" ? "admin" : "vendedor";
  return {
    id: data.id as string,
    email: (data.email as string | null) ?? null,
    username: (data.username as string | null) ?? null,
    role,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const supabase = getSupabase();
    let cancelled = false;

    const apply = async (next: Session | null) => {
      if (cancelled) return;
      setSession(next);
      if (!next?.user) {
        setProfile(null);
        setLoading(false);
        return;
      }
      const loaded = await loadProfile(next.user.id);
      if (!cancelled) {
        setProfile(loaded);
        setLoading(false);
      }
    };

    supabase.auth.getSession().then(({ data }) => apply(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      void apply(next);
    });

    const params = new URLSearchParams(typeof window === "undefined" ? "" : window.location.search);
    const code = params.get("code");
    if (code) {
      void supabase.auth.exchangeCodeForSession(window.location.href).finally(() => {
        const url = new URL(window.location.href);
        url.searchParams.delete("code");
        url.searchParams.delete("state");
        window.history.replaceState({}, "", url.pathname + url.search);
      });
    }

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (identifier: string, password: string) => {
    const email = loginIdentifierToEmail(identifier);
    if (!email.includes("@")) return "Ingresá tu email o el usuario admin.";
    const { error } = await getSupabase().auth.signInWithPassword({ email, password });
    return error?.message ?? null;
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const { data, error } = await getSupabase().auth.signUp({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) return error.message;
    if (!data.session)
      return "Revisá tu email para confirmar la cuenta, o entrá si ya está activa.";
    return null;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const redirectTo = `${window.location.origin}/auth`;
    const supabase = getSupabase();
    const probe = await fetch(`${SUPABASE_URL}/auth/v1/authorize?provider=google`, {
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
        Accept: "application/json",
      },
      redirect: "manual",
    });
    if (probe.status >= 400) {
      const body = (await probe.json().catch(() => null)) as { msg?: string } | null;
      const msg = body?.msg ?? "";
      if (/not enabled|Unsupported provider/i.test(msg)) {
        return "Google todavía no está habilitado. Entrá con usuario admin y la contraseña.";
      }
      return msg || "No se pudo continuar con Google.";
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        skipBrowserRedirect: true,
        queryParams: { access_type: "offline", prompt: "consent" },
      },
    });
    if (error) {
      return /provider is not enabled|Unsupported provider/i.test(error.message)
        ? "Google todavía no está habilitado. Entrá con usuario admin y la contraseña."
        : error.message;
    }
    if (data.url) window.location.assign(data.url);
    return null;
  }, []);

  const signOut = useCallback(async () => {
    await getSupabase().auth.signOut();
    setProfile(null);
    setSession(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      loading,
      session,
      user: session?.user ?? null,
      profile,
      role: profile?.role ?? null,
      signIn,
      signUp,
      signInWithGoogle,
      signOut,
    }),
    [loading, session, profile, signIn, signUp, signInWithGoogle, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
