import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { DEFAULT_DIRECT_AID_LOGO } from "@/lib/brand";
import { getPublicContentSettings } from "@/lib/public-content";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getPublicContentSettings();
  const favicon = content.logo_url || DEFAULT_DIRECT_AID_LOGO;

  return {
    metadataBase: new URL(content.public_site_url),
    title: "مشاريع العون المباشر 10×10",
    description: "مشاريع العون المباشر 10×10",
    icons: {
      icon: favicon,
      shortcut: favicon,
      apple: favicon,
    },
    openGraph: {
      title: "مشاريع العون المباشر 10×10",
      url: content.public_site_url,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = await getPublicContentSettings();

  return (
    <html lang="ar" dir="rtl">
      <body className="flex min-h-screen flex-col bg-white text-da-black antialiased">
        <main className="flex flex-1 flex-col">{children}</main>
        {content.show_footer ? (
          <Footer
            logoUrl={content.logo_url}
            siteTitle={content.site_title}
            tagline={content.footer_tagline}
            copyright={content.footer_copyright}
            legalLine={content.footer_legal_line}
            privacyUrl={content.footer_privacy_url}
            donationPolicyUrl={content.footer_donation_policy_url}
            columns={content.footer_columns}
            socialLinks={content.footer_social}
          />
        ) : null}
      </body>
    </html>
  );
}
