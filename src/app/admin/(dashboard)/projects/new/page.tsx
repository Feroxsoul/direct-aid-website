import { ProjectForm } from "@/components/admin/ProjectForm";
import { AdminPageHeader, AdminText } from "@/components/admin/AdminPageHeader";
import Link from "next/link";
import { requirePermission } from "@/lib/admin/auth";
import { adminGetCountries } from "@/lib/admin/countries";
import { adminGetCategories } from "@/lib/admin/data";

export default async function NewProjectPage() {
  const profile = await requirePermission("projects", "create");
  const [categories, countries] = await Promise.all([
    adminGetCategories(),
    adminGetCountries(),
  ]);

  return (
    <div className="dash-page">
      <div className="project-edit-header">
        <AdminPageHeader titleKey="projectPage.new" subtitleKey="projectPage.slugHelp" />
        <div className="project-edit-actions">
          <Link href="/admin/projects" className="dash-btn">
            <AdminText k="common.back" />
          </Link>
        </div>
      </div>
      <ProjectForm
        categories={categories}
        countries={countries}
        isSuperAdmin={profile.role_slug === "super_admin"}
      />
    </div>
  );
}
