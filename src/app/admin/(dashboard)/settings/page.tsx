import { saveAdvancedSettings, savePlatformSettings } from "@/lib/admin/actions";
import { HexColorField } from "@/components/admin/HexColorField";
import { requireSuperAdmin } from "@/lib/admin/auth";
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
  const [settingsRows, categories] = await Promise.all([
    adminGetSettings(),
    adminGetCategories(),
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
    <div className="dash-page">
      <header className="dash-page-header">
        <h1 className="dash-page-title">Settings</h1>
        <p className="dash-page-subtitle">
          Super Admin only — branding, public domain, integrations, category colors, and project detail tags.
        </p>
      </header>

      {saved ? <p className="admin-success">Settings saved successfully.</p> : null}

      <section className="dash-panel">
        <h2 className="dash-panel-title">Public domain — da10.direct-aid.org</h2>
        <p className="admin-help-text">
          Use this custom subdomain instead of the Railway default URL. After DNS is configured, set the public site URL below and share that link with users.
        </p>
        <ol className="admin-help-text" style={{ marginInlineStart: "1.25rem" }}>
          <li>
            In your DNS provider for <strong>direct-aid.org</strong>, add a <strong>CNAME</strong> record:
            <code dir="ltr"> da10 → &lt;your-app&gt;.up.railway.app</code>
          </li>
          <li>
            In <strong>Railway</strong>: open your service → <strong>Settings → Networking → Custom Domain</strong> → add{" "}
            <code dir="ltr">da10.direct-aid.org</code>
          </li>
          <li>
            Wait for SSL to provision (usually a few minutes), then set <strong>Public site URL</strong> to{" "}
            <code dir="ltr">https://da10.direct-aid.org</code>
          </li>
          <li>Redeploy if needed. Visitors should use the custom domain, not the Railway URL.</li>
        </ol>
        <p className="admin-help-text">
          Current configured URL: <a href={publicSiteUrl} dir="ltr">{publicSiteUrl}</a>
        </p>
      </section>

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
          <label className="admin-label">Public site URL</label>
          <input
            name="public_site_url"
            className="admin-input"
            defaultValue={publicSiteUrl}
            placeholder="https://da10.direct-aid.org"
            dir="ltr"
          />
          <p className="admin-help-text">
            Canonical public URL shown to admins and used for sharing metadata. Use https://da10.direct-aid.org after DNS is live.
          </p>
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
          Pick a hex color per category using the color picker or type a value like #2c9942.
        </p>
        {categories.map((category) => (
          <HexColorField
            key={category.slug}
            name={`color_${category.slug}`}
            label={`${category.title_line_1} ${category.title_line_2} (${category.slug})`}
            defaultValue={colorMapForForm[category.slug]}
          />
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
