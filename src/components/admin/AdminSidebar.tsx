"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { canAccessNav, hasPermission } from "@/lib/admin/permissions";
import type { AdminPermissions } from "@/lib/admin/permissions";
import { t, type AdminLang } from "@/lib/admin/i18n";
import {
  APP_DEVELOPER,
  APP_VERSION_LABEL,
} from "@/lib/app-version";

type NavItem = {
  href: string;
  labelKey: string;
  icon: string;
  resource: Parameters<typeof canAccessNav>[2];
};

const MAIN_NAV: NavItem[] = [
  { href: "/admin/homepage", labelKey: "nav.homepage", icon: "⌂", resource: "homepage" },
  { href: "/admin/categories", labelKey: "nav.categories", icon: "▦", resource: "categories" },
  { href: "/admin/projects", labelKey: "nav.projects", icon: "◫", resource: "projects" },
  { href: "/admin/footer", labelKey: "nav.footer", icon: "⊞", resource: "homepage" },
  { href: "/admin/logs", labelKey: "nav.logs", icon: "☰", resource: "audit_logs" },
];

const SETTINGS_CHILDREN: NavItem[] = [
  { href: "/admin/settings", labelKey: "nav.general", icon: "⚙", resource: "settings" },
  { href: "/admin/users", labelKey: "nav.users", icon: "◎", resource: "users" },
  { href: "/admin/roles", labelKey: "nav.roles", icon: "⚙", resource: "roles" },
];

function canSeeNavItem(
  profile: AdminSidebarProps["profile"],
  item: NavItem,
) {
  if (item.href === "/admin/users") {
    return profile.role_slug === "super_admin" || profile.role_slug === "admin";
  }
  if (item.resource === "audit_logs") {
    return profile.role_slug === "super_admin";
  }
  if (item.resource === "roles") {
    return hasPermission(profile.permissions, profile.role_slug, "roles", "view");
  }
  if (item.resource === "settings") {
    return hasPermission(profile.permissions, profile.role_slug, "settings", "view");
  }
  return canAccessNav(profile.permissions, profile.role_slug, item.resource);
}

type AdminSidebarProps = {
  profile: {
    role_slug: string;
    permissions: AdminPermissions;
  };
  logoUrl: string;
  lang: AdminLang;
  onNavigate?: () => void;
};

export function AdminSidebar({ profile, logoUrl, lang, onNavigate }: AdminSidebarProps) {
  const pathname = usePathname();
  const settingsActive = SETTINGS_CHILDREN.some((item) => pathname.startsWith(item.href));
  const [settingsOpen, setSettingsOpen] = useState(settingsActive);

  useEffect(() => {
    if (settingsActive) setSettingsOpen(true);
  }, [settingsActive]);

  const mainItems = MAIN_NAV.filter((item) => canSeeNavItem(profile, item));
  const settingsItems = SETTINGS_CHILDREN.filter((item) => canSeeNavItem(profile, item));
  const showSettings = settingsItems.length > 0;

  return (
    <aside className="dash-sidebar dash-sidebar--impact">
      <div className="dash-sidebar-brand">
        <Image
          src={logoUrl}
          alt="Direct Aid"
          width={140}
          height={44}
          className="dash-sidebar-logo-img"
          unoptimized
        />
        <span className="dash-sidebar-sub">{t(lang, "sidebar.sub")}</span>
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
              {t(lang, item.labelKey)}
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
              {t(lang, "nav.settings")}
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
                      {t(lang, item.labelKey)}
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
