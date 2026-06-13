import { DashboardView } from "@/components/admin/DashboardView";
import { requirePermission } from "@/lib/admin/auth";
import { adminGetDashboardStats } from "@/lib/admin/dashboard-data";

export default async function AdminDashboardPage() {
  await requirePermission("analytics", "view");
  const stats = await adminGetDashboardStats();

  return <DashboardView stats={stats} />;
}
