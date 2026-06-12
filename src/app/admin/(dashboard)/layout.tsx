import { AdminNav } from "@/components/admin/AdminNav";
import { requireAdmin } from "@/lib/admin/auth";

export default async function AdminDashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const profile = await requireAdmin();

  return (
    <>
      <AdminNav profile={profile} />
      <main className="admin-main">{children}</main>
    </>
  );
}
