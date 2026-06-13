import { saveHomepage } from "@/lib/admin/actions";
import { ColorField } from "@/components/admin/ColorField";
import { ImageField } from "@/components/admin/ImageField";
import { StatsBoxPreview } from "@/components/admin/StatsBoxPreview";
import { requirePermission } from "@/lib/admin/auth";
import { adminGetHomeStatistics, adminGetSettings } from "@/lib/admin/data";
import { fallbackHomeStatistics } from "@/data/fallback";
import { DEFAULT_HEADER_NAV, settingsMap } from "@/lib/admin/settings-store";

const boxColorOptions = [
  { value: "#e2eed6", label: "Light green (default)" },
  { value: "#2c9942", label: "Direct Aid green" },
  { value: "#f9f9f9", label: "Off white" },
  { value: "#e5e5e4", label: "Light gray" },
  { value: "#ffffff", label: "Pure white" },
];

type HomepageAdminProps = {
  searchParams: Promise<{ saved?: string }>;
};

export default async function AdminHomepagePage({ searchParams }: HomepageAdminProps) {
  await requirePermission("homepage", "view");
  const { saved } = await searchParams;
  const [stats, settingsRows] = await Promise.all([
    adminGetHomeStatistics(),
    adminGetSettings(),
  ]);

  const settings = settingsMap(settingsRows);
  const brandLine1 = settings.stats_brand_line_1 ?? fallbackHomeStatistics.brandLine1;
  const brandLine2 = settings.stats_brand_line_2 ?? fallbackHomeStatistics.brandLine2;
  const boxColor = settings.stats_box_color ?? fallbackHomeStatistics.backgroundColor;
  const headerNavJson = settings.header_nav_json ?? JSON.stringify(DEFAULT_HEADER_NAV, null, 2);

  return (
    <div className="dash-page">
      <header className="dash-page-header">
        <h1 className="dash-page-title">Home Page</h1>
        <p className="dash-page-subtitle">
          Edit all Arabic content shown on the public homepage. Admin UI stays in English.
        </p>
      </header>

      {saved ? <p className="admin-success">Home page saved successfully.</p> : null}

      <StatsBoxPreview
        value={stats?.value ?? ""}
        label={stats?.label ?? ""}
        brandLine1={brandLine1}
        brandLine2={brandLine2}
        introText={stats?.intro_text ?? ""}
        backgroundColor={boxColor}
        iconUrl={stats?.icon_url ?? ""}
      />

      <form action={saveHomepage} className="admin-form dash-panel">
        <h2 className="dash-panel-title">Hero statistics box</h2>

        <div className="admin-row">
          <div className="admin-field">
            <label className="admin-label">Statistic value</label>
            <input
              name="stats_value"
              className="admin-input"
              defaultValue={stats?.value ?? ""}
              required
              dir="ltr"
            />
          </div>
          <div className="admin-field">
            <label className="admin-label">Statistic label (Arabic)</label>
            <input
              name="stats_label"
              className="admin-input"
              defaultValue={stats?.label ?? ""}
              required
            />
          </div>
        </div>

        <div className="admin-row">
          <div className="admin-field">
            <label className="admin-label">Brand line 1 (Arabic)</label>
            <input name="stats_brand_line_1" className="admin-input" defaultValue={brandLine1} required />
          </div>
          <div className="admin-field">
            <label className="admin-label">Brand line 2</label>
            <input
              name="stats_brand_line_2"
              className="admin-input"
              defaultValue={brandLine2}
              required
              dir="ltr"
            />
          </div>
        </div>

        <div className="admin-field">
          <label className="admin-label">Intro paragraph (Arabic)</label>
          <textarea
            name="stats_intro"
            className="admin-textarea"
            defaultValue={stats?.intro_text ?? ""}
            rows={4}
          />
        </div>

        <div className="admin-field">
          <label className="admin-label">Hero CTA button (Arabic)</label>
          <input
            name="hero_cta_label"
            className="admin-input"
            defaultValue={settings.hero_cta_label ?? "استكشف مهمتنا ←"}
          />
        </div>

        <ImageField name="stats_icon_url" label="Statistic icon" defaultValue={stats?.icon_url ?? ""} />
        <ColorField
          name="stats_box_color"
          label="Hero box background color"
          defaultValue={boxColor}
          presets={boxColorOptions}
        />

        <h2 className="dash-panel-title">Header navigation (Arabic labels)</h2>
        <p className="admin-help-text">
          JSON array: [{`{"href":"/","label":"الرئيسية"}`}, …]
        </p>
        <textarea
          name="header_nav_json"
          className="admin-textarea"
          rows={8}
          defaultValue={headerNavJson}
          dir="ltr"
        />

        <div className="admin-row">
          <div className="admin-field">
            <label className="admin-label">Donate button (Arabic)</label>
            <input
              name="donate_label"
              className="admin-input"
              defaultValue={settings.donate_label ?? "تبرع الآن"}
            />
          </div>
          <div className="admin-field">
            <label className="admin-label">Donate URL</label>
            <input
              name="donate_url"
              className="admin-input"
              defaultValue={settings.donate_url ?? "https://directaid.org/donate"}
              dir="ltr"
            />
          </div>
        </div>

        <h2 className="dash-panel-title">Homepage sections</h2>
        <div className="admin-field">
          <label className="admin-label">Categories section title (Arabic)</label>
          <input
            name="categories_section_title"
            className="admin-input"
            defaultValue={settings.categories_section_title ?? "فئات المشاريع"}
          />
        </div>
        <div className="admin-field">
          <label className="admin-label">Impact section title (Arabic)</label>
          <input
            name="impact_section_title"
            className="admin-input"
            defaultValue={settings.impact_section_title ?? "آخر نشاط للأثر"}
          />
        </div>
        <div className="admin-field">
          <label className="admin-label">Impact section subtitle (Arabic)</label>
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

        <h2 className="dash-panel-title">Transparency section</h2>
        <div className="admin-field">
          <label className="admin-label">Title (Arabic)</label>
          <input
            name="transparency_title"
            className="admin-input"
            defaultValue={settings.transparency_title ?? "راقب الشفافية"}
          />
        </div>
        <div className="admin-field">
          <label className="admin-label">Description (Arabic)</label>
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
        <div className="admin-row">
          <div className="admin-field">
            <label className="admin-label">Newsletter placeholder (Arabic)</label>
            <input
              name="newsletter_placeholder"
              className="admin-input"
              defaultValue={settings.newsletter_placeholder ?? "أدخل بريدك الإلكتروني"}
            />
          </div>
          <div className="admin-field">
            <label className="admin-label">Newsletter button (Arabic)</label>
            <input
              name="newsletter_button"
              className="admin-input"
              defaultValue={settings.newsletter_button ?? "انضم للمجتمع"}
            />
          </div>
        </div>

        <h2 className="dash-panel-title">Category pages share button</h2>
        <div className="admin-field">
          <label className="admin-label">Share label (Arabic)</label>
          <input name="share_label" className="admin-input" defaultValue={settings.share_label ?? ""} />
        </div>
        <ImageField
          name="share_icon_url"
          label="Share icon"
          defaultValue={settings.share_icon_url ?? ""}
        />

        <button type="submit" className="admin-button">
          Save home page
        </button>
      </form>
    </div>
  );
}
