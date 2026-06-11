import Link from "next/link";
import { signOut } from "@/lib/admin/actions";

const links = [
  { href: "/admin/projects", label: "المشاريع" },
  { href: "/admin/categories", label: "الفئات" },
  { href: "/admin/homepage", label: "الصفحة الرئيسية" },
];

export function AdminNav() {
  return (
    <header className="admin-nav">
      <div className="admin-nav-inner">
        <Link href="/admin/projects" className="admin-nav-brand">
          لوحة التحكم — 10×10
        </Link>
        <nav className="admin-nav-links">
          {links.map((link) => (
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
