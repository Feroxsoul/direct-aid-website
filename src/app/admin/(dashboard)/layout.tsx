import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/admin/auth";
import { adminGetUnreadNotificationCount } from "@/lib/admin/data";
import { DEFAULT_DIRECT_AID_LOGO } from "@/lib/brand";
import { getPublicContentSettings } from "@/lib/public-content";

export default async function AdminDashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const profile = await requireAdmin();
  const [notificationCount, content] = await Promise.all([
    adminGetUnreadNotificationCount(profile.user_id),
    getPublicContentSettings(),
  ]);

  const logoUrl = content.logo_url || DEFAULT_DIRECT_AID_LOGO;

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
