import { LoginForm } from "@/components/admin/LoginForm";

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;
  const supabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project"),
  );

  return (
    <div className="admin-login-wrap">
      <div className="admin-login-card admin-card">
        <h1 className="admin-page-title">تسجيل الدخول</h1>
        <p className="admin-page-subtitle">لوحة تحكم موقع 10×10</p>

        {!supabaseConfigured ? (
          <div className="admin-setup-box">
            <p className="admin-error" style={{ marginBottom: "0.75rem" }}>
              قاعدة البيانات غير متصلة بعد — لوحة التحكم تحتاج Supabase.
            </p>
            <ol className="admin-setup-steps">
              <li>
                أنشئ مشروعاً مجانياً على{" "}
                <a href="https://supabase.com" target="_blank" rel="noreferrer">
                  supabase.com
                </a>
              </li>
              <li>
                من Supabase → Project Settings → API انسخ{" "}
                <strong>Project URL</strong> و <strong>anon public key</strong>
              </li>
              <li>
                في مجلد المشروع أنشئ ملف <code>.env.local</code> وأضف:
                <pre dir="ltr" className="admin-env-block">
{`NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...`}
                </pre>
              </li>
              <li>أعد تشغيل السيرفر: <code>npm run dev</code></li>
              <li>
                من Supabase → Authentication → Users → Add user لإنشاء حساب
                المدير
              </li>
            </ol>
          </div>
        ) : (
          <LoginForm />
        )}

        {error === "supabase" ? (
          <p className="admin-error">يجب إعداد Supabase قبل استخدام لوحة التحكم.</p>
        ) : null}

        {supabaseConfigured ? (
          <p className="admin-setup-note">
            سجّل الدخول بالبريد وكلمة المرور اللذين أنشأتهما في Supabase →
            Authentication → Users.
          </p>
        ) : null}
      </div>
    </div>
  );
}
