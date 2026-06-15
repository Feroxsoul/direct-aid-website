"use client";

import { useState } from "react";
import { verifyAdminLogin } from "@/lib/admin/actions";
import { useAdminLang } from "@/lib/admin/i18n-context";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type LoginFormProps = {
  supabaseUrl: string;
  supabaseAnonKey: string;
};

function LoginFormInner({ supabaseUrl, supabaseAnonKey }: LoginFormProps) {
  const { t } = useAdminLang();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const password = String(formData.get("password") ?? "");

    try {
      const supabase = createSupabaseBrowserClient(supabaseUrl, supabaseAnonKey);
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        const message = signInError.message.toLowerCase();
        if (message.includes("invalid api key") || message.includes("invalid jwt")) {
          setError(t("login.errorSupabase"));
        } else if (message.includes("email not confirmed")) {
          setError(t("login.errorPending"));
        } else {
          setError(t("login.errorInvalid"));
        }
        return;
      }

      if (!data.user) {
        setError(t("login.errorInvalid"));
        return;
      }

      const result = await verifyAdminLogin(email, data.user.id);
      if (!result.ok) {
        await supabase.auth.signOut();
        if (result.error.toLowerCase().includes("pending")) {
          setError(t("login.errorPending"));
        } else if (
          result.error.toLowerCase().includes("inactive") ||
          result.error.toLowerCase().includes("suspended") ||
          result.error.toLowerCase().includes("موقوف")
        ) {
          setError(t("login.errorInactive"));
        } else if (result.error.toLowerCase().includes("not registered")) {
          setError(t("login.errorUnauthorized"));
        } else {
          setError(result.error);
        }
        return;
      }

      window.location.assign("/admin");
    } catch {
      setError(t("login.dbNotConnected"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="admin-form">
      <div className="admin-field">
        <label className="admin-label" htmlFor="email">
          {t("login.email")}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          className="admin-input"
          required
          dir="ltr"
          autoComplete="email"
        />
      </div>
      <div className="admin-field">
        <label className="admin-label" htmlFor="password">
          {t("login.password")}
        </label>
        <div className="admin-password-wrap">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            className="admin-input admin-password-input"
            required
            dir="ltr"
            autoComplete="current-password"
          />
          <button
            type="button"
            className="admin-password-toggle"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? t("login.hidePassword") : t("login.showPassword")}
          >
            {showPassword ? t("login.hidePassword") : t("login.showPassword")}
          </button>
        </div>
      </div>
      {error ? <p className="admin-error">{error}</p> : null}
      <button type="submit" className="admin-button" disabled={loading}>
        {loading ? t("login.submitting") : t("login.submit")}
      </button>
    </form>
  );
}

export function LoginForm(props: LoginFormProps) {
  return <LoginFormInner {...props} />;
}
