import type { CategoryAccent } from "@/lib/design-tokens";

// UI types
export type HomepageCategory = {
  slug: string;
  titleLine1: string;
  titleLine2: string;
  iconUrl: string;
  accent: CategoryAccent;
};

export type HomeStatisticsData = {
  value: string;
  label: string;
  iconUrl: string;
  illustrationUrl: string;
  introText: string;
};

export type ProjectMetadata = {
  dateLabel: string;
  yearCode?: string;
};

export type ProjectStatistics = {
  value: string;
  label: string;
};

export type ProjectCardData = {
  id: string;
  title: string;
  imageUrl: string;
  imageAlt?: string;
  href: string;
  categorySlug: string;
  metadata: ProjectMetadata;
  categoryAccent: CategoryAccent;
  statistics?: ProjectStatistics;
  iconUrl?: string;
};

export type ProjectDetailData = ProjectCardData & {
  description: string;
  location?: string;
  categoryLabel: string;
  galleryUrls: string[];
};

export type SiteSettings = {
  site_title: string;
  site_description: string;
  share_label: string;
  logo_url: string;
  share_icon_url: string;
};

export type PageMeta = {
  title: string;
  meta_description: string | null;
};

// Supabase row types
export type CategoryRow = {
  id: string;
  slug: string;
  title_line_1: string;
  title_line_2: string;
  icon_url: string;
  accent: CategoryAccent;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ProjectRow = {
  id: string;
  slug: string;
  title: string;
  image_url: string;
  image_alt: string | null;
  category_slug: string;
  date_label: string;
  year_code: string | null;
  accent: CategoryAccent | null;
  stat_value: string | null;
  stat_label: string | null;
  icon_url: string | null;
  description: string | null;
  location: string | null;
  gallery_urls: string[] | null;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type StatisticsRow = {
  id: string;
  key: string;
  value: string;
  label: string;
  icon_url: string | null;
  illustration_url: string | null;
  intro_text: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type PageRow = {
  id: string;
  slug: string;
  title: string;
  meta_description: string | null;
  content: Record<string, unknown>;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type SettingRow = {
  id: string;
  key: string;
  value: string | null;
  value_json: Record<string, unknown> | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
};

type TableDef<Row> = {
  Row: Row;
  Insert: Omit<Row, "id" | "created_at" | "updated_at"> & {
    id?: string;
    created_at?: string;
    updated_at?: string;
  };
  Update: Partial<TableDef<Row>["Insert"]>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      categories: TableDef<CategoryRow>;
      projects: TableDef<ProjectRow>;
      statistics: TableDef<StatisticsRow>;
      pages: TableDef<PageRow>;
      settings: TableDef<SettingRow>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
