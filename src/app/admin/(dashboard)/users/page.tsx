import { redirect } from "next/navigation";
import { AdminUsersPanel } from "@/components/admin/AdminUsersPanel";
import { AdminPageHeader, AdminText } from "@/components/admin/AdminPageHeader";
import { requirePermission } from "@/lib/admin/auth";
import { adminGetRoles, adminGetUsers } from "@/lib/admin/data";

type UsersPageProps = {
  searchParams: Promise<{ saved?: string; removed?: string }>;
};

export default async function AdminUsersPage({ searchParams }: UsersPageProps) {
  const profile = await requirePermission("users", "view");

  if (profile.role_slug !== "super_admin" && profile.role_slug !== "admin") {
    redirect("/admin/login?error=forbidden");
  }

  const [users, roles] = await Promise.all([adminGetUsers(), adminGetRoles()]);
  const { saved, removed } = await searchParams;

  const customRoles = roles
    .filter((role) => !role.is_system)
    .map((role) => ({
      slug: role.slug,
      name: role.name,
      badgeColor: role.badge_color,
    }));

  return (
    <div className="dash-page">
      <AdminPageHeader titleKey="page.users" subtitleKey="users.pageSubtitle" />

      {saved ? <p className="admin-success"><AdminText k="users.pageSaved" /></p> : null}
      {removed ? <p className="admin-success"><AdminText k="users.pageRemoved" /></p> : null}

      <AdminUsersPanel
        users={users}
        currentUserId={profile.id}
        roleSlug={profile.role_slug}
        permissions={profile.permissions}
        customRoles={customRoles}
      />
    </div>
  );
}
