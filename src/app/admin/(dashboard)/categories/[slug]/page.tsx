import Link from "next/link";
import { notFound } from "next/navigation";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { AdminPageHeader, AdminText } from "@/components/admin/AdminPageHeader";
import { requirePermission } from "@/lib/admin/auth";
import { adminGetCategories } from "@/lib/admin/data";

type EditCategoryPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  await requirePermission("categories", "edit");
  const { slug } = await params;
  const categories = await adminGetCategories();
  const category = categories.find((item) => item.slug === slug);

  if (!category) {
    notFound();
  }

  return (
    <div className="dash-page">
      <div className="project-edit-header">
        <div>
          <AdminPageHeader titleKey="categoryPage.edit" />
          <p className="dash-page-subtitle" dir="ltr">
            {category.title_line_1} {category.title_line_2} · {category.slug}
          </p>
        </div>
        <div className="project-edit-actions">
          <Link href="/admin/categories" className="dash-btn">
            <AdminText k="common.back" />
          </Link>
          <Link
            href={`/lmshryaa/${category.slug}`}
            target="_blank"
            className="dash-btn dash-btn--primary"
          >
            <AdminText k="common.viewLive" />
          </Link>
        </div>
      </div>
      <CategoryForm category={category} />
    </div>
  );
}
