"use client";

import { ADMIN_NAV_PAGES } from "@/lib/admin/nav-pages";
import { useAdminLang } from "@/lib/admin/i18n-context";

const NAV_LABEL_KEYS: Record<string, string> = {
  "/admin/homepage": "nav.homepage",
  "/admin/categories": "nav.categories",
  "/admin/projects": "nav.projects",
  "/admin/footer": "nav.footer",
  "/admin/logs": "nav.logs",
  "/admin/settings": "nav.general",
  "/admin/users": "nav.users",
  "/admin/roles": "nav.roles",
  "/admin/donations": "nav.donations",
  "/admin/media": "nav.media",
  "/admin/notifications": "nav.notifications",
};

type NavPageVisibilityEditorProps = {
  hiddenPages: string[];
};

export function NavPageVisibilityEditor({ hiddenPages }: NavPageVisibilityEditorProps) {
  const { t } = useAdminLang();

  return (
    <div className="admin-field">
      <label className="admin-label">{t("users.navVisibility")}</label>
      <p className="admin-help-text">{t("users.navVisibilityHelp")}</p>
      <div className="admin-nav-visibility-grid">
        {ADMIN_NAV_PAGES.map((page) => {
          const checked = !hiddenPages.includes(page.href);
          const labelKey = NAV_LABEL_KEYS[page.href];
          return (
            <label key={page.href} className="admin-checkbox admin-nav-visibility-item">
              <input
                type="checkbox"
                name={`nav_visible_${page.key}`}
                defaultChecked={checked}
              />
              <span>{labelKey ? t(labelKey) : page.label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
