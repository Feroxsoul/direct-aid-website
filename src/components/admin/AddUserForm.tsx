"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { saveAdminUser } from "@/lib/admin/actions";
import { useAdminLang } from "@/lib/admin/i18n-context";

type RoleOption = {
  slug: string;
  name: string;
};

type AddUserFormProps = {
  assignableRoles: RoleOption[];
  canSetPassword: boolean;
};

export function AddUserForm({ assignableRoles, canSetPassword }: AddUserFormProps) {
  const { t } = useAdminLang();
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess(false);
    setSubmitting(true);

    const form = event.currentTarget;
    const result = await saveAdminUser(new FormData(form));
    setSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setSuccess(true);
    form.reset();
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="admin-form admin-form-inline">
      {error ? <p className="admin-error">{error}</p> : null}
      {success ? <p className="admin-success">{t("users.addSuccess")}</p> : null}

      <div className="admin-field">
        <label className="admin-label" htmlFor="new-email">
          {t("users.email")}
        </label>
        <input
          id="new-email"
          name="email"
          type="email"
          className="admin-input"
          required
          autoComplete="off"
          dir="ltr"
        />
      </div>
      <div className="admin-field">
        <label className="admin-label" htmlFor="new-display-name">
          {t("users.name")}
        </label>
        <input id="new-display-name" name="display_name" type="text" className="admin-input" />
      </div>
      <div className="admin-field">
        <label className="admin-label" htmlFor="new-role">
          {t("users.role")}
        </label>
        <select id="new-role" name="role" className="admin-input" defaultValue="editor">
          {assignableRoles.map((role) => (
            <option key={role.slug} value={role.slug}>
              {role.name}
            </option>
          ))}
        </select>
      </div>
      {canSetPassword ? (
        <div className="admin-field">
          <label className="admin-label" htmlFor="new-password">
            {t("users.password")}
          </label>
          <input
            id="new-password"
            name="password"
            type="password"
            className="admin-input"
            minLength={8}
            required
            autoComplete="new-password"
            dir="ltr"
            placeholder={t("users.passwordHint")}
          />
        </div>
      ) : null}
      <button type="submit" className="dash-btn dash-btn--primary" disabled={submitting}>
        {submitting ? "…" : t("users.addButton")}
      </button>
    </form>
  );
}
