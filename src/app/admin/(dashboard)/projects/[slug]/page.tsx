import { notFound } from "next/navigation";
import { ProjectDeleteForm, ProjectForm } from "@/components/admin/ProjectForm";
import { adminGetCategories, adminGetProject } from "@/lib/admin/data";

type EditProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const { slug } = await params;
  const [project, categories] = await Promise.all([
    adminGetProject(slug),
    adminGetCategories(),
  ]);

  if (!project) {
    notFound();
  }

  return (
    <>
      <h1 className="admin-page-title">تعديل: {project.title}</h1>
      <p className="admin-page-subtitle">معرف المشروع: {project.slug}</p>
      <ProjectForm project={project} categories={categories} />
      <ProjectDeleteForm slug={project.slug} />
    </>
  );
}
