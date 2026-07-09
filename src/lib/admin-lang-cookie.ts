import type { AdminLang } from "@/lib/admin/i18n";

export const ADMIN_LANG_COOKIE = "admin-lang";

export function parseAdminLang(value?: string | null): AdminLang {
  return value === "en" ? "en" : "ar";
}

export function adminLangCookieValue(lang: AdminLang): string {
  return `${ADMIN_LANG_COOKIE}=${lang}; Path=/; Max-Age=31536000; SameSite=Lax`;
}
