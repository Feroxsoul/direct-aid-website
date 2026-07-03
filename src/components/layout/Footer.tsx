"use client";

import Image from "next/image";
import Link from "next/link";
import { usePublicLocale } from "@/lib/public-locale-context";
import { useSiteLang } from "@/lib/site-i18n-context";
import type { FooterColumn, FooterSocialLink } from "@/lib/admin/settings-store";

const CDN = "https://cdn.prod.website-files.com/632a01171b125a156b28c038";
const DEFAULT_LOGO = `${CDN}/64c8cde2258c815c760717a9_small.png`;

type FooterProps = {
  logoUrl?: string;
  columns?: FooterColumn[];
  socialLinks?: FooterSocialLink[];
};

export function Footer({
  logoUrl = DEFAULT_LOGO,
  columns: columnsProp = [],
  socialLinks = [],
}: FooterProps) {
  const { t } = useSiteLang();
  const { content } = usePublicLocale();
  const year = new Date().getFullYear();
  const columns = content.footer_columns.length ? content.footer_columns : columnsProp;

  return (
    <footer className="landing-footer">
      <div className="landing-container">
        <div className="landing-footer-grid">
          <div className="landing-footer-brand">
            <Image src={logoUrl} alt={content.site_title} width={120} height={40} className="h-8 w-auto" />
            <p>{content.footer_tagline}</p>
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
              © {year} {content.footer_copyright}
            </span>
            {content.footer_legal_line ? <span>{content.footer_legal_line}</span> : null}
          </div>
          <div className="landing-footer-meta">
            <Link href={content.footer_privacy_url}>{t("footer.privacy")}</Link>
            <Link href={content.footer_donation_policy_url}>{t("footer.donation")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
