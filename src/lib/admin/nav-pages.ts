export type AdminNavPage = {
  key: string;
  href: string;
  label: string;
};

export const ADMIN_NAV_PAGES: AdminNavPage[] = [
  { key: "homepage", href: "/admin/homepage", label: "Home Page" },
  { key: "categories", href: "/admin/categories", label: "Categories" },
  { key: "projects", href: "/admin/projects", label: "Projects" },
  { key: "footer", href: "/admin/footer", label: "Footer" },
  { key: "logs", href: "/admin/logs", label: "Activity Log" },
  { key: "settings", href: "/admin/settings", label: "General Settings" },
  { key: "users", href: "/admin/users", label: "User Management" },
  { key: "roles", href: "/admin/roles", label: "Roles" },
  { key: "donations", href: "/admin/donations", label: "Donations" },
  { key: "media", href: "/admin/media", label: "Media" },
  { key: "notifications", href: "/admin/notifications", label: "Notifications" },
];

export function parseNavHiddenPages(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

export function isNavPageHidden(href: string, hiddenPages: string[]): boolean {
  return hiddenPages.some(
    (hidden) => href === hidden || href.startsWith(`${hidden}/`),
  );
}
