"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ImageField } from "@/components/admin/ImageField";
import { saveProjectInline, syncWebflowProjectsToDatabase } from "@/lib/admin/actions";
import type { AdminProjectsEditorData, AdminProjectEditorItem } from "@/lib/admin/project-editor-data";
import { CATEGORY_SHORT, getCategoryLabelFromRef, mapProjectRowToCard } from "@/lib/project-catalog";
import { categoryAccentColors } from "@/lib/design-tokens";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { CategoryRow, ProjectRow } from "@/types";

type ProjectsLiveEditorProps = AdminProjectsEditorData & {
  canCreate: boolean;
  canEdit: boolean;
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

export function ProjectsLiveEditor({
  projects: initialProjects,
  categories,
  statistics,
  dbProjectCount,
  webflowProjectCount,
  liveUsesWebflow,
  publishedCount,
  draftCount,
  canCreate,
  canEdit,
  supabaseUrl,
  supabaseAnonKey,
}: ProjectsLiveEditorProps) {
  const router = useRouter();
  const [projects, setProjects] = useState(initialProjects);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [draft, setDraft] = useState<DraftState | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showPreview, setShowPreview] = useState(true);
  const [previewKey, setPreviewKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectedProject = projects.find((project) => project.slug === selectedSlug);

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase();
    return projects.filter((project) => {
      if (categoryFilter && project.category_slug !== categoryFilter) return false;
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
  }, [projects, categoryFilter, search]);

  const refreshPreview = useCallback(() => {
    setPreviewKey((value) => value + 1);
    router.refresh();
  }, [router]);

  useEffect(() => {
    setProjects(initialProjects);
  }, [initialProjects]);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient(supabaseUrl, supabaseAnonKey);
    const channel = supabase
      .channel("admin-projects-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "projects" },
        () => {
          router.refresh();
        },
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

    setMessage(`Synced ${result.count} projects from the live site catalog.`);
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
    setMessage("Published live — homepage updated.");
    refreshPreview();
  }

  const previewUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/?live=${previewKey}`
      : `/?live=${previewKey}`;

  return (
    <div className="live-editor">
      <header className="live-editor-header">
        <div>
          <h1 className="live-editor-brand">DirectAid</h1>
          <p className="live-editor-subtitle">
            Live Site Editor — changes publish to the public homepage instantly.
          </p>
        </div>
        <div className="live-editor-actions">
          <button
            type="button"
            className="live-editor-btn live-editor-btn--ghost"
            onClick={() => setShowPreview((value) => !value)}
          >
            {showPreview ? "Hide Preview" : "Show Live Preview"}
          </button>
          <Link href="/admin/logs" className="live-editor-btn live-editor-btn--ghost">
            View Logs
          </Link>
          {canCreate ? (
            <Link href="/admin/projects/new" className="live-editor-btn live-editor-btn--primary">
              New Initiative
            </Link>
          ) : null}
        </div>
      </header>

      {liveUsesWebflow || dbProjectCount < webflowProjectCount ? (
        <div className="live-editor-sync-banner">
          <span>
            {liveUsesWebflow
              ? `The public site is still reading bundled Webflow data (${webflowProjectCount} projects).`
              : `Only ${dbProjectCount} of ${webflowProjectCount} live projects are in the database.`}{" "}
            Sync them so you can edit exactly what visitors see on the homepage.
          </span>
          <button
            type="button"
            className="live-editor-btn live-editor-btn--primary"
            onClick={handleSync}
            disabled={syncing}
          >
            {syncing ? "Syncing…" : `Sync ${webflowProjectCount} Projects`}
          </button>
        </div>
      ) : null}

      {message ? <p className="live-editor-success">{message}</p> : null}
      {error ? <p className="live-editor-error">{error}</p> : null}

      <div className="live-editor-stats">
        <div className="live-editor-stat">
          <p className="live-editor-stat-label">Total Beneficiaries</p>
          <p className="live-editor-stat-value">
            {statistics?.value ?? "6,284,069"}
          </p>
          <p className="live-editor-stat-note">{statistics?.label ?? "people served"}</p>
        </div>
        <div className="live-editor-stat">
          <p className="live-editor-stat-label">Published Projects</p>
          <p className="live-editor-stat-value">{publishedCount}</p>
          <p className="live-editor-stat-note">Visible on homepage</p>
        </div>
        <div className="live-editor-stat live-editor-stat--accent">
          <p className="live-editor-stat-label">In Database</p>
          <p className="live-editor-stat-value">{dbProjectCount}</p>
          <p className="live-editor-stat-note">
            {draftCount} draft{draftCount === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      <div className={`live-editor-layout${showPreview ? " has-preview" : ""}`}>
        <section>
          <h2 className="live-editor-section-title">Recent Impact Activity</h2>
          <p className="live-editor-subtitle" style={{ marginBottom: "0.75rem" }}>
            Same projects shown on the homepage — tap any card to edit.
          </p>

          <input
            type="search"
            className="admin-input live-editor-search"
            placeholder="Search projects…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <div className="live-editor-filters">
            <button
              type="button"
              className={`live-editor-pill${categoryFilter === null ? " is-active" : ""}`}
              onClick={() => setCategoryFilter(null)}
            >
              ALL
            </button>
            {categories.map((category) => (
              <button
                key={category.slug}
                type="button"
                className={`live-editor-pill${
                  categoryFilter === category.slug ? " is-active" : ""
                }`}
                onClick={() =>
                  setCategoryFilter((current) =>
                    current === category.slug ? null : category.slug,
                  )
                }
              >
                {CATEGORY_SHORT[category.slug] ?? category.title_line_2}
              </button>
            ))}
          </div>

          {filteredProjects.length === 0 ? (
            <p className="live-editor-empty">
              No projects found. Sync live data or create a new project.
            </p>
          ) : (
            <div className="live-editor-impact-list">
              {filteredProjects.map((project) => {
                const accent =
                  categoryAccentColors[
                    project.preview.categoryAccent as keyof typeof categoryAccentColors
                  ] ?? "#2c9942";

                return (
                  <button
                    key={project.slug}
                    type="button"
                    className={`live-impact-card${
                      selectedSlug === project.slug ? " is-selected" : ""
                    }${project.statusLabel !== "published" ? " is-draft" : ""}`}
                    onClick={() => openEditor(project)}
                  >
                    <div className="live-impact-media">
                      <Image
                        src={project.image_url}
                        alt={project.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 900px) 100vw, 50vw"
                        unoptimized
                      />
                    </div>
                    <div className="live-impact-body">
                      <span className="live-impact-tag">
                        <span
                          className="live-impact-dot"
                          style={{ backgroundColor: accent }}
                          aria-hidden
                        />
                        {project.categoryShort}
                      </span>
                      <h3 className="live-impact-title">{project.title}</h3>
                      <p className="live-impact-desc">
                        {project.short_description ??
                          project.description ??
                          project.preview.description ??
                          "No description yet."}
                      </p>
                      <div className="live-impact-footer">
                        <span>{project.date_label}</span>
                        <span
                          className={`live-impact-status${
                            project.statusLabel === "published" ? " is-published" : ""
                          }`}
                        >
                          {project.statusLabel}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {showPreview ? (
          <aside className="live-editor-preview">
            <h2 className="live-editor-section-title">Live Homepage Preview</h2>
            <iframe
              key={previewKey}
              title="Live site preview"
              src={previewUrl}
              className="live-editor-preview-frame"
            />
          </aside>
        ) : null}
      </div>

      {canCreate ? (
        <Link href="/admin/projects/new" className="live-editor-fab" aria-label="New project">
          +
        </Link>
      ) : null}

      {selectedProject && draft ? (
        <>
          <button
            type="button"
            className="live-editor-drawer-backdrop"
            aria-label="Close editor"
            onClick={closeEditor}
          />
          <aside className="live-editor-drawer" aria-label="Project editor">
            <header className="live-editor-drawer-header">
              <div>
                <p className="live-editor-drawer-kicker">Live Site Editor</p>
                <h2 className="live-editor-drawer-brand">DirectAid</h2>
              </div>
              <button
                type="button"
                className="live-editor-drawer-close"
                onClick={closeEditor}
                aria-label="Close"
              >
                ×
              </button>
            </header>

            <div className="live-editor-drawer-body">
              <section className="live-editor-drawer-section">
                <h3 className="live-editor-drawer-section-title">Project Content</h3>
                <div className="admin-field">
                  <label className="admin-label" htmlFor="live-title">
                    Title
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
                    Card Description (homepage)
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
                    Full Description
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
                <h3 className="live-editor-drawer-section-title">Hero Media</h3>
                {canEdit ? (
                  <ImageField
                    key={draft.slug}
                    name="image_url"
                    label="Main Image"
                    defaultValue={draft.image_url}
                    onUrlChange={(url) => updateDraft("image_url", url)}
                    required
                  />
                ) : (
                  <input className="admin-input" value={draft.image_url} readOnly dir="ltr" />
                )}
              </section>

              <section className="live-editor-drawer-section">
                <h3 className="live-editor-drawer-section-title">Metadata</h3>
                <div className="admin-field">
                  <label className="admin-label" htmlFor="live-category">
                    Category
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
                      Date Label
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
                      Status
                    </label>
                    <select
                      id="live-status"
                      className="admin-select"
                      value={draft.status}
                      onChange={(event) => updateDraft("status", event.target.value)}
                      disabled={!canEdit}
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>
                <div className="admin-row">
                  <div className="admin-field">
                    <label className="admin-label" htmlFor="live-stat-value">
                      Stat Value
                    </label>
                    <input
                      id="live-stat-value"
                      className="admin-input"
                      value={draft.stat_value}
                      onChange={(event) => updateDraft("stat_value", event.target.value)}
                      disabled={!canEdit}
                    />
                  </div>
                  <div className="admin-field">
                    <label className="admin-label" htmlFor="live-stat-label">
                      Stat Label
                    </label>
                    <input
                      id="live-stat-label"
                      className="admin-input"
                      value={draft.stat_label}
                      onChange={(event) => updateDraft("stat_label", event.target.value)}
                      disabled={!canEdit}
                    />
                  </div>
                </div>
              </section>

              <Link
                href={`/project/${selectedProject.slug}`}
                target="_blank"
                className="live-editor-btn"
              >
                Open Public Page
              </Link>
            </div>

            <footer className="live-editor-drawer-footer">
              <button type="button" className="live-editor-btn" onClick={closeEditor}>
                Discard
              </button>
              {canEdit ? (
                <button
                  type="button"
                  className="live-editor-btn live-editor-btn--primary"
                  onClick={handlePublish}
                  disabled={saving}
                >
                  {saving ? "Publishing…" : "Publish Live"}
                </button>
              ) : null}
            </footer>
          </aside>
        </>
      ) : null}
    </div>
  );
}
