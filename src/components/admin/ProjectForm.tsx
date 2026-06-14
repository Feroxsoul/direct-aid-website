"use client";

import { deleteProject, saveProject } from "@/lib/admin/actions";
import { ProjectMediaPicker } from "@/components/admin/ProjectMediaPicker";
import { useAdminLang } from "@/lib/admin/i18n-context";
import type { CategoryRow, ProjectRow } from "@/types";

type ProjectFormProps = {
  project?: ProjectRow | null;
  categories: CategoryRow[];
};

export function ProjectForm({ project, categories }: ProjectFormProps) {
  const { t } = useAdminLang();
  const isNew = !project;

  return (
    <form action={saveProject} className="admin-form dash-panel">
      <input type="hidden" name="is_new" value={String(isNew)} />

      <h2 className="dash-panel-title">
        {isNew ? t("projectForm.new") : t("projectForm.edit")}
      </h2>

      <div className="admin-row">
        <div className="admin-field">
          <label className="admin-label" htmlFor="slug">
            {t("projectForm.slug")}
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
            {t("projectForm.title")}
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
            {t("projectForm.metaTitle")}
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
            {t("projectForm.metaDescription")}
          </label>
          <input
            id="meta_description"
            name="meta_description"
            className="admin-input"
            defaultValue={project?.meta_description ?? ""}
          />
        </div>
      </div>

      <p className="admin-help-text">{t("settings.categoryColorsHelp")}</p>

      <ProjectMediaPicker
        imageUrl={project?.image_url ?? ""}
        galleryUrls={project?.gallery_urls ?? []}
      />

      <div className="admin-field">
        <label className="admin-label" htmlFor="description">
          {t("projectForm.description")}
        </label>
        <p className="admin-help-text">{t("projectForm.descriptionHelp")}</p>
        <textarea
          id="description"
          name="description"
          className="admin-textarea"
          rows={8}
          defaultValue={project?.description ?? ""}
        />
      </div>

      <div className="impact-tags-panel">
        <h3 className="dash-panel-title">{t("projectForm.impactTag")}</h3>
        <p className="admin-help-text">{t("projectForm.impactHelp")}</p>
        <div className="admin-row">
          <div className="admin-field">
            <label className="admin-label" htmlFor="stat_value">
              {t("projectForm.statValue")}
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
              {t("projectForm.statLabel")}
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
            {t("projectForm.category")}
          </label>
          <select
            id="category_slug"
            name="category_slug"
            className="admin-select"
            defaultValue={project?.category_slug ?? ""}
            required
          >
            <option value="">{t("projectForm.selectCategory")}</option>
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.title_line_1} {category.title_line_2}
              </option>
            ))}
          </select>
        </div>
        <div className="admin-field">
          <label className="admin-label" htmlFor="location">
            {t("projectForm.location")}
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
            {t("projectForm.dateLabel")}
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
            {t("projectForm.sortOrder")}
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
          {t("projectForm.status")}
        </label>
        <select
          id="status"
          name="status"
          className="admin-select"
          defaultValue={project?.status ?? (project?.is_published ? "published" : "draft")}
        >
          <option value="draft">{t("common.draft")}</option>
          <option value="published">{t("common.published")}</option>
          <option value="archived">{t("common.archived")}</option>
        </select>
      </div>

      <div className="admin-actions">
        <button type="submit" className="admin-button">
          {isNew ? t("projectForm.create") : t("projectForm.save")}
        </button>
      </div>
    </form>
  );
}

export function ProjectDeleteForm({ slug }: { slug: string }) {
  const { t } = useAdminLang();

  return (
    <form action={deleteProject} className="admin-actions">
      <input type="hidden" name="slug" value={slug} />
      <button type="submit" className="admin-button admin-button-danger">
        {t("projectForm.delete")}
      </button>
    </form>
  );
}
