import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types";

function parseDocumentCookies(): Record<string, string> {
  if (typeof document === "undefined") return {};
  return document.cookie
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((acc, part) => {
      const idx = part.indexOf("=");
      if (idx === -1) return acc;
      const name = part.slice(0, idx).trim();
      const value = part.slice(idx + 1);
      if (!name) return acc;
      acc[name] = decodeURIComponent(value);
      return acc;
    }, {});
}

export function createSupabaseBrowserClient(url: string, anonKey: string) {
  if (!url || !anonKey) {
    throw new Error("Supabase is not configured. Add credentials to .env.local");
  }

  return createBrowserClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        const parsed = parseDocumentCookies();
        return Object.entries(parsed).map(([name, value]) => ({ name, value }));
      },
      setAll(cookiesToSet) {
        if (typeof document === "undefined") return;

        cookiesToSet.forEach(({ name, value, options }) => {
          const parts: string[] = [];
          parts.push(`${name}=${encodeURIComponent(value)}`);
          parts.push(`Path=${options?.path ?? "/"}`);
          parts.push(`SameSite=${options?.sameSite ?? "Lax"}`);

          if (options?.maxAge !== undefined) parts.push(`Max-Age=${options.maxAge}`);
          if (options?.expires) parts.push(`Expires=${options.expires.toUTCString()}`);
          if (options?.httpOnly) {
            // httpOnly cannot be set from the browser; ignore.
          }
          if (options?.secure) parts.push("Secure");

          document.cookie = parts.join("; ");
        });
      },
    },
  });
}
