import { saveCategory } from "@/lib/admin/actions";
import { AccentSelect } from "@/components/admin/AccentSelect";
import { ImageField } from "@/components/admin/ImageField";
import { requirePermission } from "@/lib/admin/auth";
import { adminGetCategories } from "@/lib/admin/data";
import { categoryAccentColors } from "@/lib/design-tokens";

export default async function AdminCategoriesPage() {
  await requirePermission("categories", "view");
  const categories = await adminGetCategories();

  return (
    <div className="dash-page">
      <header className="dash-page-header">
        <h1 className="dash-page-title">Categories</h1>
        <p className="dash-page-subtitle">
          {categories.length} category tiles — title, icon, accent color, and sort order.
        </p>
      </header>

      <div className="admin-category-grid">
        {categories.map((category) => (
          <form key={category.slug} action={saveCategory} className="admin-category-card">
            <input type="hidden" name="slug" value={category.slug} />

            <header className="admin-category-card-head">
              <div
                className="admin-category-swatch"
                style={{ backgroundColor: categoryAccentColors[category.accent] }}
              />
              <div>
                <h2 className="admin-category-card-title">
                  {category.title_line_1} {category.title_line_2}
                </h2>
                <p className="admin-category-card-slug" dir="ltr">
                  {category.slug}
                </p>
              </div>
            </header>

            <div className="admin-row">
              <div className="admin-field">
                <label className="admin-label">Title line 1</label>
                <input
                  name="title_line_1"
                  className="admin-input"
                  defaultValue={category.title_line_1}
                  required
                />
              </div>
              <div className="admin-field">
                <label className="admin-label">Title line 2</label>
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
              label="Category icon"
              defaultValue={category.icon_url}
              required
            />

            <div className="admin-row">
              <div className="admin-field">
                <label className="admin-label">Accent color</label>
                <AccentSelect defaultValue={category.accent} />
              </div>
              <div className="admin-field">
                <label className="admin-label">Sort order</label>
                <input
                  name="sort_order"
                  type="number"
                  className="admin-input"
                  defaultValue={category.sort_order}
                />
              </div>
            </div>

            <button type="submit" className="admin-button">
              Save category
            </button>
          </form>
        ))}
      </div>
    </div>
  );
}
