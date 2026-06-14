import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { getPublicContentSettings } from "@/lib/public-content";
import "./globals.css";

const DIRECT_AID_FAVICON = "https://directaid.org/favicon.ico";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getPublicContentSettings();

  return {
    metadataBase: new URL(content.public_site_url),
    title: "مشاريع العون المباشر 10×10",
    description: "مشاريع العون المباشر 10×10",
    icons: {
      icon: DIRECT_AID_FAVICON,
      shortcut: DIRECT_AID_FAVICON,
      apple: DIRECT_AID_FAVICON,
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
      </body>
    </html>
  );
}
