import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  AdminNotificationRow,
  AdminRoleRow,
  AdminUserRow,
  AuditLogRow,
  CategoryRow,
  DonationRow,
  MediaAssetRow,
  ProjectRow,
  SettingRow,
  StatisticsRow,
} from "@/types";

export async function adminGetProjects(): Promise<ProjectRow[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("projects")
    .select("*")
    .order("sort_order", { ascending: true });

  return data ?? [];
}

export async function adminGetProject(slug: string): Promise<ProjectRow | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  return data;
}

export async function adminGetCategories(): Promise<CategoryRow[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  return data ?? [];
}

export async function adminGetHomeStatistics(): Promise<StatisticsRow | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("statistics")
    .select("*")
    .eq("key", "homepage_beneficiaries")
    .maybeSingle();

  return data;
}

export async function adminGetSettings(): Promise<SettingRow[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data } = await supabase.from("settings").select("*").order("key");
  return data ?? [];
}

export async function adminGetUsers(): Promise<AdminUserRow[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("admin_users")
    .select("*")
    .order("created_at", { ascending: true });

  return data ?? [];
}

export async function adminGetRoles(): Promise<AdminRoleRow[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("admin_roles")
    .select("*")
    .order("name", { ascending: true });

  return data ?? [];
}

export async function adminGetDonations(): Promise<DonationRow[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("donations")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  return data ?? [];
}

export async function adminGetAuditLogs(): Promise<AuditLogRow[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  return data ?? [];
}

export async function adminGetMediaAssets(): Promise<MediaAssetRow[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("media_assets")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  return data ?? [];
}

export async function adminGetNotifications(
  userId: string | null,
): Promise<AdminNotificationRow[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  let query = supabase
    .from("admin_notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (userId) {
    query = query.or(`target_user_id.is.null,target_user_id.eq.${userId}`);
  }

  const { data } = await query;
  return data ?? [];
}

export async function adminGetUnreadNotificationCount(
  userId: string | null,
): Promise<number> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return 0;

  let query = supabase
    .from("admin_notifications")
    .select("id", { count: "exact", head: true })
    .eq("is_read", false);

  if (userId) {
    query = query.or(`target_user_id.is.null,target_user_id.eq.${userId}`);
  }

  const { count } = await query;
  return count ?? 0;
}
