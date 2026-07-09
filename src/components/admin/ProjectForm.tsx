"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { deleteProject, saveProject } from "@/lib/admin/actions";
import { BilingualField } from "@/components/admin/BilingualField";
import { MonthYearPicker } from "@/components/admin/MonthYearPicker";
import { ProjectMediaPicker } from "@/components/admin/ProjectMediaPicker";
import { useAdminLang } from "@/lib/admin/i18n-context";
import { formatEnglishCountryName } from "@/lib/site-localize";
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
  const { t, lang } = useAdminLang();
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
      </div>

      <h3 className="dash-panel-title">{t("projectForm.bilingualContent")}</h3>

      <BilingualField
        label={t("projectForm.titleBilingual")}
        nameAr="title"
        nameEn="title_en"
        defaultAr={project?.title ?? ""}
        defaultEn={project?.title_en ?? ""}
        requiredAr
        arLabel={t("projectForm.langAr")}
        enLabel={t("projectForm.langEn")}
      />

      <BilingualField
        label={t("projectForm.metaTitleBilingual")}
        nameAr="meta_title"
        nameEn="meta_title_en"
        defaultAr={project?.meta_title ?? ""}
        defaultEn={project?.meta_title_en ?? ""}
        arLabel={t("projectForm.langAr")}
        enLabel={t("projectForm.langEn")}
      />

      <BilingualField
        label={t("projectForm.metaDescriptionBilingual")}
        nameAr="meta_description"
        nameEn="meta_description_en"
        defaultAr={project?.meta_description ?? ""}
        defaultEn={project?.meta_description_en ?? ""}
        arLabel={t("projectForm.langAr")}
        enLabel={t("projectForm.langEn")}
      />

      <ProjectMediaPicker
        imageUrl={project?.image_url ?? ""}
        galleryUrls={project?.gallery_urls ?? []}
      />

      <BilingualField
        label={t("projectForm.descriptionBilingual")}
        nameAr="description"
        nameEn="description_en"
        defaultAr={project?.description ?? ""}
        defaultEn={project?.description_en ?? ""}
        multiline
        rows={8}
        arLabel={t("projectForm.langAr")}
        enLabel={t("projectForm.langEn")}
      />
      <p className="admin-help-text">{t("projectForm.descriptionHelp")}</p>

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
              dir="ltr"
            />
          </div>
        </div>
        <BilingualField
          label={t("projectForm.statLabelBilingual")}
          nameAr="stat_label"
          nameEn="stat_label_en"
          defaultAr={project?.stat_label ?? ""}
          defaultEn={project?.stat_label_en ?? ""}
          arLabel={t("projectForm.langAr")}
          enLabel={t("projectForm.langEn")}
        />
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
                {lang === "en"
                  ? `${category.name_en ?? category.title_line_2} (${category.slug_key ?? category.slug})`
                  : `${category.title_line_1} ${category.title_line_2}`}
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
          >
            <option value="">{t("projectForm.selectCountry")}</option>
            {countries.map((country) => (
              <option key={country.slug} value={country.slug}>
                {lang === "en"
                  ? formatEnglishCountryName(country.name_en)
                  : country.name_ar}
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
