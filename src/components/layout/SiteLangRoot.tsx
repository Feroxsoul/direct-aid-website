"use client";

import { useCallback, useEffect, useState } from "react";
import { SITE_LANG_STORAGE_KEY, type SiteLang } from "@/lib/site-i18n";
import { SiteLangProvider } from "@/lib/site-i18n-context";

export function SiteLangRoot({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<SiteLang>("ar");

  const applyLang = useCallback((next: SiteLang) => {
    setLang(next);
    localStorage.setItem(SITE_LANG_STORAGE_KEY, next);
    document.documentElement.setAttribute("lang", next);
    document.documentElement.setAttribute("dir", next === "ar" ? "rtl" : "ltr");
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem(SITE_LANG_STORAGE_KEY);
    if (stored === "ar" || stored === "en") {
      applyLang(stored);
    }
  }, [applyLang]);

  return (
    <SiteLangProvider lang={lang} onLangChange={applyLang}>
      {children}
    </SiteLangProvider>
  );
}
