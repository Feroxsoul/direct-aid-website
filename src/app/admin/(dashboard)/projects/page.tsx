import { ProjectsLiveEditor } from "@/components/admin/ProjectsLiveEditor";
import { requirePermission } from "@/lib/admin/auth";
import { getAdminProjectsEditorData } from "@/lib/admin/project-editor-data";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";
import { hasPermission } from "@/lib/admin/permissions";

export default async function AdminProjectsPage() {
  const profile = await requirePermission("projects", "view");
  const data = await getAdminProjectsEditorData();

  return (
    <div className="dash-page">
      <ProjectsLiveEditor
        {...data}
        canCreate={
          profile.role_slug === "super_admin" ||
          hasPermission(profile.permissions, profile.role_slug, "projects", "create")
        }
        canEdit={
          profile.role_slug === "super_admin" ||
          hasPermission(profile.permissions, profile.role_slug, "projects", "edit")
        }
        supabaseUrl={getSupabaseUrl()}
        supabaseAnonKey={getSupabaseAnonKey()}
      />
    </div>
  );
}
