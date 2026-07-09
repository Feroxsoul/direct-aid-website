"use client";

import Image from "next/image";
import { useSiteLang } from "@/lib/site-i18n-context";
import { localizeHomeStatistics } from "@/lib/site-localize";
import type { HomeStatisticsData } from "@/types";

type StatisticsSectionProps = HomeStatisticsData;

export function StatisticsSection({
  value,
  label,
  labelEn,
  iconUrl,
  introText,
  introTextEn,
  brandLogoUrl,
  backgroundColor,
}: StatisticsSectionProps) {
  const { lang } = useSiteLang();
  const localized = localizeHomeStatistics(
    {
      value,
      label,
      labelEn,
      iconUrl,
      illustrationUrl: "",
      introText,
      introTextEn,
      brandLine1: "",
      brandLine2: "",
      brandLogoUrl,
      backgroundColor,
    },
    lang,
  );
  return (
    <section id="hero" aria-label="Project impact" className="landing-hero">
      <div className="landing-container">
        <div
          className="landing-hero-shell"
          style={{ backgroundColor: backgroundColor || "#e2eed6" }}
        >
          <div className="landing-hero-grid">
            <div className="landing-stat-card">
              <div className="landing-stat-icon">
                <Image src={iconUrl} alt="" width={28} height={28} aria-hidden unoptimized />
              </div>
              <p className="landing-stat-value">{value}</p>
              <p className="landing-stat-label" key={`stat-label-${lang}`}>
                {localized.label}
              </p>
            </div>

            <div className="landing-hero-brand-card">
              <Image
                src={brandLogoUrl}
                alt="10×10"
                width={132}
                height={88}
                className="landing-hero-brand-logo-img"
                unoptimized
              />
            </div>

            <div className="landing-hero-copy">
              <p className="landing-hero-intro" key={`stat-intro-${lang}`}>
                {localized.introText}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
