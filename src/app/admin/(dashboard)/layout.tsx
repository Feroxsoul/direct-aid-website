import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/admin/auth";
import { adminGetUnreadNotificationCount } from "@/lib/admin/data";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";

export default async function AdminDashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const profile = await requireAdmin();
  const notificationCount = await adminGetUnreadNotificationCount(
    profile.user_id,
  );

  return (
    <AdminShell
      profile={profile}
      supabaseUrl={getSupabaseUrl()}
      supabaseAnonKey={getSupabaseAnonKey()}
      notificationCount={notificationCount}
    >
      {children}
    </AdminShell>
  );
}
