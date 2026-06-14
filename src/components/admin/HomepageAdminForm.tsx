"use client";

import { saveHomepage } from "@/lib/admin/actions";
import { ColorField } from "@/components/admin/ColorField";
import { ImageField } from "@/components/admin/ImageField";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useAdminLang } from "@/lib/admin/i18n-context";
import { DEFAULT_WHATSAPP_HEADER_URL } from "@/lib/admin/settings-store";
import type { StatisticsRow } from "@/types";

type HomepageAdminFormProps = {
  stats: StatisticsRow | null;
  settings: Record<string, string>;
  brandLogoUrl: string;
  boxColor: string;
  isSuperAdmin: boolean;
  saved?: boolean;
};

export function HomepageAdminForm({
  stats,
  settings,
  brandLogoUrl,
  boxColor,
  isSuperAdmin,
  saved,
}: HomepageAdminFormProps) {
  const { t } = useAdminLang();

  const boxColorOptions = [
    { value: "#e2eed6", label: t("homepage.colorLightGreen") },
    { value: "#2c9942", label: t("homepage.colorDaGreen") },
    { value: "#f9f9f9", label: t("homepage.colorOffWhite") },
    { value: "#e5e5e4", label: t("homepage.colorLightGray") },
    { value: "#ffffff", label: t("homepage.colorWhite") },
  ];

  return (
    <div className="dash-page">
      <AdminPageHeader
        titleKey="page.homepage"
        subtitleKey="homepage.subtitle"
        saved={saved}
        savedKey="homepage.saved"
      />

      <form action={saveHomepage} className="admin-form dash-panel">
        <h2 className="dash-panel-title">{t("homepage.heroTitle")}</h2>

        <div className="admin-row">
          <div className="admin-field">
            <label className="admin-label">{t("homepage.statValue")}</label>
            <input
              name="stats_value"
              className="admin-input"
              defaultValue={stats?.value ?? ""}
              required
              dir="ltr"
            />
          </div>
          <div className="admin-field">
            <label className="admin-label">{t("homepage.statLabel")}</label>
            <input
              name="stats_label"
              className="admin-input"
              defaultValue={stats?.label ?? ""}
              required
            />
          </div>
        </div>

        <ImageField
          name="stats_brand_logo_url"
          label={t("homepage.brandLogo")}
          defaultValue={brandLogoUrl}
        />

        <div className="admin-field">
          <label className="admin-label">{t("homepage.intro")}</label>
          <textarea
            name="stats_intro"
            className="admin-textarea"
            defaultValue={stats?.intro_text ?? ""}
            rows={4}
          />
        </div>

        <div className="admin-field">
          <label className="admin-label">{t("homepage.cta")}</label>
          <input
            name="hero_cta_label"
            className="admin-input"
            defaultValue={settings.hero_cta_label ?? "استكشف مهمتنا ←"}
          />
        </div>

        <ImageField
          name="stats_icon_url"
          label={t("homepage.statIcon")}
          defaultValue={stats?.icon_url ?? ""}
        />
        <ColorField
          name="stats_box_color"
          label={t("homepage.boxColor")}
          defaultValue={boxColor}
          presets={boxColorOptions}
        />

        <h2 className="dash-panel-title">{t("homepage.shareTitle")}</h2>
        <p className="admin-help-text">{t("homepage.shareHelp")}</p>
        <div className="admin-field">
          <label className="admin-label">{t("homepage.shareLabel")}</label>
          <input
            name="share_label"
            className="admin-input"
            defaultValue={settings.share_label ?? "مشاركة"}
          />
        </div>
        <ImageField
          name="share_icon_url"
          label={t("homepage.shareIcon")}
          defaultValue={settings.share_icon_url ?? ""}
        />

        {isSuperAdmin ? (
          <>
            <h2 className="dash-panel-title">{t("homepage.whatsappHeaderTitle")}</h2>
            <p className="admin-help-text">{t("homepage.whatsappHeaderHelp")}</p>
            <div className="admin-field">
              <label className="admin-label">{t("homepage.whatsappHeaderUrl")}</label>
              <input
                name="whatsapp_header_url"
                className="admin-input"
                defaultValue={settings.whatsapp_header_url ?? DEFAULT_WHATSAPP_HEADER_URL}
                dir="ltr"
              />
            </div>
          </>
        ) : null}

        <h2 className="dash-panel-title">{t("homepage.sectionsTitle")}</h2>
        <div className="admin-field">
          <label className="admin-label">{t("homepage.categoriesTitle")}</label>
          <input
            name="categories_section_title"
            className="admin-input"
            defaultValue={settings.categories_section_title ?? "فئات المشاريع"}
          />
        </div>
        <div className="admin-field">
          <label className="admin-label">{t("homepage.impactTitle")}</label>
          <input
            name="impact_section_title"
            className="admin-input"
            defaultValue={settings.impact_section_title ?? "آخر نشاط للأثر"}
          />
        </div>
        <div className="admin-field">
          <label className="admin-label">{t("homepage.impactSubtitle")}</label>
          <textarea
            name="impact_section_subtitle"
            className="admin-textarea"
            rows={2}
            defaultValue={
              settings.impact_section_subtitle ??
              "مشروع مميز من كل فئة — اختر فئة أعلاه لعرض المزيد."
            }
          />
        </div>

        <h2 className="dash-panel-title">{t("homepage.transparencyTitle")}</h2>
        <div className="admin-field">
          <label className="admin-label">{t("homepage.transparencyHeading")}</label>
          <input
            name="transparency_title"
            className="admin-input"
            defaultValue={settings.transparency_title ?? "راقب الشفافية"}
          />
        </div>
        <div className="admin-field">
          <label className="admin-label">{t("homepage.transparencyDesc")}</label>
          <textarea
            name="transparency_text"
            className="admin-textarea"
            rows={3}
            defaultValue={
              settings.transparency_text ??
              "ابقَ على اطلاع بآخر مستجدات عملياتنا الميدانية."
            }
          />
        </div>

        <h2 className="dash-panel-title">{t("homepage.whatsappTitle")}</h2>
        <p className="admin-help-text">{t("homepage.whatsappHelp")}</p>
        <div className="admin-row">
          <div className="admin-field">
            <label className="admin-label">{t("homepage.whatsappNumber")}</label>
            <input
              name="whatsapp_number"
              className="admin-input"
              defaultValue={settings.whatsapp_number ?? "9651866888"}
              dir="ltr"
            />
          </div>
          <div className="admin-field">
            <label className="admin-label">{t("homepage.whatsappMessage")}</label>
            <input
              name="whatsapp_subscribe_message"
              className="admin-input"
              defaultValue={settings.whatsapp_subscribe_message ?? "اشتراك"}
            />
          </div>
        </div>
        <div className="admin-field">
          <label className="admin-label">{t("homepage.whatsappButton")}</label>
          <input
            name="whatsapp_subscribe_button"
            className="admin-input"
            defaultValue={settings.whatsapp_subscribe_button ?? "اشتراك"}
          />
        </div>
        <div className="admin-field">
          <label className="admin-checkbox-label">
            <input
              type="checkbox"
              name="show_whatsapp_block"
              defaultChecked={(settings.show_whatsapp_block ?? "true") !== "false"}
            />
            {t("homepage.showWhatsapp")}
          </label>
          <p className="admin-help-text">{t("homepage.showWhatsappHelp")}</p>
        </div>

        <button type="submit" className="admin-button">
          {t("homepage.save")}
        </button>
      </form>
    </div>
  );
}
