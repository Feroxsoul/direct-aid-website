import { deleteProject, saveProject } from "@/lib/admin/actions";
import { ProjectMediaPicker } from "@/components/admin/ProjectMediaPicker";
import type { CategoryRow, ProjectRow } from "@/types";

type ProjectFormProps = {
  project?: ProjectRow | null;
  categories: CategoryRow[];
};

export function ProjectForm({ project, categories }: ProjectFormProps) {
  const isNew = !project;

  return (
    <form action={saveProject} className="admin-form dash-panel">
      <input type="hidden" name="is_new" value={String(isNew)} />

      <h2 className="dash-panel-title">{isNew ? "New Project" : "Edit Project"}</h2>

      <div className="admin-row">
        <div className="admin-field">
          <label className="admin-label" htmlFor="slug">
            Project ID (slug)
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
            Title
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

      <p className="admin-help-text">
        Accent color is assigned automatically from the selected category (Settings → Category accent colors).
      </p>

      <ProjectMediaPicker
        imageUrl={project?.image_url ?? ""}
        galleryUrls={project?.gallery_urls ?? []}
      />

      <div className="admin-field">
        <label className="admin-label" htmlFor="description">
          Description
        </label>
        <p className="admin-help-text">
          First 100 characters appear on the home page project card.
        </p>
        <textarea
          id="description"
          name="description"
          className="admin-textarea"
          rows={8}
          defaultValue={project?.description ?? ""}
        />
      </div>

      <div className="impact-tags-panel">
        <h3 className="dash-panel-title">Card Impact Tag</h3>
        <p className="admin-help-text">
          Shown on the project card badge (e.g. 8,750 · beneficiaries). Leave empty to hide.
        </p>
        <div className="admin-row">
          <div className="admin-field">
            <label className="admin-label" htmlFor="stat_value">
              Tag value
            </label>
            <input
              id="stat_value"
              name="stat_value"
              className="admin-input"
              placeholder="8,750"
              defaultValue={project?.stat_value ?? ""}
            />
          </div>
          <div className="admin-field">
            <label className="admin-label" htmlFor="stat_label">
              Tag label
            </label>
            <input
              id="stat_label"
              name="stat_label"
              className="admin-input"
              placeholder="beneficiaries"
              defaultValue={project?.stat_label ?? ""}
            />
          </div>
        </div>
      </div>

      <div className="admin-row">
        <div className="admin-field">
          <label className="admin-label" htmlFor="category_slug">
            Category
          </label>
          <select
            id="category_slug"
            name="category_slug"
            className="admin-select"
            defaultValue={project?.category_slug ?? ""}
            required
          >
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.title_line_1} {category.title_line_2}
              </option>
            ))}
          </select>
        </div>
        <div className="admin-field">
          <label className="admin-label" htmlFor="location">
            Location
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
            Date label (on card)
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
          <label className="admin-label" htmlFor="sort_order">
            Sort order
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

      <div className="admin-field">
        <label className="admin-label" htmlFor="status">
          Status
        </label>
        <select
          id="status"
          name="status"
          className="admin-select"
          defaultValue={project?.status ?? (project?.is_published ? "published" : "draft")}
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div className="admin-actions">
        <button type="submit" className="admin-button">
          {isNew ? "Create project" : "Save changes"}
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
        Delete project
      </button>
    </form>
  );
}
