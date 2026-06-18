"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { deleteProject, saveProject } from "@/lib/admin/actions";
import { MonthYearPicker } from "@/components/admin/MonthYearPicker";
import { ProjectMediaPicker } from "@/components/admin/ProjectMediaPicker";
import { useAdminLang } from "@/lib/admin/i18n-context";
import { parseProjectDateLabel } from "@/lib/project-slug";
import type { CategoryRow, CountryRow, ProjectRow } from "@/types";

type ProjectFormProps = {
  project?: ProjectRow | null;
  categories: CategoryRow[];
  countries: CountryRow[];
  isSuperAdmin: boolean;
};

function resolveProjectDate(project?: ProjectRow | null) {
  if (project?.project_month && project?.project_year) {
    return { month: project.project_month, year: project.project_year };
  }
  const parsed = parseProjectDateLabel(project?.date_label, project?.year_code);
  return parsed ? { month: parsed.month, year: parsed.year } : { month: null, year: null };
}

export function ProjectForm({
  project,
  categories,
  countries,
  isSuperAdmin,
}: ProjectFormProps) {
  const { t } = useAdminLang();
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const isNew = !project;
  const projectDate = resolveProjectDate(project);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    const result = await saveProject(new FormData(event.currentTarget));
    if (!result.ok) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

    router.push("/admin/projects");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="admin-form dash-panel">
      <input type="hidden" name="is_new" value={String(isNew)} />
      {project ? <input type="hidden" name="original_slug" value={project.slug} /> : null}

      <h2 className="dash-panel-title">
        {isNew ? t("projectForm.new") : t("projectForm.edit")}
      </h2>

      {error ? <p className="admin-error">{error}</p> : null}

      <div className="admin-row">
        <div className="admin-field">
          <label className="admin-label" htmlFor="slug">
            {t("projectForm.slug")}
          </label>
          {isNew ? (
            <>
              <input
                id="slug"
                className="admin-input"
                value={t("projectForm.slugAuto")}
                readOnly
                dir="ltr"
              />
              <p className="admin-help-text">{t("projectForm.slugAutoHelp")}</p>
            </>
          ) : (
            <>
              <input
                id="slug"
                name="slug"
                className="admin-input"
                defaultValue={project.slug}
                readOnly={!isSuperAdmin}
                dir="ltr"
              />
              {!isSuperAdmin ? (
                <p className="admin-help-text">{t("projectForm.slugReadOnly")}</p>
              ) : (
                <p className="admin-help-text">{t("projectForm.slugSuperAdmin")}</p>
              )}
            </>
          )}
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
                {category.slug_key ? ` (${category.slug_key})` : ""}
              </option>
            ))}
          </select>
        </div>
        <div className="admin-field">
          <label className="admin-label" htmlFor="country_slug">
            {t("projectForm.country")}
          </label>
          <select
            id="country_slug"
            name="country_slug"
            className="admin-select"
            defaultValue={project?.country_slug ?? ""}
            required
          >
            <option value="">{t("projectForm.selectCountry")}</option>
            {countries.map((country) => (
              <option key={country.slug} value={country.slug}>
                {country.name_ar}
              </option>
            ))}
          </select>
        </div>
      </div>

      <MonthYearPicker month={projectDate.month} year={projectDate.year} />

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
        <button type="submit" className="admin-button" disabled={submitting}>
          {submitting
            ? t("common.uploading")
            : isNew
              ? t("projectForm.create")
              : t("projectForm.save")}
        </button>
      </div>
    </form>
  );
}

export function ProjectDeleteForm({ slug }: { slug: string }) {
  const { t } = useAdminLang();
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleDelete(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!window.confirm(t("projects.deleteConfirm"))) return;

    setError("");
    setSubmitting(true);
    const formData = new FormData();
    formData.set("slug", slug);
    const result = await deleteProject(formData);
    if (!result.ok) {
      setError(result.error);
      setSubmitting(false);
      return;
    }
    router.push("/admin/projects");
    router.refresh();
  }

  return (
    <form onSubmit={handleDelete} className="admin-actions">
      {error ? <p className="admin-error">{error}</p> : null}
      <button type="submit" className="admin-button admin-button-danger" disabled={submitting}>
        {t("projectForm.delete")}
      </button>
    </form>
  );
}
