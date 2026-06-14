import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/admin/auth";
import { adminGetUnreadNotificationCount } from "@/lib/admin/data";
import { BRAND_10X10_LOGO_SVG } from "@/lib/brand";
import { getPublicContentSettings } from "@/lib/public-content";

export default async function AdminDashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const profile = await requireAdmin();
  const [notificationCount, content] = await Promise.all([
    adminGetUnreadNotificationCount(profile.user_id),
    getPublicContentSettings(),
  ]);

  const logoUrl = BRAND_10X10_LOGO_SVG;

  return (
    <AdminShell
      profile={profile}
      logoUrl={logoUrl}
      publicSiteUrl={content.public_site_url}
      notificationCount={notificationCount}
    >
      {children}
    </AdminShell>
  );
}
