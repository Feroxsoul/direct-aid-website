"use client";

import Image from "next/image";
import { useMemo, useState, type CSSProperties } from "react";
import { categoryAccentColors } from "@/lib/design-tokens";
import { LandingProjectCard } from "@/components/home/LandingProjectCard";
import type { HomepageCategory, ProjectCardData } from "@/types";

type HomeProjectsExplorerProps = {
  categories: HomepageCategory[];
  projects: ProjectCardData[];
  categoriesSectionTitle?: string;
  impactSectionTitle?: string;
  impactSectionSubtitle?: string;
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
  categoriesSectionTitle = "فئات المشاريع",
  impactSectionTitle = "آخر نشاط للأثر",
  impactSectionSubtitle = "مشروع مميز من كل فئة — اختر فئة أعلاه لعرض المزيد.",
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
    ? (categories.find((category) => category.slug === activeSlug)?.titleLine2 ??
      categories.find((category) => category.slug === activeSlug)?.titleLine1 ??
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
        aria-label="فئات المشاريع"
        className="landing-section landing-section--categories"
      >
        <div className="landing-container">
          <h2 className="landing-section-title landing-reveal">{categoriesSectionTitle}</h2>
          <div className="landing-categories-scroll">
            {categories.map((category, index) => {
              const short = category.titleLine2 || category.titleLine1;
              const isActive = activeSlug === category.slug;

              return (
                <button
                  key={category.slug}
                  type="button"
                  className={`landing-category-card landing-category-btn landing-reveal landing-reveal--category${isActive ? " is-active" : ""}`}
                  style={{ "--reveal-index": index } as CSSProperties}
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

      <section id="impact" aria-label="آخر الأثر" className="landing-section">
        <div className="landing-container">
          <div className="landing-section-header">
            <div>
              <h2 className="landing-section-title">{impactSectionTitle}</h2>
              <p className="landing-section-subtitle">
                {activeLabel
                  ? `جميع المشاريع (${visibleProjects.length}) في ${activeLabel}.`
                  : impactSectionSubtitle}
              </p>
            </div>
            {activeSlug ? (
              <button type="button" className="landing-section-link" onClick={showOverview}>
                العودة للنظرة العامة ←
              </button>
            ) : null}
          </div>

          {visibleProjects.length === 0 ? (
            <p className="landing-section-subtitle">لا توجد مشاريع في هذه الفئة حالياً.</p>
          ) : (
            <div
              key={activeSlug ?? "overview"}
              className={`landing-projects-grid${activeSlug ? " landing-projects-grid--expanded" : " landing-projects-grid--preview"}`}
            >
              {visibleProjects.map((project, index) => (
                <LandingProjectCard
                  key={project.id}
                  project={project}
                  revealIndex={index}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
