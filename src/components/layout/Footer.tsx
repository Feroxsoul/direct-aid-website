"use client";

import Image from "next/image";
import Link from "next/link";
import { useSiteLang } from "@/lib/site-i18n-context";
import type { FooterColumn, FooterSocialLink } from "@/lib/admin/settings-store";

const CDN = "https://cdn.prod.website-files.com/632a01171b125a156b28c038";
const DEFAULT_LOGO = `${CDN}/64c8cde2258c815c760717a9_small.png`;

type FooterProps = {
  logoUrl?: string;
  siteTitle?: string;
  tagline?: string;
  copyright?: string;
  legalLine?: string;
  privacyUrl?: string;
  donationPolicyUrl?: string;
  columns?: FooterColumn[];
  socialLinks?: FooterSocialLink[];
};

export function Footer({
  logoUrl = DEFAULT_LOGO,
  siteTitle = "مشاريع 10×10",
  tagline = "جمعية العون المباشر — مؤسسة خيرية كويتية تعمل على تقديم العون الإنساني والتنموي في أكثر من 30 دولة.",
  copyright = "جمعية العون المباشر. جميع الحقوق محفوظة.",
  legalLine = "مؤسسة خيرية كويتية غير ربحية — رقم التسجيل 1999/81",
  privacyUrl = "https://direct-aid.org/cms/about-us-ar-2/good-governance-in-direct-aid/privacy-policy/",
  donationPolicyUrl = "https://direct-aid.org/cms/donation-policy-ar/",
  columns = [],
  socialLinks = [],
}: FooterProps) {
  const { t } = useSiteLang();
  const year = new Date().getFullYear();

  return (
    <footer className="landing-footer">
      <div className="landing-container">
        <div className="landing-footer-grid">
          <div className="landing-footer-brand">
            <Image src={logoUrl} alt={siteTitle} width={120} height={40} className="h-8 w-auto" />
            <p>{tagline}</p>
            {socialLinks.length ? (
              <div className="landing-footer-social">
                {socialLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={link.label}
                    title={link.label}
                  >
                    {link.label.slice(0, 1)}
                  </a>
                ))}
              </div>
            ) : null}
          </div>

          {columns.map((column) => (
            <div key={column.title} className="landing-footer-col">
              <h3>{column.title}</h3>
              <ul>
                {column.links.map((link) => (
                  <li key={`${column.title}-${link.label}`}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="landing-footer-bottom">
          <div className="landing-footer-legal">
            <span>
              © {year} {copyright}
            </span>
            {legalLine ? <span>{legalLine}</span> : null}
          </div>
          <div className="landing-footer-meta">
            <Link href={privacyUrl}>{t("footer.privacy")}</Link>
            <Link href={donationPolicyUrl}>{t("footer.donation")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
