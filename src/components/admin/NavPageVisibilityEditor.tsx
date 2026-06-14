"use client";

import { ADMIN_NAV_PAGES } from "@/lib/admin/nav-pages";

type NavPageVisibilityEditorProps = {
  hiddenPages: string[];
};

export function NavPageVisibilityEditor({ hiddenPages }: NavPageVisibilityEditorProps) {
  return (
    <div className="admin-field">
      <label className="admin-label">Visible pages for this user</label>
      <p className="admin-help-text">
        Uncheck a page to hide it from this user&apos;s sidebar. Super Admin only.
      </p>
      <div className="admin-nav-visibility-grid">
        {ADMIN_NAV_PAGES.map((page) => {
          const checked = !hiddenPages.includes(page.href);
          return (
            <label key={page.href} className="admin-checkbox admin-nav-visibility-item">
              <input
                type="checkbox"
                name={`nav_visible_${page.key}`}
                defaultChecked={checked}
              />
              <span>{page.label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
