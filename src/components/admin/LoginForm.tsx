"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    let navigating = false;

    try {
      const supabase = createSupabaseBrowserClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError("البريد أو كلمة المرور غير صحيحة");
        return;
      }

      navigating = true;
      router.replace("/admin/projects");
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
        <input
          id="password"
          name="password"
          type="password"
          className="admin-input"
          required
          dir="ltr"
          autoComplete="current-password"
        />
      </div>
      {error ? <p className="admin-error">{error}</p> : null}
      <button type="submit" className="admin-button" disabled={loading}>
        {loading ? "جاري الدخول…" : "دخول"}
      </button>
    </form>
  );
}
