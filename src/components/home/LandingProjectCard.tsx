import Image from "next/image";
import Link from "next/link";
import { categoryAccentColors } from "@/lib/design-tokens";
import type { ProjectCardData } from "@/types";

type LandingProjectCardProps = {
  project: ProjectCardData;
};

export function LandingProjectCard({ project }: LandingProjectCardProps) {
  const accentColor = categoryAccentColors[project.categoryAccent];
  const unoptimized = project.imageUrl.includes("cdn.prod.website-files.com");

  return (
    <article className="landing-project-card">
      <div className="landing-project-media">
        <Link href={project.href} className="absolute inset-0">
          <Image
            src={project.imageUrl}
            alt={project.imageAlt ?? project.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            unoptimized={unoptimized}
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
            PROJECT DETAILS
          </Link>
        </div>
      </div>
    </article>
  );
}
