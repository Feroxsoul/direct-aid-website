"use client";

import Image from "next/image";
import { AdminLangRoot } from "@/components/admin/AdminLangRoot";
import { AdminLangToggle } from "@/components/admin/AdminLangToggle";
import { AdminText } from "@/components/admin/AdminPageHeader";
import { LoginForm } from "@/components/admin/LoginForm";
import { APP_DEVELOPER, APP_VERSION_LABEL } from "@/lib/app-version";
import { BRAND_10X10_LOGO_SVG, DEFAULT_DIRECT_AID_LOGO } from "@/lib/brand";

type LoginPageContentProps = {
  supabaseConfigured: boolean;
  supabaseUrl: string;
  supabaseAnonKey: string;
  error?: string;
};

function LoginPageInner({
  supabaseConfigured,
  supabaseUrl,
  supabaseAnonKey,
  error,
}: LoginPageContentProps) {
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

          <div className="admin-login-lang-row">
            <AdminLangToggle />
          </div>

          <h1 className="admin-login-title">
            <AdminText k="login.title" />
          </h1>

          {!supabaseConfigured ? (
            <div className="admin-setup-box">
              <p className="admin-error" style={{ marginBottom: "0.75rem" }}>
                <AdminText k="login.dbNotConnected" />
              </p>
            </div>
          ) : (
            <LoginForm supabaseUrl={supabaseUrl} supabaseAnonKey={supabaseAnonKey} />
          )}

          {error === "supabase" ? (
            <p className="admin-error">
              <AdminText k="login.errorSupabase" />
            </p>
          ) : null}
          {error === "unauthorized" ? (
            <p className="admin-error">
              <AdminText k="login.errorUnauthorized" />
            </p>
          ) : null}
          {error === "forbidden" ? (
            <p className="admin-error">
              <AdminText k="login.errorForbidden" />
            </p>
          ) : null}
        </div>
      </div>

      <footer className="admin-login-page-footer">
        <p className="admin-login-version">
          <AdminText k="login.kicker" vars={{ version: APP_VERSION_LABEL }} />
        </p>
        <p>
          <AdminText k="sidebar.poweredBy" />
        </p>
        <p>
          <AdminText k="sidebar.byDeveloper" vars={{ name: APP_DEVELOPER }} />
        </p>
      </footer>
    </div>
  );
}

export function LoginPageContent(props: LoginPageContentProps) {
  return (
    <AdminLangRoot>
      <LoginPageInner {...props} />
    </AdminLangRoot>
  );
}
