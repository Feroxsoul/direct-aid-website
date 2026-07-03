"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { saveHomepage } from "@/lib/admin/actions";
import { BilingualField } from "@/components/admin/BilingualField";
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
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const arLabel = t("projectForm.langAr");
  const enLabel = t("projectForm.langEn");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    const result = await saveHomepage(new FormData(event.currentTarget));
    if (!result.ok) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

    router.push("/admin/homepage?saved=1");
    router.refresh();
  }

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

      <form onSubmit={handleSubmit} className="admin-form dash-panel">
        <h2 className="dash-panel-title">{t("homepage.heroTitle")}</h2>
        {error ? <p className="admin-error">{error}</p> : null}

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
              dir="rtl"
            />
          </div>
          <div className="admin-field">
            <label className="admin-label">{t("homepage.statLabel")} ({enLabel})</label>
            <input
              name="stats_label_en"
              className="admin-input"
              defaultValue={stats?.label_en ?? ""}
              dir="ltr"
            />
          </div>
        </div>

        <BilingualField
          label={t("homepage.intro")}
          nameAr="stats_intro"
          nameEn="stats_intro_en"
          defaultAr={stats?.intro_text ?? ""}
          defaultEn={stats?.intro_text_en ?? ""}
          multiline
          rows={4}
          arLabel={arLabel}
          enLabel={enLabel}
        />

        <BilingualField
          label={t("homepage.cta")}
          nameAr="hero_cta_label"
          nameEn="hero_cta_label_en"
          defaultAr={settings.hero_cta_label ?? "استكشف مهمتنا ←"}
          defaultEn={settings.hero_cta_label_en ?? "Explore our mission →"}
          arLabel={arLabel}
          enLabel={enLabel}
        />

        <ImageField
          name="stats_brand_logo_url"
          label={t("homepage.brandLogo")}
          defaultValue={brandLogoUrl}
        />

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
        <BilingualField
          label={t("homepage.categoriesTitle")}
          nameAr="categories_section_title"
          nameEn="categories_section_title_en"
          defaultAr={settings.categories_section_title ?? "فئات المشاريع"}
          defaultEn={settings.categories_section_title_en ?? "Project categories"}
          arLabel={arLabel}
          enLabel={enLabel}
        />
        <BilingualField
          label={t("homepage.impactTitle")}
          nameAr="impact_section_title"
          nameEn="impact_section_title_en"
          defaultAr={settings.impact_section_title ?? "آخر نشاط للأثر"}
          defaultEn={settings.impact_section_title_en ?? "Latest impact"}
          arLabel={arLabel}
          enLabel={enLabel}
        />
        <BilingualField
          label={t("homepage.impactSubtitle")}
          nameAr="impact_section_subtitle"
          nameEn="impact_section_subtitle_en"
          defaultAr={
            settings.impact_section_subtitle ??
            "مشروع مميز من كل فئة — اختر فئة أعلاه لعرض المزيد."
          }
          defaultEn={
            settings.impact_section_subtitle_en ??
            "All projects — scroll down to load more."
          }
          multiline
          rows={2}
          arLabel={arLabel}
          enLabel={enLabel}
        />

        <h2 className="dash-panel-title">{t("homepage.transparencyTitle")}</h2>
        <BilingualField
          label={t("homepage.transparencyHeading")}
          nameAr="transparency_title"
          nameEn="transparency_title_en"
          defaultAr={settings.transparency_title ?? "راقب الشفافية"}
          defaultEn={settings.transparency_title_en ?? "Track transparency"}
          arLabel={arLabel}
          enLabel={enLabel}
        />
        <BilingualField
          label={t("homepage.transparencyDesc")}
          nameAr="transparency_text"
          nameEn="transparency_text_en"
          defaultAr={
            settings.transparency_text ??
            "ابقَ على اطلاع بآخر مستجدات عملياتنا الميدانية."
          }
          defaultEn={
            settings.transparency_text_en ??
            "Stay informed about the latest updates from our field operations."
          }
          multiline
          rows={3}
          arLabel={arLabel}
          enLabel={enLabel}
        />

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
        </div>
        <BilingualField
          label={t("homepage.whatsappMessage")}
          nameAr="whatsapp_subscribe_message"
          nameEn="whatsapp_subscribe_message_en"
          defaultAr={settings.whatsapp_subscribe_message ?? "اشتراك"}
          defaultEn={settings.whatsapp_subscribe_message_en ?? "Subscribe"}
          arLabel={arLabel}
          enLabel={enLabel}
        />
        <BilingualField
          label={t("homepage.whatsappButton")}
          nameAr="whatsapp_subscribe_button"
          nameEn="whatsapp_subscribe_button_en"
          defaultAr={settings.whatsapp_subscribe_button ?? "اشتراك"}
          defaultEn={settings.whatsapp_subscribe_button_en ?? "Subscribe"}
          arLabel={arLabel}
          enLabel={enLabel}
        />
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

        <button type="submit" className="admin-button" disabled={submitting}>
          {submitting ? t("common.uploading") : t("homepage.save")}
        </button>
      </form>
    </div>
  );
}
