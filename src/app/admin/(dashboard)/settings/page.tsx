import { saveAdvancedSettings, savePlatformSettings } from "@/lib/admin/actions";
import { AccentSelect } from "@/components/admin/AccentSelect";
import { requireSuperAdmin } from "@/lib/admin/auth";
import { adminGetCategories, adminGetSettings } from "@/lib/admin/data";
import {
  parseCategoryAccentMap,
  parseProjectTagDefs,
  settingsMap,
} from "@/lib/admin/settings-store";

type SettingsPageProps = {
  searchParams: Promise<{ saved?: string }>;
};

export default async function AdminSettingsPage({ searchParams }: SettingsPageProps) {
  await requireSuperAdmin();
  const { saved } = await searchParams;
  const [settingsRows, categories] = await Promise.all([
    adminGetSettings(),
    adminGetCategories(),
  ]);
  const map = settingsMap(settingsRows);
  const accentMap = parseCategoryAccentMap(map.category_accent_map);
  const tagDefs = parseProjectTagDefs(map.project_detail_tag_defs);

  const accentMapForForm = Object.fromEntries(
    categories.map((category) => [
      category.slug,
      accentMap[category.slug] ?? category.accent,
    ]),
  );

  return (
    <div className="dash-page">
      <header className="dash-page-header">
        <h1 className="dash-page-title">Settings</h1>
        <p className="dash-page-subtitle">
          Super Admin only — branding, integrations, category colors, and project detail tags.
        </p>
      </header>

      {saved ? <p className="admin-success">Settings saved successfully.</p> : null}

      <form action={savePlatformSettings} className="dash-panel admin-form">
        <h2 className="dash-panel-title">General</h2>
        <div className="admin-field">
          <label className="admin-label">Site title (Arabic, public)</label>
          <input
            name="site_title"
            className="admin-input"
            defaultValue={map.site_title ?? "مشاريع 10×10"}
          />
        </div>
        <div className="admin-field">
          <label className="admin-label">Logo URL</label>
          <input name="logo_url" className="admin-input" defaultValue={map.logo_url ?? ""} dir="ltr" />
        </div>

        <h2 className="dash-panel-title">Integrations</h2>
        <div className="admin-field">
          <label className="admin-label">Stripe Public Key</label>
          <input
            name="stripe_public_key"
            className="admin-input"
            defaultValue={map.stripe_public_key ?? ""}
            dir="ltr"
          />
        </div>
        <div className="admin-field">
          <label className="admin-label">Stripe Secret Key</label>
          <input
            name="stripe_secret_key"
            type="password"
            className="admin-input"
            defaultValue={map.stripe_secret_key ?? ""}
            dir="ltr"
          />
        </div>
        <div className="admin-field">
          <label className="admin-label">Cloudinary Cloud Name</label>
          <input
            name="cloudinary_cloud_name"
            className="admin-input"
            defaultValue={map.cloudinary_cloud_name ?? ""}
            dir="ltr"
          />
        </div>

        <button type="submit" className="dash-btn dash-btn--primary">
          Save general settings
        </button>
      </form>

      <form action={saveAdvancedSettings} className="dash-panel admin-form">
        <h2 className="dash-panel-title">Category accent colors</h2>
        <p className="admin-help-text">
          Assign accent colors per category. New categories use these mappings — no color picker on the category form.
        </p>
        {categories.map((category) => (
          <div key={category.slug} className="admin-row">
            <div className="admin-field">
              <label className="admin-label">
                {category.title_line_1} {category.title_line_2}
              </label>
              <span className="admin-help-text" dir="ltr">
                {category.slug}
              </span>
            </div>
            <div className="admin-field">
              <label className="admin-label">Accent</label>
              <select
                name={`accent_${category.slug}`}
                className="admin-select"
                defaultValue={accentMapForForm[category.slug]}
              >
                {["red", "green", "blue", "olive", "yellow", "orange", "water", "default"].map(
                  (accent) => (
                    <option key={accent} value={accent}>
                      {accent}
                    </option>
                  ),
                )}
              </select>
            </div>
          </div>
        ))}

        <h2 className="dash-panel-title">Project detail tags</h2>
        <p className="admin-help-text">
          JSON array of extra tags shown on every project detail page. Example:
          [{`{"key":"beneficiaries","label":"انسان مستفيد"}`}]
        </p>
        <textarea
          name="project_detail_tag_defs"
          className="admin-textarea"
          rows={6}
          dir="ltr"
          defaultValue={JSON.stringify(tagDefs, null, 2)}
        />

        <button type="submit" className="dash-btn dash-btn--primary">
          Save category colors &amp; tags
        </button>
      </form>
    </div>
  );
}
