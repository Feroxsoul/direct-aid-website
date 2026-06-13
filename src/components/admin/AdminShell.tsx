"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminPresence } from "@/components/admin/AdminPresence";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { signOut } from "@/lib/admin/actions";
import type { AdminProfile } from "@/types";

type AdminShellProps = {
  profile: AdminProfile;
  supabaseUrl: string;
  supabaseAnonKey: string;
  notificationCount?: number;
  children: React.ReactNode;
};

export function AdminShell({
  profile,
  supabaseUrl,
  supabaseAnonKey,
  notificationCount = 0,
  children,
}: AdminShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

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
    <div className="dash-shell">
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
        <header className="dash-topbar">
          <button
            type="button"
            className="dash-topbar-menu"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            ☰
          </button>

          <div className="dash-topbar-actions">
            <AdminPresence
              supabaseUrl={supabaseUrl}
              supabaseAnonKey={supabaseAnonKey}
              currentUser={{
                key: profile.user_id ?? profile.id,
                email: profile.email,
                role: profile.role_slug,
                displayName: profile.display_name,
              }}
            />

            <Link href="/admin/notifications" className="dash-topbar-bell">
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

            <Link href="/" className="dash-topbar-link" target="_blank">
              View site
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
