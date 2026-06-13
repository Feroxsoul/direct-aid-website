import webflowProjectsJson from "@/data/webflow-projects.json";
import type { CategoryAccent } from "@/lib/design-tokens";
import { getDefaultDescription } from "@/data/project-details";
import { truncateCardDescription } from "@/lib/project-catalog";
import type {
  HomepageCategory,
  ProjectCardData,
  ProjectDetailData,
  ProjectRow,
} from "@/types";

export type WebflowProjectRow = {
  slug: string;
  title: string;
  image_url: string;
  image_alt: string | null;
  category_slug: string;
  date_label: string;
  year_code: string | null;
  accent: CategoryAccent;
  stat_value: string | null;
  stat_label: string | null;
  icon_url: string | null;
  description: string | null;
  location: string | null;
  gallery_urls: string[];
  is_published: boolean;
  sort_order: number;
};

const webflowProjects = webflowProjectsJson as WebflowProjectRow[];

const categoryLabels: Record<string, string> = {
  "educational.10x10": "المشاريع التعليمية",
  "health-10x10": "المشاريع الصحية",
  "lmshryaa-ldaawy": "المشاريع الدعوية",
  developments: "المشاريع التنموية",
  "lmshryaa-lgthy": "المشاريع الإغاثية",
  orphans: "مشاريع الأيتام",
  "waters-10x10": "مشاريع المياه",
  mosque: "مشاريع المساجد",
};

export function getWebflowProjectCount() {
  return webflowProjects.length;
}

function mapWebflowToCard(row: WebflowProjectRow): ProjectCardData {
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
    categoryAccent: row.accent,
    statistics:
      row.stat_value && row.stat_label
        ? { value: row.stat_value, label: row.stat_label }
        : undefined,
    iconUrl: row.icon_url ?? undefined,
    categoryLabel: categoryLabels[row.category_slug],
    description: truncateCardDescription(row.description),
  };
}

export function getWebflowProjects(): ProjectCardData[] {
  return webflowProjects
    .filter((row) => row.is_published)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(mapWebflowToCard);
}

export function getWebflowProjectsByCategory(slug: string): ProjectCardData[] {
  return getWebflowProjects().filter((project) => project.categorySlug === slug);
}

export function getWebflowProjectSlugs(): string[] {
  return webflowProjects.map((row) => row.slug);
}

export function getWebflowProjectBySlug(
  slug: string,
  categories?: HomepageCategory[],
): ProjectDetailData | undefined {
  const row = webflowProjects.find((item) => item.slug === slug);
  if (!row) return undefined;

  const category = categories?.find((item) => item.slug === row.category_slug);
  const categoryLabel = category
    ? `${category.titleLine1} ${category.titleLine2}`.trim()
    : categoryLabels[row.category_slug] ?? "المشاريع";

  const card = mapWebflowToCard(row);

  return {
    ...card,
    categoryLabel,
    location: row.location ?? undefined,
    description:
      row.description ?? getDefaultDescription(row.title, categoryLabel),
    galleryUrls: row.gallery_urls ?? [],
  };
}

export function webflowRowToProjectRow(row: WebflowProjectRow): ProjectRow {
  return {
    id: row.slug,
    slug: row.slug,
    title: row.title,
    image_url: row.image_url,
    image_alt: row.image_alt,
    category_slug: row.category_slug,
    date_label: row.date_label,
    year_code: row.year_code,
    accent: row.accent,
    stat_value: row.stat_value,
    stat_label: row.stat_label,
    icon_url: row.icon_url,
    description: row.description,
    location: row.location,
    gallery_urls: row.gallery_urls,
    is_published: row.is_published,
    sort_order: row.sort_order,
    created_at: "",
    updated_at: "",
  };
}
