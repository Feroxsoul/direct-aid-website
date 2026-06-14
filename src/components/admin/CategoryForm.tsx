"use client";

import { saveCategory } from "@/lib/admin/actions";
import { ImageField } from "@/components/admin/ImageField";
import { useAdminLang } from "@/lib/admin/i18n-context";
import type { CategoryRow } from "@/types";

type CategoryFormProps = {
  category?: CategoryRow | null;
};

export function CategoryForm({ category }: CategoryFormProps) {
  const { t } = useAdminLang();
  const isNew = !category;

  return (
    <form action={saveCategory} className="admin-form dash-panel">
      <input type="hidden" name="is_new" value={String(isNew)} />

      <h2 className="dash-panel-title">
        {isNew ? t("categoryForm.new") : t("categoryForm.edit")}
      </h2>
      <p className="admin-help-text">{t("categoryForm.help")}</p>

      <div className="admin-row">
        <div className="admin-field">
          <label className="admin-label" htmlFor="slug">
            {t("categoryForm.slug")}
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
            {t("categoryForm.sortOrder")}
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
            {t("categoryForm.title1")}
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
            {t("categoryForm.title2")}
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
        labelKey="categoryForm.icon"
        defaultValue={category?.icon_url ?? ""}
        required
      />

      <div className="admin-field">
        <label className="admin-label" htmlFor="status">
          {t("categoryForm.status")}
        </label>
        <select
          id="status"
          name="status"
          className="admin-select"
          defaultValue={category?.status ?? "published"}
        >
          <option value="published">{t("categoryForm.publishedHelp")}</option>
          <option value="draft">{t("categoryForm.draftHelp")}</option>
        </select>
      </div>

      <button type="submit" className="admin-button">
        {isNew ? t("categoryForm.create") : t("categoryForm.save")}
      </button>
    </form>
  );
}
