import { AdminUsersPanel } from "@/components/admin/AdminUsersPanel";
import { requirePermission } from "@/lib/admin/auth";
import { adminGetRoles, adminGetUsers } from "@/lib/admin/data";

type UsersPageProps = {
  searchParams: Promise<{ saved?: string; removed?: string }>;
};

export default async function AdminUsersPage({ searchParams }: UsersPageProps) {
  const profile = await requirePermission("users", "view");
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
      <header className="dash-page-header">
        <h1 className="dash-page-title">User Management</h1>
        <p className="dash-page-subtitle">
          {profile.role_slug === "super_admin"
            ? "Create users, assign roles, suspend accounts, and manage admins."
            : "View and manage team members within your permission level."}
        </p>
      </header>

      {saved ? <p className="admin-success">Changes saved.</p> : null}
      {removed ? <p className="admin-success">User removed.</p> : null}

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
