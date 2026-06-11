import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types";

export function createSupabaseBrowserClient(url: string, anonKey: string) {
  if (!url || !anonKey) {
    throw new Error("Supabase is not configured. Add credentials to .env.local");
  }

  return createBrowserClient<Database>(url, anonKey);
}
