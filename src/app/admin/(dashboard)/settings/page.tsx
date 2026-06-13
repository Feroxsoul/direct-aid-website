import { savePlatformSettings } from "@/lib/admin/actions";
import { requireSuperAdmin } from "@/lib/admin/auth";
import { adminGetSettings } from "@/lib/admin/data";

type SettingsPageProps = {
  searchParams: Promise<{ saved?: string }>;
};

export default async function AdminSettingsPage({ searchParams }: SettingsPageProps) {
  await requireSuperAdmin();
  const { saved } = await searchParams;
  const settings = await adminGetSettings();
  const map = Object.fromEntries(settings.map((s) => [s.key, s.value ?? ""]));

  return (
    <div className="dash-page">
      <header className="dash-page-header">
        <h1 className="dash-page-title">Platform Settings</h1>
        <p className="dash-page-subtitle">
          Super Admin only — configure branding, integrations, and security.
        </p>
      </header>

      {saved ? <p className="admin-success">Settings saved.</p> : null}

      <form action={savePlatformSettings} className="dash-panel admin-form">
        <h2 className="dash-panel-title">General</h2>
        <div className="admin-field">
          <label className="admin-label">Platform Name</label>
          <input
            name="site_title"
            className="admin-input"
            defaultValue={map.site_title ?? "Direct Aid 10x10"}
          />
        </div>
        <div className="admin-field">
          <label className="admin-label">Logo URL</label>
          <input
            name="logo_url"
            className="admin-input"
            defaultValue={map.logo_url ?? ""}
            dir="ltr"
          />
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
          Save Settings
        </button>
      </form>
    </div>
  );
}
