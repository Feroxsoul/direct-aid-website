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
  const [lang, setLang] = useState<SiteLang>(initialLang);

  const applyLang = useCallback((next: SiteLang) => {
    setLang(next);
    localStorage.setItem(SITE_LANG_STORAGE_KEY, next);
    document.cookie = siteLangCookieValue(next);
    document.documentElement.setAttribute("lang", next);
    document.documentElement.setAttribute("dir", next === "ar" ? "rtl" : "ltr");
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem(SITE_LANG_STORAGE_KEY);
    const preferred: SiteLang =
      stored === "ar" || stored === "en" ? stored : initialLang;
    applyLang(preferred);
  }, [applyLang, initialLang]);

  return (
    <SiteLangProvider lang={lang} onLangChange={applyLang}>
      {children}
    </SiteLangProvider>
  );
}
