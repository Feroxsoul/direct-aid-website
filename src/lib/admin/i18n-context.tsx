"use client";

import { createContext, useContext } from "react";
import { t, type AdminLang } from "@/lib/admin/i18n";

const AdminLangContext = createContext<AdminLang>("en");
const AdminLangSetContext = createContext<(lang: AdminLang) => void>(() => {});

export function AdminLangProvider({
  lang,
  onLangChange,
  children,
}: {
  lang: AdminLang;
  onLangChange: (lang: AdminLang) => void;
  children: React.ReactNode;
}) {
  return (
    <AdminLangContext.Provider value={lang}>
      <AdminLangSetContext.Provider value={onLangChange}>{children}</AdminLangSetContext.Provider>
    </AdminLangContext.Provider>
  );
}

export function useAdminLang() {
  const lang = useContext(AdminLangContext);
  return {
    lang,
    t: (key: string, vars?: Record<string, string | number>) => t(lang, key, vars),
  };
}

export function useSetAdminLang() {
  return useContext(AdminLangSetContext);
}
