import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { getPublicSettings } from "@/lib/data";
import "./globals.css";

export const metadata: Metadata = {
  title: "Direct Aid 10x10",
  description: "Direct Aid 10x10 Projects",
  openGraph: {
    title: "Direct Aid 10x10",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getPublicSettings();

  return (
    <html lang="en" dir="ltr">
      <body className="flex min-h-screen flex-col bg-white text-da-black antialiased">
        <main className="flex flex-1 flex-col">{children}</main>
        <Footer logoUrl={settings.logo_url} siteTitle={settings.site_title} />
      </body>
    </html>
  );
}
