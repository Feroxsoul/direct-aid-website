"use client";

import type { ElementType } from "react";
import { useAdminLang } from "@/lib/admin/i18n-context";

type AdminPageHeaderProps = {
  titleKey: string;
  subtitleKey?: string;
  savedKey?: string;
  saved?: boolean;
};

export function AdminPageHeader({
  titleKey,
  subtitleKey,
  savedKey,
  saved,
}: AdminPageHeaderProps) {
  const { t } = useAdminLang();

  return (
    <header className="dash-page-header">
      <h1 className="dash-page-title">{t(titleKey)}</h1>
      {subtitleKey ? <p className="dash-page-subtitle">{t(subtitleKey)}</p> : null}
      {saved && savedKey ? <p className="admin-success">{t(savedKey)}</p> : null}
    </header>
  );
}

type AdminTextProps = {
  k: string;
  vars?: Record<string, string | number>;
  as?: ElementType;
  className?: string;
};

export function AdminText({ k, vars, as: Tag = "span", className }: AdminTextProps) {
  const { t } = useAdminLang();
  return <Tag className={className}>{t(k, vars)}</Tag>;
}
