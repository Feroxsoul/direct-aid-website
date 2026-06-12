import { AdminUsersPanel } from "@/components/admin/AdminUsersPanel";
import { requireSuperAdmin } from "@/lib/admin/auth";
import { adminGetUsers } from "@/lib/admin/data";

type UsersPageProps = {
  searchParams: Promise<{ saved?: string; removed?: string }>;
};

export default async function AdminUsersPage({ searchParams }: UsersPageProps) {
  const profile = await requireSuperAdmin();
  const users = await adminGetUsers();
  const { saved, removed } = await searchParams;

  return (
    <>
      <h1 className="admin-page-title">إدارة المستخدمين</h1>
      <p className="admin-page-subtitle">
        أنت Super Admin — يمكنك إضافة مديري المحتوى وتعيين أدوارهم.
      </p>

      {saved ? (
        <p className="admin-success" style={{ marginBottom: "1rem" }}>
          تم حفظ التغييرات.
        </p>
      ) : null}
      {removed ? (
        <p className="admin-success" style={{ marginBottom: "1rem" }}>
          تم حذف المستخدم.
        </p>
      ) : null}

      <AdminUsersPanel users={users} currentUserId={profile.id} />
    </>
  );
}
