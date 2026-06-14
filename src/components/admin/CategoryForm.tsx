import { saveCategory } from "@/lib/admin/actions";
import { ImageField } from "@/components/admin/ImageField";
import type { CategoryRow } from "@/types";

type CategoryFormProps = {
  category?: CategoryRow | null;
};

export function CategoryForm({ category }: CategoryFormProps) {
  const isNew = !category;

  return (
    <form action={saveCategory} className="admin-form dash-panel">
      <input type="hidden" name="is_new" value={String(isNew)} />

      <h2 className="dash-panel-title">{isNew ? "New Category" : "Edit Category"}</h2>
      <p className="admin-help-text">
        Accent colors are assigned in Settings → Category Colors after the category is created.
      </p>

      <div className="admin-row">
        <div className="admin-field">
          <label className="admin-label" htmlFor="slug">
            Category ID (slug)
          </label>
          <input
            id="slug"
            name="slug"
            className="admin-input"
            defaultValue={category?.slug ?? ""}
            required
            readOnly={!isNew}
            dir="ltr"
            placeholder="e.g. health-10x10"
          />
        </div>
        <div className="admin-field">
          <label className="admin-label" htmlFor="sort_order">
            Sort order
          </label>
          <input
            id="sort_order"
            name="sort_order"
            type="number"
            className="admin-input"
            defaultValue={category?.sort_order ?? 0}
          />
        </div>
      </div>

      <div className="admin-row">
        <div className="admin-field">
          <label className="admin-label" htmlFor="title_line_1">
            Title line 1
          </label>
          <input
            id="title_line_1"
            name="title_line_1"
            className="admin-input"
            defaultValue={category?.title_line_1 ?? ""}
            required
          />
        </div>
        <div className="admin-field">
          <label className="admin-label" htmlFor="title_line_2">
            Title line 2
          </label>
          <input
            id="title_line_2"
            name="title_line_2"
            className="admin-input"
            defaultValue={category?.title_line_2 ?? ""}
            required
          />
        </div>
      </div>

      <ImageField
        name="icon_url"
        label="Category icon"
        defaultValue={category?.icon_url ?? ""}
        required
      />

      <div className="admin-field">
        <label className="admin-label" htmlFor="status">
          Publish status
        </label>
        <select
          id="status"
          name="status"
          className="admin-select"
          defaultValue={category?.status ?? "published"}
        >
          <option value="published">Published — visible on the public site</option>
          <option value="draft">Draft — hidden until you publish</option>
        </select>
      </div>

      <button type="submit" className="admin-button">
        {isNew ? "Create category" : "Save changes"}
      </button>
    </form>
  );
}
