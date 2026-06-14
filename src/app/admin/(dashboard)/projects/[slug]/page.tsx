import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectDeleteForm, ProjectForm } from "@/components/admin/ProjectForm";
import { AdminPageHeader, AdminText } from "@/components/admin/AdminPageHeader";
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
      <div className="project-edit-header">
        <div>
          <AdminPageHeader titleKey="projectPage.edit" />
          <p className="dash-page-subtitle" dir="ltr">
            {project.title} · {project.slug}
          </p>
        </div>
        <div className="project-edit-actions">
          <Link href="/admin/projects" className="dash-btn">
            <AdminText k="common.back" />
          </Link>
          <Link
            href={`/project/${project.slug}`}
            target="_blank"
            className="dash-btn dash-btn--primary"
          >
            <AdminText k="common.viewLive" />
          </Link>
        </div>
      </div>
      <ProjectForm project={project} categories={categories} />
      {canDeleteProjects(profile.role_slug, profile.permissions) ? (
        <ProjectDeleteForm slug={project.slug} />
      ) : null}
    </div>
  );
}
