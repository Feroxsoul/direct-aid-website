"use client";

import { useState } from "react";
import { saveCountries } from "@/lib/admin/actions";
import { useAdminLang } from "@/lib/admin/i18n-context";
import type { CountryRow } from "@/types";

type SettingsCountriesPanelProps = {
  countries: CountryRow[];
};

export function SettingsCountriesPanel({ countries }: SettingsCountriesPanelProps) {
  const { t } = useAdminLang();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [rows, setRows] = useState(countries);

  function addRow() {
    setRows((current) => [
      ...current,
      {
        id: `new-${current.length}`,
        slug: "",
        name_en: "",
        name_ar: "",
        sort_order: current.length + 1,
        is_active: true,
        created_at: "",
        updated_at: "",
      },
    ]);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    const result = await saveCountries(new FormData(event.currentTarget));
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setMessage(t("settings.countriesSaved"));
  }

  return (
    <form onSubmit={handleSubmit} className="dash-panel admin-form">
      <h2 className="dash-panel-title">{t("settings.countriesTitle")}</h2>
      <p className="admin-help-text">{t("settings.countriesHelp")}</p>

      {message ? <p className="admin-success">{message}</p> : null}
      {error ? <p className="admin-error">{error}</p> : null}

      <div className="settings-table-wrap">
        <table className="settings-table">
          <thead>
            <tr>
              <th>{t("settings.countryEnglish")}</th>
              <th>{t("settings.countryArabic")}</th>
              <th>{t("settings.countrySlug")}</th>
              <th>{t("settings.countryActive")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((country, index) => (
              <tr key={country.id}>
                <td>
                  <input type="hidden" name={`id__${index}`} value={country.id} />
                  <input
                    name={`name_en__${index}`}
                    className="admin-input"
                    defaultValue={country.name_en}
                    required
                    dir="ltr"
                  />
                </td>
                <td>
                  <input
                    name={`name_ar__${index}`}
                    className="admin-input"
                    defaultValue={country.name_ar}
                    required
                  />
                </td>
                <td>
                  <input
                    name={`slug__${index}`}
                    className="admin-input"
                    defaultValue={country.slug}
                    required
                    dir="ltr"
                    placeholder="sierra-leone"
                  />
                </td>
                <td>
                  <input
                    type="checkbox"
                    name={`active__${index}`}
                    defaultChecked={country.is_active}
                    value="1"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="admin-actions">
        <button type="button" className="dash-btn" onClick={addRow}>
          {t("settings.addCountry")}
        </button>
        <button type="submit" className="admin-button">
          {t("settings.saveCountries")}
        </button>
      </div>
    </form>
  );
}
