"use client";

import { ProjectCard } from "@/components/project/ProjectCard";
import { useSiteLang } from "@/lib/site-i18n-context";
import type { ProjectCardData } from "@/types";

type ProjectGridProps = {
  projects: ProjectCardData[];
  /** Archived wrapper class — homepage vs category listing */
  variant?: "home" | "listing";
};

export function ProjectGrid({ projects, variant = "home" }: ProjectGridProps) {
  const { t } = useSiteLang();
  const wrapperClass =
    variant === "listing" ? "collection-list-wrapper-2" : "collection-list-wrapper";

  if (projects.length === 0) {
    return (
      <section aria-label={t("project.listAria")} className={`${wrapperClass} w-full`}>
        <p className="empty-state da-text-body px-5 py-10 text-center text-da-gray">
          {t("impact.empty")}
        </p>
      </section>
    );
  }

  return (
    <section aria-label={t("project.listAria")} className={`${wrapperClass} w-full`}>
      <ul
        role="list"
        className="collection-list m-0 flex list-none flex-row flex-wrap items-center justify-center gap-0 p-0 max-[767px]:flex-col"
      >
        {projects.map((project) => (
          <li key={project.id} role="listitem" className="collection-main">
            <ProjectCard
              {...project}
              className="m-5 max-[767px]:mx-auto max-[767px]:my-2.5 max-[767px]:max-w-none"
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
