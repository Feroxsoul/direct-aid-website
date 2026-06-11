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
import { createSupabaseServerClient } from "@/lib/supabase";
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

function mapProject(
  row: ProjectRow,
  category?: Pick<CategoryRow, "slug" | "accent"> | null,
): ProjectCardData {
  const accent = (row.accent ?? category?.accent ?? "default") as CategoryAccent;

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
  };
}

function mapHomeStatistics(
  row: StatisticsRow,
  defaults: HomeStatisticsData,
): HomeStatisticsData {
  return {
    value: row.value,
    label: row.label,
    iconUrl: row.icon_url ?? defaults.iconUrl,
    illustrationUrl: row.illustration_url ?? defaults.illustrationUrl,
    introText: row.intro_text ?? defaults.introText,
  };
}

async function getCategoryAccentMap(
  supabase: NonNullable<ReturnType<typeof createSupabaseServerClient>>,
) {
  const { data } = await supabase.from("categories").select("slug, accent");

  return new Map(
    (data ?? []).map((category) => [
      category.slug,
      category as Pick<CategoryRow, "slug" | "accent">,
    ]),
  );
}

export async function getCategories(): Promise<HomepageCategory[]> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return fallbackCategories;

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error || !data?.length) return fallbackCategories;
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
  if (!supabase) return fallbackProjects;

  const [{ data, error }, categoryMap] = await Promise.all([
    supabase
      .from("projects")
      .select("*")
      .eq("is_published", true)
      .order("sort_order", { ascending: true }),
    getCategoryAccentMap(supabase),
  ]);

  if (error || !data?.length) return fallbackProjects;
  return data.map((row) => mapProject(row, categoryMap.get(row.category_slug)));
}

function mapProjectDetail(
  row: ProjectRow,
  categoryLabel: string,
  category?: Pick<CategoryRow, "slug" | "accent"> | null,
): ProjectDetailData {
  const card = mapProject(row, category);

  return {
    ...card,
    categoryLabel,
    location: row.location ?? undefined,
    description:
      row.description ?? getDefaultDescription(row.title, categoryLabel),
    galleryUrls: row.gallery_urls ?? [],
  };
}

export async function getProjectSlugs(): Promise<string[]> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return getFallbackProjectSlugs();

  const { data, error } = await supabase
    .from("projects")
    .select("slug")
    .eq("is_published", true);

  if (error || !data?.length) return getFallbackProjectSlugs();
  return data.map((row) => row.slug);
}

export async function getProjectBySlug(
  slug: string,
): Promise<ProjectDetailData | undefined> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return getFallbackProjectBySlug(slug);

  const [{ data, error }, categories] = await Promise.all([
    supabase
      .from("projects")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle(),
    getCategories(),
  ]);

  if (error || !data) return getFallbackProjectBySlug(slug);

  const category = categories.find((item) => item.slug === data.category_slug);
  const categoryLabel = category ? getCategoryLabel(category) : "المشاريع";

  return mapProjectDetail(data, categoryLabel, category);
}

export async function getProjectsByCategorySlug(
  slug: string,
): Promise<ProjectCardData[]> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return getFallbackProjectsByCategorySlug(slug);

  const [{ data, error }, categoryMap] = await Promise.all([
    supabase
      .from("projects")
      .select("*")
      .eq("is_published", true)
      .eq("category_slug", slug)
      .order("sort_order", { ascending: true }),
    getCategoryAccentMap(supabase),
  ]);

  if (error) return getFallbackProjectsByCategorySlug(slug);
  return (data ?? []).map((row) =>
    mapProject(row, categoryMap.get(row.category_slug)),
  );
}

export async function getHomeStatistics(): Promise<HomeStatisticsData> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return fallbackHomeStatistics;

  const { data, error } = await supabase
    .from("statistics")
    .select("*")
    .eq("key", HOMEPAGE_STATS_KEY)
    .maybeSingle();

  if (error || !data) return fallbackHomeStatistics;
  return mapHomeStatistics(data, fallbackHomeStatistics);
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
