import type { CategoryAccent } from "@/lib/design-tokens";
import type { ProjectCardData, ProjectRow } from "@/types";

import { getWebflowProjectCount } from "@/lib/webflow-data";

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
};

export function resolveProjectSource(hasDbProjects: boolean): "webflow" | "database" {
  const mode = process.env.NEXT_PUBLIC_USE_WEBFLOW_PROJECTS;
  if (mode === "true") return "webflow";
  if (mode === "false") return "database";
  if (hasDbProjects) return "database";
  return getWebflowProjectCount() > 0 ? "webflow" : "database";
}

export function useWebflowProjectCatalog(hasDbProjects = false) {
  return resolveProjectSource(hasDbProjects) === "webflow";
}

export function getCategoryLabelFromRef(category: CategoryRef) {
  return `${category.title_line_1 ?? ""} ${category.title_line_2 ?? ""}`.trim();
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
    description: row.short_description ?? row.description ?? undefined,
  };
}

export function projectStatus(row: ProjectRow) {
  return row.status ?? (row.is_published ? "published" : "draft");
}

export function relativeTimeLabel(dateLabel: string) {
  return dateLabel;
}
