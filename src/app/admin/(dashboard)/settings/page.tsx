import { SettingsAdminPanel } from "@/components/admin/SettingsAdminPanel";
import { requireSuperAdmin } from "@/lib/admin/auth";
import { adminGetCountries } from "@/lib/admin/countries";
import { adminGetCategories, adminGetSettings } from "@/lib/admin/data";
import { resolveCategoryColor } from "@/lib/category-colors";
import {
  DEFAULT_PUBLIC_SITE_URL,
  parseCategoryColorMap,
  parseProjectTagDefs,
  settingsMap,
} from "@/lib/admin/settings-store";

type SettingsPageProps = {
  searchParams: Promise<{ saved?: string }>;
};

export default async function AdminSettingsPage({ searchParams }: SettingsPageProps) {
  await requireSuperAdmin();
  const { saved } = await searchParams;
  const [settingsRows, categories, countries] = await Promise.all([
    adminGetSettings(),
    adminGetCategories(),
    adminGetCountries(),
  ]);
  const map = settingsMap(settingsRows);
  const colorMap = parseCategoryColorMap(map.category_accent_map);
  const tagDefs = parseProjectTagDefs(map.project_detail_tag_defs);
  const publicSiteUrl = map.public_site_url ?? DEFAULT_PUBLIC_SITE_URL;

  const colorMapForForm = Object.fromEntries(
    categories.map((category) => [
      category.slug,
      colorMap[category.slug] ??
        resolveCategoryColor(category.slug, category.accent, colorMap),
    ]),
  );

  return (
    <SettingsAdminPanel
      map={map}
      categories={categories}
      countries={countries}
      colorMapForForm={colorMapForForm}
      tagDefs={tagDefs}
      publicSiteUrl={publicSiteUrl}
      saved={saved === "1"}
    />
  );
}
