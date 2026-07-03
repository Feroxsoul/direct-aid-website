"use client";

import { ProjectCoverImage } from "@/components/admin/ProjectCoverImage";
import Link from "next/link";
import type { CSSProperties } from "react";
import { useLocalizedProject } from "@/hooks/use-localized-project";
import { resolveCategoryColor } from "@/lib/category-colors";
import { useSiteLang } from "@/lib/site-i18n-context";
import type { ProjectCardData } from "@/types";

type LandingProjectCardProps = {
  project: ProjectCardData;
  revealIndex?: number;
  categoryColorMap?: Record<string, string>;
};

export function LandingProjectCard({
  project,
  revealIndex = 0,
  categoryColorMap = {},
}: LandingProjectCardProps) {
  const { t } = useSiteLang();
  const localized = useLocalizedProject(project);
  const accentColor = resolveCategoryColor(
    localized.categorySlug,
    localized.categoryAccent,
    categoryColorMap,
  );

  return (
    <article
      className="landing-project-card landing-reveal landing-reveal--project"
      style={{ "--reveal-index": revealIndex } as CSSProperties}
    >
      <div className="landing-project-media">
        <Link href={localized.href} className="absolute inset-0">
          <ProjectCoverImage
            src={localized.imageUrl}
            alt={localized.imageAlt ?? localized.title}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </Link>
        {localized.statistics ? (
          <span className="landing-project-badge landing-project-badge--stat">
            {localized.statistics.value} {localized.statistics.label}
          </span>
        ) : null}
        <span className="landing-project-badge landing-project-badge--date">
          {localized.metadata.yearCode ?? localized.metadata.dateLabel}
        </span>
      </div>

      <div className="landing-project-body">
        <h3 className="landing-project-title">{localized.title}</h3>
        {localized.description ? (
          <p className="landing-project-desc">{localized.description}</p>
        ) : null}

        <div className="landing-project-footer">
          {localized.categoryLabel ? (
            <span className="landing-project-category">
              <span
                className="landing-project-dot"
                style={{ backgroundColor: accentColor }}
                aria-hidden
              />
              {localized.categoryLabel}
            </span>
          ) : (
            <span />
          )}
          <Link href={localized.href} className="landing-project-btn">
            {t("project.details")}
          </Link>
        </div>
      </div>
    </article>
  );
}
