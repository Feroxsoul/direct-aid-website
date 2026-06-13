"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { signOut } from "@/lib/admin/actions";
import type { AdminProfile } from "@/types";

const PAGE_TITLES: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/projects": "Project Management",
  "/admin/users": "User Management",
  "/admin/media": "Media Library",
  "/admin/donations": "Donations",
  "/admin/categories": "Categories",
  "/admin/homepage": "Homepage",
  "/admin/roles": "Roles",
  "/admin/logs": "Activity Logs",
  "/admin/settings": "Settings",
  "/admin/notifications": "Notifications",
};

type AdminShellProps = {
  profile: AdminProfile;
  notificationCount?: number;
  children: React.ReactNode;
};

export function AdminShell({
  profile,
  notificationCount = 0,
  children,
}: AdminShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const pageTitle =
    Object.entries(PAGE_TITLES).find(([path]) =>
      path === "/admin" ? pathname === "/admin" : pathname.startsWith(path),
    )?.[1] ?? "Admin";

  useEffect(() => {
    const stored = localStorage.getItem("admin-theme");
    if (stored === "dark" || stored === "light") {
      setTheme(stored);
      document.documentElement.setAttribute("data-admin-theme", stored);
    }
  }, []);

  function toggleTheme() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("admin-theme", next);
    document.documentElement.setAttribute("data-admin-theme", next);
  }

  return (
    <div className="dash-shell dash-shell--impact">
      <div
        className={`dash-sidebar-overlay${mobileOpen ? " is-open" : ""}`}
        onClick={() => setMobileOpen(false)}
        aria-hidden
      />

      <div className={`dash-sidebar-wrap${mobileOpen ? " is-open" : ""}`}>
        <AdminSidebar
          profile={profile}
          onNavigate={() => setMobileOpen(false)}
        />
      </div>

      <div className="dash-main-wrap">
        <header className="dash-topbar dash-topbar--impact">
          <div className="dash-topbar-left">
            <button
              type="button"
              className="dash-topbar-menu"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
            >
              ☰
            </button>
            <h1 className="dash-topbar-title">{pageTitle}</h1>
          </div>

          <div className="dash-topbar-actions">
            <Link href="/admin/notifications" className="dash-topbar-bell" aria-label="Notifications">
              🔔
              {notificationCount > 0 ? (
                <span className="dash-topbar-bell-count">{notificationCount}</span>
              ) : null}
            </Link>

            <button
              type="button"
              className="dash-topbar-theme"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {theme === "light" ? "🌙" : "☀️"}
            </button>

            <Link href="/" className="dash-topbar-live" target="_blank">
              LIVE SITE
            </Link>

            <form action={signOut}>
              <button type="submit" className="dash-topbar-signout">
                Sign out
              </button>
            </form>
          </div>
        </header>

        <main className="dash-content">{children}</main>
      </div>
    </div>
  );
}
