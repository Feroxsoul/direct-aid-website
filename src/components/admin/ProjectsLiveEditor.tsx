"use client";

import { ProjectCoverImage } from "@/components/admin/ProjectCoverImage";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  deleteProjectInline,
  syncWebflowProjectsToDatabase,
} from "@/lib/admin/actions";
import type { AdminProjectsEditorData } from "@/lib/admin/project-editor-data";
import { CATEGORY_SHORT, getCategoryLabelFromRef, truncateCardDescription } from "@/lib/project-catalog";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const PAGE_SIZE = 9;

const STATUS_LABELS: Record<string, string> = {
  published: "Published",
  draft: "Draft",
  archived: "Archived",
};

type ProjectsLiveEditorProps = AdminProjectsEditorData & {
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  supabaseUrl: string;
  supabaseAnonKey: string;
};

export function ProjectsLiveEditor({
  projects: initialProjects,
  categories,
  dbProjectCount,
  webflowProjectCount,
  liveUsesWebflow,
  canCreate,
  canEdit,
  canDelete,
  supabaseUrl,
  supabaseAnonKey,
}: ProjectsLiveEditorProps) {
  const router = useRouter();
  const [projects, setProjects] = useState(initialProjects);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase();
    return projects.filter((project) => {
      if (categoryFilter !== "all" && project.category_slug !== categoryFilter) {
        return false;
      }
      if (statusFilter !== "all" && project.statusLabel !== statusFilter) {
        return false;
      }
      if (!query) return true;
      const haystack = [
        project.title,
        project.slug,
        project.categoryLabel,
        project.description ?? "",
        project.stat_value ?? "",
        project.stat_label ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [projects, categoryFilter, statusFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedProjects = filteredProjects.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  useEffect(() => {
    setProjects(initialProjects);
  }, [initialProjects]);

  useEffect(() => {
    setPage(1);
  }, [categoryFilter, statusFilter, search]);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient(supabaseUrl, supabaseAnonKey);
    const channel = supabase
      .channel("admin-projects-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "projects" },
        () => router.refresh(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router, supabaseAnonKey, supabaseUrl]);

  async function handleSync() {
    setSyncing(true);
    setError("");
    setMessage("");
    const result = await syncWebflowProjectsToDatabase();
    setSyncing(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setMessage(`Synced ${result.count} projects from the live Webflow catalog.`);
    router.refresh();
  }

  async function handleDelete(slug: string) {
    if (!canDelete || !window.confirm("Permanently delete this project?")) return;
    const result = await deleteProjectInline(slug);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setProjects((current) => current.filter((project) => project.slug !== slug));
    setMessage("Project deleted.");
    router.refresh();
  }

  return (
    <div className="impact-projects">
      {(liveUsesWebflow || dbProjectCount < webflowProjectCount) && (
        <div className="impact-sync-banner">
          <span>
            Sync {webflowProjectCount} projects from da10.webflow.io into the database so
            visitors see up-to-date images and content.
          </span>
          <button
            type="button"
            className="impact-btn impact-btn--primary"
            onClick={handleSync}
            disabled={syncing}
          >
            {syncing ? "Syncing…" : "Sync from Webflow"}
          </button>
        </div>
      )}

      {message ? <p className="impact-alert impact-alert--success">{message}</p> : null}
      {error ? <p className="impact-alert impact-alert--error">{error}</p> : null}

      <header className="impact-projects-header">
        <div>
          <h2 className="impact-projects-title">All Projects</h2>
          <p className="impact-projects-subtitle">
            {filteredProjects.length} initiatives · manage content, images, and impact tags.
          </p>
        </div>
        {canCreate ? (
          <Link href="/admin/projects/new" className="impact-btn impact-btn--primary impact-btn--lg">
            + New project
          </Link>
        ) : null}
      </header>

      <div className="impact-toolbar">
        <div className="impact-filters">
          <span className="impact-filters-label">FILTER BY</span>
          <select
            className="impact-select"
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
          >
            <option value="all">All categories</option>
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.title_line_2 || category.title_line_1}
              </option>
            ))}
          </select>
          <select
            className="impact-select"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
          <input
            type="search"
            className="impact-search"
            placeholder="Search projects…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <div className="impact-view-toggle" role="group" aria-label="View mode">
          <button
            type="button"
            className={`impact-view-btn${viewMode === "grid" ? " is-active" : ""}`}
            onClick={() => setViewMode("grid")}
            aria-pressed={viewMode === "grid"}
            title="Grid view"
          >
            ▦
          </button>
          <button
            type="button"
            className={`impact-view-btn${viewMode === "list" ? " is-active" : ""}`}
            onClick={() => setViewMode("list")}
            aria-pressed={viewMode === "list"}
            title="List view"
          >
            ☰
          </button>
        </div>
      </div>

      {pagedProjects.length === 0 ? (
        <p className="impact-empty">No projects match your filters.</p>
      ) : (
        <div
          className={`impact-initiative-grid${
            viewMode === "list" ? " impact-initiative-grid--list" : ""
          }`}
        >
          {pagedProjects.map((project) => {
            const categoryShort =
              CATEGORY_SHORT[project.category_slug] ??
              getCategoryLabelFromRef(
                categories.find((item) => item.slug === project.category_slug) ?? {
                  slug: project.category_slug,
                  accent: "default",
                },
              );

            return (
              <article
                key={project.slug}
                className={`impact-initiative-card${
                  viewMode === "list" ? " impact-initiative-card--list" : ""
                }`}
              >
                <div className="impact-initiative-media">
                  <ProjectCoverImage
                    src={project.image_url}
                    alt={project.title}
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  {project.stat_value && project.stat_label ? (
                    <span className="impact-initiative-stat">
                      {project.stat_value} · {project.stat_label}
                    </span>
                  ) : null}
                </div>
                <div className="impact-initiative-body">
                  <div className="impact-initiative-head">
                    <h3 className="impact-initiative-title">{project.title}</h3>
                    <span
                      className={`impact-status impact-status--${project.statusLabel}`}
                    >
                      {STATUS_LABELS[project.statusLabel] ?? project.statusLabel}
                    </span>
                  </div>
                  <p className="impact-initiative-desc">
                    {truncateCardDescription(project.description) ?? "No description yet."}
                  </p>
                  <div className="impact-initiative-meta">
                    <span>📁 {categoryShort}</span>
                    <span>🕐 {project.date_label}</span>
                  </div>
                  <div className="impact-initiative-actions">
                    <Link
                      href={`/project/${project.slug}`}
                      target="_blank"
                      className="impact-action impact-action--view"
                    >
                      View live
                    </Link>
                    {canEdit ? (
                      <Link
                        href={`/admin/projects/${project.slug}`}
                        className="impact-action impact-action--edit"
                      >
                        Edit
                      </Link>
                    ) : null}
                    {canDelete ? (
                      <button
                        type="button"
                        className="impact-action impact-action--delete"
                        onClick={() => handleDelete(project.slug)}
                      >
                        Delete
                      </button>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <footer className="impact-pagination">
        <p>
          Showing {pagedProjects.length} of {filteredProjects.length} projects
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
