import { ProjectCoverImage } from "@/components/admin/ProjectCoverImage";
import Link from "next/link";
import type { CSSProperties } from "react";
import { resolveCategoryColor } from "@/lib/category-colors";
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
  const accentColor = resolveCategoryColor(
    project.categorySlug,
    project.categoryAccent,
    categoryColorMap,
  );

  return (
    <article
      className="landing-project-card landing-reveal landing-reveal--project"
      style={{ "--reveal-index": revealIndex } as CSSProperties}
    >
      <div className="landing-project-media">
        <Link href={project.href} className="absolute inset-0">
          <ProjectCoverImage
            src={project.imageUrl}
            alt={project.imageAlt ?? project.title}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </Link>
        {project.statistics ? (
          <span className="landing-project-badge landing-project-badge--stat">
            {project.statistics.value} {project.statistics.label}
          </span>
        ) : null}
        <span className="landing-project-badge landing-project-badge--date">
          {project.metadata.yearCode ?? project.metadata.dateLabel}
        </span>
      </div>

      <div className="landing-project-body">
        <h3 className="landing-project-title">{project.title}</h3>
        {project.description ? (
          <p className="landing-project-desc">{project.description}</p>
        ) : null}

        <div className="landing-project-footer">
          {project.categoryLabel ? (
            <span className="landing-project-category">
              <span
                className="landing-project-dot"
                style={{ backgroundColor: accentColor }}
                aria-hidden
              />
              {project.categoryLabel}
            </span>
          ) : (
            <span />
          )}
              <Link href={project.href} className="landing-project-btn">
                تفاصيل المشروع
              </Link>
        </div>
      </div>
    </article>
  );
}
