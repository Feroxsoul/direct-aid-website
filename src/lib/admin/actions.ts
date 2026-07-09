"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logAuditEvent } from "@/lib/admin/audit";
import {
  type AdminSaveResult,
  CATEGORY_OPTIONAL_COLUMNS,
  isMissingColumnError,
  omitKeys,
  PROJECT_BILINGUAL_COLUMNS,
  runWithOptionalColumns,
  STATISTICS_BILINGUAL_COLUMNS,
} from "@/lib/admin/db-write";

export type { AdminSaveResult } from "@/lib/admin/db-write";
import {
  assertCanDeleteProjects,
  requireSupabaseAdmin,
} from "@/lib/admin/auth";
import {
  DEFAULT_ROLE_DEFINITIONS,
  getDefaultRoleDefinition,
} from "@/lib/admin/permissions";
import { hasPermission } from "@/lib/admin/permissions";
import { canAssignRole } from "@/lib/admin/roles";
import type { AdminProfile } from "@/types";
import type { CategoryStatus } from "@/types";
import type { CategoryAccent } from "@/lib/design-tokens";
import { categoryAccentColors } from "@/lib/design-tokens";
import { isHexColor, normalizeHexColor } from "@/lib/category-colors";
import { normalizeCdnImageUrl } from "@/lib/image-url";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ADMIN_NAV_PAGES } from "@/lib/admin/nav-pages";
import {
  buildProjectSlug,
  formatArabicDateLabel,
  slugKeyFromEnglishName,
} from "@/lib/project-slug";

function canManageLoginAccounts(roleSlug: string) {
  return roleSlug === "super_admin" || roleSlug === "admin";
}

function parseNavHiddenFromForm(formData: FormData): string[] {
  const hidden: string[] = [];
  for (const page of ADMIN_NAV_PAGES) {
    if (formData.get(`nav_visible_${page.key}`) !== "on") {
      hidden.push(page.href);
    }
  }
  return hidden;
}

async function setAuthUserPassword(userId: string, password: string) {
  const service = createSupabaseServiceClient();
  if (!service) {
    throw new Error("Service role key is required to manage passwords");
  }

  const { error } = await service.auth.admin.updateUserById(userId, { password });
  if (error) throw new Error(error.message);
}

async function findAuthUserIdByEmail(
  service: NonNullable<ReturnType<typeof createSupabaseServiceClient>>,
  email: string,
) {
  let page = 1;
  const perPage = 200;

  while (page <= 10) {
    const { data, error } = await service.auth.admin.listUsers({ page, perPage });
    if (error) throw new Error(error.message);

    const match = data.users.find((user) => user.email?.toLowerCase() === email);
    if (match?.id) return match.id;

    if (data.users.length < perPage) break;
    page += 1;
  }

  return null;
}

async function createOrLinkAuthUser(
  email: string,
  password: string,
  displayName: string | null,
) {
  const service = createSupabaseServiceClient();
  if (!service) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is required — add it in Railway environment variables",
    );
  }

  const { data, error } = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: displayName ? { display_name: displayName } : undefined,
  });

  if (!error && data.user?.id) {
    return { service, authUserId: data.user.id };
  }

  const message = error?.message?.toLowerCase() ?? "";
  if (
    message.includes("already") ||
    message.includes("registered") ||
    message.includes("exists")
  ) {
    const existingId = await findAuthUserIdByEmail(service, email);
    if (!existingId) {
      throw new Error(error?.message ?? "Auth account exists but could not be linked");
    }
    await setAuthUserPassword(existingId, password);
    return { service, authUserId: existingId };
  }

  throw new Error(error?.message ?? "Failed to create auth user");
}

async function getAdminWriteClient() {
  const { supabase, profile } = await requireSupabaseAdmin();
  const service = createSupabaseServiceClient();
  return { supabase: service ?? supabase, profile };
}

const ACCENTS: CategoryAccent[] = [
  "red",
  "green",
  "blue",
  "olive",
  "yellow",
  "orange",
  "water",
  "default",
];

function parseGalleryUrls(value: FormDataEntryValue | null): string[] {
  if (typeof value !== "string") return [];
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function revalidateSite() {
  // Root layout renders header/footer and public settings.
  // Revalidate both page and layout so footer changes show immediately.
  revalidatePath("/");
  revalidatePath("/", "layout");
  revalidatePath("/lmshryaa", "layout");
  revalidatePath("/project", "layout");
}

async function nextProjectSlug(
  supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>,
  categorySlug: string,
  year: number,
  month: number,
): Promise<string> {
  const { data: category } = await supabase
    .from("categories")
    .select("slug_key")
    .eq("slug", categorySlug)
    .maybeSingle();

  const key = (category?.slug_key ?? slugKeyFromEnglishName(categorySlug)) || "project";
  const yy = String(year).slice(-2);
  const mm = String(month).padStart(2, "0");
  const prefix = `${key}${yy}${mm}`;

  const { data: existing } = await supabase
    .from("projects")
    .select("slug")
    .like("slug", `${prefix}%`);

  const sequences = (existing ?? [])
    .map((row) => {
      const match = row.slug.match(new RegExp(`^${prefix}(\\d{2})$`));
      return match ? Number(match[1]) : 0;
    })
    .filter((value) => value > 0);

  const next = sequences.length ? Math.max(...sequences) + 1 : 1;
  return buildProjectSlug(key, year, month, next);
}

function parseProjectPayload(formData: FormData) {
  const rawStatus = String(formData.get("status") ?? "published").trim();
  const status = rawStatus === "archived" ? "draft" : rawStatus;
  const month = Number(formData.get("project_month"));
  const year = Number(formData.get("project_year"));

  const payload = {
    slug: String(formData.get("slug") ?? "").trim(),
    title: String(formData.get("title") ?? "").trim(),
    image_url: String(formData.get("image_url") ?? "").trim(),
    image_alt: String(formData.get("image_alt") ?? "").trim() || null,
    category_slug: String(formData.get("category_slug") ?? "").trim(),
    date_label: "",
    project_month: month,
    project_year: year,
    description: String(formData.get("description") ?? "").trim() || null,
    short_description: null as string | null,
    location: null as string | null,
    country_slug: String(formData.get("country_slug") ?? "").trim() || null,
    gallery_urls: parseGalleryUrls(formData.get("gallery_urls")),
    stat_value: String(formData.get("stat_value") ?? "").trim() || null,
    stat_label: String(formData.get("stat_label") ?? "").trim() || null,
    icon_url: String(formData.get("icon_url") ?? "").trim() || null,
    accent: null as CategoryAccent | null,
    status,
    is_published: status === "published",
    year_code: null as string | null,
    goal_amount: null,
    amount_raised: 0,
    meta_title: String(formData.get("meta_title") ?? "").trim() || null,
    meta_description:
      String(formData.get("meta_description") ?? "").trim() || null,
    title_en: String(formData.get("title_en") ?? "").trim() || null,
    description_en: String(formData.get("description_en") ?? "").trim() || null,
    meta_title_en: String(formData.get("meta_title_en") ?? "").trim() || null,
    meta_description_en:
      String(formData.get("meta_description_en") ?? "").trim() || null,
    stat_label_en: String(formData.get("stat_label_en") ?? "").trim() || null,
    sort_order: 0,
  };

  if (
    !payload.title ||
    !payload.image_url ||
    !payload.category_slug ||
    !month ||
    !year
  ) {
    throw new Error("Required: title, image, category, month, year");
  }

  payload.date_label = formatArabicDateLabel(month, year);
  payload.year_code = `${year} ${payload.date_label.split(" ")[0]?.slice(0, 3).toUpperCase() ?? ""}`;
  payload.short_description = payload.description
    ? payload.description.slice(0, 100)
    : null;

  if (payload.accent && !ACCENTS.includes(payload.accent)) {
    payload.accent = null;
  }

  return { payload };
}

async function applyCategoryAccentToProject(
  supabase: NonNullable<Awaited<ReturnType<typeof import("@/lib/supabase/server").createSupabaseServerClient>>>,
  payload: { category_slug: string; accent: CategoryAccent | null },
) {
  const { data: category } = await supabase
    .from("categories")
    .select("accent")
    .eq("slug", payload.category_slug)
    .maybeSingle();

  payload.accent = (category?.accent as CategoryAccent | null) ?? null;
}

export async function signOut() {
  const supabase = await import("@/lib/supabase/server").then((m) =>
    m.createSupabaseServerClient(),
  );
  if (supabase) {
    await supabase.auth.signOut();
  }
  redirect("/admin/login");
}

export async function uploadImage(formData: FormData): Promise<string> {
  const { supabase } = await requireSupabaseAdmin();
  const service = createSupabaseServiceClient();
  const writeClient = service ?? supabase;
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    throw new Error("لم يتم اختيار ملف");
  }

  const extension = file.name.split(".").pop() ?? "jpg";
  const path = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;

  const { error } = await writeClient.storage.from("media").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) throw new Error(error.message);

  const { data } = writeClient.storage.from("media").getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadMediaAsset(formData: FormData) {
  const { supabase, profile } = await requireSupabaseAdmin();
  const service = createSupabaseServiceClient();
  const writeClient = service ?? supabase;
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    throw new Error("No file selected");
  }

  const url = await uploadImage(formData);

  await writeClient.from("media_assets").insert({
    url,
    filename: file.name,
    alt_text: null,
    size_bytes: file.size,
    uploaded_by: profile.user_id,
  });

  await logAuditEvent(profile, "media.uploaded", "media", url);
  revalidatePath("/admin/media");
}

export type ProjectActionResult = { ok: true; slug: string } | { ok: false; error: string };

export async function saveProject(formData: FormData): Promise<ProjectActionResult> {
  try {
    const { supabase, profile } = await getAdminWriteClient();
    const isNew = formData.get("is_new") === "true";
    const originalSlug = String(formData.get("original_slug") ?? "").trim();
    const { payload } = parseProjectPayload(formData);

    if (!hasPermission(profile.permissions, profile.role_slug, "projects", isNew ? "create" : "edit")) {
      return { ok: false, error: "You do not have permission to save this project." };
    }

    const isSuperAdmin = profile.role_slug === "super_admin";
    let slug = payload.slug;

    if (isNew) {
      slug = await nextProjectSlug(
        supabase,
        payload.category_slug,
        payload.project_year!,
        payload.project_month!,
      );
    } else if (isSuperAdmin) {
      const requested = String(formData.get("slug") ?? "").trim();
      slug = requested || originalSlug;
    } else {
      slug = originalSlug;
    }

    payload.slug = slug;

    if (payload.country_slug) {
      const { data: countryRow } = await supabase
        .from("countries")
        .select("name_ar")
        .eq("slug", payload.country_slug)
        .maybeSingle();
      payload.location = (countryRow as { name_ar: string } | null)?.name_ar ?? null;
    }

    await applyCategoryAccentToProject(supabase, payload);

    if (!isNew && originalSlug && slug !== originalSlug) {
      await supabase
        .from("donations")
        .update({ project_slug: slug })
        .eq("project_slug", originalSlug);

      const { error: renameError } = await runWithOptionalColumns(
        async (row) => {
          const r = await supabase.from("projects").update(row).eq("slug", originalSlug);
          return { error: r.error };
        },
        payload,
        [...PROJECT_BILINGUAL_COLUMNS],
      );

      if (renameError) return { ok: false, error: renameError.message };
    } else {
      const write = async (row: typeof payload) => {
        const r = isNew
          ? await supabase.from("projects").insert(row)
          : await supabase.from("projects").upsert(row, { onConflict: "slug" });
        return { error: r.error };
      };

      const { error } = await runWithOptionalColumns(
        write,
        payload,
        [...PROJECT_BILINGUAL_COLUMNS],
      );

      if (error) return { ok: false, error: error.message };
    }

    await logAuditEvent(
      profile,
      isNew ? "project.created" : "project.updated",
      "project",
      slug,
    );

    revalidateSite();
    revalidatePath("/admin/projects");
    revalidatePath(`/admin/projects/${slug}`);
    if (originalSlug && originalSlug !== slug) {
      revalidatePath(`/admin/projects/${originalSlug}`);
      revalidatePath(`/project/${originalSlug}`);
    }
    revalidatePath(`/project/${slug}`);
    return { ok: true, slug };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to save project",
    };
  }
}

export async function saveProjectInline(formData: FormData) {
  try {
    const { supabase, profile } = await getAdminWriteClient();
    const isNew = formData.get("is_new") === "true";
    const originalSlug = String(formData.get("original_slug") ?? "").trim();
    const { payload } = parseProjectPayload(formData);

    let slug = payload.slug;
    if (isNew) {
      slug = await nextProjectSlug(
        supabase,
        payload.category_slug,
        payload.project_year!,
        payload.project_month!,
      );
    } else {
      slug = originalSlug || payload.slug;
    }
    payload.slug = slug;

    await applyCategoryAccentToProject(supabase, payload);

    const write = (row: typeof payload) =>
      isNew
        ? supabase.from("projects").insert(row).select("*").single()
        : supabase.from("projects").upsert(row, { onConflict: "slug" }).select("*").single();

    let { data, error } = await write(payload);
    if (error && isMissingColumnError(error)) {
      const retry = await write(omitKeys(payload, [...PROJECT_BILINGUAL_COLUMNS]));
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      return { ok: false as const, error: error.message };
    }

    await logAuditEvent(
      profile,
      isNew ? "project.created" : "project.updated",
      "project",
      slug,
    );

    revalidateSite();
    revalidatePath("/admin/projects");
    revalidatePath(`/project/${slug}`);

    return { ok: true as const, project: data };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Save failed",
    };
  }
}

export async function syncWebflowProjectsToDatabase() {
  const { supabase, profile } = await requireSupabaseAdmin();
  const service = createSupabaseServiceClient();
  const webflowProjects = (await import("@/data/webflow-projects.json")).default as Array<{
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
    project_month?: number | null;
    project_year?: number | null;
    country_slug?: string | null;
    location: string | null;
    gallery_urls: string[];
    is_published: boolean;
    sort_order: number;
  }>;

  const payloads = webflowProjects.map((row) => ({
    slug: row.slug,
    title: row.title,
    image_url: normalizeCdnImageUrl(row.image_url),
    image_alt: row.image_alt,
    category_slug: row.category_slug,
    date_label: row.date_label,
    year_code: row.year_code,
    accent: row.accent,
    stat_value: row.stat_value,
    stat_label: row.stat_label,
    icon_url: row.icon_url,
    description: row.description,
    short_description: row.description ? row.description.slice(0, 100) : null,
    project_month: row.project_month ?? null,
    project_year: row.project_year ?? null,
    country_slug: row.country_slug ?? null,
    location: row.location,
    gallery_urls: row.gallery_urls.map((url) => normalizeCdnImageUrl(url)),
    status: row.is_published ? "published" : "draft",
    is_published: row.is_published,
    goal_amount: null,
    amount_raised: 0,
    suggested_donations: [],
    sort_order: row.sort_order,
  }));

  const RPC_CHUNK = 40;
  let syncedTotal = 0;

  for (let index = 0; index < payloads.length; index += RPC_CHUNK) {
    const chunk = payloads.slice(index, index + RPC_CHUNK);

    if (service) {
      const { error } = await service
        .from("projects")
        .upsert(chunk, { onConflict: "slug" });

      if (error) {
        return { ok: false as const, error: error.message };
      }
      syncedTotal += chunk.length;
      continue;
    }

    const { data, error } = await supabase.rpc("admin_bulk_upsert_projects", {
      payload: chunk,
    });

    if (error) {
      const needsSql =
        error.message.includes("admin_bulk_upsert_projects") ||
        error.code === "PGRST202";
      const needsKey = !createSupabaseServiceClient();
      const hints = [
        needsSql
          ? "شغّل supabase/fix-projects-sync-rpc.sql في محرر SQL بـ Supabase"
          : null,
        needsKey
          ? "أو أضِف SUPABASE_SERVICE_ROLE_KEY في Railway (Settings → API → service_role)"
          : null,
      ]
        .filter(Boolean)
        .join(" — ");

      return {
        ok: false as const,
        error: hints ? `${error.message} — ${hints}` : error.message,
      };
    }

    syncedTotal += typeof data === "number" ? data : chunk.length;
  }

  const writeClient = service ?? supabase;
  await writeClient.from("projects").delete().like("image_url", "%images.unsplash.com%");

  await logAuditEvent(profile, "projects.synced", "project", String(syncedTotal));
  revalidateSite();
  revalidatePath("/admin/projects");

  return { ok: true as const, count: syncedTotal };
}

export async function deleteProjectInline(slug: string) {
  try {
    const { supabase, profile } = await requireSupabaseAdmin("admin");
    await assertCanDeleteProjects(profile as AdminProfile);
    const service = createSupabaseServiceClient();
    const writeClient = service ?? supabase;

    if (!slug.trim()) {
      return { ok: false as const, error: "Project slug required" };
    }

    const { error } = await writeClient.from("projects").delete().eq("slug", slug);
    if (error) {
      return { ok: false as const, error: error.message };
    }

    await logAuditEvent(profile, "project.deleted", "project", slug);
    revalidateSite();
    revalidatePath("/admin/projects");

    return { ok: true as const };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Delete failed",
    };
  }
}

export async function deleteProject(formData: FormData) {
  const slug = String(formData.get("slug") ?? "").trim();
  return deleteProjectInline(slug);
}

export async function saveCategory(formData: FormData): Promise<AdminSaveResult> {
  try {
    const { supabase, profile } = await getAdminWriteClient();
  const isNew = formData.get("is_new") === "true";
  const slug = String(formData.get("slug") ?? "").trim();
  const status = String(formData.get("status") ?? "published").trim();
  const categoryStatus: CategoryStatus = status === "draft" ? "draft" : "published";

  const { data: accentSetting } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "category_accent_map")
    .maybeSingle();

  let accent: CategoryAccent = "default";
  if (accentSetting?.value) {
    try {
      const map = JSON.parse(accentSetting.value) as Record<string, string>;
      const entry = map[slug];
      if (entry && isHexColor(entry)) {
        accent =
          ACCENTS.find((name) => categoryAccentColors[name] === entry.toLowerCase()) ??
          "default";
      } else if (entry && ACCENTS.includes(entry as CategoryAccent)) {
        accent = entry as CategoryAccent;
      }
    } catch {
      accent = "default";
    }
  }

  const payload = {
    slug,
    title_line_1: String(formData.get("title_line_1") ?? "").trim(),
    title_line_2: String(formData.get("title_line_2") ?? "").trim(),
    icon_url: String(formData.get("icon_url") ?? "").trim(),
    accent,
    status: categoryStatus,
    sort_order: Number(formData.get("sort_order") ?? 0),
  };

    if (!payload.slug || !payload.title_line_1 || !payload.title_line_2 || !payload.icon_url) {
      return { ok: false, error: "Required: slug, titles, icon" };
    }

    const nameEn = String(formData.get("name_en") ?? payload.title_line_2).trim();
    const payloadWithKeys = {
      ...payload,
      name_en: nameEn || null,
      slug_key: slugKeyFromEnglishName(nameEn || payload.slug),
    };

    if (isNew) {
      const { error } = await runWithOptionalColumns(
        async (row) => {
          const r = await supabase.from("categories").insert(row);
          return { error: r.error };
        },
        payloadWithKeys,
        [...CATEGORY_OPTIONAL_COLUMNS],
      );
      if (error) return { ok: false, error: error.message };
    } else {
      const { error } = await supabase
        .from("categories")
        .update({
          title_line_1: payload.title_line_1,
          title_line_2: payload.title_line_2,
          icon_url: payload.icon_url,
          accent: payload.accent,
          status: payload.status,
          sort_order: payload.sort_order,
          name_en: nameEn || null,
          slug_key: slugKeyFromEnglishName(nameEn || payload.slug),
        })
        .eq("slug", slug);

      if (error) {
        if (isMissingColumnError(error)) {
          const { error: fallbackError } = await supabase
            .from("categories")
            .update({
              title_line_1: payload.title_line_1,
              title_line_2: payload.title_line_2,
              icon_url: payload.icon_url,
              accent: payload.accent,
              status: payload.status,
              sort_order: payload.sort_order,
            })
            .eq("slug", slug);
          if (fallbackError) return { ok: false, error: fallbackError.message };
        } else {
          return { ok: false, error: error.message };
        }
      }
    }

    await logAuditEvent(
      profile,
      isNew ? "category.created" : "category.updated",
      "category",
      slug,
      { status: categoryStatus },
    );

    revalidateSite();
    revalidatePath("/admin/categories");
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to save category",
    };
  }
}

export async function saveFooterSettings(formData: FormData): Promise<AdminSaveResult> {
  try {
    const { supabase, profile } = await getAdminWriteClient();

  const settings = [
    {
      key: "footer_columns_json",
      value: String(formData.get("footer_columns_json") ?? "").trim(),
      is_public: true,
    },
    {
      key: "footer_social_json",
      value: String(formData.get("footer_social_json") ?? "").trim(),
      is_public: true,
    },
    {
      key: "footer_tagline",
      value: String(formData.get("footer_tagline") ?? "").trim(),
      is_public: true,
    },
    {
      key: "footer_copyright",
      value: String(formData.get("footer_copyright") ?? "").trim(),
      is_public: true,
    },
    {
      key: "footer_legal_line",
      value: String(formData.get("footer_legal_line") ?? "").trim(),
      is_public: true,
    },
    {
      key: "footer_privacy_url",
      value: String(formData.get("footer_privacy_url") ?? "").trim(),
      is_public: true,
    },
    {
      key: "footer_donation_policy_url",
      value: String(formData.get("footer_donation_policy_url") ?? "").trim(),
      is_public: true,
    },
    {
      key: "show_footer",
      value: formData.get("show_footer") === "on" ? "true" : "false",
      is_public: true,
    },
  ];

  for (const setting of settings) {
    const { error } = await supabase.from("settings").upsert(
      {
        key: setting.key,
        value: setting.value,
        value_json: null,
        is_public: setting.is_public,
      },
      { onConflict: "key" },
    );
    if (error) return { ok: false, error: error.message };
  }

    await logAuditEvent(profile, "footer.updated", "homepage", "footer");
    revalidateSite();
    revalidatePath("/admin/footer");
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to save footer",
    };
  }
}

export async function saveAdvancedSettings(formData: FormData) {
  const { supabase, profile } = await requireSupabaseAdmin("super_admin");

  const categoryColorMap: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("color_")) continue;
    const slug = key.slice("color_".length);
    const color = normalizeHexColor(String(value).trim());
    if (isHexColor(color)) {
      categoryColorMap[slug] = color;
    }
  }

  const projectDetailTagDefs = String(formData.get("project_detail_tag_defs") ?? "").trim();

  const advancedSettings = [
    {
      key: "category_accent_map",
      value: JSON.stringify(categoryColorMap),
      is_public: true,
    },
    { key: "project_detail_tag_defs", value: projectDetailTagDefs, is_public: true },
  ];

  for (const setting of advancedSettings) {
    const { error } = await supabase.from("settings").upsert(
      {
        key: setting.key,
        value: setting.value,
        value_json: null,
        is_public: setting.is_public,
      },
      { onConflict: "key" },
    );
    if (error) throw new Error(error.message);
  }

  for (const [slug, color] of Object.entries(categoryColorMap)) {
    const accent = ACCENTS.find((name) => categoryAccentColors[name] === color) ?? "default";
    await supabase.from("categories").update({ accent }).eq("slug", slug);
  }

  await logAuditEvent(profile, "settings.updated", "settings", "advanced");
  revalidateSite();
  revalidatePath("/admin/settings");
  redirect("/admin/settings?saved=1");
}

export async function saveHomepage(formData: FormData): Promise<AdminSaveResult> {
  try {
    const { supabase, profile } = await getAdminWriteClient();

  const statsPayload = {
    value: String(formData.get("stats_value") ?? "").trim(),
    label: String(formData.get("stats_label") ?? "").trim(),
    label_en: String(formData.get("stats_label_en") ?? "").trim() || null,
    intro_text: String(formData.get("stats_intro") ?? "").trim() || null,
    intro_text_en: String(formData.get("stats_intro_en") ?? "").trim() || null,
    icon_url: String(formData.get("stats_icon_url") ?? "").trim() || null,
  };

  const { error: statsError } = await runWithOptionalColumns(
    async (payload) => {
      const r = await supabase
        .from("statistics")
        .update(payload)
        .eq("key", "homepage_beneficiaries");
      return { error: r.error };
    },
    statsPayload,
    [...STATISTICS_BILINGUAL_COLUMNS],
  );

  if (statsError) return { ok: false, error: statsError.message };

  const statsIllustration = String(formData.get("stats_illustration_url") ?? "").trim() || null;
  const { error: illustrationError } = await supabase
    .from("statistics")
    .update({ illustration_url: statsIllustration })
    .eq("key", "homepage_beneficiaries");

  if (illustrationError) return { ok: false, error: illustrationError.message };

  const settings = [
    { key: "stats_brand_line_1", value: String(formData.get("stats_brand_line_1") ?? "").trim() },
    { key: "stats_brand_line_2", value: String(formData.get("stats_brand_line_2") ?? "").trim() },
    {
      key: "stats_brand_logo_url",
      value: String(formData.get("stats_brand_logo_url") ?? "").trim(),
    },
    { key: "stats_box_color", value: String(formData.get("stats_box_color") ?? "").trim() },
    { key: "share_label", value: String(formData.get("share_label") ?? "").trim() },
    { key: "share_icon_url", value: String(formData.get("share_icon_url") ?? "").trim() },
    ...(profile.role_slug === "super_admin"
      ? [
          {
            key: "whatsapp_header_url",
            value: String(formData.get("whatsapp_header_url") ?? "").trim(),
          },
        ]
      : []),
    { key: "hero_cta_label", value: String(formData.get("hero_cta_label") ?? "").trim() },
    { key: "hero_cta_label_en", value: String(formData.get("hero_cta_label_en") ?? "").trim() },
    { key: "transparency_title", value: String(formData.get("transparency_title") ?? "").trim() },
    { key: "transparency_title_en", value: String(formData.get("transparency_title_en") ?? "").trim() },
    { key: "transparency_text", value: String(formData.get("transparency_text") ?? "").trim() },
    { key: "transparency_text_en", value: String(formData.get("transparency_text_en") ?? "").trim() },
    { key: "whatsapp_number", value: String(formData.get("whatsapp_number") ?? "").trim() },
    {
      key: "whatsapp_subscribe_message",
      value: String(formData.get("whatsapp_subscribe_message") ?? "").trim(),
    },
    {
      key: "whatsapp_subscribe_message_en",
      value: String(formData.get("whatsapp_subscribe_message_en") ?? "").trim(),
    },
    {
      key: "whatsapp_subscribe_button",
      value: String(formData.get("whatsapp_subscribe_button") ?? "").trim(),
    },
    {
      key: "whatsapp_subscribe_button_en",
      value: String(formData.get("whatsapp_subscribe_button_en") ?? "").trim(),
    },
    { key: "impact_section_title", value: String(formData.get("impact_section_title") ?? "").trim() },
    {
      key: "impact_section_title_en",
      value: String(formData.get("impact_section_title_en") ?? "").trim(),
    },
    { key: "impact_section_subtitle", value: String(formData.get("impact_section_subtitle") ?? "").trim() },
    {
      key: "impact_section_subtitle_en",
      value: String(formData.get("impact_section_subtitle_en") ?? "").trim(),
    },
    {
      key: "categories_section_title",
      value: String(formData.get("categories_section_title") ?? "").trim(),
    },
    {
      key: "categories_section_title_en",
      value: String(formData.get("categories_section_title_en") ?? "").trim(),
    },
    {
      key: "show_whatsapp_block",
      value: formData.get("show_whatsapp_block") === "on" ? "true" : "false",
    },
  ];

  for (const setting of settings) {
    const { error } = await supabase.from("settings").upsert(
      { key: setting.key, value: setting.value, value_json: null, is_public: true },
      { onConflict: "key" },
    );
    if (error) return { ok: false, error: error.message };
  }

    await logAuditEvent(profile, "homepage.updated", "homepage", "main");
    revalidateSite();
    revalidatePath("/admin/homepage");
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to save homepage",
    };
  }
}

async function parseAdminRole(
  supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createSupabaseServerClient>>,
  value: FormDataEntryValue | null,
) {
  const role = String(value ?? "").trim();
  if (!role) throw new Error("Invalid role");

  const defaultSlugs = DEFAULT_ROLE_DEFINITIONS.map((item) => item.slug);
  if (defaultSlugs.includes(role)) return role;

  if (!supabase) throw new Error("Invalid role");

  const { data } = await supabase
    .from("admin_roles")
    .select("slug")
    .eq("slug", role)
    .maybeSingle();

  if (!data) throw new Error("Invalid role");
  return role;
}

export type UserActionResult = { ok: true } | { ok: false; error: string };

export async function saveAdminUser(formData: FormData): Promise<UserActionResult> {
  try {
    const { supabase, user, profile } = await requireSupabaseAdmin("viewer");
    if (!hasPermission(profile.permissions, profile.role_slug, "users", "create")) {
      return { ok: false, error: "ليس لديك صلاحية إضافة المستخدمين" };
    }

    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const role = await parseAdminRole(supabase, formData.get("role"));

    if (!canAssignRole(profile.role_slug, role)) {
      return { ok: false, error: "Only Super Admin can assign Admin or Super Admin roles" };
    }
    const displayName = String(formData.get("display_name") ?? "").trim() || null;
    const password = String(formData.get("password") ?? "");

    if (!email) {
      return { ok: false, error: "البريد الإلكتروني مطلوب" };
    }

    const { data: existing } = await supabase
      .from("admin_users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (password && !canManageLoginAccounts(profile.role_slug)) {
      return { ok: false, error: "Only Admin or Super Admin can set login passwords" };
    }

    if (!existing && !password) {
      return { ok: false, error: "Password is required when creating a new user" };
    }

    if (password && password.length < 8) {
      return { ok: false, error: "Password must be at least 8 characters" };
    }

    let serviceClient: ReturnType<typeof createSupabaseServiceClient> = null;
    let linkedUserId: string | null = null;

    if (password) {
      const linked = await createOrLinkAuthUser(email, password, displayName);
      serviceClient = linked.service;
      linkedUserId = linked.authUserId;
    }

    const db = serviceClient ?? (await createSupabaseServiceClient()) ?? supabase;

    const { error } = existing
      ? await db
          .from("admin_users")
          .update({
            role,
            role_slug: role,
            display_name: displayName,
            is_active: true,
            suspended_at: null,
            created_by: user.id,
            ...(linkedUserId ? { user_id: linkedUserId } : {}),
          })
          .eq("id", existing.id)
      : await db.from("admin_users").insert({
          email,
          role,
          role_slug: role,
          display_name: displayName,
          is_active: true,
          created_by: user.id,
          user_id: linkedUserId,
        });

    if (error) return { ok: false, error: error.message };

    await logAuditEvent(profile, "user.created", "user", email, { role });
    await supabase.from("admin_notifications").insert({
      target_user_id: null,
      type: "user",
      title: "New admin user added",
      body: email,
      is_read: false,
    });

    revalidatePath("/admin/users");
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to add user",
    };
  }
}

export async function updateAdminUser(formData: FormData) {
  const { supabase, user, profile } = await requireSupabaseAdmin("viewer");
  if (!hasPermission(profile.permissions, profile.role_slug, "users", "edit")) {
    throw new Error("ليس لديك صلاحية تعديل المستخدمين");
  }

  const id = String(formData.get("id") ?? "").trim();
  const role = await parseAdminRole(supabase, formData.get("role"));

  if (!canAssignRole(profile.role_slug, role)) {
    throw new Error("Only Super Admin can assign Admin or Super Admin roles");
  }

  const { data: existingUser } = await supabase
    .from("admin_users")
    .select("role_slug, role, user_id, nav_hidden_pages")
    .eq("id", id)
    .maybeSingle();

  const existingRole = existingUser?.role_slug ?? existingUser?.role;
  if (existingRole === "super_admin" && profile.role_slug !== "super_admin") {
    throw new Error("Only Super Admin can modify Super Admin accounts");
  }
  const displayName = String(formData.get("display_name") ?? "").trim() || null;
  const isActive = formData.get("is_active") === "on";
  const newPassword = String(formData.get("new_password") ?? "");

  if (newPassword && profile.role_slug !== "super_admin") {
    throw new Error("Only Super Admin can reset passwords");
  }

  if (newPassword && newPassword.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  if (!id) {
    throw new Error("معرف المستخدم مطلوب");
  }

  if (id === profile.id && (!isActive || role !== "super_admin")) {
    throw new Error("لا يمكنك إلغاء صلاحياتك أو تعطيل حسابك");
  }

  const suspended = formData.get("suspend") === "on";
  const navHiddenPages =
    profile.role_slug === "super_admin" ? parseNavHiddenFromForm(formData) : undefined;

  const { error } = await supabase
    .from("admin_users")
    .update({
      role,
      role_slug: role,
      display_name: displayName,
      is_active: isActive,
      suspended_at: suspended ? new Date().toISOString() : null,
      created_by: user.id,
      ...(navHiddenPages ? { nav_hidden_pages: navHiddenPages } : {}),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  if (newPassword && existingUser?.user_id) {
    await setAuthUserPassword(existingUser.user_id, newPassword);
  }

  await logAuditEvent(profile, "user.updated", "user", id, {
    role,
    isActive,
    passwordReset: Boolean(newPassword),
  });
  revalidatePath("/admin/users");
  redirect("/admin/users?saved=1");
}

export async function removeAdminUser(formData: FormData) {
  const { supabase, profile } = await requireSupabaseAdmin("viewer");
  if (!hasPermission(profile.permissions, profile.role_slug, "users", "delete")) {
    throw new Error("ليس لديك صلاحية حذف المستخدمين");
  }

  const id = String(formData.get("id") ?? "").trim();
  if (!id) {
    throw new Error("معرف المستخدم مطلوب");
  }

  if (id === profile.id) {
    throw new Error("لا يمكنك حذف حسابك");
  }

  const { data: target } = await supabase
    .from("admin_users")
    .select("role_slug, role")
    .eq("id", id)
    .maybeSingle();

  const targetRole = target?.role_slug ?? target?.role;
  if (targetRole === "super_admin" && profile.role_slug !== "super_admin") {
    throw new Error("Only Super Admin can remove Super Admin accounts");
  }

  const { error } = await supabase.from("admin_users").delete().eq("id", id);
  if (error) throw new Error(error.message);

  await logAuditEvent(profile, "user.deleted", "user", id);
  revalidatePath("/admin/users");
  redirect("/admin/users?removed=1");
}

export async function savePlatformSettings(formData: FormData) {
  const { supabase, profile } = await requireSupabaseAdmin("super_admin");

  const keys = [
    "site_title",
    "logo_url",
    "public_site_url",
    "stripe_public_key",
    "stripe_secret_key",
    "cloudinary_cloud_name",
  ] as const;

  for (const key of keys) {
    const value = String(formData.get(key) ?? "").trim();
    const { error } = await supabase.from("settings").upsert(
      {
        key,
        value,
        value_json: null,
        is_public:
          key === "site_title" || key === "logo_url" || key === "public_site_url",
      },
      { onConflict: "key" },
    );
    if (error) throw new Error(error.message);
  }

  await logAuditEvent(profile, "settings.updated", "settings");
  revalidateSite();
  revalidatePath("/admin/settings");
  redirect("/admin/settings?saved=1");
}

export async function createCustomRole(formData: FormData) {
  const { supabase, profile } = await requireSupabaseAdmin("super_admin");
  const name = String(formData.get("name") ?? "").trim();
  const badgeColor = String(formData.get("badge_color") ?? "#6b7280").trim();

  if (!name) throw new Error("Role name required");

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");

  const { error } = await supabase.from("admin_roles").insert({
    slug,
    name,
    badge_color: badgeColor,
    is_system: false,
    permissions: getDefaultRoleDefinition("viewer")?.permissions ?? { projects: { view: true } },
  });

  if (error) throw new Error(error.message);

  await logAuditEvent(profile, "role.created", "role", slug);
  revalidatePath("/admin/roles");
}

export async function saveMyProfile(formData: FormData) {
  const { supabase, profile } = await requireSupabaseAdmin();
  const displayName = String(formData.get("display_name") ?? "").trim() || null;
  const avatarUrl = String(formData.get("avatar_url") ?? "").trim() || null;

  const { error } = await supabase
    .from("admin_users")
    .update({
      display_name: displayName,
      avatar_url: avatarUrl,
    })
    .eq("id", profile.id);

  if (error) throw new Error(error.message);

  await logAuditEvent(profile, "profile.updated", "user", profile.id);
  revalidatePath("/admin/profile");
  redirect("/admin/profile?saved=1");
}

export async function verifyAdminLogin(email: string, authUserId?: string) {
  const normalizedEmail = email.trim().toLowerCase();

  const service = createSupabaseServiceClient();
  if (!service) {
    return {
      ok: false as const,
      error: "إعدادات الخادم غير مكتملة — أضف SUPABASE_SERVICE_ROLE_KEY",
    };
  }

  let resolvedUserId = authUserId?.trim();
  if (!resolvedUserId) {
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return { ok: false as const, error: "تعذر الاتصال بقاعدة البيانات" };
    }
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) {
      return { ok: false as const, error: "تعذر التحقق من الحساب" };
    }
    resolvedUserId = authData.user.id;
  }

  const { data: adminUser, error } = await service
    .from("admin_users")
    .select("id, email, is_active, suspended_at, user_id")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (error || !adminUser) {
    const supabase = await createSupabaseServerClient();
    if (supabase) await supabase.auth.signOut();
    return {
      ok: false as const,
      error: "ليس لديك صلاحية الدخول — تأكد أن بريدك مضاف في لوحة المستخدمين.",
    };
  }

  if (!adminUser.is_active || adminUser.suspended_at) {
    const supabase = await createSupabaseServerClient();
    if (supabase) await supabase.auth.signOut();
    return { ok: false as const, error: "هذا الحساب غير نشط أو موقوف." };
  }

  if (adminUser.user_id !== resolvedUserId) {
    const { error: linkError } = await service
      .from("admin_users")
      .update({ user_id: resolvedUserId })
      .eq("id", adminUser.id);

    if (linkError) {
      const supabase = await createSupabaseServerClient();
      if (supabase) await supabase.auth.signOut();
      return { ok: false as const, error: "تعذر ربط الحساب — تواصل مع Super Admin." };
    }
  }

  await service
    .from("admin_users")
    .update({
      last_login_at: new Date().toISOString(),
      user_id: resolvedUserId,
    })
    .eq("id", adminUser.id);

  return { ok: true as const };
}

export async function recordAdminLogin() {
  const { supabase, user, profile } = await requireSupabaseAdmin("viewer");

  await supabase
    .from("admin_users")
    .update({
      last_login_at: new Date().toISOString(),
      user_id: profile.user_id ?? user.id,
    })
    .eq("id", profile.id);

  await logAuditEvent(profile, "user.logged_in", "user", profile.email);
}

export async function markNotificationsRead() {
  const { supabase, profile } = await requireSupabaseAdmin();
  await supabase
    .from("admin_notifications")
    .update({ is_read: true })
    .eq("is_read", false)
    .or(
      profile.user_id
        ? `target_user_id.is.null,target_user_id.eq.${profile.user_id}`
        : "target_user_id.is.null",
    );

  revalidatePath("/admin/notifications");
  redirect("/admin/notifications");
}

export async function saveCategoryKeys(formData: FormData) {
  try {
    const { supabase, profile } = await requireSupabaseAdmin("super_admin");
    const updates = new Map<string, string>();

    for (const [key, value] of formData.entries()) {
      if (key.startsWith("name_en__")) {
        updates.set(key.slice("name_en__".length), String(value).trim());
      }
    }

    for (const [slug, nameEn] of updates) {
      if (!nameEn) continue;
      const slugKey = slugKeyFromEnglishName(nameEn);
      const { error } = await supabase
        .from("categories")
        .update({ name_en: nameEn, slug_key: slugKey })
        .eq("slug", slug);
      if (error) return { ok: false as const, error: error.message };
    }

    await logAuditEvent(profile, "settings.updated", "settings", "category_keys");
    revalidateSite();
    revalidatePath("/admin/settings");
    revalidatePath("/admin/categories");
    return { ok: true as const };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Failed to save category keys",
    };
  }
}

export async function saveCountries(formData: FormData) {
  try {
    const { supabase, profile } = await requireSupabaseAdmin("super_admin");
    const indices = new Set<number>();

    for (const key of formData.keys()) {
      const match = key.match(/^[a-z_]+__(\d+)$/);
      if (match) indices.add(Number(match[1]));
    }

    const rows = [...indices]
      .sort((a, b) => a - b)
      .map((index) => ({
        slug: String(formData.get(`slug__${index}`) ?? "").trim(),
        name_en: String(formData.get(`name_en__${index}`) ?? "").trim(),
        name_ar: String(formData.get(`name_ar__${index}`) ?? "").trim(),
        is_active: formData.get(`active__${index}`) === "1",
        sort_order: index + 1,
      }))
      .filter((row) => row.slug && row.name_en && row.name_ar);

    if (!rows.length) {
      return { ok: false as const, error: "No countries to save." };
    }

    const { error } = await supabase.from("countries").upsert(rows, { onConflict: "slug" });
    if (error) return { ok: false as const, error: error.message };

    await logAuditEvent(profile, "settings.updated", "settings", "countries");
    revalidateSite();
    revalidatePath("/admin/settings");
    revalidatePath("/admin/projects");
    return { ok: true as const };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Failed to save countries",
    };
  }
}
