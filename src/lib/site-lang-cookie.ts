import type { SiteLang } from "@/lib/site-i18n";

export const SITE_LANG_COOKIE = "site-lang";

export function parseSiteLang(value?: string | null): SiteLang {
  return value === "en" ? "en" : "ar";
}

export function siteLangCookieValue(lang: SiteLang): string {
  return `${SITE_LANG_COOKIE}=${lang}; Path=/; Max-Age=31536000; SameSite=Lax`;
}
