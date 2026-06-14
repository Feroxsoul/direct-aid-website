import { RoleBadge } from "@/components/admin/RoleBadge";
import { RolesManager } from "@/components/admin/RolesManager";
import { requirePermission } from "@/lib/admin/auth";
import { adminGetRoles } from "@/lib/admin/data";
import { DEFAULT_ROLE_DEFINITIONS, getDefaultRoleDefinition } from "@/lib/admin/permissions";

export default async function AdminRolesPage() {
  const profile = await requirePermission("roles", "view");
  const dbRoles = await adminGetRoles();
  const canCreateRoles = profile.role_slug === "super_admin";

  const roles =
    dbRoles.length > 0
      ? dbRoles
      : DEFAULT_ROLE_DEFINITIONS.map((role, index) => ({
          id: `default-${index}`,
          slug: role.slug,
          name: role.name,
          badge_color: role.badgeColor,
          is_system: role.isSystem,
          permissions: role.permissions,
          created_at: "",
          updated_at: "",
        }));

  return (
    <div className="dash-page">
      <header className="dash-page-header">
        <h1 className="dash-page-title">Roles & Permissions</h1>
        <p className="dash-page-subtitle">
          {canCreateRoles
            ? "Manage role badges, colors, and access control across the platform."
            : "View role definitions and badge colors. Only Super Admin can create custom roles."}
        </p>
      </header>

      <div className="dash-panel">
        <div className="dash-bar-chart" style={{ marginBottom: "1rem" }}>
          {roles.map((role) => (
            <div key={role.slug} className="dash-role-row">
              <RoleBadge label={role.name} color={role.badge_color} />
              <span className="dash-bar-label">{role.slug}</span>
              <span className="dash-bar-value">
                {role.is_system ? "System" : "Custom"}
              </span>
            </div>
          ))}
        </div>
        {canCreateRoles ? (
          <RolesManager
            roles={roles.map((r) => ({
              slug: r.slug,
              name: r.name,
              badgeColor: r.badge_color,
              isSystem: r.is_system,
              description:
                getDefaultRoleDefinition(r.slug)?.permissions
                  ? "Configured"
                  : "Custom permissions",
            }))}
          />
        ) : null}
      </div>
    </div>
  );
}
