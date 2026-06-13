import { CategoryForm } from "@/components/admin/CategoryForm";
import { requirePermission } from "@/lib/admin/auth";

export default async function NewCategoryPage() {
  await requirePermission("categories", "create");

  return (
    <div className="dash-page">
      <header className="dash-page-header">
        <h1 className="dash-page-title">New category</h1>
      </header>
      <CategoryForm />
    </div>
  );
}
