import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const SUPABASE_URL = "https://qkdspyxsfctqsboylwai.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_W9RvthVNOO8r07YxV3kNaA_1DbXxOoX";
export const ADMIN_EMAIL = "admin@libreriacallao.local";

const url = (import.meta.env["VITE_SUPABASE_URL"] as string | undefined) || SUPABASE_URL;
const key =
  (import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] as string | undefined) ||
  SUPABASE_PUBLISHABLE_KEY;

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!client) {
    client = createClient(url, key, {
      auth: {
        persistSession: typeof window !== "undefined",
        autoRefreshToken: typeof window !== "undefined",
        detectSessionInUrl: true,
        flowType: "pkce",
      },
    });
  }
  return client;
}

export function loginIdentifierToEmail(identifier: string) {
  const value = identifier.trim();
  if (value.toLowerCase() === "admin") return ADMIN_EMAIL;
  return value;
}
