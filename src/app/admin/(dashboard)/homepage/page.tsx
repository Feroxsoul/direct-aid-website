import Link from "next/link";
import { saveHomepage } from "@/lib/admin/actions";
import { ColorField } from "@/components/admin/ColorField";
import { ImageField } from "@/components/admin/ImageField";
import { StatsBoxPreview } from "@/components/admin/StatsBoxPreview";
import { adminGetHomeStatistics, adminGetSettings } from "@/lib/admin/data";
import { fallbackHomeStatistics } from "@/data/fallback";

const boxColorOptions = [
  { value: "#e2eed6", label: "أخضر فاتح (افتراضي)" },
  { value: "#2c9942", label: "أخضر DirectAid" },
  { value: "#f9f9f9", label: "أبيض" },
  { value: "#e5e5e4", label: "رمادي فاتح" },
  { value: "#ffffff", label: "أبيض نقي" },
];

type HomepageAdminProps = {
  searchParams: Promise<{ saved?: string }>;
};

export default async function AdminHomepagePage({ searchParams }: HomepageAdminProps) {
  const { saved } = await searchParams;
  const [stats, settingsRows] = await Promise.all([
    adminGetHomeStatistics(),
    adminGetSettings(),
  ]);

  const settings = Object.fromEntries(
    settingsRows.map((row) => [row.key, row.value ?? ""]),
  );

  const brandLine1 = settings.stats_brand_line_1 ?? fallbackHomeStatistics.brandLine1;
  const brandLine2 = settings.stats_brand_line_2 ?? fallbackHomeStatistics.brandLine2;
  const boxColor = settings.stats_box_color ?? fallbackHomeStatistics.backgroundColor;

  return (
    <>
      <h1 className="admin-page-title">الصفحة الرئيسية</h1>
      <p className="admin-page-subtitle">
        عدّل الصندوق الأخضر والنصوص الظاهرة في أعلى الموقع. شعار DirectAid ثابت ولا يُعدّل من هنا.
      </p>

      {saved ? <p className="admin-success">تم الحفظ بنجاح.</p> : null}

      <StatsBoxPreview
        value={stats?.value ?? ""}
        label={stats?.label ?? ""}
        brandLine1={brandLine1}
        brandLine2={brandLine2}
        introText={stats?.intro_text ?? ""}
        backgroundColor={boxColor}
        iconUrl={stats?.icon_url ?? ""}
      />

      <form action={saveHomepage} className="admin-form admin-card">
        <h2 className="admin-section-title">الصندوق الأخضر</h2>
        <p className="admin-help-text">
          Number · Beneficiary label · Ten · 10×10 · Intro paragraph · Icon · Background color
        </p>

        <div className="admin-row">
          <div className="admin-field">
            <label className="admin-label">الرقم (6,284,069)</label>
            <input
              name="stats_value"
              className="admin-input"
              defaultValue={stats?.value ?? ""}
              required
              dir="ltr"
            />
          </div>
          <div className="admin-field">
            <label className="admin-label">التسمية (انسان مستفيد)</label>
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
            <label className="admin-label">السطر الأول (عشرة / Ten)</label>
            <input
              name="stats_brand_line_1"
              className="admin-input"
              defaultValue={brandLine1}
              required
            />
          </div>
          <div className="admin-field">
            <label className="admin-label">السطر الثاني (10×10)</label>
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
          <label className="admin-label">نص المقدمة (الفقرة السفلية)</label>
          <textarea
            name="stats_intro"
            className="admin-textarea"
            defaultValue={stats?.intro_text ?? ""}
            rows={4}
          />
        </div>

        <ImageField
          name="stats_icon_url"
          label="أيقونة الإحصائية (الأشخاص بجانب الرقم)"
          defaultValue={stats?.icon_url ?? ""}
        />

        <ColorField
          name="stats_box_color"
          label="لون خلفية الصندوق الأخضر"
          defaultValue={boxColor}
          presets={boxColorOptions}
        />

        <h2 className="admin-section-title">زر المشاركة</h2>

        <div className="admin-field">
          <label className="admin-label">نص زر المشاركة</label>
          <input
            name="share_label"
            className="admin-input"
            defaultValue={settings.share_label ?? ""}
          />
        </div>

        <ImageField
          name="share_icon_url"
          label="أيقونة المشاركة"
          defaultValue={settings.share_icon_url ?? ""}
        />

        <button type="submit" className="admin-button">
          حفظ الصفحة الرئيسية
        </button>
      </form>

      <div className="admin-card admin-next-step">
        <h2 className="admin-section-title">بطاقات الفئات</h2>
        <p className="admin-help-text">
          لتعديل Educational projects · Health projects · Water projects وغيرها — العناوين، الأيقونات، وألوان الشريط السفلي:
        </p>
        <Link href="/admin/categories" className="admin-button">
          تعديل الفئات ←
        </Link>
      </div>
    </>
  );
}
