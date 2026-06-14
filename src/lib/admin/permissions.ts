export type PermissionAction =
  | "view"
  | "create"
  | "edit"
  | "delete"
  | "publish"
  | "export"
  | "manage"
  | "modify"
  | "access";

export type PermissionResource =
  | "analytics"
  | "projects"
  | "donations"
  | "users"
  | "settings"
  | "media"
  | "categories"
  | "homepage"
  | "audit_logs"
  | "roles"
  | "notifications";

export type AdminPermissions = Partial<
  Record<PermissionResource, Partial<Record<PermissionAction, boolean>>>
>;

export type RoleDefinition = {
  slug: string;
  name: string;
  badgeColor: string;
  isSystem: boolean;
  permissions: AdminPermissions;
};

const all = (
  actions: PermissionAction[],
): Partial<Record<PermissionAction, boolean>> =>
  Object.fromEntries(actions.map((a) => [a, true]));

const viewOnly = { view: true } as const;

export const DEFAULT_ROLE_DEFINITIONS: RoleDefinition[] = [
  {
    slug: "super_admin",
    name: "Super Admin",
    badgeColor: "#7c3aed",
    isSystem: true,
    permissions: { analytics: { view: true, manage: true } },
  },
  {
    slug: "admin",
    name: "Admin",
    badgeColor: "#dc2626",
    isSystem: true,
    permissions: {
      analytics: viewOnly,
      projects: all(["view", "create", "edit", "delete", "publish"]),
      donations: all(["view", "export", "manage"]),
      users: all(["view", "create", "edit"]),
      media: all(["view", "create", "delete", "manage"]),
      categories: all(["view", "edit"]),
      homepage: all(["view", "edit"]),
      notifications: viewOnly,
      roles: viewOnly,
    },
  },
  {
    slug: "project_manager",
    name: "Project Manager",
    badgeColor: "#2563eb",
    isSystem: true,
    permissions: {
      analytics: { view: true },
      projects: all(["view", "create", "edit", "publish"]),
      media: all(["view", "create"]),
      categories: viewOnly,
      roles: viewOnly,
    },
  },
  {
    slug: "donation_manager",
    name: "Donation Manager",
    badgeColor: "#16a34a",
    isSystem: true,
    permissions: {
      analytics: { view: true },
      donations: all(["view", "export", "manage"]),
      projects: viewOnly,
      roles: viewOnly,
    },
  },
  {
    slug: "content_manager",
    name: "Content Manager",
    badgeColor: "#0891b2",
    isSystem: true,
    permissions: {
      projects: all(["view", "edit"]),
      categories: all(["view", "edit"]),
      homepage: all(["view", "edit"]),
      media: all(["view", "create"]),
      roles: viewOnly,
    },
  },
  {
    slug: "editor",
    name: "Editor",
    badgeColor: "#ea580c",
    isSystem: true,
    permissions: {
      projects: all(["view", "create", "edit"]),
      categories: all(["view", "edit"]),
      homepage: all(["view", "edit"]),
      media: all(["view", "create"]),
      roles: viewOnly,
    },
  },
  {
    slug: "viewer",
    name: "Viewer",
    badgeColor: "#6b7280",
    isSystem: true,
    permissions: {
      analytics: viewOnly,
      projects: viewOnly,
      donations: viewOnly,
      categories: viewOnly,
      homepage: viewOnly,
      media: viewOnly,
      roles: viewOnly,
    },
  },
];

export const ROLE_BADGE_COLORS: Record<string, string> = Object.fromEntries(
  DEFAULT_ROLE_DEFINITIONS.map((r) => [r.slug, r.badgeColor]),
);

export function getDefaultRoleDefinition(slug: string): RoleDefinition | undefined {
  return DEFAULT_ROLE_DEFINITIONS.find((r) => r.slug === slug);
}

export function resolveRolePermissions(
  slug: string,
  dbPermissions?: AdminPermissions | null,
): AdminPermissions {
  if (slug === "super_admin") {
    return { analytics: { view: true, manage: true } };
  }

  if (dbPermissions && Object.keys(dbPermissions).length > 0) {
    return dbPermissions;
  }

  return getDefaultRoleDefinition(slug)?.permissions ?? {};
}

export function hasPermission(
  permissions: AdminPermissions,
  roleSlug: string,
  resource: PermissionResource,
  action: PermissionAction,
): boolean {
  if (roleSlug === "super_admin") return true;

  const resourcePerms = permissions[resource];
  if (!resourcePerms) return false;

  return resourcePerms[action] === true || resourcePerms.manage === true;
}

export function canAccessNav(
  permissions: AdminPermissions,
  roleSlug: string,
  resource: PermissionResource,
): boolean {
  return hasPermission(permissions, roleSlug, resource, "view");
}
