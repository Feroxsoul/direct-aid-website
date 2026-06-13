import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/admin/auth";
import { adminGetUnreadNotificationCount } from "@/lib/admin/data";

export default async function AdminDashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const profile = await requireAdmin();
  const notificationCount = await adminGetUnreadNotificationCount(
    profile.user_id,
  );

  return (
    <AdminShell profile={profile} notificationCount={notificationCount}>
      {children}
    </AdminShell>
  );
}
