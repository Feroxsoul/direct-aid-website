import type { CategoryAccent } from "@/lib/design-tokens";
import type { ProjectCardData, ProjectRow } from "@/types";

import { getWebflowProjectCount } from "@/lib/webflow-data";
import { parseProjectDateLabel } from "@/lib/project-slug";

export type ProjectDateSortable = {
  project_year?: number | null;
  project_month?: number | null;
  date_label?: string | null;
  year_code?: string | null;
  created_at?: string | null;
  slug: string;
};

/** Resolve year/month for sorting (newest first on listings). */
export function getProjectSortDate(row: ProjectDateSortable): {
  year: number;
  month: number;
} {
  if (row.project_year && row.project_month) {
    return { year: row.project_year, month: row.project_month };
  }

  const parsed = parseProjectDateLabel(row.date_label ?? null, row.year_code);
  if (parsed) {
    return { year: parsed.year, month: parsed.month };
  }

  const slugTail = row.slug.match(/(\d{2})(\d{2})\d{2}$/);
  if (slugTail) {
    const yy = Number(slugTail[1]);
    const mm = Number(slugTail[2]);
    return {
      year: yy >= 70 ? 1900 + yy : 2000 + yy,
      month: mm,
    };
  }

  if (row.created_at) {
    const created = new Date(row.created_at);
    if (!Number.isNaN(created.getTime())) {
      return { year: created.getFullYear(), month: created.getMonth() + 1 };
    }
  }

  return { year: 0, month: 0 };
}

/** Newest project date first (2026 → 2025 → 2024, then month within year). */
export function compareProjectsByDateDesc(
  a: ProjectDateSortable,
  b: ProjectDateSortable,
): number {
  const da = getProjectSortDate(a);
  const db = getProjectSortDate(b);

  if (db.year !== da.year) return db.year - da.year;
  if (db.month !== da.month) return db.month - da.month;
  return b.slug.localeCompare(a.slug);
}

export function sortProjectsByDateDesc<T extends ProjectDateSortable>(rows: T[]): T[] {
  return [...rows].sort(compareProjectsByDateDesc);
}

export const CATEGORY_SHORT: Record<string, string> = {
  "health-10x10": "الصحية",
  "educational.10x10": "التعليمية",
  developments: "التنموية",
  "lmshryaa-ldaawy": "الدعوية",
  orphans: "الأيتام",
  "lmshryaa-lgthy": "الإغاثية",
  mosque: "المساجد",
  "waters-10x10": "المياه",
};

export type CategoryRef = {
  slug: string;
  accent: CategoryAccent;
  title_line_1?: string;
  title_line_2?: string;
  name_en?: string | null;
};

export function resolveProjectSource(hasDbProjects: boolean): "webflow" | "database" {
  const mode = process.env.NEXT_PUBLIC_USE_WEBFLOW_PROJECTS;
  if (mode === "true") return "webflow";
  if (mode === "false") return "database";
  if (hasDbProjects) return "database";
  return getWebflowProjectCount() > 0 ? "webflow" : "database";
}

export function shouldUseWebflowProjectCatalog(hasDbProjects = false) {
  return resolveProjectSource(hasDbProjects) === "webflow";
}

export function getCategoryLabelFromRef(category: CategoryRef) {
  return `${category.title_line_1 ?? ""} ${category.title_line_2 ?? ""}`.trim();
}

export function truncateCardDescription(
  text: string | null | undefined,
  max = 100,
): string | undefined {
  if (!text) return undefined;
  const normalized = text.trim();
  if (!normalized) return undefined;
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, max).trim()}…`;
}

export function mapProjectRowToCard(
  row: ProjectRow,
  category?: CategoryRef | null,
): ProjectCardData {
  const accent = (row.accent ?? category?.accent ?? "default") as CategoryAccent;
  const categoryLabel = category ? getCategoryLabelFromRef(category) : undefined;

  return {
    id: row.slug,
    title: row.title,
    imageUrl: row.image_url,
    imageAlt: row.image_alt ?? undefined,
    href: `/project/${row.slug}`,
    categorySlug: row.category_slug,
    metadata: {
      dateLabel: row.date_label,
      yearCode: row.year_code ?? undefined,
    },
    categoryAccent: accent,
    statistics:
      row.stat_value && row.stat_label
        ? { value: row.stat_value, label: row.stat_label }
        : undefined,
    iconUrl: row.icon_url ?? undefined,
    categoryLabel,
    categoryLabelEn: category?.name_en ?? null,
    description: truncateCardDescription(row.description),
    location: row.location ?? undefined,
    countrySlug: row.country_slug ?? undefined,
    titleEn: row.title_en ?? undefined,
    descriptionEn: row.description_en ?? undefined,
    statLabelEn: row.stat_label_en ?? undefined,
  };
}

export function projectStatus(row: ProjectRow) {
  const status = row.status ?? (row.is_published ? "published" : "draft");
  return status === "archived" ? "draft" : status;
}

export function relativeTimeLabel(dateLabel: string) {
  return dateLabel;
}
