"use client";

import { createContext, useContext } from "react";
import { siteT, type SiteLang } from "@/lib/site-i18n";

type SiteLangContextValue = {
  lang: SiteLang;
  setLang: (lang: SiteLang) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

const SiteLangContext = createContext<SiteLangContextValue | null>(null);

export function SiteLangProvider({
  lang,
  onLangChange,
  children,
}: {
  lang: SiteLang;
  onLangChange: (lang: SiteLang) => void;
  children: React.ReactNode;
}) {
  return (
    <SiteLangContext.Provider
      value={{
        lang,
        setLang: onLangChange,
        t: (key, vars) => siteT(lang, key, vars),
      }}
    >
      {children}
    </SiteLangContext.Provider>
  );
}

export function useSiteLang() {
  const ctx = useContext(SiteLangContext);
  if (!ctx) {
    return {
      lang: "ar" as SiteLang,
      setLang: () => {},
      t: (key: string, vars?: Record<string, string | number>) => siteT("ar", key, vars),
    };
  }
  return ctx;
}
