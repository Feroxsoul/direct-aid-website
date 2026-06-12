"use client";

type StatsBoxPreviewProps = {
  value: string;
  label: string;
  brandLine1: string;
  brandLine2: string;
  introText: string;
  backgroundColor: string;
  iconUrl?: string;
};

export function StatsBoxPreview({
  value,
  label,
  brandLine1,
  brandLine2,
  introText,
  backgroundColor,
  iconUrl,
}: StatsBoxPreviewProps) {
  return (
    <div className="admin-preview-card" dir="ltr">
      <p className="admin-preview-label">معاينة الصندوق الأخضر</p>
      <div className="admin-preview-stats" style={{ backgroundColor }}>
        <div className="admin-preview-stats-top">
          <div>
            {iconUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={iconUrl} alt="" className="admin-preview-icon" />
            ) : null}
            <p className="admin-preview-value">{value || "6,284,069"}</p>
            <p className="admin-preview-label-text">{label || "انسان مستفيد"}</p>
          </div>
          <div className="admin-preview-brand">
            <p>{brandLine1 || "عشرة"}</p>
            <p>{brandLine2 || "10×10"}</p>
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
