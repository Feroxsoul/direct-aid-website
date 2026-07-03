export type AdminSaveResult = { ok: true } | { ok: false; error: string };

export function isMissingColumnError(error: { message?: string } | null): boolean {
  if (!error?.message) return false;
  const message = error.message.toLowerCase();
  return (
    message.includes("column") &&
    (message.includes("does not exist") ||
      message.includes("could not find") ||
      message.includes("schema cache"))
  );
}

export function omitKeys<T extends Record<string, unknown>>(
  payload: T,
  keys: string[],
): T {
  const next = { ...payload };
  for (const key of keys) {
    delete next[key];
  }
  return next;
}

export async function runWithOptionalColumns<T extends Record<string, unknown>>(
  run: (payload: T) => Promise<{ error: { message: string } | null }>,
  payload: T,
  optionalKeys: string[],
): Promise<{ error: { message: string } | null; usedFallback: boolean }> {
  const first = await run(payload);
  if (!first.error || !isMissingColumnError(first.error)) {
    return { error: first.error, usedFallback: false };
  }

  const reduced = omitKeys(payload, optionalKeys);
  const second = await run(reduced);
  return { error: second.error, usedFallback: true };
}

export const PROJECT_BILINGUAL_COLUMNS = [
  "title_en",
  "description_en",
  "meta_title_en",
  "meta_description_en",
  "stat_label_en",
] as const;

export const STATISTICS_BILINGUAL_COLUMNS = ["label_en", "intro_text_en"] as const;

export const CATEGORY_OPTIONAL_COLUMNS = ["name_en", "slug_key"] as const;
