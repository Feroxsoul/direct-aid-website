import { LoginForm } from "@/components/admin/LoginForm";

export const dynamic = "force-dynamic";
import {
  getSupabaseAnonKey,
  getSupabaseUrl,
  isSupabaseConfigured,
} from "@/lib/supabase/env";

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;
  const supabaseConfigured = isSupabaseConfigured();
  const supabaseUrl = getSupabaseUrl();
  const supabaseAnonKey = getSupabaseAnonKey();

  return (
    <div className="admin-login-wrap">
      <div className="admin-login-card admin-card">
        <h1 className="admin-page-title">Sign in</h1>
        <p className="admin-page-subtitle">10x10 by Direct Aid — Admin Panel</p>

        {!supabaseConfigured ? (
          <div className="admin-setup-box">
            <p className="admin-error" style={{ marginBottom: "0.75rem" }}>
              Database not connected — the admin panel requires Supabase.
            </p>
            <ol className="admin-setup-steps">
              <li>
                Create a free project at{" "}
                <a href="https://supabase.com" target="_blank" rel="noreferrer">
                  supabase.com
                </a>
              </li>
              <li>
                From Supabase → Project Settings → API copy{" "}
                <strong>Project URL</strong> and <strong>anon public key</strong>
              </li>
              <li>
                In the project folder create <code>.env.local</code> and add:
                <pre dir="ltr" className="admin-env-block">
{`NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...`}
                </pre>
              </li>
              <li>Restart the server: <code>npm run dev</code></li>
              <li>
                From Supabase → Authentication → Users → Add user to create the
                admin account
              </li>
            </ol>
          </div>
        ) : (
          <LoginForm
            supabaseUrl={supabaseUrl}
            supabaseAnonKey={supabaseAnonKey}
          />
        )}

        {error === "supabase" ? (
          <p className="admin-error">Configure Supabase before using the admin panel.</p>
        ) : null}
        {error === "unauthorized" ? (
          <p className="admin-error">
            Your account is not registered in the admin panel — contact a Super Admin.
          </p>
        ) : null}
        {error === "forbidden" ? (
          <p className="admin-error">You do not have permission to access this page.</p>
        ) : null}

        {supabaseConfigured ? (
          <p className="admin-setup-note">
            Sign in with an email listed in User Management. Super Admin adds emails at
            /admin/users, then creates the auth user in Supabase.
          </p>
        ) : null}
      </div>
    </div>
  );
}
