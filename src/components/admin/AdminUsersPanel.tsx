"use client";

import { useMemo, useState } from "react";
import {
  removeAdminUser,
  saveAdminUser,
  updateAdminUser,
} from "@/lib/admin/actions";
import { RoleBadge } from "@/components/admin/RoleBadge";
import { hasPermission } from "@/lib/admin/permissions";
import {
  DEFAULT_ROLE_DEFINITIONS,
  ROLE_DESCRIPTIONS,
  ROLE_LABELS,
  canAssignRole,
  getRoleBadgeColor,
  getRoleLabel,
} from "@/lib/admin/roles";
import type { AdminPermissions, AdminUserRow } from "@/types";

type RoleOption = {
  slug: string;
  name: string;
  badgeColor: string;
};

type AdminUsersPanelProps = {
  users: AdminUserRow[];
  currentUserId: string;
  roleSlug: string;
  permissions: AdminPermissions;
  customRoles?: RoleOption[];
};

function formatLastLogin(value: string | null | undefined) {
  if (!value) return "Never";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function UserAvatar({
  name,
  email,
  avatarUrl,
}: {
  name: string | null;
  email: string;
  avatarUrl: string | null | undefined;
}) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt=""
        className="dash-user-avatar"
        width={36}
        height={36}
      />
    );
  }

  const initial = (name?.[0] ?? email[0] ?? "?").toUpperCase();
  return <span className="dash-user-avatar dash-user-avatar--placeholder">{initial}</span>;
}

export function AdminUsersPanel({
  users,
  currentUserId,
  roleSlug,
  permissions,
  customRoles = [],
}: AdminUsersPanelProps) {
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const canCreate = hasPermission(permissions, roleSlug, "users", "create");
  const canEdit = hasPermission(permissions, roleSlug, "users", "edit");
  const canDelete = hasPermission(permissions, roleSlug, "users", "delete");
  const isSuperAdmin = roleSlug === "super_admin";

  const allRoles: RoleOption[] = useMemo(() => {
    const defaults = DEFAULT_ROLE_DEFINITIONS.map((role) => ({
      slug: role.slug,
      name: role.name,
      badgeColor: role.badgeColor,
    }));
    const merged = [...defaults];
    for (const role of customRoles) {
      if (!merged.some((item) => item.slug === role.slug)) {
        merged.push(role);
      }
    }
    return merged;
  }, [customRoles]);

  const assignableRoles = allRoles.filter(
    (role) => role.slug !== "super_admin" && canAssignRole(roleSlug, role.slug),
  );

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((adminUser) => {
      const slug = adminUser.role_slug ?? adminUser.role;
      if (roleFilter !== "all" && slug !== roleFilter) return false;

      const status = adminUser.suspended_at
        ? "suspended"
        : adminUser.is_active
          ? "active"
          : "inactive";
      if (statusFilter !== "all" && status !== statusFilter) return false;

      if (!q) return true;
      const haystack = [
        adminUser.email,
        adminUser.display_name ?? "",
        getRoleLabel(slug),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [users, query, roleFilter, statusFilter]);

  return (
    <>
      {canCreate ? (
        <div className="dash-panel" style={{ marginBottom: "1rem" }}>
          <h2 className="dash-panel-title">Add User</h2>
          <p className="dash-page-subtitle" style={{ marginBottom: "1rem" }}>
            {isSuperAdmin
              ? "Add email, role, and optional password so the user can log in immediately."
              : "Add email and role. Super Admin can also set a login password."}
          </p>
          <form action={saveAdminUser} className="admin-form admin-form-inline">
            <div className="admin-field">
              <label className="admin-label" htmlFor="new-email">
                Email
              </label>
              <input
                id="new-email"
                name="email"
                type="email"
                className="admin-input"
                required
                dir="ltr"
              />
            </div>
            <div className="admin-field">
              <label className="admin-label" htmlFor="new-display-name">
                Name
              </label>
              <input id="new-display-name" name="display_name" type="text" className="admin-input" />
            </div>
            <div className="admin-field">
              <label className="admin-label" htmlFor="new-role">
                Role
              </label>
              <select id="new-role" name="role" className="admin-input" defaultValue="editor">
                {assignableRoles.map((role) => (
                  <option key={role.slug} value={role.slug}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
            {isSuperAdmin ? (
              <div className="admin-field">
                <label className="admin-label" htmlFor="new-password">
                  Password (optional)
                </label>
                <input
                  id="new-password"
                  name="password"
                  type="password"
                  className="admin-input"
                  minLength={8}
                  dir="ltr"
                  placeholder="Min. 8 characters"
                />
              </div>
            ) : null}
            <button type="submit" className="dash-btn dash-btn--primary">
              Add User
            </button>
          </form>
        </div>
      ) : null}

      <div className="dash-panel">
        <div className="dash-panel-header">
          <h2 className="dash-panel-title">All Users</h2>
          <div className="dash-filters">
            <input
              type="search"
              className="admin-input"
              placeholder="Search by name or email…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              dir="ltr"
            />
            <select
              className="admin-input"
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
            >
              <option value="all">All roles</option>
              {allRoles.map((role) => (
                <option key={role.slug} value={role.slug}>
                  {role.name}
                </option>
              ))}
            </select>
            <select
              className="admin-input"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <p className="dash-empty">No users match your filters.</p>
        ) : (
          <div className="dash-table-wrap">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Last login</th>
                  <th>Linked</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((adminUser) => {
                  const slug = adminUser.role_slug ?? adminUser.role;
                  const canEditUser =
                    canEdit &&
                    adminUser.id !== currentUserId &&
                    (isSuperAdmin || slug !== "super_admin");
                  const canDeleteUser =
                    canDelete &&
                    adminUser.id !== currentUserId &&
                    (isSuperAdmin || slug !== "super_admin");

                  return (
                    <tr key={adminUser.id}>
                      <td>
                        <div className="dash-user-cell">
                          <UserAvatar
                            name={adminUser.display_name}
                            email={adminUser.email}
                            avatarUrl={adminUser.avatar_url}
                          />
                          <div>
                            <p className="dash-user-name">
                              {adminUser.display_name ?? "—"}
                            </p>
                            <p className="dash-user-email" dir="ltr">
                              {adminUser.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <RoleBadge
                          label={getRoleLabel(slug)}
                          color={getRoleBadgeColor(slug)}
                          size="sm"
                        />
                      </td>
                      <td>
                        {adminUser.suspended_at
                          ? "Suspended"
                          : adminUser.is_active
                            ? "Active"
                            : "Inactive"}
                      </td>
                      <td>{formatLastLogin(adminUser.last_login_at)}</td>
                      <td>{adminUser.user_id ? "Yes" : "Pending login"}</td>
                      <td>
                        {canEditUser || canDeleteUser ? (
                          <details className="admin-details">
                            <summary className="dash-link">Edit</summary>
                            {canEditUser ? (
                              <form action={updateAdminUser} className="admin-form admin-form-stack">
                                <input type="hidden" name="id" value={adminUser.id} />
                                <div className="admin-field">
                                  <label className="admin-label">Name</label>
                                  <input
                                    name="display_name"
                                    type="text"
                                    className="admin-input"
                                    defaultValue={adminUser.display_name ?? ""}
                                  />
                                </div>
                                <div className="admin-field">
                                  <label className="admin-label">Role</label>
                                  <select
                                    name="role"
                                    className="admin-input"
                                    defaultValue={slug}
                                  >
                                    {(isSuperAdmin ? allRoles : assignableRoles).map((role) => (
                                      <option key={role.slug} value={role.slug}>
                                        {role.name}
                                      </option>
                                    ))}
                                  </select>
                                  <p className="admin-hint">
                                    {ROLE_DESCRIPTIONS[slug] ?? ROLE_LABELS[slug]}
                                  </p>
                                </div>
                                <label className="admin-checkbox">
                                  <input
                                    type="checkbox"
                                    name="is_active"
                                    defaultChecked={adminUser.is_active}
                                  />
                                  <span>Active</span>
                                </label>
                                <label className="admin-checkbox">
                                  <input type="checkbox" name="suspend" />
                                  <span>Suspend user</span>
                                </label>
                                <button type="submit" className="dash-btn">
                                  Save
                                </button>
                              </form>
                            ) : null}
                            {canDeleteUser ? (
                              <form action={removeAdminUser} className="admin-actions">
                                <input type="hidden" name="id" value={adminUser.id} />
                                <button type="submit" className="dash-btn dash-btn--danger">
                                  Delete
                                </button>
                              </form>
                            ) : null}
                          </details>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
