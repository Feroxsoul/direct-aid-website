"use client";

import { useAdminLang } from "@/lib/admin/i18n-context";

const MONTHS = [
  { value: 1, labelAr: "يناير", labelEn: "January" },
  { value: 2, labelAr: "فبراير", labelEn: "February" },
  { value: 3, labelAr: "مارس", labelEn: "March" },
  { value: 4, labelAr: "أبريل", labelEn: "April" },
  { value: 5, labelAr: "مايو", labelEn: "May" },
  { value: 6, labelAr: "يونيو", labelEn: "June" },
  { value: 7, labelAr: "يوليو", labelEn: "July" },
  { value: 8, labelAr: "أغسطس", labelEn: "August" },
  { value: 9, labelAr: "سبتمبر", labelEn: "September" },
  { value: 10, labelAr: "أكتوبر", labelEn: "October" },
  { value: 11, labelAr: "نوفمبر", labelEn: "November" },
  { value: 12, labelAr: "ديسمبر", labelEn: "December" },
];

type MonthYearPickerProps = {
  month?: number | null;
  year?: number | null;
};

export function MonthYearPicker({ month, year }: MonthYearPickerProps) {
  const { lang } = useAdminLang();
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2017 + 2 }, (_, i) => currentYear + 1 - i);

  return (
    <div className="admin-row">
      <div className="admin-field">
        <label className="admin-label" htmlFor="project_month">
          {lang === "ar" ? "الشهر" : "Month"}
        </label>
        <select
          id="project_month"
          name="project_month"
          className="admin-select"
          defaultValue={month ?? ""}
          required
        >
          <option value="">{lang === "ar" ? "اختر الشهر" : "Select month"}</option>
          {MONTHS.map((item) => (
            <option key={item.value} value={item.value}>
              {lang === "ar" ? item.labelAr : item.labelEn}
            </option>
          ))}
        </select>
      </div>
      <div className="admin-field">
        <label className="admin-label" htmlFor="project_year">
          {lang === "ar" ? "السنة" : "Year"}
        </label>
        <select
          id="project_year"
          name="project_year"
          className="admin-select"
          defaultValue={year ?? ""}
          required
        >
          <option value="">{lang === "ar" ? "اختر السنة" : "Select year"}</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
