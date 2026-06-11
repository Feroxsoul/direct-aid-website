import { ProjectForm } from "@/components/admin/ProjectForm";
import { adminGetCategories } from "@/lib/admin/data";

export default async function NewProjectPage() {
  const categories = await adminGetCategories();

  return (
    <>
      <h1 className="admin-page-title">مشروع جديد</h1>
      <p className="admin-page-subtitle">
        المعرف (slug) يجب أن يكون فريداً بالإنجليزية، مثل: 2024slewat5001
      </p>
      <ProjectForm categories={categories} />
    </>
  );
}
