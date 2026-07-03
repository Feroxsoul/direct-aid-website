"use client";

import Image from "next/image";
import Link from "next/link";
import { useSiteLang } from "@/lib/site-i18n-context";
import type { HomeStatisticsData } from "@/types";

type StatisticsSectionProps = HomeStatisticsData & {
  ctaLabel?: string;
};

export function StatisticsSection({
  value,
  label,
  iconUrl,
  introText,
  brandLogoUrl,
  backgroundColor,
  ctaLabel,
}: StatisticsSectionProps) {
  const { t } = useSiteLang();
  const cta = ctaLabel ?? t("hero.cta");
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
              <p className="landing-stat-label">{label}</p>
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
              <p className="landing-hero-intro">{introText}</p>
              <Link href="#categories" className="landing-hero-cta">
                {cta}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
