import { getWebflowProjectRows } from "@/lib/webflow-data";
import { webflowRowToProjectRow } from "@/lib/webflow-data";
import type { ProjectRow } from "@/types";

/** DB rows override catalog rows with the same slug. */
export function mergeProjectsWithWebflowCatalog(
  dbProjects: ProjectRow[],
): ProjectRow[] {
  const bySlug = new Map<string, ProjectRow>();

  for (const row of getWebflowProjectRows()) {
    bySlug.set(row.slug, webflowRowToProjectRow(row));
  }

  for (const row of dbProjects) {
    bySlug.set(row.slug, row);
  }

  return Array.from(bySlug.values());
}

export function getWebflowOnlyProjectCount(dbProjects: ProjectRow[]): number {
  const dbSlugs = new Set(dbProjects.map((row) => row.slug));
  return getWebflowProjectRows().filter((row) => !dbSlugs.has(row.slug)).length;
}
