import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { getPublicSettings } from "@/lib/data";
import "./globals.css";

const DIRECT_AID_FAVICON = "https://directaid.org/favicon.ico";

export const metadata: Metadata = {
  title: "مشاريع العون المباشر 10×10",
  description: "مشاريع العون المباشر 10×10",
  icons: {
    icon: DIRECT_AID_FAVICON,
    shortcut: DIRECT_AID_FAVICON,
    apple: DIRECT_AID_FAVICON,
  },
  openGraph: {
    title: "مشاريع العون المباشر 10×10",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getPublicSettings();

  return (
    <html lang="ar" dir="rtl">
      <body className="flex min-h-screen flex-col bg-white text-da-black antialiased">
        <main className="flex flex-1 flex-col">{children}</main>
        <Footer logoUrl={settings.logo_url} siteTitle={settings.site_title} />
      </body>
    </html>
  );
}
