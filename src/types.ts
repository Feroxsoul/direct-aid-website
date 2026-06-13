import type { AdminPermissions } from "@/lib/admin/permissions";
import type { CategoryAccent } from "@/lib/design-tokens";

export type { AdminPermissions } from "@/lib/admin/permissions";

export type ProjectStatus = "draft" | "published" | "archived";

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
  brandLine1: string;
  brandLine2: string;
  backgroundColor: string;
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
  categoryLabel?: string;
  description?: string;
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
  status?: ProjectStatus | string | null;
  short_description?: string | null;
  goal_amount?: number | null;
  amount_raised?: number | null;
  suggested_donations?: number[] | null;
  meta_title?: string | null;
  meta_description?: string | null;
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

export type AdminRole = string;

export type AdminUserRow = {
  id: string;
  user_id: string | null;
  email: string;
  role: AdminRole;
  role_slug?: string | null;
  display_name: string | null;
  avatar_url?: string | null;
  is_active: boolean;
  last_login_at?: string | null;
  suspended_at?: string | null;
  suspended_reason?: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type AdminRoleRow = {
  id: string;
  slug: string;
  name: string;
  badge_color: string;
  is_system: boolean;
  permissions: AdminPermissions;
  created_at: string;
  updated_at: string;
};

export type AdminProfile = AdminUserRow & {
  role_slug: string;
  role_name: string;
  badge_color: string;
  permissions: AdminPermissions;
};

export type DonationRow = {
  id: string;
  project_slug: string | null;
  category_slug: string | null;
  donor_name: string | null;
  donor_email: string | null;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
};

export type AuditLogRow = {
  id: string;
  actor_user_id: string | null;
  actor_email: string | null;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  details: Record<string, unknown>;
  created_at: string;
};

export type AdminNotificationRow = {
  id: string;
  target_user_id: string | null;
  type: string;
  title: string;
  body: string | null;
  is_read: boolean;
  created_at: string;
};

export type MediaAssetRow = {
  id: string;
  url: string;
  filename: string | null;
  alt_text: string | null;
  size_bytes: number | null;
  uploaded_by: string | null;
  created_at: string;
};

export type DashboardStats = {
  totalDonations: number;
  totalDonors: number;
  totalProjects: number;
  activeProjects: number;
  totalUsers: number;
  totalRoles: number;
  monthlyDonations: number;
  yearlyDonations: number;
  donationGrowth: number;
  projectGrowth: number;
  usersByRole: { role: string; label: string; color: string; count: number }[];
  recentUsers: AdminUserRow[];
  suspendedUsers: number;
  donationsByMonth: { month: string; amount: number }[];
  topProjects: {
    slug: string;
    title: string;
    image_url: string;
    goal_amount: number;
    amount_raised: number;
  }[];
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
      admin_users: TableDef<AdminUserRow>;
      admin_roles: TableDef<AdminRoleRow>;
      donations: TableDef<DonationRow>;
      audit_logs: TableDef<AuditLogRow>;
      admin_notifications: TableDef<AdminNotificationRow>;
      media_assets: TableDef<MediaAssetRow>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
