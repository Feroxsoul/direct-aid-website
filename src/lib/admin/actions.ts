"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logAuditEvent } from "@/lib/admin/audit";
import {
  assertCanDeleteProjects,
  requireSupabaseAdmin,
  requireSuperAdmin,
} from "@/lib/admin/auth";
import {
  DEFAULT_ROLE_DEFINITIONS,
  getDefaultRoleDefinition,
} from "@/lib/admin/permissions";
import { hasPermission } from "@/lib/admin/permissions";
import { canAssignRole, canManageUsers, isPrivilegedRole } from "@/lib/admin/roles";
import type { AdminProfile } from "@/types";
import type { CategoryAccent } from "@/lib/design-tokens";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

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
  revalidatePath("/");
  revalidatePath("/lmshryaa", "layout");
  revalidatePath("/project", "layout");
}

function parseProjectPayload(formData: FormData, isNew: boolean) {
  const slug = String(formData.get("slug") ?? "").trim();
  const status = String(formData.get("status") ?? "published").trim();

  const payload = {
    slug,
    title: String(formData.get("title") ?? "").trim(),
    image_url: String(formData.get("image_url") ?? "").trim(),
    image_alt: String(formData.get("image_alt") ?? "").trim() || null,
    category_slug: String(formData.get("category_slug") ?? "").trim(),
    date_label: String(formData.get("date_label") ?? "").trim(),
    year_code: String(formData.get("year_code") ?? "").trim() || null,
    description: String(formData.get("description") ?? "").trim() || null,
    short_description:
      String(formData.get("short_description") ?? "").trim() || null,
    location: String(formData.get("location") ?? "").trim() || null,
    gallery_urls: parseGalleryUrls(formData.get("gallery_urls")),
    stat_value: String(formData.get("stat_value") ?? "").trim() || null,
    stat_label: String(formData.get("stat_label") ?? "").trim() || null,
    icon_url: String(formData.get("icon_url") ?? "").trim() || null,
    accent: (String(formData.get("accent") ?? "").trim() || null) as CategoryAccent | null,
    status,
    is_published: status === "published",
    goal_amount: Number(formData.get("goal_amount") ?? 0) || null,
    amount_raised: Number(formData.get("amount_raised") ?? 0) || 0,
    meta_title: String(formData.get("meta_title") ?? "").trim() || null,
    meta_description:
      String(formData.get("meta_description") ?? "").trim() || null,
    sort_order: Number(formData.get("sort_order") ?? 0),
  };

  if (!payload.slug || !payload.title || !payload.image_url || !payload.category_slug) {
    throw new Error("Required: slug, title, image, category");
  }

  if (payload.accent && !ACCENTS.includes(payload.accent)) {
    payload.accent = null;
  }

  return { slug, payload, isNew };
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
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    throw new Error("لم يتم اختيار ملف");
  }

  const extension = file.name.split(".").pop() ?? "jpg";
  const path = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;

  const { error } = await supabase.storage.from("media").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from("media").getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadMediaAsset(formData: FormData) {
  const { supabase, profile } = await requireSupabaseAdmin();
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    throw new Error("No file selected");
  }

  const url = await uploadImage(formData);

  await supabase.from("media_assets").insert({
    url,
    filename: file.name,
    alt_text: null,
    size_bytes: file.size,
    uploaded_by: profile.user_id,
  });

  await logAuditEvent(profile, "media.uploaded", "media", url);
  revalidatePath("/admin/media");
}

export async function saveProject(formData: FormData) {
  const { supabase, profile } = await requireSupabaseAdmin();
  const isNew = formData.get("is_new") === "true";
  const { slug, payload } = parseProjectPayload(formData, isNew);

  const { error } = isNew
    ? await supabase.from("projects").insert(payload)
    : await supabase.from("projects").update(payload).eq("slug", slug);

  if (error) throw new Error(error.message);

  await logAuditEvent(
    profile,
    isNew ? "project.created" : "project.updated",
    "project",
    slug,
  );

  revalidateSite();
  revalidatePath("/admin/projects");
  revalidatePath(`/admin/projects/${slug}`);
  revalidatePath(`/project/${slug}`);
  redirect("/admin/projects");
}

export async function saveProjectInline(formData: FormData) {
  try {
    const { supabase, profile } = await getAdminWriteClient();
    const isNew = formData.get("is_new") === "true";
    const { slug, payload } = parseProjectPayload(formData, isNew);

    const { data, error } = isNew
      ? await supabase.from("projects").insert(payload).select("*").single()
      : await supabase
          .from("projects")
          .update(payload)
          .eq("slug", slug)
          .select("*")
          .single();

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
  const { supabase, profile } = await getAdminWriteClient();
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
    location: string | null;
    gallery_urls: string[];
    is_published: boolean;
    sort_order: number;
  }>;

  const payloads = webflowProjects.map((row) => ({
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
    short_description: row.description,
    location: row.location,
    gallery_urls: row.gallery_urls,
    status: row.is_published ? "published" : "draft",
    is_published: row.is_published,
    goal_amount: null,
    amount_raised: 0,
    suggested_donations: [],
    sort_order: row.sort_order,
  }));

  for (let index = 0; index < payloads.length; index += 40) {
    const chunk = payloads.slice(index, index + 40);
    const { error } = await supabase
      .from("projects")
      .upsert(chunk, { onConflict: "slug" });

    if (error) {
      const hint = createSupabaseServiceClient()
        ? ""
        : " — أضِف SUPABASE_SERVICE_ROLE_KEY في Railway إن استمر الخطأ.";
      return { ok: false as const, error: `${error.message}${hint}` };
    }
  }

  await logAuditEvent(profile, "projects.synced", "project", String(payloads.length));
  revalidateSite();
  revalidatePath("/admin/projects");

  return { ok: true as const, count: payloads.length };
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
  const { supabase, profile } = await requireSupabaseAdmin("admin");
  await assertCanDeleteProjects(profile as AdminProfile);
  const slug = String(formData.get("slug") ?? "").trim();
  if (!slug) throw new Error("معرف المشروع مطلوب");

  const { error } = await supabase.from("projects").delete().eq("slug", slug);
  if (error) throw new Error(error.message);

  await logAuditEvent(profile, "project.deleted", "project", slug);
  revalidateSite();
  revalidatePath("/admin/projects");
  redirect("/admin/projects");
}

export async function saveCategory(formData: FormData) {
  const { supabase } = await requireSupabaseAdmin();
  const slug = String(formData.get("slug") ?? "").trim();

  const accent = String(formData.get("accent") ?? "default") as CategoryAccent;
  const payload = {
    title_line_1: String(formData.get("title_line_1") ?? "").trim(),
    title_line_2: String(formData.get("title_line_2") ?? "").trim(),
    icon_url: String(formData.get("icon_url") ?? "").trim(),
    accent: ACCENTS.includes(accent) ? accent : "default",
    sort_order: Number(formData.get("sort_order") ?? 0),
  };

  const { error } = await supabase
    .from("categories")
    .update(payload)
    .eq("slug", slug);

  if (error) throw new Error(error.message);

  revalidateSite();
  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

export async function saveHomepage(formData: FormData) {
  const { supabase } = await requireSupabaseAdmin();

  const statsPayload = {
    value: String(formData.get("stats_value") ?? "").trim(),
    label: String(formData.get("stats_label") ?? "").trim(),
    intro_text: String(formData.get("stats_intro") ?? "").trim() || null,
    icon_url: String(formData.get("stats_icon_url") ?? "").trim() || null,
  };

  const { error: statsError } = await supabase
    .from("statistics")
    .update(statsPayload)
    .eq("key", "homepage_beneficiaries");

  if (statsError) throw new Error(statsError.message);

  const statsIllustration = String(formData.get("stats_illustration_url") ?? "").trim() || null;
  const { error: illustrationError } = await supabase
    .from("statistics")
    .update({ illustration_url: statsIllustration })
    .eq("key", "homepage_beneficiaries");

  if (illustrationError) throw new Error(illustrationError.message);

  const settings = [
    { key: "stats_brand_line_1", value: String(formData.get("stats_brand_line_1") ?? "").trim() },
    { key: "stats_brand_line_2", value: String(formData.get("stats_brand_line_2") ?? "").trim() },
    { key: "stats_box_color", value: String(formData.get("stats_box_color") ?? "").trim() },
    { key: "share_label", value: String(formData.get("share_label") ?? "").trim() },
    { key: "share_icon_url", value: String(formData.get("share_icon_url") ?? "").trim() },
  ];

  for (const setting of settings) {
    const { error } = await supabase.from("settings").upsert(
      { key: setting.key, value: setting.value, value_json: null, is_public: true },
      { onConflict: "key" },
    );
    if (error) throw new Error(error.message);
  }

  revalidateSite();
  revalidatePath("/admin/homepage");
  redirect("/admin/homepage?saved=1");
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

export async function saveAdminUser(formData: FormData) {
  const { supabase, user, profile } = await requireSupabaseAdmin("viewer");
  if (!hasPermission(profile.permissions, profile.role_slug, "users", "create")) {
    throw new Error("ليس لديك صلاحية إضافة المستخدمين");
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = await parseAdminRole(supabase, formData.get("role"));

  if (!canAssignRole(profile.role_slug, role)) {
    throw new Error("Only Super Admin can assign Admin or Super Admin roles");
  }
  const displayName = String(formData.get("display_name") ?? "").trim() || null;

  if (!email) {
    throw new Error("البريد الإلكتروني مطلوب");
  }

  const { data: existing } = await supabase
    .from("admin_users")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  const { error } = existing
    ? await supabase
        .from("admin_users")
        .update({
          role,
          role_slug: role,
          display_name: displayName,
          is_active: true,
          suspended_at: null,
          created_by: user.id,
        })
        .eq("id", existing.id)
    : await supabase.from("admin_users").insert({
        email,
        role,
        role_slug: role,
        display_name: displayName,
        is_active: true,
        created_by: user.id,
        user_id: null,
      });

  if (error) throw new Error(error.message);

  await logAuditEvent(profile, "user.created", "user", email, { role });
  await supabase.from("admin_notifications").insert({
    target_user_id: null,
    type: "user",
    title: "New admin user added",
    body: email,
    is_read: false,
  });

  revalidatePath("/admin/users");
  redirect("/admin/users?saved=1");
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
    .select("role_slug, role")
    .eq("id", id)
    .maybeSingle();

  const existingRole = existingUser?.role_slug ?? existingUser?.role;
  if (
    existingRole &&
    isPrivilegedRole(existingRole) &&
    profile.role_slug !== "super_admin"
  ) {
    throw new Error("Only Super Admin can modify Admin accounts");
  }
  const displayName = String(formData.get("display_name") ?? "").trim() || null;
  const isActive = formData.get("is_active") === "on";

  if (!id) {
    throw new Error("معرف المستخدم مطلوب");
  }

  if (id === profile.id && (!isActive || role !== "super_admin")) {
    throw new Error("لا يمكنك إلغاء صلاحياتك أو تعطيل حسابك");
  }

  const suspended = formData.get("suspend") === "on";

  const { error } = await supabase
    .from("admin_users")
    .update({
      role,
      role_slug: role,
      display_name: displayName,
      is_active: isActive,
      suspended_at: suspended ? new Date().toISOString() : null,
      created_by: user.id,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  await logAuditEvent(profile, "user.updated", "user", id, { role, isActive });
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
  if (
    targetRole &&
    isPrivilegedRole(targetRole) &&
    profile.role_slug !== "super_admin"
  ) {
    throw new Error("Only Super Admin can remove Admin accounts");
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
        is_public: key === "site_title" || key === "logo_url",
      },
      { onConflict: "key" },
    );
    if (error) throw new Error(error.message);
  }

  await logAuditEvent(profile, "settings.updated", "settings");
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
