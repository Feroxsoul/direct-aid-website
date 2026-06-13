import {
  DEFAULT_ROLE_DEFINITIONS,
  getDefaultRoleDefinition,
  hasPermission,
  ROLE_BADGE_COLORS,
  type AdminPermissions,
  type PermissionAction,
  type PermissionResource,
} from "@/lib/admin/permissions";

/** @deprecated Use role_slug — kept for backward compatibility */
export const ADMIN_ROLES = ["super_admin", "admin", "editor"] as const;

export type LegacyAdminRole = (typeof ADMIN_ROLES)[number];

export type AdminRole = string;

export const ROLE_LABELS: Record<string, string> = Object.fromEntries(
  DEFAULT_ROLE_DEFINITIONS.map((r) => [r.slug, r.name]),
);

export const ROLE_DESCRIPTIONS: Record<string, string> = {
  super_admin: "Full platform access — founder level",
  admin: "Manage content, donations, and most users",
  project_manager: "Create and publish projects",
  donation_manager: "View and manage donations",
  content_manager: "Edit homepage, categories, and content",
  editor: "Edit content without deleting projects",
  viewer: "Read-only access",
};

export { ROLE_BADGE_COLORS, DEFAULT_ROLE_DEFINITIONS, hasPermission };

export function getRoleBadgeColor(slug: string, override?: string | null) {
  return override ?? ROLE_BADGE_COLORS[slug] ?? "#6b7280";
}

export function getRoleLabel(slug: string) {
  return ROLE_LABELS[slug] ?? getDefaultRoleDefinition(slug)?.name ?? slug;
}

export function hasMinRole(userRole: string, minRole: string) {
  const rank: Record<string, number> = {
    viewer: 1,
    editor: 2,
    content_manager: 3,
    donation_manager: 3,
    project_manager: 3,
    admin: 4,
    super_admin: 5,
  };
  return (rank[userRole] ?? 0) >= (rank[minRole] ?? 99);
}

export function canDeleteProjects(
  roleSlug: string,
  permissions?: AdminPermissions,
) {
  if (roleSlug === "super_admin") return true;
  if (permissions) {
    return hasPermission(permissions, roleSlug, "projects", "delete");
  }
  return hasMinRole(roleSlug, "admin");
}

export function canManageUsers(
  roleSlug: string,
  permissions?: AdminPermissions,
) {
  if (roleSlug === "super_admin") return true;
  if (permissions) {
    return (
      hasPermission(permissions, roleSlug, "users", "create") ||
      hasPermission(permissions, roleSlug, "users", "delete")
    );
  }
  return roleSlug === "super_admin";
}

export function canManageRoles(roleSlug: string) {
  return roleSlug === "super_admin";
}

const PRIVILEGED_ROLES = new Set(["super_admin", "admin"]);

export function isPrivilegedRole(roleSlug: string) {
  return PRIVILEGED_ROLES.has(roleSlug);
}

export function canAssignRole(actorRoleSlug: string, targetRoleSlug: string) {
  if (actorRoleSlug === "super_admin") return true;
  return !isPrivilegedRole(targetRoleSlug);
}

export function checkPermission(
  permissions: AdminPermissions,
  roleSlug: string,
  resource: PermissionResource,
  action: PermissionAction,
) {
  return hasPermission(permissions, roleSlug, resource, action);
}
