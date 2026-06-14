import Image from "next/image";
import Link from "next/link";
import type { HomeStatisticsData } from "@/types";

type StatisticsSectionProps = HomeStatisticsData & {
  ctaLabel?: string;
};

export function StatisticsSection({
  value,
  label,
  iconUrl,
  introText,
  brandLine1,
  brandLine2,
  backgroundColor,
  ctaLabel = "استكشف مهمتنا ←",
}: StatisticsSectionProps) {
  return (
    <section id="hero" aria-label="Project impact" className="landing-hero">
      <div className="landing-container">
        <div
          className="landing-hero-shell"
          style={{ backgroundColor: backgroundColor || "#e8f3e0" }}
        >
          <div className="landing-hero-grid">
            <div className="landing-stat-card">
              <div className="landing-stat-icon">
                <Image src={iconUrl} alt="" width={28} height={28} aria-hidden />
              </div>
              <p className="landing-stat-value">{value}</p>
              <p className="landing-stat-label">{label}</p>
            </div>

            <div className="landing-hero-brand-card">
              <p className="landing-hero-brand-small">{brandLine1}</p>
              <p className="landing-hero-brand-logo" dir="ltr">
                {brandLine2}
              </p>
            </div>

            <div className="landing-hero-copy">
              <p className="landing-hero-intro">{introText}</p>
              <Link href="#categories" className="landing-hero-cta">
                {ctaLabel}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
