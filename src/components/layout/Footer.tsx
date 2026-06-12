import Image from "next/image";
import Link from "next/link";

const CDN =
  "https://cdn.prod.website-files.com/632a01171b125a156b28c038";

const DEFAULT_LOGO = `${CDN}/64c8cde2258c815c760717a9_small.png`;

const FOOTER_COLUMNS = [
  {
    title: "OUR WORK",
    links: [
      { href: "/#categories", label: "Project Categories" },
      { href: "/#impact", label: "Recent Impact" },
      { href: "https://directaid.org", label: "Global Programs" },
    ],
  },
  {
    title: "ORGANIZATION",
    links: [
      { href: "https://directaid.org", label: "About Direct Aid" },
      { href: "/#transparency", label: "Transparency" },
      { href: "/admin/login", label: "Admin Portal" },
    ],
  },
  {
    title: "HELP & SUPPORT",
    links: [
      { href: "https://directaid.org", label: "Contact Us" },
      { href: "https://directaid.org/donate", label: "Donate" },
      { href: "/#transparency", label: "Newsletter" },
    ],
  },
] as const;

type FooterProps = {
  logoUrl?: string;
  siteTitle?: string;
};

export function Footer({
  logoUrl = DEFAULT_LOGO,
  siteTitle = "Direct Aid 10x10",
}: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="landing-footer">
      <div className="landing-container">
        <div className="landing-footer-grid">
          <div className="landing-footer-brand">
            <Image src={logoUrl} alt={siteTitle} width={120} height={40} className="h-8 w-auto" />
            <p>
              Empowering communities through sustainable development and transparent
              humanitarian action across the globe.
            </p>
          </div>

          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title} className="landing-footer-col">
              <h3>{column.title}</h3>
              <ul>
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="landing-footer-bottom">
          <span>© {year} DirectAid International. All rights reserved.</span>
          <div className="landing-footer-meta">
            <span>Certified NGO: #8254-A</span>
            <span>Audited by KPMG</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
