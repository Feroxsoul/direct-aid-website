"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { canAccessNav, hasPermission } from "@/lib/admin/permissions";
import type { AdminPermissions } from "@/lib/admin/permissions";
import { RoleBadge } from "@/components/admin/RoleBadge";

type NavItem = {
  href: string;
  label: string;
  icon: string;
  resource: Parameters<typeof canAccessNav>[2];
};

const MAIN_NAV: NavItem[] = [
  { href: "/admin", label: "لوحة التحكم", icon: "▦", resource: "analytics" },
  { href: "/admin/homepage", label: "الصفحة الرئيسية", icon: "⌂", resource: "homepage" },
  { href: "/admin/categories", label: "الفئات", icon: "▦", resource: "categories" },
  { href: "/admin/projects", label: "المشاريع", icon: "◫", resource: "projects" },
  { href: "/admin/media", label: "الوسائط", icon: "▣", resource: "media" },
  { href: "/admin/logs", label: "النشاط", icon: "☰", resource: "audit_logs" },
];

const SETTINGS_CHILDREN: NavItem[] = [
  { href: "/admin/settings", label: "الإعدادات العامة", icon: "⚙", resource: "settings" },
  { href: "/admin/users", label: "إدارة المستخدمين", icon: "◎", resource: "users" },
  { href: "/admin/roles", label: "الأدوار", icon: "⚙", resource: "roles" },
];

function getInitials(name: string | null, email: string) {
  const source = name?.trim() || email;
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

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
    email: string;
    display_name: string | null;
    role_slug: string;
    role_name: string;
    badge_color: string;
    permissions: AdminPermissions;
  };
  onNavigate?: () => void;
};

export function AdminSidebar({ profile, onNavigate }: AdminSidebarProps) {
  const pathname = usePathname();
  const displayName = profile.display_name ?? "مشرف";
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
        <span className="dash-sidebar-logo">لوحة التحكم</span>
        <span className="dash-sidebar-sub">10×10</span>
      </div>

      <div className="dash-sidebar-user">
        <span className="dash-sidebar-avatar" aria-hidden>
          {getInitials(profile.display_name, profile.email)}
        </span>
        <div>
          <p className="dash-sidebar-user-name">{displayName}</p>
          <RoleBadge
            label={profile.role_name}
            color={profile.badge_color}
            size="sm"
          />
        </div>
      </div>

      <nav className="dash-sidebar-nav" aria-label="تنقل لوحة التحكم">
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
              الإعدادات
              <span className="dash-sidebar-chevron" aria-hidden>
                {settingsOpen ? "▾" : "◂"}
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

      <div className="dash-sidebar-status">
        <span className="dash-sidebar-status-dot" aria-hidden />
        النظام متصل
      </div>
    </aside>
  );
}
