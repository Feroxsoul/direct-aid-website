import { DEFAULT_ROLE_DEFINITIONS } from "@/lib/admin/permissions";
import { getRoleLabel, getRoleBadgeColor } from "@/lib/admin/roles";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { DashboardStats } from "@/types";

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string) {
  const [year, month] = key.split("-");
  const d = new Date(Number(year), Number(month) - 1, 1);
  return d.toLocaleString("en", { month: "short", year: "2-digit" });
}

export async function adminGetDashboardStats(): Promise<DashboardStats> {
  const supabase = await createSupabaseServerClient();
  const empty: DashboardStats = {
    totalDonations: 0,
    totalDonors: 0,
    totalProjects: 0,
    activeProjects: 0,
    totalUsers: 0,
    totalRoles: DEFAULT_ROLE_DEFINITIONS.length,
    monthlyDonations: 0,
    yearlyDonations: 0,
    donationGrowth: 0,
    projectGrowth: 0,
    usersByRole: [],
    recentUsers: [],
    suspendedUsers: 0,
    donationsByMonth: [],
    topProjects: [],
  };

  if (!supabase) return empty;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [
    projectsRes,
    usersRes,
    rolesRes,
    donationsRes,
    recentUsersRes,
    suspendedRes,
  ] = await Promise.all([
    supabase.from("projects").select("*"),
    supabase.from("admin_users").select("*"),
    supabase.from("admin_roles").select("id"),
    supabase.from("donations").select("*").eq("status", "completed"),
    supabase
      .from("admin_users")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("admin_users")
      .select("id", { count: "exact", head: true })
      .not("suspended_at", "is", null),
  ]);

  const projects = projectsRes.data ?? [];
  const users = usersRes.data ?? [];
  const donations = donationsRes.data ?? [];

  const totalDonations = donations.reduce((sum, d) => sum + Number(d.amount), 0);
  const donorEmails = new Set(
    donations.map((d) => d.donor_email).filter(Boolean) as string[],
  );

  const monthlyDonations = donations
    .filter((d) => new Date(d.created_at) >= monthStart)
    .reduce((sum, d) => sum + Number(d.amount), 0);

  const yearlyDonations = donations
    .filter((d) => new Date(d.created_at) >= yearStart)
    .reduce((sum, d) => sum + Number(d.amount), 0);

  const lastMonthDonations = donations
    .filter((d) => {
      const date = new Date(d.created_at);
      return date >= lastMonthStart && date < monthStart;
    })
    .reduce((sum, d) => sum + Number(d.amount), 0);

  const donationGrowth =
    lastMonthDonations > 0
      ? Math.round(
          ((monthlyDonations - lastMonthDonations) / lastMonthDonations) * 100,
        )
      : monthlyDonations > 0
        ? 100
        : 0;

  const roleCounts = new Map<string, number>();
  for (const user of users) {
    const slug = user.role_slug ?? user.role;
    roleCounts.set(slug, (roleCounts.get(slug) ?? 0) + 1);
  }

  const usersByRole = [...roleCounts.entries()].map(([role, count]) => ({
    role,
    label: getRoleLabel(role),
    color: getRoleBadgeColor(role),
    count,
  }));

  const monthTotals = new Map<string, number>();
  for (const donation of donations) {
    const key = monthKey(new Date(donation.created_at));
    monthTotals.set(key, (monthTotals.get(key) ?? 0) + Number(donation.amount));
  }

  const donationsByMonth = [...monthTotals.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, amount]) => ({ month: monthLabel(month), amount }));

  const topProjects = [...projects]
    .map((p) => ({
      slug: p.slug,
      title: p.title,
      image_url: p.image_url,
      goal_amount: Number(p.goal_amount ?? 0),
      amount_raised: Number(p.amount_raised ?? 0),
    }))
    .sort((a, b) => b.amount_raised - a.amount_raised)
    .slice(0, 5);

  const publishedCount = projects.filter(
    (p) => (p.status ?? (p.is_published ? "published" : "draft")) === "published",
  ).length;

  return {
    totalDonations,
    totalDonors: donorEmails.size,
    totalProjects: projects.length,
    activeProjects: publishedCount,
    totalUsers: users.length,
    totalRoles: rolesRes.data?.length ?? DEFAULT_ROLE_DEFINITIONS.length,
    monthlyDonations,
    yearlyDonations,
    donationGrowth,
    projectGrowth: 0,
    usersByRole,
    recentUsers: recentUsersRes.data ?? [],
    suspendedUsers: suspendedRes.count ?? 0,
    donationsByMonth,
    topProjects,
  };
}
