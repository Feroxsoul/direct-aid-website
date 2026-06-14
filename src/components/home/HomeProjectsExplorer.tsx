"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { resolveCategoryColor } from "@/lib/category-colors";
import { LandingProjectCard } from "@/components/home/LandingProjectCard";
import type { HomepageCategory, ProjectCardData } from "@/types";

const PROJECTS_BATCH = 8;

type HomeProjectsExplorerProps = {
  categories: HomepageCategory[];
  projects: ProjectCardData[];
  categoryColorMap?: Record<string, string>;
  categoriesSectionTitle?: string;
  impactSectionTitle?: string;
  impactSectionSubtitle?: string;
};

export function HomeProjectsExplorer({
  categories,
  projects,
  categoryColorMap = {},
  categoriesSectionTitle = "فئات المشاريع",
  impactSectionTitle = "آخر نشاط للأثر",
  impactSectionSubtitle = "جميع المشاريع — مرّر للأسفل لتحميل المزيد.",
}: HomeProjectsExplorerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const categoryFromUrl = searchParams.get("category");
  const [activeSlug, setActiveSlug] = useState<string | null>(categoryFromUrl);
  const [visibleCount, setVisibleCount] = useState(PROJECTS_BATCH);

  useEffect(() => {
    setActiveSlug(categoryFromUrl);
    setVisibleCount(PROJECTS_BATCH);
  }, [categoryFromUrl]);

  const filteredProjects = useMemo(() => {
    if (!activeSlug) return projects;
    return projects.filter((project) => project.categorySlug === activeSlug);
  }, [activeSlug, projects]);

  const visibleProjects = useMemo(
    () => filteredProjects.slice(0, visibleCount),
    [filteredProjects, visibleCount],
  );

  const hasMore = visibleCount < filteredProjects.length;

  const activeLabel = activeSlug
    ? (categories.find((category) => category.slug === activeSlug)?.titleLine2 ??
      categories.find((category) => category.slug === activeSlug)?.titleLine1 ??
      activeSlug)
    : null;

  const updateCategory = useCallback(
    (slug: string | null) => {
      setActiveSlug(slug);
      setVisibleCount(PROJECTS_BATCH);
      if (slug) {
        router.push(`/?category=${encodeURIComponent(slug)}#impact`, { scroll: false });
      } else {
        router.push("/#impact", { scroll: false });
      }
    },
    [router],
  );

  function selectCategory(slug: string) {
    updateCategory(activeSlug === slug ? null : slug);
    document.getElementById("impact")?.scrollIntoView({ behavior: "smooth" });
  }

  function showAllProjects() {
    updateCategory(null);
    document.getElementById("impact")?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(() => {
    if (!hasMore || !loadMoreRef.current) return;

    const node = loadMoreRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisibleCount((current) =>
            Math.min(current + PROJECTS_BATCH, filteredProjects.length),
          );
        }
      },
      { rootMargin: "240px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [filteredProjects.length, hasMore]);

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
                    loading="lazy"
                    aria-hidden
                  />
                  <span className="landing-category-label">{short}</span>
                  <span
                    className="landing-category-bar"
                    style={{
                      backgroundColor: resolveCategoryColor(
                        category.slug,
                        category.accent,
                        categoryColorMap,
                      ),
                    }}
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
                  ? `جميع المشاريع (${filteredProjects.length}) في ${activeLabel}.`
                  : `${impactSectionSubtitle} (${filteredProjects.length} مشروع)`}
              </p>
            </div>
            {activeSlug ? (
              <button type="button" className="landing-section-link" onClick={showAllProjects}>
                عرض كل المشاريع ←
              </button>
            ) : null}
          </div>

          {visibleProjects.length === 0 ? (
            <p className="landing-section-subtitle">لا توجد مشاريع في هذه الفئة حالياً.</p>
          ) : (
            <>
              <div
                key={activeSlug ?? "all"}
                className="landing-projects-grid landing-projects-grid--expanded"
              >
                {visibleProjects.map((project, index) => (
                  <LandingProjectCard
                    key={project.id}
                    project={project}
                    revealIndex={index}
                    categoryColorMap={categoryColorMap}
                  />
                ))}
              </div>
              {hasMore ? (
                <div ref={loadMoreRef} className="landing-load-more-sentinel" aria-hidden>
                  <span className="landing-load-more-label">جاري تحميل المزيد…</span>
                </div>
              ) : null}
            </>
          )}
        </div>
      </section>
    </>
  );
}
