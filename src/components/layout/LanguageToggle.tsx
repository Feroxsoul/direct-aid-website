"use client";

import { useSiteLang } from "@/lib/site-i18n-context";

export function LanguageToggle() {
  const { lang, setLang, t } = useSiteLang();
  const nextLang = lang === "ar" ? "en" : "ar";
  const label = lang === "ar" ? t("lang.switchToEn") : t("lang.switchToAr");

  return (
    <button
      type="button"
      className="landing-lang-btn"
      onClick={() => setLang(nextLang)}
      aria-label={t("lang.aria")}
      title={label}
    >
      {label}
    </button>
  );
}
