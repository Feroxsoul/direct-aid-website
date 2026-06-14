import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/admin/auth";
import { adminGetUnreadNotificationCount } from "@/lib/admin/data";
import { BRAND_10X10_LOGO_SVG } from "@/lib/brand";

export default async function AdminDashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const profile = await requireAdmin();
  const notificationCount = await adminGetUnreadNotificationCount(profile.user_id);

  const logoUrl = BRAND_10X10_LOGO_SVG;

  return (
    <AdminShell
      profile={profile}
      logoUrl={logoUrl}
      notificationCount={notificationCount}
    >
      {children}
    </AdminShell>
  );
}
