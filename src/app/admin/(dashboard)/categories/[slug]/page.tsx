import Link from "next/link";
import { notFound } from "next/navigation";
import { CategoryForm } from "@/components/admin/CategoryForm";
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
        <header className="dash-page-header">
          <h1 className="dash-page-title">Edit category</h1>
          <p className="dash-page-subtitle" dir="ltr">
            {category.title_line_1} {category.title_line_2} · {category.slug}
          </p>
        </header>
        <div className="project-edit-actions">
          <Link href="/admin/categories" className="dash-btn">
            ← Back
          </Link>
          <Link
            href={`/lmshryaa/${category.slug}`}
            target="_blank"
            className="dash-btn dash-btn--primary"
          >
            View live
          </Link>
        </div>
      </div>
      <CategoryForm category={category} />
    </div>
  );
}
