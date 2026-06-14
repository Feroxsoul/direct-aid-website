import Image from "next/image";
import { LoginForm } from "@/components/admin/LoginForm";
import {
  getSupabaseAnonKey,
  getSupabaseUrl,
  isSupabaseConfigured,
} from "@/lib/supabase/env";
import { BRAND_10X10_LOGO_SVG, DEFAULT_DIRECT_AID_LOGO } from "@/lib/brand";
import { APP_DEVELOPER, APP_VERSION_LABEL } from "@/lib/app-version";

export const dynamic = "force-dynamic";

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
      <div className="admin-login-panel">
        <div className="admin-login-card admin-card">
          <div className="admin-login-brand-row">
            <Image
              src={BRAND_10X10_LOGO_SVG}
              alt="10×10"
              width={88}
              height={56}
              className="admin-login-logo-10x10"
              unoptimized
              priority
            />
            <Image
              src={DEFAULT_DIRECT_AID_LOGO}
              alt="Direct Aid"
              width={120}
              height={40}
              className="admin-login-logo-directaid"
              unoptimized
              priority
            />
          </div>

          <p className="admin-login-kicker">{APP_VERSION_LABEL} · Admin</p>
          <h1 className="admin-login-title">Sign in</h1>

          {!supabaseConfigured ? (
            <div className="admin-setup-box">
              <p className="admin-error" style={{ marginBottom: "0.75rem" }}>
                Database not connected — configure Supabase in .env.local
              </p>
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
              Your account is not registered — contact a Super Admin.
            </p>
          ) : null}
          {error === "forbidden" ? (
            <p className="admin-error">You do not have permission to access this page.</p>
          ) : null}

          {supabaseConfigured ? (
            <p className="admin-setup-note">
              Admins create accounts in User Management — no Supabase dashboard required.
            </p>
          ) : null}
        </div>
      </div>

      <footer className="admin-login-page-footer">
        <p>Provided Direct Aid</p>
        <p>by {APP_DEVELOPER}</p>
      </footer>
    </div>
  );
}
