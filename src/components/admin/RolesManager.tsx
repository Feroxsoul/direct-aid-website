"use client";

import { useState } from "react";
import { createCustomRole } from "@/lib/admin/actions";
import { DEFAULT_ROLE_DEFINITIONS } from "@/lib/admin/permissions";
import { RoleBadge } from "@/components/admin/RoleBadge";

const BADGE_COLORS = [
  "#7c3aed",
  "#dc2626",
  "#2563eb",
  "#16a34a",
  "#ea580c",
  "#0891b2",
  "#6b7280",
  "#db2777",
  "#ca8a04",
];

type RolesManagerProps = {
  roles: {
    slug: string;
    name: string;
    badgeColor: string;
    isSystem: boolean;
    description: string;
  }[];
};

export function RolesManager({ roles }: RolesManagerProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(BADGE_COLORS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.set("name", name);
      formData.set("badge_color", color);
      await createCustomRole(formData);
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create role");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h3 className="dash-panel-title">Create Custom Role</h3>
      <p className="dash-page-subtitle" style={{ marginBottom: "0.75rem" }}>
        Super Admin can add roles with a custom badge color. Default permissions
        start as Viewer-level read-only access.
      </p>

      <form onSubmit={handleCreate} className="admin-form-inline">
        <input
          className="admin-input"
          placeholder="Role name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <select
          className="admin-select"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        >
          {BADGE_COLORS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <RoleBadge label={name || "Preview"} color={color} />
        <button type="submit" className="dash-btn dash-btn--primary" disabled={loading}>
          {loading ? "Creating…" : "Create Role"}
        </button>
      </form>

      {error ? <p className="admin-error">{error}</p> : null}

      <details style={{ marginTop: "1rem" }}>
        <summary className="dash-link">Default role permission templates</summary>
        <ul style={{ marginTop: "0.5rem", fontSize: "0.8125rem" }}>
          {DEFAULT_ROLE_DEFINITIONS.map((role) => (
            <li key={role.slug}>
              <strong>{role.name}</strong> — {role.slug}
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
