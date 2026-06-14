"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { categoryAccentColors } from "@/lib/design-tokens";
import { useAdminLang } from "@/lib/admin/i18n-context";
import type { CategoryRow } from "@/types";

const PAGE_SIZE = 8;

type CategoriesLiveEditorProps = {
  categories: CategoryRow[];
  canCreate: boolean;
  canEdit: boolean;
};

export function CategoriesLiveEditor({
  categories: initialCategories,
  canCreate,
  canEdit,
}: CategoriesLiveEditorProps) {
  const { t } = useAdminLang();
  const [categories] = useState(initialCategories);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return categories;
    return categories.filter((category) =>
      [category.title_line_1, category.title_line_2, category.slug]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [categories, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="impact-projects">
      <header className="impact-projects-header">
        <div>
          <h2 className="impact-projects-title">{t("categories.title")}</h2>
          <p className="impact-projects-subtitle">
            {t("categories.subtitle", { count: filtered.length })}
          </p>
        </div>
        {canCreate ? (
          <Link href="/admin/categories/new" className="impact-btn impact-btn--primary impact-btn--lg">
            {t("categories.new")}
          </Link>
        ) : null}
      </header>

      <div className="impact-toolbar">
        <div className="impact-filters">
          <span className="impact-filters-label">{t("common.filterBy")}</span>
          <input
            type="search"
            className="impact-search"
            placeholder={t("categories.search")}
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="impact-view-toggle" role="group" aria-label={t("common.viewMode")}>
          <button
            type="button"
            className={`impact-view-btn${viewMode === "grid" ? " is-active" : ""}`}
            onClick={() => setViewMode("grid")}
            aria-pressed={viewMode === "grid"}
          >
            ▦
          </button>
          <button
            type="button"
            className={`impact-view-btn${viewMode === "list" ? " is-active" : ""}`}
            onClick={() => setViewMode("list")}
            aria-pressed={viewMode === "list"}
          >
            ☰
          </button>
        </div>
      </div>

      {paged.length === 0 ? (
        <p className="impact-empty">{t("categories.empty")}</p>
      ) : (
        <div
          className={`impact-category-grid${
            viewMode === "list" ? " impact-category-grid--list" : ""
          }`}
        >
          {paged.map((category) => {
            const status = category.status ?? "published";
            return (
            <article
              key={category.slug}
              className={`impact-category-card${
                viewMode === "list" ? " impact-category-card--list" : ""
              }`}
            >
              <div
                className="impact-initiative-media"
                style={{ backgroundColor: categoryAccentColors[category.accent] }}
              >
                {category.icon_url ? (
                  <Image
                    src={category.icon_url}
                    alt=""
                    width={72}
                    height={72}
                    className="m-auto h-16 w-16 object-contain"
                    unoptimized
                  />
                ) : null}
              </div>
              <div className="impact-initiative-body">
                <div className="impact-initiative-head">
                  <h3 className="impact-initiative-title">
                    {category.title_line_1} {category.title_line_2}
                  </h3>
                  <span
                    className={`impact-status ${
                      status === "draft"
                        ? "impact-status--draft"
                        : "impact-status--published"
                    }`}
                    style={{
                      background: `color-mix(in srgb, ${categoryAccentColors[category.accent]} 25%, white)`,
                      color: categoryAccentColors[category.accent],
                    }}
                  >
                    {status === "draft" ? t("common.draft") : t("common.published")}
                  </span>
                </div>
                <p className="impact-initiative-desc" dir="ltr">
                  {category.slug}
                </p>
                <div className="impact-initiative-meta">
                  <span>{t("common.order")}: {category.sort_order}</span>
                </div>
                {canEdit ? (
                  <div className="impact-initiative-actions">
                    <Link
                      href={`/lmshryaa/${category.slug}`}
                      target="_blank"
                      className="impact-action impact-action--view"
                    >
                      {t("common.viewLive")}
                    </Link>
                    <Link
                      href={`/admin/categories/${category.slug}`}
                      className="impact-action impact-action--edit"
                    >
                      {t("common.edit")}
                    </Link>
                  </div>
                ) : null}
              </div>
            </article>
            );
          })}
        </div>
      )}

      <footer className="impact-pagination">
        <p>
          {t("common.showingCategories", { shown: paged.length, total: filtered.length })}
        </p>
        <div className="impact-pagination-controls">
          <button
            type="button"
            className="impact-page-btn"
            disabled={currentPage <= 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
          >
            ‹
          </button>
          {Array.from({ length: totalPages }, (_, index) => index + 1)
            .slice(0, 5)
            .map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                className={`impact-page-btn${
                  pageNumber === currentPage ? " is-active" : ""
                }`}
                onClick={() => setPage(pageNumber)}
              >
                {pageNumber}
              </button>
            ))}
          <button
            type="button"
            className="impact-page-btn"
            disabled={currentPage >= totalPages}
            onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
          >
            ›
          </button>
        </div>
      </footer>
    </div>
  );
}
