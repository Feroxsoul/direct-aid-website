"use client";

import { useState } from "react";
import { saveCategoryKeys } from "@/lib/admin/actions";
import { useAdminLang } from "@/lib/admin/i18n-context";
import type { CategoryRow } from "@/types";

type SettingsCategoryKeysPanelProps = {
  categories: CategoryRow[];
};

export function SettingsCategoryKeysPanel({ categories }: SettingsCategoryKeysPanelProps) {
  const { t } = useAdminLang();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    const result = await saveCategoryKeys(new FormData(event.currentTarget));
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setMessage(t("settings.categoryKeysSaved"));
  }

  return (
    <form onSubmit={handleSubmit} className="dash-panel admin-form">
      <h2 className="dash-panel-title">{t("settings.categoryKeysTitle")}</h2>
      <p className="admin-help-text">{t("settings.categoryKeysHelp")}</p>

      {message ? <p className="admin-success">{message}</p> : null}
      {error ? <p className="admin-error">{error}</p> : null}

      <div className="settings-table-wrap">
        <table className="settings-table">
          <thead>
            <tr>
              <th>{t("settings.categoryArabic")}</th>
              <th>{t("settings.categoryEnglish")}</th>
              <th>{t("settings.categorySlugKey")}</th>
              <th>{t("settings.categoryRouteSlug")}</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.slug}>
                <td>
                  {category.title_line_1} {category.title_line_2}
                  <input type="hidden" name={`slug__${category.slug}`} value={category.slug} />
                </td>
                <td>
                  <input
                    name={`name_en__${category.slug}`}
                    className="admin-input"
                    defaultValue={category.name_en ?? ""}
                    required
                    dir="ltr"
                    placeholder="Health"
                  />
                </td>
                <td dir="ltr">{category.slug_key}</td>
                <td dir="ltr">{category.slug}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button type="submit" className="admin-button">
        {t("settings.saveCategoryKeys")}
      </button>
    </form>
  );
}
