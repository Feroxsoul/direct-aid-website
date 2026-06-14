import {
  fallbackCategories,
  fallbackHomeStatistics,
  fallbackPages,
  fallbackSettings,
} from "@/data/fallback";
import { getDefaultDescription } from "@/data/project-details";
import {
  fallbackProjects,
  getFallbackProjectBySlug,
  getFallbackProjectSlugs,
  getFallbackProjectsByCategorySlug,
} from "@/data/projects";
import type { CategoryAccent } from "@/lib/design-tokens";
import {
  getCategoryLabelFromRef,
  mapProjectRowToCard,
  useWebflowProjectCatalog,
  type CategoryRef,
} from "@/lib/project-catalog";
import { createSupabaseServerClient } from "@/lib/supabase";
import { parseCategoryColorMap } from "@/lib/admin/settings-store";
import {
  getWebflowProjectBySlug,
  getWebflowProjectCount,
  getWebflowProjectSlugs,
  getWebflowProjects,
  getWebflowProjectsByCategory,
} from "@/lib/webflow-data";
import type {
  CategoryRow,
  HomeStatisticsData,
  HomepageCategory,
  PageMeta,
  ProjectCardData,
  ProjectDetailData,
  ProjectRow,
  SiteSettings,
  StatisticsRow,
} from "@/types";

const HOMEPAGE_STATS_KEY = "homepage_beneficiaries";

function mapCategory(row: CategoryRow): HomepageCategory {
  return {
    slug: row.slug,
    titleLine1: row.title_line_1,
    titleLine2: row.title_line_2,
    iconUrl: row.icon_url,
    accent: row.accent,
  };
}

function mapProject(row: ProjectRow, category?: CategoryRef | null): ProjectCardData {
  const card = mapProjectRowToCard(row, category);
  const categoryLabel = category ? getCategoryLabelFromRef(category) : undefined;

  if (!card.description && categoryLabel) {
    card.description = getDefaultDescription(row.title, categoryLabel);
  }

  return card;
}

const HOME_STATS_SETTING_KEYS = [
  "stats_brand_line_1",
  "stats_brand_line_2",
  "stats_brand_logo_url",
  "stats_box_color",
] as const;

function mapHomeStatistics(
  row: StatisticsRow,
  defaults: HomeStatisticsData,
  settings: Partial<Record<(typeof HOME_STATS_SETTING_KEYS)[number], string>> = {},
): HomeStatisticsData {
  return {
    value: row.value,
    label: row.label,
    iconUrl: row.icon_url ?? defaults.iconUrl,
    illustrationUrl: row.illustration_url ?? defaults.illustrationUrl,
    introText: row.intro_text ?? defaults.introText,
    brandLine1: settings.stats_brand_line_1 ?? defaults.brandLine1,
    brandLine2: settings.stats_brand_line_2 ?? defaults.brandLine2,
    brandLogoUrl: settings.stats_brand_logo_url ?? defaults.brandLogoUrl,
    backgroundColor: settings.stats_box_color ?? defaults.backgroundColor,
  };
}

async function getCategoryMap(
  supabase: NonNullable<ReturnType<typeof createSupabaseServerClient>>,
) {
  const { data } = await supabase.from("categories").select(
    "slug, accent, title_line_1, title_line_2",
  );

  return new Map((data ?? []).map((category) => [category.slug, category as CategoryRef]));
}

export async function getCategoryColorMap(): Promise<Record<string, string>> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return {};

  const { data } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "category_accent_map")
    .maybeSingle();

  return parseCategoryColorMap(data?.value);
}

export async function getCategories(): Promise<HomepageCategory[]> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return fallbackCategories;

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("status", "published")
    .order("sort_order", { ascending: true });

  if (error) {
    const fallbackQuery = await supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true });
    if (fallbackQuery.error || !fallbackQuery.data?.length) return fallbackCategories;
    return fallbackQuery.data.map(mapCategory);
  }

  if (!data?.length) return fallbackCategories;
  return data.map(mapCategory);
}

export async function getCategoryBySlug(
  slug: string,
): Promise<HomepageCategory | undefined> {
  const categories = await getCategories();
  return categories.find((category) => category.slug === slug);
}

export async function getCategorySlugs(): Promise<string[]> {
  const categories = await getCategories();
  return categories.map((category) => category.slug);
}

export function getCategoryLabel(category: HomepageCategory): string {
  return `${category.titleLine1} ${category.titleLine2}`.trim();
}

export async function getAllProjects(): Promise<ProjectCardData[]> {
  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return getWebflowProjects().length ? getWebflowProjects() : fallbackProjects;
  }

  const [{ data, error }, categoryMap, { count }] = await Promise.all([
    supabase
      .from("projects")
      .select("*")
      .eq("is_published", true)
      .order("sort_order", { ascending: true }),
    getCategoryMap(supabase),
    supabase.from("projects").select("*", { count: "exact", head: true }),
  ]);

  const hasDbProjects = (count ?? 0) > 0;

  if (useWebflowProjectCatalog(hasDbProjects)) {
    return getWebflowProjects();
  }

  if (error || !data?.length) {
    return fallbackProjects;
  }

  return data.map((row) => mapProject(row, categoryMap.get(row.category_slug)));
}

function mapProjectDetail(
  row: ProjectRow,
  categoryLabel: string,
  category?: CategoryRef | null,
): ProjectDetailData {
  const card = mapProject(row, category);

  return {
    ...card,
    categoryLabel,
    location: row.location ?? undefined,
    description:
      row.description ?? getDefaultDescription(row.title, categoryLabel),
    galleryUrls: row.gallery_urls ?? [],
    metaTitle: row.meta_title ?? undefined,
    metaDescription: row.meta_description ?? undefined,
  };
}

export async function getProjectSlugs(): Promise<string[]> {
  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return getWebflowProjectSlugs().length
      ? getWebflowProjectSlugs()
      : getFallbackProjectSlugs();
  }

  const [{ data, error }, { count }] = await Promise.all([
    supabase.from("projects").select("slug").eq("is_published", true),
    supabase.from("projects").select("*", { count: "exact", head: true }),
  ]);

  const hasDbProjects = (count ?? 0) > 0;

  if (useWebflowProjectCatalog(hasDbProjects)) {
    return getWebflowProjectSlugs();
  }

  if (error || !data?.length) {
    return getFallbackProjectSlugs();
  }
  return data.map((row) => row.slug);
}

export async function getProjectBySlug(
  slug: string,
): Promise<ProjectDetailData | undefined> {
  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return (
      getWebflowProjectBySlug(slug) ?? getFallbackProjectBySlug(slug)
    );
  }

  const [{ data, error }, categories, { count }] = await Promise.all([
    supabase
      .from("projects")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle(),
    getCategories(),
    supabase.from("projects").select("*", { count: "exact", head: true }),
  ]);

  const hasDbProjects = (count ?? 0) > 0;

  if (useWebflowProjectCatalog(hasDbProjects)) {
    return getWebflowProjectBySlug(slug, categories);
  }

  if (error || !data) {
    return getFallbackProjectBySlug(slug);
  }

  const category = categories.find((item) => item.slug === data.category_slug);
  const categoryLabel = category ? getCategoryLabel(category) : "المشاريع";

  return mapProjectDetail(data, categoryLabel, category);
}

export async function getProjectsByCategorySlug(
  slug: string,
): Promise<ProjectCardData[]> {
  const supabase = createSupabaseServerClient();
  if (!supabase) {
    const webflow = getWebflowProjectsByCategory(slug);
    return webflow.length ? webflow : getFallbackProjectsByCategorySlug(slug);
  }

  const [{ data, error }, categoryMap, { count }] = await Promise.all([
    supabase
      .from("projects")
      .select("*")
      .eq("is_published", true)
      .eq("category_slug", slug)
      .order("sort_order", { ascending: true }),
    getCategoryMap(supabase),
    supabase.from("projects").select("*", { count: "exact", head: true }),
  ]);

  const hasDbProjects = (count ?? 0) > 0;

  if (useWebflowProjectCatalog(hasDbProjects)) {
    return getWebflowProjectsByCategory(slug);
  }

  if (error) {
    return getFallbackProjectsByCategorySlug(slug);
  }
  return (data ?? []).map((row) =>
    mapProject(row, categoryMap.get(row.category_slug)),
  );
}

export async function getHomeStatistics(): Promise<HomeStatisticsData> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return fallbackHomeStatistics;

  const [{ data, error }, { data: settingsRows }] = await Promise.all([
    supabase
      .from("statistics")
      .select("*")
      .eq("key", HOMEPAGE_STATS_KEY)
      .maybeSingle(),
    supabase
      .from("settings")
      .select("key, value")
      .in("key", [...HOME_STATS_SETTING_KEYS]),
  ]);

  const settings = Object.fromEntries(
    (settingsRows ?? []).map((row) => [row.key, row.value ?? ""]),
  ) as Partial<Record<(typeof HOME_STATS_SETTING_KEYS)[number], string>>;

  if (error || !data) {
    return {
      ...fallbackHomeStatistics,
      brandLine1: settings.stats_brand_line_1 ?? fallbackHomeStatistics.brandLine1,
      brandLine2: settings.stats_brand_line_2 ?? fallbackHomeStatistics.brandLine2,
      brandLogoUrl: settings.stats_brand_logo_url ?? fallbackHomeStatistics.brandLogoUrl,
      backgroundColor: settings.stats_box_color ?? fallbackHomeStatistics.backgroundColor,
    };
  }

  return mapHomeStatistics(data, fallbackHomeStatistics, settings);
}

export async function getPageBySlug(slug: string): Promise<PageMeta | null> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return fallbackPages[slug] ?? null;

  const { data, error } = await supabase
    .from("pages")
    .select("title, meta_description")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error || !data) return fallbackPages[slug] ?? null;
  return data;
}

export async function getPublicSettings(): Promise<SiteSettings> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return fallbackSettings;

  const { data, error } = await supabase
    .from("settings")
    .select("key, value")
    .eq("is_public", true);

  if (error || !data?.length) return fallbackSettings;

  const settings = { ...fallbackSettings };
  for (const row of data) {
    if (row.value && row.key in settings) {
      settings[row.key as keyof SiteSettings] = row.value;
    }
  }
  return settings;
}
