"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AdminLangToggle } from "@/components/admin/AdminLangToggle";
import { AdminProfileMenu } from "@/components/admin/AdminProfileMenu";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminLangProvider } from "@/lib/admin/i18n-context";
import {
  ADMIN_LANG_STORAGE_KEY,
  getPageTitleKey,
  t,
  type AdminLang,
} from "@/lib/admin/i18n";
import type { AdminProfile } from "@/types";

type AdminShellProps = {
  profile: AdminProfile;
  logoUrl: string;
  publicSiteUrl: string;
  notificationCount?: number;
  children: React.ReactNode;
};

export function AdminShell({
  profile,
  logoUrl,
  publicSiteUrl,
  notificationCount = 0,
  children,
}: AdminShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [lang, setLang] = useState<AdminLang>("en");

  const pageTitle = t(lang, getPageTitleKey(pathname));

  const applyLang = useCallback((next: AdminLang) => {
    setLang(next);
    localStorage.setItem(ADMIN_LANG_STORAGE_KEY, next);
    document.documentElement.setAttribute("lang", next);
    document.documentElement.setAttribute("dir", next === "ar" ? "rtl" : "ltr");
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("admin-theme");
    if (stored === "dark" || stored === "light") {
      setTheme(stored);
      document.documentElement.setAttribute("data-admin-theme", stored);
    }

    const storedLang = localStorage.getItem(ADMIN_LANG_STORAGE_KEY);
    if (storedLang === "ar" || storedLang === "en") {
      applyLang(storedLang);
    } else {
      document.documentElement.setAttribute("lang", "en");
      document.documentElement.setAttribute("dir", "ltr");
    }
  }, [applyLang]);

  function toggleTheme() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("admin-theme", next);
    document.documentElement.setAttribute("data-admin-theme", next);
  }

  return (
    <AdminLangProvider lang={lang} onLangChange={applyLang}>
    <div className="dash-shell dash-shell--impact">
      <div
        className={`dash-sidebar-overlay${mobileOpen ? " is-open" : ""}`}
        onClick={() => setMobileOpen(false)}
        aria-hidden
      />

      <div className={`dash-sidebar-wrap${mobileOpen ? " is-open" : ""}`}>
        <AdminSidebar
          profile={profile}
          logoUrl={logoUrl}
          lang={lang}
          onNavigate={() => setMobileOpen(false)}
        />
      </div>

      <div className="dash-main-wrap">
        <header className="dash-topbar dash-topbar--impact">
          <div className="dash-topbar-left">
            <button
              type="button"
              className="dash-topbar-menu"
              aria-label={t(lang, "shell.menu")}
              onClick={() => setMobileOpen(true)}
            >
              ☰
            </button>
            <h1 className="dash-topbar-title">{pageTitle}</h1>
          </div>

          <div className="dash-topbar-actions">
            <a
              href={publicSiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="dash-topbar-link"
              aria-label={t(lang, "shell.preview")}
              title={t(lang, "shell.preview")}
            >
              ↗
            </a>

            <Link
              href="/admin/notifications"
              className="dash-topbar-bell"
              aria-label={t(lang, "nav.notifications")}
            >
              🔔
              {notificationCount > 0 ? (
                <span className="dash-topbar-bell-count">{notificationCount}</span>
              ) : null}
            </Link>

            <AdminLangToggle onLangChange={applyLang} />

            <button
              type="button"
              className="dash-topbar-theme"
              onClick={toggleTheme}
              aria-label={t(lang, "shell.theme")}
            >
              {theme === "light" ? "🌙" : "☀️"}
            </button>

            <AdminProfileMenu profile={profile} />
          </div>
        </header>

        <main className="dash-content">{children}</main>
      </div>
    </div>
    </AdminLangProvider>
  );
}
