"use client";

import { useCallback, useEffect, useState } from "react";
import { SITE_LANG_STORAGE_KEY, type SiteLang } from "@/lib/site-i18n";
import { siteLangCookieValue } from "@/lib/site-lang-cookie";
import { SiteLangProvider } from "@/lib/site-i18n-context";

type SiteLangRootProps = {
  initialLang: SiteLang;
  children: React.ReactNode;
};

export function SiteLangRoot({ initialLang, children }: SiteLangRootProps) {
  const [lang, setLang] = useState<SiteLang>(() => {
    if (typeof window === "undefined") return initialLang;
    const stored = localStorage.getItem(SITE_LANG_STORAGE_KEY);
    return stored === "ar" || stored === "en" ? stored : initialLang;
  });

  const applyLang = useCallback((next: SiteLang) => {
    setLang(next);
  }, []);

  useEffect(() => {
    localStorage.setItem(SITE_LANG_STORAGE_KEY, lang);
    document.cookie = siteLangCookieValue(lang);
    document.documentElement.setAttribute("lang", lang);
    document.documentElement.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
  }, [lang]);

  return (
    <SiteLangProvider lang={lang} onLangChange={applyLang}>
      {children}
    </SiteLangProvider>
  );
}
