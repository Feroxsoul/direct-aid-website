"use client";

import { useMemo, useState } from "react";
import { AddUserForm } from "@/components/admin/AddUserForm";
import { updateAdminUser } from "@/lib/admin/actions";
import { DeleteUserButton } from "@/components/admin/DeleteUserButton";
import { NavPageVisibilityEditor } from "@/components/admin/NavPageVisibilityEditor";
import { RoleBadge } from "@/components/admin/RoleBadge";
import { hasPermission } from "@/lib/admin/permissions";
import { parseNavHiddenPages } from "@/lib/admin/nav-pages";
import {
  DEFAULT_ROLE_DEFINITIONS,
  ROLE_DESCRIPTIONS,
  ROLE_LABELS,
  canAssignRole,
  getRoleBadgeColor,
  getRoleLabel,
} from "@/lib/admin/roles";
import type { AdminPermissions, AdminUserRow } from "@/types";
import { useAdminLang } from "@/lib/admin/i18n-context";

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

function formatLastLogin(value: string | null | undefined, neverLabel: string) {
  if (!value) return neverLabel;
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
  const { t } = useAdminLang();
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const canCreate = hasPermission(permissions, roleSlug, "users", "create");
  const canEdit = hasPermission(permissions, roleSlug, "users", "edit");
  const canDelete = hasPermission(permissions, roleSlug, "users", "delete");
  const isSuperAdmin = roleSlug === "super_admin";
  const canSetPassword = isSuperAdmin || roleSlug === "admin";

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
          <h2 className="dash-panel-title">{t("users.addTitle")}</h2>
          <p className="dash-page-subtitle" style={{ marginBottom: "1rem" }}>
            {t("users.addSubtitle")}
          </p>
          <AddUserForm assignableRoles={assignableRoles} canSetPassword={canSetPassword} />
        </div>
      ) : null}

      <div className="dash-panel">
        <div className="dash-panel-header">
          <h2 className="dash-panel-title">{t("users.allTitle")}</h2>
          <div className="dash-filters">
            <input
              type="search"
              className="admin-input"
              placeholder={t("users.search")}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              dir="ltr"
            />
            <select
              className="admin-input"
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
            >
              <option value="all">{t("users.allRoles")}</option>
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
              <option value="all">{t("users.allStatuses")}</option>
              <option value="active">{t("users.active")}</option>
              <option value="suspended">{t("users.suspended")}</option>
              <option value="inactive">{t("users.inactive")}</option>
            </select>
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <p className="dash-empty">{t("users.empty")}</p>
        ) : (
          <div className="dash-table-wrap">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>{t("users.colUser")}</th>
                  <th>{t("users.colRole")}</th>
                  <th>{t("users.colStatus")}</th>
                  <th>{t("users.colLastLogin")}</th>
                  <th>{t("users.colLinked")}</th>
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
                          ? t("users.suspended")
                          : adminUser.is_active
                            ? t("users.active")
                            : t("users.inactive")}
                      </td>
                      <td>{formatLastLogin(adminUser.last_login_at, t("users.never"))}</td>
                      <td>{adminUser.user_id ? t("users.linkedYes") : t("users.linkedPending")}</td>
                      <td>
                        {canEditUser || canDeleteUser ? (
                          <details className="admin-details">
                            <summary className="dash-link">{t("common.edit")}</summary>
                            {canEditUser ? (
                              <form action={updateAdminUser} className="admin-form admin-form-stack">
                                <input type="hidden" name="id" value={adminUser.id} />
                                <div className="admin-field">
                                  <label className="admin-label">{t("users.name")}</label>
                                  <input
                                    name="display_name"
                                    type="text"
                                    className="admin-input"
                                    defaultValue={adminUser.display_name ?? ""}
                                  />
                                </div>
                                <div className="admin-field">
                                  <label className="admin-label">{t("users.role")}</label>
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
                                  <span>{t("users.active")}</span>
                                </label>
                                <label className="admin-checkbox">
                                  <input type="checkbox" name="suspend" />
                                  <span>{t("users.suspend")}</span>
                                </label>
                                {isSuperAdmin ? (
                                  <>
                                    <div className="admin-field">
                                      <label className="admin-label">{t("users.newPassword")}</label>
                                      <input
                                        name="new_password"
                                        type="password"
                                        className="admin-input"
                                        minLength={8}
                                        autoComplete="new-password"
                                        dir="ltr"
                                        placeholder={t("users.passwordKeep")}
                                      />
                                      <p className="admin-help-text">{t("users.passwordHelp")}</p>
                                    </div>
                                    <NavPageVisibilityEditor
                                      hiddenPages={parseNavHiddenPages(
                                        adminUser.nav_hidden_pages,
                                      )}
                                    />
                                  </>
                                ) : null}
                                <button type="submit" className="dash-btn">
                                  {t("common.save")}
                                </button>
                              </form>
                            ) : null}
                            {canDeleteUser ? (
                              <DeleteUserButton
                                userId={adminUser.id}
                                userEmail={adminUser.email}
                              />
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
