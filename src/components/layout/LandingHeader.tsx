"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const CDN =
  "https://cdn.prod.website-files.com/632a01171b125a156b28c038";

const DEFAULT_LOGO = `${CDN}/64c8cde2258c815c760717a9_small.png`;

const NAV_LINKS = [
  { href: "/", label: "الرئيسية" },
  { href: "/#hero", label: "من نحن" },
  { href: "/#categories", label: "المشاريع" },
  { href: "/#impact", label: "التقارير" },
  { href: "/#transparency", label: "تواصل" },
] as const;

type LandingHeaderProps = {
  logoUrl?: string;
  siteTitle?: string;
};

export function LandingHeader({
  logoUrl = DEFAULT_LOGO,
  siteTitle = "مشاريع 10×10",
}: LandingHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="landing-header">
      <div className="landing-container landing-header-inner">
        <Link href="/" className="landing-logo">
          <Image
            src={logoUrl}
            alt={siteTitle}
            width={130}
            height={44}
            className="h-9 w-auto"
            priority
          />
        </Link>

        <nav
          className={`landing-nav${menuOpen ? " is-open" : ""}`}
          aria-label="التنقل الرئيسي"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="landing-nav-link"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="landing-header-mobile-actions">
          <a
            href="https://directaid.org/donate"
            className="landing-donate-btn landing-donate-btn--mobile"
            target="_blank"
            rel="noreferrer"
          >
            تبرع الآن
          </a>
          <button
            type="button"
            className="landing-menu-toggle"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "إغلاق القائمة" : "فتح القائمة"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        <div className="landing-header-actions">
          <a
            href="https://directaid.org/donate"
            className="landing-donate-btn landing-donate-btn--desktop"
            target="_blank"
            rel="noreferrer"
          >
            تبرع الآن
          </a>
          <Link href="/admin/login" className="landing-user-btn" aria-label="دخول لوحة التحكم">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Z"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <path
                d="M4.5 20.25c0-3.314 3.358-6 7.5-6s7.5 2.686 7.5 6"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </Link>
        </div>
      </div>
    </header>
  );
}
