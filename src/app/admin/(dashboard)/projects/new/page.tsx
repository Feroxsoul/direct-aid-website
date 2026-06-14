import { ProjectForm } from "@/components/admin/ProjectForm";
import { AdminPageHeader, AdminText } from "@/components/admin/AdminPageHeader";
import Link from "next/link";
import { requirePermission } from "@/lib/admin/auth";
import { adminGetCategories } from "@/lib/admin/data";

export default async function NewProjectPage() {
  await requirePermission("projects", "create");
  const categories = await adminGetCategories();

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
      <ProjectForm categories={categories} />
    </div>
  );
}
