"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ImageField } from "@/components/admin/ImageField";
import {
  deleteProjectInline,
  saveProjectInline,
  syncWebflowProjectsToDatabase,
} from "@/lib/admin/actions";
import type { AdminProjectsEditorData, AdminProjectEditorItem } from "@/lib/admin/project-editor-data";
import { CATEGORY_SHORT, getCategoryLabelFromRef, mapProjectRowToCard } from "@/lib/project-catalog";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { CategoryRow, ProjectRow } from "@/types";

const PAGE_SIZE = 6;

const STATUS_LABELS: Record<string, string> = {
  published: "منشور",
  draft: "مسودة",
  archived: "مؤرشف",
};

type ProjectsLiveEditorProps = AdminProjectsEditorData & {
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  supabaseUrl: string;
  supabaseAnonKey: string;
};

type DraftState = {
  slug: string;
  title: string;
  short_description: string;
  description: string;
  image_url: string;
  category_slug: string;
  date_label: string;
  year_code: string;
  status: string;
  stat_value: string;
  stat_label: string;
  sort_order: number;
};

function toDraft(project: AdminProjectEditorItem): DraftState {
  return {
    slug: project.slug,
    title: project.title,
    short_description: project.short_description ?? "",
    description: project.description ?? "",
    image_url: project.image_url,
    category_slug: project.category_slug,
    date_label: project.date_label,
    year_code: project.year_code ?? "",
    status: project.statusLabel,
    stat_value: project.stat_value ?? "",
    stat_label: project.stat_label ?? "",
    sort_order: project.sort_order,
  };
}

function enrichProject(
  row: ProjectRow,
  categories: CategoryRow[],
): AdminProjectEditorItem {
  const category = categories.find((item) => item.slug === row.category_slug);
  const categoryLabel = category
    ? getCategoryLabelFromRef(category)
    : row.category_slug;

  return {
    ...row,
    categoryLabel,
    categoryShort: CATEGORY_SHORT[row.category_slug] ?? categoryLabel,
    statusLabel: row.status ?? (row.is_published ? "published" : "draft"),
    preview: mapProjectRowToCard(row, category),
  };
}

function truncate(text: string, max = 120) {
  if (text.length <= max) return text;
  return `${text.slice(0, max).trim()}…`;
}

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
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [draft, setDraft] = useState<DraftState | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectedProject = projects.find((project) => project.slug === selectedSlug);

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

  const refreshPreview = useCallback(() => {
    router.refresh();
  }, [router]);

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

  function openEditor(project: AdminProjectEditorItem) {
    setSelectedSlug(project.slug);
    setDraft(toDraft(project));
    setMessage("");
    setError("");
  }

  function closeEditor() {
    setSelectedSlug(null);
    setDraft(null);
    setError("");
  }

  function updateDraft<K extends keyof DraftState>(key: K, value: DraftState[K]) {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
  }

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
    setMessage(`تمت مزامنة ${result.count} مشروعاً من الكتالوج المباشر.`);
    refreshPreview();
  }

  async function handlePublish() {
    if (!draft || !canEdit) return;
    setSaving(true);
    setError("");
    setMessage("");

    const formData = new FormData();
    formData.set("is_new", "false");
    formData.set("slug", draft.slug);
    formData.set("title", draft.title);
    formData.set("short_description", draft.short_description);
    formData.set("description", draft.description);
    formData.set("image_url", draft.image_url);
    formData.set("category_slug", draft.category_slug);
    formData.set("date_label", draft.date_label);
    formData.set("year_code", draft.year_code);
    formData.set("status", draft.status);
    formData.set("stat_value", draft.stat_value);
    formData.set("stat_label", draft.stat_label);
    formData.set("sort_order", String(draft.sort_order));

    const result = await saveProjectInline(formData);
    setSaving(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    const updated = enrichProject(result.project, categories);
    setProjects((current) =>
      current.map((project) => (project.slug === updated.slug ? updated : project)),
    );
    setMessage("نُشر على الموقع — التغييرات ظاهرة للزوار.");
    refreshPreview();
  }

  async function handleDelete(slug: string) {
    if (!canDelete || !window.confirm("حذف هذا المشروع نهائياً؟")) return;
    const result = await deleteProjectInline(slug);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setProjects((current) => current.filter((project) => project.slug !== slug));
    if (selectedSlug === slug) closeEditor();
    setMessage("تم الحذف.");
    refreshPreview();
  }

  return (
    <div className="impact-projects">
      {(liveUsesWebflow || dbProjectCount < webflowProjectCount) && (
        <div className="impact-sync-banner">
          <span>
            مزامنة {webflowProjectCount} مشروعاً مباشراً إلى قاعدة البيانات لتعديل ما يراه الزوار.
          </span>
          <button
            type="button"
            className="impact-btn impact-btn--primary"
            onClick={handleSync}
            disabled={syncing}
          >
            {syncing ? "جاري المزامنة…" : "مزامنة البيانات"}
          </button>
        </div>
      )}

      {message ? <p className="impact-alert impact-alert--success">{message}</p> : null}
      {error ? <p className="impact-alert impact-alert--error">{error}</p> : null}

      <header className="impact-projects-header">
        <div>
          <h2 className="impact-projects-title">جميع المبادرات</h2>
          <p className="impact-projects-subtitle">
            نظرة عامة وتحكم في العمليات الإنسانية.
          </p>
        </div>
        {canCreate ? (
          <Link href="/admin/projects/new" className="impact-btn impact-btn--primary impact-btn--lg">
            + مشروع جديد
          </Link>
        ) : null}
      </header>

      <div className="impact-toolbar">
        <div className="impact-filters">
          <span className="impact-filters-label">تصفية حسب:</span>
          <select
            className="impact-select"
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
          >
            <option value="all">كل الفئات</option>
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
            <option value="all">كل الحالات</option>
            <option value="published">منشور</option>
            <option value="draft">مسودة</option>
            <option value="archived">مؤرشف</option>
          </select>
          <input
            type="search"
            className="impact-search"
            placeholder="بحث في المبادرات…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <div className="impact-view-toggle" role="group" aria-label="طريقة العرض">
          <button
            type="button"
            className={`impact-view-btn${viewMode === "grid" ? " is-active" : ""}`}
            onClick={() => setViewMode("grid")}
            aria-pressed={viewMode === "grid"}
            title="عرض شبكي"
          >
            ▦
          </button>
          <button
            type="button"
            className={`impact-view-btn${viewMode === "list" ? " is-active" : ""}`}
            onClick={() => setViewMode("list")}
            aria-pressed={viewMode === "list"}
            title="عرض قائمة"
          >
            ☰
          </button>
        </div>
      </div>

      {pagedProjects.length === 0 ? (
        <p className="impact-empty">لا توجد مشاريع تطابق التصفية.</p>
      ) : (
        <div
          className={`impact-initiative-grid${
            viewMode === "list" ? " impact-initiative-grid--list" : ""
          }`}
        >
          {pagedProjects.map((project) => (
            <article
              key={project.slug}
              className={`impact-initiative-card${
                viewMode === "list" ? " impact-initiative-card--list" : ""
              }`}
            >
              <div className="impact-initiative-media">
                <Image
                  src={project.image_url}
                  alt={project.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  unoptimized
                />
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
                  {truncate(
                    project.short_description ??
                      project.description ??
                      project.preview.description ??
                      "لا يوجد وصف بعد.",
                  )}
                </p>
                <div className="impact-initiative-meta">
                  <span>📁 {project.categoryShort}</span>
                  <span>🕐 {project.date_label}</span>
                </div>
                <div className="impact-initiative-actions">
                  <Link
                    href={`/project/${project.slug}`}
                    target="_blank"
                    className="impact-action impact-action--view"
                  >
                    👁 عرض مباشر
                  </Link>
                  {canEdit ? (
                    <button
                      type="button"
                      className="impact-action impact-action--edit"
                      onClick={() => openEditor(project)}
                    >
                      ✎ تعديل
                    </button>
                  ) : null}
                  {canDelete ? (
                    <button
                      type="button"
                      className="impact-action impact-action--delete"
                      onClick={() => handleDelete(project.slug)}
                    >
                      🗑
                    </button>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <footer className="impact-pagination">
        <p>
          عرض {pagedProjects.length} من {filteredProjects.length} مبادرة
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

      {selectedProject && draft ? (
        <>
          <button
            type="button"
            className="live-editor-drawer-backdrop"
            aria-label="إغلاق المحرر"
            onClick={closeEditor}
          />
          <aside className="live-editor-drawer" aria-label="محرر الموقع المباشر">
            <header className="live-editor-drawer-header">
              <div>
                <p className="live-editor-drawer-kicker">محرر الموقع المباشر</p>
                <h2 className="live-editor-drawer-brand">العون المباشر</h2>
              </div>
              <button
                type="button"
                className="live-editor-drawer-close"
                onClick={closeEditor}
                aria-label="إغلاق"
              >
                ×
              </button>
            </header>

            <div className="live-editor-drawer-body">
              <section className="live-editor-drawer-section">
                <h3 className="live-editor-drawer-section-title">محتوى المشروع</h3>
                <div className="admin-field">
                  <label className="admin-label" htmlFor="live-title">
                    العنوان
                  </label>
                  <input
                    id="live-title"
                    className="admin-input"
                    value={draft.title}
                    onChange={(event) => updateDraft("title", event.target.value)}
                    disabled={!canEdit}
                  />
                </div>
                <div className="admin-field">
                  <label className="admin-label" htmlFor="live-short">
                    وصف البطاقة (الصفحة الرئيسية)
                  </label>
                  <textarea
                    id="live-short"
                    className="admin-textarea"
                    rows={3}
                    value={draft.short_description}
                    onChange={(event) =>
                      updateDraft("short_description", event.target.value)
                    }
                    disabled={!canEdit}
                  />
                </div>
                <div className="admin-field">
                  <label className="admin-label" htmlFor="live-desc">
                    الوصف الكامل
                  </label>
                  <textarea
                    id="live-desc"
                    className="admin-textarea"
                    rows={5}
                    value={draft.description}
                    onChange={(event) => updateDraft("description", event.target.value)}
                    disabled={!canEdit}
                  />
                </div>
              </section>

              <section className="live-editor-drawer-section">
                <h3 className="live-editor-drawer-section-title">الصورة الرئيسية</h3>
                {canEdit ? (
                  <ImageField
                    key={draft.slug}
                    name="image_url"
                    label="الصورة الرئيسية"
                    defaultValue={draft.image_url}
                    onUrlChange={(url) => updateDraft("image_url", url)}
                    required
                  />
                ) : (
                  <input className="admin-input" value={draft.image_url} readOnly dir="ltr" />
                )}
              </section>

              <section className="live-editor-drawer-section">
                <h3 className="live-editor-drawer-section-title">البيانات الوصفية</h3>
                <div className="admin-field">
                  <label className="admin-label" htmlFor="live-category">
                    الفئة
                  </label>
                  <select
                    id="live-category"
                    className="admin-select"
                    value={draft.category_slug}
                    onChange={(event) => updateDraft("category_slug", event.target.value)}
                    disabled={!canEdit}
                  >
                    {categories.map((category) => (
                      <option key={category.slug} value={category.slug}>
                        {category.title_line_1} {category.title_line_2}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="admin-row">
                  <div className="admin-field">
                    <label className="admin-label" htmlFor="live-date">
                      تاريخ العرض
                    </label>
                    <input
                      id="live-date"
                      className="admin-input"
                      value={draft.date_label}
                      onChange={(event) => updateDraft("date_label", event.target.value)}
                      disabled={!canEdit}
                    />
                  </div>
                  <div className="admin-field">
                    <label className="admin-label" htmlFor="live-status">
                      الحالة
                    </label>
                    <select
                      id="live-status"
                      className="admin-select"
                      value={draft.status}
                      onChange={(event) => updateDraft("status", event.target.value)}
                      disabled={!canEdit}
                    >
                      <option value="draft">مسودة</option>
                      <option value="published">منشور</option>
                      <option value="archived">مؤرشف</option>
                    </select>
                  </div>
                </div>
              </section>
            </div>

            <footer className="live-editor-drawer-footer">
              <button type="button" className="impact-btn" onClick={closeEditor}>
                تجاهل
              </button>
              {canEdit ? (
                <button
                  type="button"
                  className="impact-btn impact-btn--primary"
                  onClick={handlePublish}
                  disabled={saving}
                >
                  {saving ? "جاري النشر…" : "نشر مباشر"}
                </button>
              ) : null}
            </footer>
          </aside>
        </>
      ) : null}
    </div>
  );
}
