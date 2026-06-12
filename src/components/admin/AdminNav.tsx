import Link from "next/link";
import { AdminPresence } from "@/components/admin/AdminPresence";
import { signOut } from "@/lib/admin/actions";
import { canManageUsers, ROLE_LABELS } from "@/lib/admin/roles";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";
import type { AdminUserRow } from "@/types";

const links = [
  { href: "/admin/projects", label: "المشاريع" },
  { href: "/admin/categories", label: "الفئات" },
  { href: "/admin/homepage", label: "الصفحة الرئيسية" },
];

type AdminNavProps = {
  profile: AdminUserRow;
};

export function AdminNav({ profile }: AdminNavProps) {
  const navLinks = canManageUsers(profile.role)
    ? [...links, { href: "/admin/users", label: "المستخدمون" }]
    : links;

  const presenceKey = profile.user_id ?? profile.id;

  return (
    <header className="admin-nav">
      <div className="admin-nav-inner">
        <Link href="/admin/projects" className="admin-nav-brand">
          لوحة التحكم — 10×10
        </Link>
        <nav className="admin-nav-links">
          <AdminPresence
            supabaseUrl={getSupabaseUrl()}
            supabaseAnonKey={getSupabaseAnonKey()}
            currentUser={{
              key: presenceKey,
              email: profile.email,
              role: profile.role,
              displayName: profile.display_name,
            }}
          />
          <span className="admin-nav-role">{ROLE_LABELS[profile.role]}</span>
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="admin-nav-link">
              {link.label}
            </Link>
          ))}
          <Link href="/" className="admin-nav-link" target="_blank">
            عرض الموقع
          </Link>
          <form action={signOut}>
            <button type="submit" className="admin-nav-button">
              خروج
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
