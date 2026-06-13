import { deleteProject, saveProject } from "@/lib/admin/actions";
import { GalleryField } from "@/components/admin/GalleryField";
import { ImageField } from "@/components/admin/ImageField";
import type { CategoryRow, ProjectRow } from "@/types";

type ProjectFormProps = {
  project?: ProjectRow | null;
  categories: CategoryRow[];
};

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

export function ProjectForm({ project, categories }: ProjectFormProps) {
  const isNew = !project;

  return (
    <form action={saveProject} className="admin-form admin-card">
      <input type="hidden" name="is_new" value={String(isNew)} />

      <div className="admin-row">
        <div className="admin-field">
          <label className="admin-label" htmlFor="slug">
            معرف المشروع (slug)
          </label>
          <input
            id="slug"
            name="slug"
            className="admin-input"
            defaultValue={project?.slug ?? ""}
            required
            readOnly={!isNew}
            dir="ltr"
          />
        </div>
        <div className="admin-field">
          <label className="admin-label" htmlFor="title">
            العنوان
          </label>
          <input
            id="title"
            name="title"
            className="admin-input"
            defaultValue={project?.title ?? ""}
            required
          />
        </div>
      </div>

      <ImageField
        name="image_url"
        label="صورة البطاقة"
        defaultValue={project?.image_url ?? ""}
        required
      />

      <div className="admin-field">
        <label className="admin-label" htmlFor="short_description">
          Short Description
        </label>
        <textarea
          id="short_description"
          name="short_description"
          className="admin-textarea"
          rows={2}
          defaultValue={project?.short_description ?? ""}
        />
      </div>

      <div className="admin-field">
        <label className="admin-label" htmlFor="description">
          Full Description
        </label>
        <textarea
          id="description"
          name="description"
          className="admin-textarea"
          rows={8}
          defaultValue={project?.description ?? ""}
        />
      </div>

      <GalleryField
        name="gallery_urls"
        label="صور المعرض (صفحة المزيد)"
        defaultValue={project?.gallery_urls ?? []}
      />

      <ImageField
        name="icon_url"
        label="أيقونة المشروع (اختياري)"
        defaultValue={project?.icon_url ?? ""}
      />

      <div className="admin-row">
        <div className="admin-field">
          <label className="admin-label" htmlFor="category_slug">
            الفئة
          </label>
          <select
            id="category_slug"
            name="category_slug"
            className="admin-select"
            defaultValue={project?.category_slug ?? ""}
            required
          >
            <option value="">اختر فئة</option>
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.title_line_1} {category.title_line_2}
              </option>
            ))}
          </select>
        </div>
        <div className="admin-field">
          <label className="admin-label" htmlFor="location">
            الموقع
          </label>
          <input
            id="location"
            name="location"
            className="admin-input"
            defaultValue={project?.location ?? ""}
          />
        </div>
      </div>

      <div className="admin-row">
        <div className="admin-field">
          <label className="admin-label" htmlFor="date_label">
            التاريخ (على البطاقة)
          </label>
          <input
            id="date_label"
            name="date_label"
            className="admin-input"
            defaultValue={project?.date_label ?? ""}
            required
          />
        </div>
        <div className="admin-field">
          <label className="admin-label" htmlFor="year_code">
            رمز السنة (اختياري)
          </label>
          <input
            id="year_code"
            name="year_code"
            className="admin-input"
            defaultValue={project?.year_code ?? ""}
            dir="ltr"
          />
        </div>
      </div>

      <div className="admin-row">
        <div className="admin-field">
          <label className="admin-label" htmlFor="stat_value">
            رقم الإحصائية (اختياري)
          </label>
          <input
            id="stat_value"
            name="stat_value"
            className="admin-input"
            defaultValue={project?.stat_value ?? ""}
          />
        </div>
        <div className="admin-field">
          <label className="admin-label" htmlFor="stat_label">
            تسمية الإحصائية
          </label>
          <input
            id="stat_label"
            name="stat_label"
            className="admin-input"
            defaultValue={project?.stat_label ?? ""}
          />
        </div>
      </div>

      <div className="admin-row">
        <div className="admin-field">
          <label className="admin-label" htmlFor="accent">
            لون الشريط
          </label>
          <select
            id="accent"
            name="accent"
            className="admin-select"
            defaultValue={project?.accent ?? ""}
          >
            <option value="">افتراضي من الفئة</option>
            {accents.map((accent) => (
              <option key={accent} value={accent}>
                {accent}
              </option>
            ))}
          </select>
        </div>
        <div className="admin-field">
          <label className="admin-label" htmlFor="sort_order">
            ترتيب العرض
          </label>
          <input
            id="sort_order"
            name="sort_order"
            type="number"
            className="admin-input"
            defaultValue={project?.sort_order ?? 0}
          />
        </div>
      </div>

      <div className="admin-row">
        <div className="admin-field">
          <label className="admin-label" htmlFor="status">
            Status
          </label>
          <select
            id="status"
            name="status"
            className="admin-select"
            defaultValue={
              project?.status ?? (project?.is_published ? "published" : "draft")
            }
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <div className="admin-field">
          <label className="admin-label" htmlFor="goal_amount">
            Goal Amount (USD)
          </label>
          <input
            id="goal_amount"
            name="goal_amount"
            type="number"
            min={0}
            className="admin-input"
            defaultValue={project?.goal_amount ?? ""}
            dir="ltr"
          />
        </div>
        <div className="admin-field">
          <label className="admin-label" htmlFor="amount_raised">
            Amount Raised (USD)
          </label>
          <input
            id="amount_raised"
            name="amount_raised"
            type="number"
            min={0}
            className="admin-input"
            defaultValue={project?.amount_raised ?? 0}
            dir="ltr"
          />
        </div>
      </div>

      <div className="admin-row">
        <div className="admin-field">
          <label className="admin-label" htmlFor="meta_title">
            SEO Meta Title
          </label>
          <input
            id="meta_title"
            name="meta_title"
            className="admin-input"
            defaultValue={project?.meta_title ?? ""}
          />
        </div>
        <div className="admin-field">
          <label className="admin-label" htmlFor="meta_description">
            SEO Meta Description
          </label>
          <input
            id="meta_description"
            name="meta_description"
            className="admin-input"
            defaultValue={project?.meta_description ?? ""}
          />
        </div>
      </div>

      <div className="admin-actions">
        <button type="submit" className="admin-button">
          {isNew ? "إضافة المشروع" : "حفظ التغييرات"}
        </button>
      </div>
    </form>
  );
}

export function ProjectDeleteForm({ slug }: { slug: string }) {
  return (
    <form action={deleteProject} className="admin-actions">
      <input type="hidden" name="slug" value={slug} />
      <button type="submit" className="admin-button admin-button-danger">
        حذف المشروع
      </button>
    </form>
  );
}
