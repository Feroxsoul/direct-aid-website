import { HomepageAdminForm } from "@/components/admin/HomepageAdminForm";
import { StatsBoxPreview } from "@/components/admin/StatsBoxPreview";
import { requireAdmin, requirePermission } from "@/lib/admin/auth";
import { adminGetHomeStatistics, adminGetSettings } from "@/lib/admin/data";
import { fallbackHomeStatistics } from "@/data/fallback";
import { settingsMap } from "@/lib/admin/settings-store";

type HomepageAdminProps = {
  searchParams: Promise<{ saved?: string }>;
};

export default async function AdminHomepagePage({ searchParams }: HomepageAdminProps) {
  await requirePermission("homepage", "view");
  const profile = await requireAdmin();
  const { saved } = await searchParams;
  const [stats, settingsRows] = await Promise.all([
    adminGetHomeStatistics(),
    adminGetSettings(),
  ]);

  const settings = settingsMap(settingsRows);
  const brandLogoUrl =
    settings.stats_brand_logo_url ?? fallbackHomeStatistics.brandLogoUrl;
  const boxColor = settings.stats_box_color ?? fallbackHomeStatistics.backgroundColor;

  return (
    <>
      <StatsBoxPreview
        value={stats?.value ?? ""}
        label={stats?.label ?? ""}
        brandLogoUrl={brandLogoUrl}
        introText={stats?.intro_text ?? ""}
        backgroundColor={boxColor}
        iconUrl={stats?.icon_url ?? ""}
      />
      <HomepageAdminForm
        stats={stats}
        settings={settings}
        brandLogoUrl={brandLogoUrl}
        boxColor={boxColor}
        isSuperAdmin={profile.role_slug === "super_admin"}
        saved={saved === "1"}
      />
    </>
  );
}
