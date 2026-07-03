"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ADMIN_LANG_STORAGE_KEY,
  type AdminLang,
} from "@/lib/admin/i18n";
import { AdminLangProvider } from "@/lib/admin/i18n-context";

export function AdminLangRoot({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<AdminLang>(() => {
    if (typeof window === "undefined") return "en";
    const stored = localStorage.getItem(ADMIN_LANG_STORAGE_KEY);
    return stored === "ar" || stored === "en" ? stored : "en";
  });

  const applyLang = useCallback((next: AdminLang) => {
    setLang(next);
    localStorage.setItem(ADMIN_LANG_STORAGE_KEY, next);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("lang", lang);
    document.documentElement.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
    localStorage.setItem(ADMIN_LANG_STORAGE_KEY, lang);
  }, [lang]);

  return (
    <AdminLangProvider lang={lang} onLangChange={applyLang}>
      {children}
    </AdminLangProvider>
  );
}
