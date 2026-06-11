import { saveHomepage } from "@/lib/admin/actions";
import { ImageField } from "@/components/admin/ImageField";
import { adminGetHomeStatistics, adminGetSettings } from "@/lib/admin/data";

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

  return (
    <>
      <h1 className="admin-page-title">الصفحة الرئيسية</h1>
      <p className="admin-page-subtitle">إحصائيات المستفيدين وإعدادات الهيدر.</p>

      {saved ? <p className="admin-success">تم الحفظ بنجاح.</p> : null}

      <form action={saveHomepage} className="admin-form admin-card">
        <h2 className="admin-label">صندوق الإحصائيات</h2>

        <div className="admin-row">
          <div className="admin-field">
            <label className="admin-label">الرقم</label>
            <input
              name="stats_value"
              className="admin-input"
              defaultValue={stats?.value ?? ""}
              required
            />
          </div>
          <div className="admin-field">
            <label className="admin-label">التسمية</label>
            <input
              name="stats_label"
              className="admin-input"
              defaultValue={stats?.label ?? ""}
              required
            />
          </div>
        </div>

        <div className="admin-field">
          <label className="admin-label">نص المقدمة</label>
          <textarea
            name="stats_intro"
            className="admin-textarea"
            defaultValue={stats?.intro_text ?? ""}
          />
        </div>

        <ImageField
          name="stats_icon_url"
          label="أيقونة الإحصائية"
          defaultValue={stats?.icon_url ?? ""}
        />

        <ImageField
          name="stats_illustration_url"
          label="صورة الإحصائية (اختياري)"
          defaultValue={stats?.illustration_url ?? ""}
        />

        <h2 className="admin-label">الهيدر</h2>

        <div className="admin-field">
          <label className="admin-label">عنوان الموقع</label>
          <input
            name="site_title"
            className="admin-input"
            defaultValue={settings.site_title ?? ""}
          />
        </div>

        <div className="admin-field">
          <label className="admin-label">وصف الموقع (SEO)</label>
          <textarea
            name="site_description"
            className="admin-textarea"
            defaultValue={settings.site_description ?? ""}
          />
        </div>

        <div className="admin-field">
          <label className="admin-label">نص زر المشاركة</label>
          <input
            name="share_label"
            className="admin-input"
            defaultValue={settings.share_label ?? ""}
          />
        </div>

        <ImageField
          name="logo_url"
          label="شعار الموقع"
          defaultValue={settings.logo_url ?? ""}
        />

        <ImageField
          name="share_icon_url"
          label="أيقونة المشاركة"
          defaultValue={settings.share_icon_url ?? ""}
        />

        <button type="submit" className="admin-button">
          حفظ الصفحة الرئيسية
        </button>
      </form>
    </>
  );
}
