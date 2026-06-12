"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  assertCanDeleteProjects,
  requireSupabaseAdmin,
} from "@/lib/admin/auth";
import {
  ADMIN_ROLES,
  type AdminRole,
  canManageUsers,
} from "@/lib/admin/roles";
import type { CategoryAccent } from "@/lib/design-tokens";

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

export async function saveProject(formData: FormData) {
  const { supabase } = await requireSupabaseAdmin();

  const slug = String(formData.get("slug") ?? "").trim();
  const isNew = formData.get("is_new") === "true";

  const payload = {
    slug,
    title: String(formData.get("title") ?? "").trim(),
    image_url: String(formData.get("image_url") ?? "").trim(),
    image_alt: String(formData.get("image_alt") ?? "").trim() || null,
    category_slug: String(formData.get("category_slug") ?? "").trim(),
    date_label: String(formData.get("date_label") ?? "").trim(),
    year_code: String(formData.get("year_code") ?? "").trim() || null,
    description: String(formData.get("description") ?? "").trim() || null,
    location: String(formData.get("location") ?? "").trim() || null,
    gallery_urls: parseGalleryUrls(formData.get("gallery_urls")),
    stat_value: String(formData.get("stat_value") ?? "").trim() || null,
    stat_label: String(formData.get("stat_label") ?? "").trim() || null,
    icon_url: String(formData.get("icon_url") ?? "").trim() || null,
    accent: (String(formData.get("accent") ?? "").trim() || null) as CategoryAccent | null,
    is_published: formData.get("is_published") === "on",
    sort_order: Number(formData.get("sort_order") ?? 0),
  };

  if (!payload.slug || !payload.title || !payload.image_url || !payload.category_slug) {
    throw new Error("الحقول المطلوبة: المعرف، العنوان، الصورة، الفئة");
  }

  if (payload.accent && !ACCENTS.includes(payload.accent)) {
    payload.accent = null;
  }

  const { error } = isNew
    ? await supabase.from("projects").insert(payload)
    : await supabase.from("projects").update(payload).eq("slug", slug);

  if (error) throw new Error(error.message);

  revalidateSite();
  revalidatePath("/admin/projects");
  revalidatePath(`/admin/projects/${slug}`);
  revalidatePath(`/project/${slug}`);
  redirect("/admin/projects");
}

export async function deleteProject(formData: FormData) {
  const { supabase, profile } = await requireSupabaseAdmin("admin");
  await assertCanDeleteProjects(profile);
  const slug = String(formData.get("slug") ?? "").trim();
  if (!slug) throw new Error("معرف المشروع مطلوب");

  const { error } = await supabase.from("projects").delete().eq("slug", slug);
  if (error) throw new Error(error.message);

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

function parseAdminRole(value: FormDataEntryValue | null): AdminRole {
  const role = String(value ?? "").trim() as AdminRole;
  if (!ADMIN_ROLES.includes(role)) {
    throw new Error("الدور غير صالح");
  }
  return role;
}

export async function saveAdminUser(formData: FormData) {
  const { supabase, user, profile } = await requireSupabaseAdmin("super_admin");
  if (!canManageUsers(profile.role)) {
    throw new Error("ليس لديك صلاحية إدارة المستخدمين");
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = parseAdminRole(formData.get("role"));
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
          display_name: displayName,
          is_active: true,
          created_by: user.id,
        })
        .eq("id", existing.id)
    : await supabase.from("admin_users").insert({
        email,
        role,
        display_name: displayName,
        is_active: true,
        created_by: user.id,
        user_id: null,
      });

  if (error) throw new Error(error.message);

  revalidatePath("/admin/users");
  redirect("/admin/users?saved=1");
}

export async function updateAdminUser(formData: FormData) {
  const { supabase, user, profile } = await requireSupabaseAdmin("super_admin");
  if (!canManageUsers(profile.role)) {
    throw new Error("ليس لديك صلاحية إدارة المستخدمين");
  }

  const id = String(formData.get("id") ?? "").trim();
  const role = parseAdminRole(formData.get("role"));
  const displayName = String(formData.get("display_name") ?? "").trim() || null;
  const isActive = formData.get("is_active") === "on";

  if (!id) {
    throw new Error("معرف المستخدم مطلوب");
  }

  if (id === profile.id && (!isActive || role !== "super_admin")) {
    throw new Error("لا يمكنك إلغاء صلاحياتك أو تعطيل حسابك");
  }

  const { error } = await supabase
    .from("admin_users")
    .update({
      role,
      display_name: displayName,
      is_active: isActive,
      created_by: user.id,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/users");
  redirect("/admin/users?saved=1");
}

export async function removeAdminUser(formData: FormData) {
  const { supabase, profile } = await requireSupabaseAdmin("super_admin");
  if (!canManageUsers(profile.role)) {
    throw new Error("ليس لديك صلاحية إدارة المستخدمين");
  }

  const id = String(formData.get("id") ?? "").trim();
  if (!id) {
    throw new Error("معرف المستخدم مطلوب");
  }

  if (id === profile.id) {
    throw new Error("لا يمكنك حذف حسابك");
  }

  const { error } = await supabase.from("admin_users").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/users");
  redirect("/admin/users?removed=1");
}
