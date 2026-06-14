"use client";

import { createContext, useContext } from "react";
import { t, type AdminLang } from "@/lib/admin/i18n";

const AdminLangContext = createContext<AdminLang>("en");

export function AdminLangProvider({
  lang,
  children,
}: {
  lang: AdminLang;
  children: React.ReactNode;
}) {
  return <AdminLangContext.Provider value={lang}>{children}</AdminLangContext.Provider>;
}

export function useAdminLang() {
  const lang = useContext(AdminLangContext);
  return {
    lang,
    t: (key: string, vars?: Record<string, string | number>) => t(lang, key, vars),
  };
}
