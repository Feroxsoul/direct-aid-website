import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  type AdminRole,
  canDeleteProjects,
  canManageUsers,
  hasMinRole,
} from "@/lib/admin/roles";
import type { AdminUserRow } from "@/types";

export async function getAdminUser() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function getAdminProfile(): Promise<AdminUserRow | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return null;

  const { data } = await supabase
    .from("admin_users")
    .select("*")
    .eq("user_id", authData.user.id)
    .eq("is_active", true)
    .maybeSingle();

  return data;
}

export async function requireAdminProfile(minRole: AdminRole = "editor") {
  const profile = await getAdminProfile();
  if (!profile) {
    redirect("/admin/login?error=unauthorized");
  }

  if (!hasMinRole(profile.role, minRole)) {
    redirect("/admin/login?error=forbidden");
  }

  return profile;
}

export async function requireAdmin() {
  return requireAdminProfile("editor");
}

export async function requireSuperAdmin() {
  const profile = await requireAdminProfile("super_admin");
  if (!canManageUsers(profile.role)) {
    redirect("/admin/login?error=forbidden");
  }
  return profile;
}

export async function requireSupabaseAdmin(minRole: AdminRole = "editor") {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    redirect("/admin/login?error=supabase");
  }

  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    redirect("/admin/login");
  }

  const { data: profile } = await supabase
    .from("admin_users")
    .select("*")
    .eq("user_id", data.user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (!profile || !hasMinRole(profile.role, minRole)) {
    redirect("/admin/login?error=unauthorized");
  }

  return { supabase, user: data.user, profile };
}

export async function assertCanDeleteProjects(profile: AdminUserRow) {
  if (!canDeleteProjects(profile.role)) {
    throw new Error("ليس لديك صلاحية حذف المشاريع");
  }
}
