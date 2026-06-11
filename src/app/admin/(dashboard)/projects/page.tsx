import Link from "next/link";
import { adminGetProjects } from "@/lib/admin/data";

export default async function AdminProjectsPage() {
  const projects = await adminGetProjects();

  return (
    <>
      <div className="admin-actions" style={{ marginBottom: "1rem" }}>
        <div>
          <h1 className="admin-page-title">المشاريع</h1>
          <p className="admin-page-subtitle">
            عدّل العناوين والصور والأوصاف — التغييرات تظهر على الموقع خلال دقيقة.
          </p>
        </div>
        <Link href="/admin/projects/new" className="admin-button">
          + مشروع جديد
        </Link>
      </div>

      <div className="admin-card">
        {projects.length === 0 ? (
          <p>لا توجد مشاريع في قاعدة البيانات. شغّل seed.sql أو أضف مشروعاً جديداً.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>العنوان</th>
                <th>الفئة</th>
                <th>التاريخ</th>
                <th>الحالة</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.slug}>
                  <td>{project.title}</td>
                  <td>{project.category_slug}</td>
                  <td>{project.date_label}</td>
                  <td>{project.is_published ? "منشور" : "مسودة"}</td>
                  <td>
                    <Link
                      href={`/admin/projects/${project.slug}`}
                      className="admin-link"
                    >
                      تعديل
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
