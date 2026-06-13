import { notFound } from "next/navigation";
import { ProjectDeleteForm, ProjectForm } from "@/components/admin/ProjectForm";
import { requirePermission } from "@/lib/admin/auth";
import { canDeleteProjects } from "@/lib/admin/roles";
import { adminGetCategories, adminGetProject } from "@/lib/admin/data";

type EditProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const { slug } = await params;
  const profile = await requirePermission("projects", "edit");
  const [project, categories] = await Promise.all([
    adminGetProject(slug),
    adminGetCategories(),
  ]);

  if (!project) {
    notFound();
  }

  return (
    <div className="dash-page">
      <header className="dash-page-header">
        <h1 className="dash-page-title">Edit project</h1>
        <p className="dash-page-subtitle" dir="ltr">
          {project.title} · {project.slug}
        </p>
      </header>
      <ProjectForm project={project} categories={categories} />
      {canDeleteProjects(profile.role_slug, profile.permissions) ? (
        <ProjectDeleteForm slug={project.slug} />
      ) : null}
    </div>
  );
}
