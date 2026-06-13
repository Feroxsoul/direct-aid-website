"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { canAccessNav, hasPermission } from "@/lib/admin/permissions";
import type { AdminPermissions } from "@/lib/admin/permissions";
import { RoleBadge } from "@/components/admin/RoleBadge";

export type NavItem = {
  href: string;
  label: string;
  icon: string;
  resource: Parameters<typeof canAccessNav>[2];
};

const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: "◫", resource: "analytics" },
  { href: "/admin/projects", label: "Projects", icon: "◧", resource: "projects" },
  { href: "/admin/donations", label: "Donations", icon: "◈", resource: "donations" },
  { href: "/admin/media", label: "Media", icon: "▣", resource: "media" },
  { href: "/admin/categories", label: "Categories", icon: "▦", resource: "categories" },
  { href: "/admin/homepage", label: "Homepage", icon: "⌂", resource: "homepage" },
  { href: "/admin/users", label: "Users", icon: "◎", resource: "users" },
  { href: "/admin/roles", label: "Roles", icon: "⚙", resource: "roles" },
  { href: "/admin/logs", label: "Activity", icon: "☰", resource: "audit_logs" },
  { href: "/admin/settings", label: "Settings", icon: "⚙", resource: "settings" },
];

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

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (item.resource === "roles") {
      return profile.role_slug === "super_admin";
    }
    if (item.resource === "audit_logs") {
      return profile.role_slug === "super_admin";
    }
    if (item.resource === "settings") {
      return hasPermission(
        profile.permissions,
        profile.role_slug,
        "settings",
        "view",
      );
    }
    return canAccessNav(profile.permissions, profile.role_slug, item.resource);
  });

  return (
    <aside className="dash-sidebar">
      <div className="dash-sidebar-brand">
        <span className="dash-sidebar-logo">10×10</span>
        <span className="dash-sidebar-sub">Admin Console</span>
      </div>

      <nav className="dash-sidebar-nav" aria-label="Admin navigation">
        {visibleItems.map((item) => {
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
      </nav>

      <div className="dash-sidebar-footer">
        <RoleBadge
          label={profile.role_name}
          color={profile.badge_color}
          size="sm"
        />
        <p className="dash-sidebar-email">{profile.display_name ?? profile.email}</p>
      </div>
    </aside>
  );
}
