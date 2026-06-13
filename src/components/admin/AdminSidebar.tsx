"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { canAccessNav, hasPermission } from "@/lib/admin/permissions";
import type { AdminPermissions } from "@/lib/admin/permissions";
import {
  APP_BUILD_NAME,
  APP_DEVELOPER,
  APP_VERSION_LABEL,
} from "@/lib/app-version";

type NavItem = {
  href: string;
  label: string;
  icon: string;
  resource: Parameters<typeof canAccessNav>[2];
};

const MAIN_NAV: NavItem[] = [
  { href: "/admin/homepage", label: "Home Page", icon: "⌂", resource: "homepage" },
  { href: "/admin/categories", label: "Categories", icon: "▦", resource: "categories" },
  { href: "/admin/projects", label: "Projects", icon: "◫", resource: "projects" },
  { href: "/admin/footer", label: "Footer", icon: "⊞", resource: "homepage" },
  { href: "/admin/logs", label: "Activity Log", icon: "☰", resource: "audit_logs" },
];

const SETTINGS_CHILDREN: NavItem[] = [
  { href: "/admin/settings", label: "General Settings", icon: "⚙", resource: "settings" },
  { href: "/admin/users", label: "User Management", icon: "◎", resource: "users" },
  { href: "/admin/roles", label: "Roles", icon: "⚙", resource: "roles" },
];

function canSeeNavItem(
  profile: AdminSidebarProps["profile"],
  resource: NavItem["resource"],
) {
  if (resource === "roles" || resource === "audit_logs") {
    return profile.role_slug === "super_admin";
  }
  if (resource === "settings") {
    return hasPermission(profile.permissions, profile.role_slug, "settings", "view");
  }
  return canAccessNav(profile.permissions, profile.role_slug, resource);
}

type AdminSidebarProps = {
  profile: {
    role_slug: string;
    permissions: AdminPermissions;
  };
  onNavigate?: () => void;
};

export function AdminSidebar({ profile, onNavigate }: AdminSidebarProps) {
  const pathname = usePathname();
  const settingsActive = SETTINGS_CHILDREN.some((item) => pathname.startsWith(item.href));
  const [settingsOpen, setSettingsOpen] = useState(settingsActive);

  useEffect(() => {
    if (settingsActive) setSettingsOpen(true);
  }, [settingsActive]);

  const mainItems = MAIN_NAV.filter((item) => canSeeNavItem(profile, item.resource));
  const settingsItems = SETTINGS_CHILDREN.filter((item) =>
    canSeeNavItem(profile, item.resource),
  );
  const showSettings = settingsItems.length > 0;

  return (
    <aside className="dash-sidebar dash-sidebar--impact">
      <div className="dash-sidebar-brand">
        <span className="dash-sidebar-logo">{APP_BUILD_NAME}</span>
        <span className="dash-sidebar-sub">Direct Aid · Admin</span>
      </div>

      <nav className="dash-sidebar-nav" aria-label="Admin navigation">
        {mainItems.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`dash-sidebar-link${active ? " is-active" : ""}`}
              onClick={onNavigate}
            >
              <span className="dash-sidebar-icon" aria-hidden>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}

        {showSettings ? (
          <div className="dash-sidebar-group">
            <button
              type="button"
              className={`dash-sidebar-link dash-sidebar-group-toggle${
                settingsActive ? " is-active" : ""
              }`}
              onClick={() => setSettingsOpen((open) => !open)}
              aria-expanded={settingsOpen}
            >
              <span className="dash-sidebar-icon" aria-hidden>
                ⚙
              </span>
              Settings
              <span className="dash-sidebar-chevron" aria-hidden>
                {settingsOpen ? "▾" : "▸"}
              </span>
            </button>
            {settingsOpen ? (
              <div className="dash-sidebar-subnav">
                {settingsItems.map((item) => {
                  const active = pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`dash-sidebar-sublink${active ? " is-active" : ""}`}
                      onClick={onNavigate}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            ) : null}
          </div>
        ) : null}
      </nav>

      <div className="dash-sidebar-version">
        <span className="dash-sidebar-version-label">{APP_VERSION_LABEL}</span>
        <span className="dash-sidebar-version-meta">by {APP_DEVELOPER}</span>
      </div>
    </aside>
  );
}
