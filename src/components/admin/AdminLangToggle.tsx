"use client";

import { t, type AdminLang } from "@/lib/admin/i18n";
import { useAdminLang, useSetAdminLang } from "@/lib/admin/i18n-context";

type AdminLangToggleProps = {
  onLangChange?: (lang: AdminLang) => void;
};

export function AdminLangToggle({ onLangChange }: AdminLangToggleProps) {
  const { lang } = useAdminLang();
  const setContextLang = useSetAdminLang();

  function toggle() {
    const next: AdminLang = lang === "en" ? "ar" : "en";
    setContextLang(next);
    onLangChange?.(next);
  }

  return (
    <button
      type="button"
      className="dash-topbar-lang"
      onClick={toggle}
      aria-label={t(lang, lang === "en" ? "shell.lang.ar" : "shell.lang.en")}
      title={lang === "en" ? "العربية" : "English"}
    >
      {lang === "en" ? "ع" : "EN"}
    </button>
  );
}
