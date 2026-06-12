"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { categoryAccentColors } from "@/lib/design-tokens";
import { LandingProjectCard } from "@/components/home/LandingProjectCard";
import type { HomepageCategory, ProjectCardData } from "@/types";

const CATEGORY_SHORT: Record<string, string> = {
  "health-10x10": "HEALTH",
  "educational.10x10": "EDUCATION",
  developments: "DEVELOPMENT",
  "lmshryaa-ldaawy": "DA'WAH",
  orphans: "ORPHAN",
  "lmshryaa-lgthy": "RELIEF",
  mosque: "MOSQUE",
  "waters-10x10": "WATER",
};

type HomeProjectsExplorerProps = {
  categories: HomepageCategory[];
  projects: ProjectCardData[];
};

function oneProjectPerCategory(
  categories: HomepageCategory[],
  projects: ProjectCardData[],
) {
  const firstByCategory = new Map<string, ProjectCardData>();

  for (const project of projects) {
    if (!firstByCategory.has(project.categorySlug)) {
      firstByCategory.set(project.categorySlug, project);
    }
  }

  return categories
    .map((category) => firstByCategory.get(category.slug))
    .filter((project): project is ProjectCardData => Boolean(project));
}

export function HomeProjectsExplorer({
  categories,
  projects,
}: HomeProjectsExplorerProps) {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  const previewProjects = useMemo(
    () => oneProjectPerCategory(categories, projects),
    [categories, projects],
  );

  const visibleProjects = useMemo(() => {
    if (!activeSlug) return previewProjects;
    return projects.filter((project) => project.categorySlug === activeSlug);
  }, [activeSlug, previewProjects, projects]);

  const activeLabel = activeSlug
    ? (CATEGORY_SHORT[activeSlug] ??
      categories.find((category) => category.slug === activeSlug)?.titleLine2 ??
      activeSlug)
    : null;

  function selectCategory(slug: string) {
    setActiveSlug((current) => (current === slug ? null : slug));
    document.getElementById("impact")?.scrollIntoView({ behavior: "smooth" });
  }

  function showOverview() {
    setActiveSlug(null);
    document.getElementById("impact")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <>
      <section
        id="categories"
        aria-label="Project categories"
        className="landing-section landing-section--categories"
      >
        <div className="landing-container">
          <h2 className="landing-section-title">Project Categories</h2>
          <div className="landing-categories-scroll">
            {categories.map((category) => {
              const short =
                CATEGORY_SHORT[category.slug] ??
                (category.titleLine2 || category.titleLine1);
              const isActive = activeSlug === category.slug;

              return (
                <button
                  key={category.slug}
                  type="button"
                  className={`landing-category-card landing-category-btn${isActive ? " is-active" : ""}`}
                  onClick={() => selectCategory(category.slug)}
                  aria-pressed={isActive}
                >
                  <Image
                    src={category.iconUrl}
                    alt=""
                    width={36}
                    height={36}
                    className="landing-category-icon"
                    aria-hidden
                  />
                  <span className="landing-category-label">{short}</span>
                  <span
                    className="landing-category-bar"
                    style={{ backgroundColor: categoryAccentColors[category.accent] }}
                    aria-hidden
                  />
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section id="impact" aria-label="Recent impact" className="landing-section">
        <div className="landing-container">
          <div className="landing-section-header">
            <div>
              <h2 className="landing-section-title">Recent Impact Activity</h2>
              <p className="landing-section-subtitle">
                {activeLabel
                  ? `All ${visibleProjects.length} projects in ${activeLabel}.`
                  : "One featured project from each category — tap a category above to see more."}
              </p>
            </div>
            {activeSlug ? (
              <button type="button" className="landing-section-link" onClick={showOverview}>
                BACK TO OVERVIEW →
              </button>
            ) : null}
          </div>

          {visibleProjects.length === 0 ? (
            <p className="landing-section-subtitle">No projects in this category yet.</p>
          ) : (
            <div
              className={`landing-projects-grid${activeSlug ? " landing-projects-grid--expanded" : " landing-projects-grid--preview"}`}
            >
              {visibleProjects.map((project) => (
                <LandingProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
