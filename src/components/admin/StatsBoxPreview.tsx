"use client";

import { useAdminLang } from "@/lib/admin/i18n-context";

type StatsBoxPreviewProps = {
  value: string;
  label: string;
  brandLogoUrl: string;
  introText: string;
  backgroundColor: string;
  iconUrl?: string;
};

export function StatsBoxPreview({
  value,
  label,
  brandLogoUrl,
  introText,
  backgroundColor,
  iconUrl,
}: StatsBoxPreviewProps) {
  const { t } = useAdminLang();

  return (
    <div className="admin-preview-card" dir="ltr">
      <p className="admin-preview-label">{t("homepage.preview")}</p>
      <div className="admin-preview-stats" style={{ backgroundColor }}>
        <div className="admin-preview-stats-top">
          <div className="admin-preview-stats-cell">
            {iconUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={iconUrl} alt="" className="admin-preview-icon" />
            ) : null}
            <p className="admin-preview-value">{value || "6,284,069"}</p>
            <p className="admin-preview-label-text">{label || "انسان مستفيد"}</p>
          </div>
          <div className="admin-preview-brand admin-preview-stats-cell">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={brandLogoUrl} alt="10×10" className="admin-preview-brand-logo" />
          </div>
        </div>
        <p className="admin-preview-intro" dir="rtl">
          {introText ||
            "مشروع البركة 10×10 من باب مشاركة الأثر معكم نقوم برفع التقارير الخاصة في هذا الموقع بشكل دوري"}
        </p>
      </div>
    </div>
  );
}
