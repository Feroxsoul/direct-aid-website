import { saveCategory } from "@/lib/admin/actions";
import { ImageField } from "@/components/admin/ImageField";
import { adminGetCategories } from "@/lib/admin/data";

const accents = [
  "red",
  "green",
  "blue",
  "olive",
  "yellow",
  "orange",
  "water",
  "default",
] as const;

export default async function AdminCategoriesPage() {
  const categories = await adminGetCategories();

  return (
    <>
      <h1 className="admin-page-title">الفئات</h1>
      <p className="admin-page-subtitle">تعديل عناوين وأيقونات مربعات الفئات على الصفحة الرئيسية.</p>

      <div className="admin-form" style={{ gap: "1.5rem" }}>
        {categories.map((category) => (
          <form key={category.slug} action={saveCategory} className="admin-form admin-card">
            <input type="hidden" name="slug" value={category.slug} />
            <h2 className="admin-label">
              {category.title_line_1} {category.title_line_2}
            </h2>

            <div className="admin-row">
              <div className="admin-field">
                <label className="admin-label">السطر الأول</label>
                <input
                  name="title_line_1"
                  className="admin-input"
                  defaultValue={category.title_line_1}
                  required
                />
              </div>
              <div className="admin-field">
                <label className="admin-label">السطر الثاني</label>
                <input
                  name="title_line_2"
                  className="admin-input"
                  defaultValue={category.title_line_2}
                  required
                />
              </div>
            </div>

            <ImageField
              name="icon_url"
              label="أيقونة الفئة"
              defaultValue={category.icon_url}
              required
            />

            <div className="admin-row">
              <div className="admin-field">
                <label className="admin-label">لون الشريط</label>
                <select
                  name="accent"
                  className="admin-select"
                  defaultValue={category.accent}
                >
                  {accents.map((accent) => (
                    <option key={accent} value={accent}>
                      {accent}
                    </option>
                  ))}
                </select>
              </div>
              <div className="admin-field">
                <label className="admin-label">الترتيب</label>
                <input
                  name="sort_order"
                  type="number"
                  className="admin-input"
                  defaultValue={category.sort_order}
                />
              </div>
            </div>

            <button type="submit" className="admin-button">
              حفظ الفئة
            </button>
          </form>
        ))}
      </div>
    </>
  );
}
