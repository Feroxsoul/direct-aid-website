import { notFound } from "next/navigation";
import { ProjectDeleteForm, ProjectForm } from "@/components/admin/ProjectForm";
import { getAdminProfile } from "@/lib/admin/auth";
import { canDeleteProjects } from "@/lib/admin/roles";
import { adminGetCategories, adminGetProject } from "@/lib/admin/data";

type EditProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const { slug } = await params;
  const [project, categories, profile] = await Promise.all([
    adminGetProject(slug),
    adminGetCategories(),
    getAdminProfile(),
  ]);

  if (!project) {
    notFound();
  }

  return (
    <>
      <h1 className="admin-page-title">تعديل: {project.title}</h1>
      <p className="admin-page-subtitle">معرف المشروع: {project.slug}</p>
      <ProjectForm project={project} categories={categories} />
      {profile && canDeleteProjects(profile.role) ? (
        <ProjectDeleteForm slug={project.slug} />
      ) : null}
    </>
  );
}
