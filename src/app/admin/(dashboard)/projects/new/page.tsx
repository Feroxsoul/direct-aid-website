import Link from "next/link";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { requirePermission } from "@/lib/admin/auth";
import { adminGetCategories } from "@/lib/admin/data";

export default async function NewProjectPage() {
  await requirePermission("projects", "create");
  const categories = await adminGetCategories();

  return (
    <div className="dash-page">
      <div className="project-edit-header">
        <header className="dash-page-header">
          <h1 className="dash-page-title">New project</h1>
          <p className="dash-page-subtitle" dir="ltr">
            Slug must be unique in English, e.g. 2024slewat5001
          </p>
        </header>
        <div className="project-edit-actions">
          <Link href="/admin/projects" className="dash-btn">
            ← Back
          </Link>
        </div>
      </div>
      <ProjectForm categories={categories} />
    </div>
  );
}
