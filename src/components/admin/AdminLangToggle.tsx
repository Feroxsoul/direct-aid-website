"use client";

import { useEffect, useState } from "react";
import {
  ADMIN_LANG_STORAGE_KEY,
  type AdminLang,
} from "@/lib/admin/i18n";

type AdminLangToggleProps = {
  onLangChange?: (lang: AdminLang) => void;
};

export function AdminLangToggle({ onLangChange }: AdminLangToggleProps) {
  const [lang, setLang] = useState<AdminLang>("en");

  useEffect(() => {
    const stored = localStorage.getItem(ADMIN_LANG_STORAGE_KEY);
    if (stored === "ar" || stored === "en") {
      setLang(stored);
      onLangChange?.(stored);
    }
  }, [onLangChange]);

  function toggle() {
    const next: AdminLang = lang === "en" ? "ar" : "en";
    setLang(next);
    localStorage.setItem(ADMIN_LANG_STORAGE_KEY, next);
    document.documentElement.setAttribute("lang", next);
    document.documentElement.setAttribute("dir", next === "ar" ? "rtl" : "ltr");
    onLangChange?.(next);
  }

  return (
    <button
      type="button"
      className="dash-topbar-lang"
      onClick={toggle}
      aria-label={lang === "en" ? "Switch to Arabic" : "Switch to English"}
      title={lang === "en" ? "العربية" : "English"}
    >
      {lang === "en" ? "ع" : "EN"}
    </button>
  );
}
