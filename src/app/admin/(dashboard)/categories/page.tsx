import { saveCategory } from "@/lib/admin/actions";
import { AccentSelect } from "@/components/admin/AccentSelect";
import { ImageField } from "@/components/admin/ImageField";
import { adminGetCategories } from "@/lib/admin/data";
import { categoryAccentColors } from "@/lib/design-tokens";

export default async function AdminCategoriesPage() {
  const categories = await adminGetCategories();

  return (
    <>
      <h1 className="admin-page-title">الفئات</h1>
      <p className="admin-page-subtitle">
        عدّل بطاقات المشاريع: Educational · Health · Water · Orphans وغيرها — العنوان، الأيقونة، ولون الشريط السفلي.
      </p>

      <div className="admin-form" style={{ gap: "1.5rem" }}>
        {categories.map((category) => (
          <form key={category.slug} action={saveCategory} className="admin-form admin-card">
            <input type="hidden" name="slug" value={category.slug} />

            <div className="admin-category-header">
              <div
                className="admin-category-swatch"
                style={{ backgroundColor: categoryAccentColors[category.accent] }}
              />
              <h2 className="admin-label">
                {category.title_line_1} {category.title_line_2}
              </h2>
            </div>

            <div className="admin-row">
              <div className="admin-field">
                <label className="admin-label">السطر الأول (مثال: المشاريع)</label>
                <input
                  name="title_line_1"
                  className="admin-input"
                  defaultValue={category.title_line_1}
                  required
                />
              </div>
              <div className="admin-field">
                <label className="admin-label">السطر الثاني (مثال: التعليمية)</label>
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
                <label className="admin-label">لون الشريط السفلي</label>
                <AccentSelect defaultValue={category.accent} />
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
