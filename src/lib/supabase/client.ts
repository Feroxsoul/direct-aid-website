import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types";

export function createSupabaseBrowserClient(url: string, anonKey: string) {
  if (!url || !anonKey) {
    throw new Error("Supabase is not configured. Add credentials to .env.local");
  }

  // In the browser, `@supabase/ssr` already persists sessions via `document.cookie`.
  // Custom cookie adapters are easy to get subtly wrong and can cause "random logouts"
  // or server routes not seeing the session.
  return createBrowserClient<Database>(url, anonKey);
}
