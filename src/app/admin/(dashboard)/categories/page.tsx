import { CategoriesLiveEditor } from "@/components/admin/CategoriesLiveEditor";
import { requirePermission } from "@/lib/admin/auth";
import { hasPermission } from "@/lib/admin/permissions";
import { adminGetCategories } from "@/lib/admin/data";

export default async function AdminCategoriesPage() {
  const profile = await requirePermission("categories", "view");
  const categories = await adminGetCategories();

  return (
    <div className="dash-page">
      <CategoriesLiveEditor
        categories={categories}
        canCreate={hasPermission(profile.permissions, profile.role_slug, "categories", "edit")}
        canEdit={hasPermission(profile.permissions, profile.role_slug, "categories", "edit")}
      />
    </div>
  );
}
