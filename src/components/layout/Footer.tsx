import Image from "next/image";
import Link from "next/link";
import type { FooterColumn } from "@/lib/admin/settings-store";

const CDN = "https://cdn.prod.website-files.com/632a01171b125a156b28c038";
const DEFAULT_LOGO = `${CDN}/64c8cde2258c815c760717a9_small.png`;

type FooterProps = {
  logoUrl?: string;
  siteTitle?: string;
  tagline?: string;
  copyright?: string;
  columns?: FooterColumn[];
};

export function Footer({
  logoUrl = DEFAULT_LOGO,
  siteTitle = "مشاريع 10×10",
  tagline = "تمكين المجتمعات من خلال التنمية المستدامة والعمل الإنساني الشفاف في جميع أنحاء العالم.",
  copyright = "العون المباشر الدولي. جميع الحقوق محفوظة.",
  columns = [],
}: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="landing-footer">
      <div className="landing-container">
        <div className="landing-footer-grid">
          <div className="landing-footer-brand">
            <Image src={logoUrl} alt={siteTitle} width={120} height={40} className="h-8 w-auto" />
            <p>{tagline}</p>
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
          <span>
            © {year} {copyright}
          </span>
          <div className="landing-footer-meta">
            <span>منظمة خيرية معتمدة: #8254-A</span>
            <span>مدققة من KPMG</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
