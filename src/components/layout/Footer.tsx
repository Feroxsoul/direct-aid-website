import Image from "next/image";
import Link from "next/link";

const CDN =
  "https://cdn.prod.website-files.com/632a01171b125a156b28c038";

const DEFAULT_LOGO = `${CDN}/64c8cde2258c815c760717a9_small.png`;

const FOOTER_COLUMNS = [
  {
    title: "أعمالنا",
    links: [
      { href: "/#categories", label: "فئات المشاريع" },
      { href: "/#impact", label: "آخر الأثر" },
      { href: "https://directaid.org", label: "البرامج العالمية" },
    ],
  },
  {
    title: "المؤسسة",
    links: [
      { href: "https://directaid.org", label: "عن العون المباشر" },
      { href: "/#transparency", label: "الشفافية" },
      { href: "/admin/login", label: "لوحة التحكم" },
    ],
  },
  {
    title: "المساعدة والدعم",
    links: [
      { href: "https://directaid.org", label: "تواصل معنا" },
      { href: "https://directaid.org/donate", label: "تبرع الآن" },
      { href: "/#transparency", label: "النشرة البريدية" },
    ],
  },
] as const;

type FooterProps = {
  logoUrl?: string;
  siteTitle?: string;
};

export function Footer({
  logoUrl = DEFAULT_LOGO,
  siteTitle = "مشاريع 10×10",
}: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="landing-footer">
      <div className="landing-container">
        <div className="landing-footer-grid">
          <div className="landing-footer-brand">
            <Image src={logoUrl} alt={siteTitle} width={120} height={40} className="h-8 w-auto" />
            <p>
              تمكين المجتمعات من خلال التنمية المستدامة والعمل الإنساني الشفاف
              في جميع أنحاء العالم.
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
          <span>© {year} العون المباشر الدولي. جميع الحقوق محفوظة.</span>
          <div className="landing-footer-meta">
            <span>منظمة خيرية معتمدة: #8254-A</span>
            <span>مدققة من KPMG</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
