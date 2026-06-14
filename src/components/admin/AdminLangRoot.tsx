"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ADMIN_LANG_STORAGE_KEY,
  type AdminLang,
} from "@/lib/admin/i18n";
import { AdminLangProvider } from "@/lib/admin/i18n-context";

export function AdminLangRoot({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<AdminLang>("en");

  const applyLang = useCallback((next: AdminLang) => {
    setLang(next);
    localStorage.setItem(ADMIN_LANG_STORAGE_KEY, next);
    document.documentElement.setAttribute("lang", next);
    document.documentElement.setAttribute("dir", next === "ar" ? "rtl" : "ltr");
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem(ADMIN_LANG_STORAGE_KEY);
    if (stored === "ar" || stored === "en") {
      applyLang(stored);
    }
  }, [applyLang]);

  return (
    <AdminLangProvider lang={lang} onLangChange={applyLang}>
      {children}
    </AdminLangProvider>
  );
}
