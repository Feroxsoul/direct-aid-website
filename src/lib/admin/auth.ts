import { redirect } from "next/navigation";
import {
  getDefaultRoleDefinition,
  hasPermission,
  resolveRolePermissions,
  type PermissionAction,
  type PermissionResource,
} from "@/lib/admin/permissions";
import {
  canDeleteProjects,
  canManageUsers,
  getRoleBadgeColor,
  getRoleLabel,
  hasMinRole,
} from "@/lib/admin/roles";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { parseNavHiddenPages } from "@/lib/admin/nav-pages";
import type { AdminPermissions, AdminProfile, AdminUserRow } from "@/types";

function enrichProfile(row: AdminUserRow): AdminProfile {
  const roleSlug = row.role_slug ?? row.role ?? "viewer";
  const roleDef = getDefaultRoleDefinition(roleSlug);

  return {
    ...row,
    role_slug: roleSlug,
    role_name: roleDef?.name ?? getRoleLabel(roleSlug),
    badge_color: getRoleBadgeColor(roleSlug),
    permissions: resolveRolePermissions(roleSlug),
    nav_hidden_pages: parseNavHiddenPages(row.nav_hidden_pages),
  };
}

export async function getAdminUser() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function getAdminProfile(): Promise<AdminProfile | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return null;

  const { data } = await supabase
    .from("admin_users")
    .select("*")
    .eq("user_id", authData.user.id)
    .eq("is_active", true)
    .is("suspended_at", null)
    .maybeSingle();

  if (!data) return null;

  const roleSlug = data.role_slug ?? data.role;
  const { data: roleRow } = await supabase
    .from("admin_roles")
    .select("name, badge_color, permissions")
    .eq("slug", roleSlug)
    .maybeSingle();

  const profile = enrichProfile(data);

  if (roleRow) {
    profile.role_name = roleRow.name;
    profile.badge_color = roleRow.badge_color;
    profile.permissions = resolveRolePermissions(
      roleSlug,
      roleRow.permissions as AdminPermissions,
    );
  }

  return profile;
}

export async function requireAdminProfile(minRole = "editor") {
  const profile = await getAdminProfile();
  if (!profile) {
    redirect("/admin/login?error=unauthorized");
  }

  if (!hasMinRole(profile.role_slug, minRole)) {
    redirect("/admin/login?error=forbidden");
  }

  return profile;
}

export async function requireAdmin() {
  return requireAdminProfile("editor");
}

export async function requireSuperAdmin() {
  const profile = await requireAdminProfile("super_admin");
  if (!canManageUsers(profile.role_slug, profile.permissions)) {
    redirect("/admin/login?error=forbidden");
  }
  return profile;
}

export async function requirePermission(
  resource: PermissionResource,
  action: PermissionAction,
) {
  const profile = await requireAdmin();
  if (!hasPermission(profile.permissions, profile.role_slug, resource, action)) {
    redirect("/admin/login?error=forbidden");
  }
  return profile;
}

export async function requireSupabaseAdmin(minRole = "editor") {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    redirect("/admin/login?error=supabase");
  }

  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    redirect("/admin/login");
  }

  const profile = await getAdminProfile();
  if (!profile || !hasMinRole(profile.role_slug, minRole)) {
    redirect("/admin/login?error=unauthorized");
  }

  return { supabase, user: data.user, profile };
}

export async function assertCanDeleteProjects(profile: AdminProfile) {
  if (!canDeleteProjects(profile.role_slug, profile.permissions)) {
    throw new Error("ليس لديك صلاحية حذف المشاريع");
  }
}
