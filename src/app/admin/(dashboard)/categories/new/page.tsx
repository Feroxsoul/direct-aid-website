import { CategoryForm } from "@/components/admin/CategoryForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { requirePermission } from "@/lib/admin/auth";

export default async function NewCategoryPage() {
  await requirePermission("categories", "create");

  return (
    <div className="dash-page">
      <AdminPageHeader titleKey="categoryPage.new" />
      <CategoryForm />
    </div>
  );
}
