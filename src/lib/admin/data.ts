import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CategoryRow, ProjectRow, SettingRow, StatisticsRow } from "@/types";

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
