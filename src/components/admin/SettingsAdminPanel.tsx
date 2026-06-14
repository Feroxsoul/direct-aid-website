"use client";

import { saveAdvancedSettings, savePlatformSettings } from "@/lib/admin/actions";
import { HexColorField } from "@/components/admin/HexColorField";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useAdminLang } from "@/lib/admin/i18n-context";
import type { CategoryRow } from "@/types";

type SettingsAdminPanelProps = {
  map: Record<string, string>;
  categories: CategoryRow[];
  colorMapForForm: Record<string, string>;
  tagDefs: unknown[];
  publicSiteUrl: string;
  saved?: boolean;
};

export function SettingsAdminPanel({
  map,
  categories,
  colorMapForForm,
  tagDefs,
  publicSiteUrl,
  saved,
}: SettingsAdminPanelProps) {
  const { t } = useAdminLang();

  return (
    <div className="dash-page">
      <AdminPageHeader
        titleKey="page.settings"
        subtitleKey="settings.subtitle"
        saved={saved}
        savedKey="settings.saved"
      />

      <section className="dash-panel">
        <h2 className="dash-panel-title">{t("settings.domainTitle")}</h2>
        <p className="admin-help-text">{t("settings.domainHelp")}</p>
        <p className="admin-help-text">
          {t("settings.publicUrl")}:{" "}
          <a href={publicSiteUrl} dir="ltr">
            {publicSiteUrl}
          </a>
        </p>
      </section>

      <form action={savePlatformSettings} className="dash-panel admin-form">
        <h2 className="dash-panel-title">{t("settings.general")}</h2>
        <div className="admin-field">
          <label className="admin-label">{t("settings.siteTitle")}</label>
          <input
            name="site_title"
            className="admin-input"
            defaultValue={map.site_title ?? "مشاريع 10×10"}
          />
        </div>
        <div className="admin-field">
          <label className="admin-label">{t("settings.publicUrl")}</label>
          <input
            name="public_site_url"
            className="admin-input"
            defaultValue={publicSiteUrl}
            placeholder="https://da10.direct-aid.org"
            dir="ltr"
          />
        </div>
        <div className="admin-field">
          <label className="admin-label">{t("settings.logoUrl")}</label>
          <input name="logo_url" className="admin-input" defaultValue={map.logo_url ?? ""} dir="ltr" />
        </div>

        <h2 className="dash-panel-title">{t("settings.integrations")}</h2>
        <div className="admin-field">
          <label className="admin-label">{t("settings.stripePublic")}</label>
          <input
            name="stripe_public_key"
            className="admin-input"
            defaultValue={map.stripe_public_key ?? ""}
            dir="ltr"
          />
        </div>
        <div className="admin-field">
          <label className="admin-label">{t("settings.stripeSecret")}</label>
          <input
            name="stripe_secret_key"
            type="password"
            className="admin-input"
            defaultValue={map.stripe_secret_key ?? ""}
            dir="ltr"
          />
        </div>
        <div className="admin-field">
          <label className="admin-label">{t("settings.cloudinary")}</label>
          <input
            name="cloudinary_cloud_name"
            className="admin-input"
            defaultValue={map.cloudinary_cloud_name ?? ""}
            dir="ltr"
          />
        </div>

        <button type="submit" className="dash-btn dash-btn--primary">
          {t("settings.saveGeneral")}
        </button>
      </form>

      <form action={saveAdvancedSettings} className="dash-panel admin-form">
        <h2 className="dash-panel-title">{t("settings.categoryColors")}</h2>
        <p className="admin-help-text">{t("settings.categoryColorsHelp")}</p>
        {categories.map((category) => (
          <HexColorField
            key={category.slug}
            name={`color_${category.slug}`}
            label={`${category.title_line_1} ${category.title_line_2} (${category.slug})`}
            defaultValue={colorMapForForm[category.slug]}
          />
        ))}

        <h2 className="dash-panel-title">{t("settings.projectTags")}</h2>
        <p className="admin-help-text">{t("settings.projectTagsHelp")}</p>
        <textarea
          name="project_detail_tag_defs"
          className="admin-textarea"
          rows={6}
          dir="ltr"
          defaultValue={JSON.stringify(tagDefs, null, 2)}
        />

        <button type="submit" className="dash-btn dash-btn--primary">
          {t("settings.saveColors")}
        </button>
      </form>
    </div>
  );
}
