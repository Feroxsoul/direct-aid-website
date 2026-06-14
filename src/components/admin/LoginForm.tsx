"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { verifyAdminLogin } from "@/lib/admin/actions";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type LoginFormProps = {
  supabaseUrl: string;
  supabaseAnonKey: string;
};

export function LoginForm({ supabaseUrl, supabaseAnonKey }: LoginFormProps) {
  const router = useRouter();
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

    let navigating = false;

    try {
      const supabase = createSupabaseBrowserClient(supabaseUrl, supabaseAnonKey);
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        const message = signInError.message.toLowerCase();
        if (message.includes("invalid api key") || message.includes("invalid jwt")) {
          setError("مفتاح Supabase غير صحيح — استخدم Legacy anon key من Supabase → API Keys");
        } else if (message.includes("email not confirmed")) {
          setError("البريد غير مؤكد — فعّل Auto Confirm User في Supabase");
        } else {
          setError(
            `البريد أو كلمة المرور غير صحيحة. (${signInError.message})`,
          );
        }
        return;
      }

      const result = await verifyAdminLogin(email);
      if (!result.ok) {
        setError(result.error);
        return;
      }

      navigating = true;
      router.replace("/admin");
      router.refresh();
    } catch {
      setError("تعذر الاتصال بقاعدة البيانات");
    } finally {
      if (!navigating) {
        setLoading(false);
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="admin-form">
      <div className="admin-field">
        <label className="admin-label" htmlFor="email">
          البريد الإلكتروني
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
          كلمة المرور
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
            aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
          >
            {showPassword ? "إخفاء" : "إظهار"}
          </button>
        </div>
      </div>
      {error ? <p className="admin-error">{error}</p> : null}
      <button type="submit" className="admin-button" disabled={loading}>
        {loading ? "جاري الدخول…" : "دخول"}
      </button>
    </form>
  );
}
