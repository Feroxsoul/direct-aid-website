import {
  mergeProjectsWithWebflowCatalog,
} from "@/lib/admin/project-catalog-merge";
import {
  CATEGORY_SHORT,
  getCategoryLabelFromRef,
  mapProjectRowToCard,
  projectStatus,
  sortProjectsByDateDesc,
  shouldUseWebflowProjectCatalog,
} from "@/lib/project-catalog";
import { getWebflowProjectCount } from "@/lib/webflow-data";
import {
  adminGetCategories,
  adminGetHomeStatistics,
  adminGetProjects,
} from "@/lib/admin/data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CategoryRow, ProjectCardData, ProjectRow, StatisticsRow } from "@/types";

export type AdminProjectEditorItem = ProjectRow & {
  categoryLabel: string;
  categoryShort: string;
  statusLabel: string;
  preview: ProjectCardData;
};

export type AdminProjectsEditorData = {
  projects: AdminProjectEditorItem[];
  categories: CategoryRow[];
  statistics: StatisticsRow | null;
  dbProjectCount: number;
  webflowProjectCount: number;
  liveUsesWebflow: boolean;
  publishedCount: number;
  draftCount: number;
};

export async function getAdminProjectsEditorData(): Promise<AdminProjectsEditorData> {
  const supabase = await createSupabaseServerClient();
  const [projects, categories, statistics] = await Promise.all([
    adminGetProjects(),
    adminGetCategories(),
    adminGetHomeStatistics(),
  ]);

  let dbProjectCount = projects.length;
  if (supabase) {
    const { count } = await supabase
      .from("projects")
      .select("*", { count: "exact", head: true });
    dbProjectCount = count ?? projects.length;
  }

  const categoryMap = new Map(categories.map((category) => [category.slug, category]));
  const webflowProjectCount = getWebflowProjectCount();
  const liveUsesWebflow = shouldUseWebflowProjectCatalog(dbProjectCount > 0);
  const mergedProjects = sortProjectsByDateDesc(mergeProjectsWithWebflowCatalog(projects));

  const editorProjects: AdminProjectEditorItem[] = mergedProjects.map((row) => {
    const category = categoryMap.get(row.category_slug);
    const categoryLabel = category
      ? getCategoryLabelFromRef(category)
      : row.category_slug;

    return {
      ...row,
      categoryLabel,
      categoryShort: CATEGORY_SHORT[row.category_slug] ?? categoryLabel,
      statusLabel: projectStatus(row),
      preview: mapProjectRowToCard(row, category),
    };
  });

  const publishedCount = editorProjects.filter(
    (project) => projectStatus(project) === "published",
  ).length;

  return {
    projects: editorProjects,
    categories,
    statistics,
    dbProjectCount,
    webflowProjectCount,
    liveUsesWebflow,
    publishedCount,
    draftCount: editorProjects.length - publishedCount,
  };
}
