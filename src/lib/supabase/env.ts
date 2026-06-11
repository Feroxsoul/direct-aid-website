function clean(value: string | undefined) {
  return value?.trim() ?? "";
}

/** Runtime (Railway/Docker) or build-time (NEXT_PUBLIC_*) Supabase config. */
export function getSupabaseUrl() {
  const url =
    clean(process.env.SUPABASE_URL) ||
    clean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  return url.replace(/\/+$/, "");
}

export function getSupabaseAnonKey() {
  return (
    clean(process.env.SUPABASE_ANON_KEY) ||
    clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  );
}

export function isSupabaseConfigured() {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  return Boolean(
    url &&
      key &&
      !url.includes("your-project") &&
      !url.includes("xxxxx"),
  );
}
