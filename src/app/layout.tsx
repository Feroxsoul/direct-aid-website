import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Footer } from "@/components/layout/Footer";
import { PublicLocaleProvider } from "@/lib/public-locale-context";
import { SiteLangRoot } from "@/components/layout/SiteLangRoot";
import { BRAND_10X10_LOGO_SVG } from "@/lib/brand";
import { getPublicCountryMaps } from "@/lib/public-countries";
import { getPublicContentSettings } from "@/lib/public-content";
import { parseSiteLang, SITE_LANG_COOKIE } from "@/lib/site-lang-cookie";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getPublicContentSettings();

  return {
    metadataBase: new URL(content.public_site_url),
    title: "مشاريع العون المباشر 10×10",
    description: "مشاريع العون المباشر 10×10",
    icons: {
      icon: BRAND_10X10_LOGO_SVG,
      shortcut: BRAND_10X10_LOGO_SVG,
      apple: BRAND_10X10_LOGO_SVG,
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
  const [content, countryMaps] = await Promise.all([
    getPublicContentSettings(),
    getPublicCountryMaps(),
  ]);
  const cookieStore = await cookies();
  const initialLang = parseSiteLang(cookieStore.get(SITE_LANG_COOKIE)?.value);

  return (
    <html
      lang={initialLang}
      dir={initialLang === "ar" ? "rtl" : "ltr"}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col bg-white text-da-black antialiased">
        <SiteLangRoot initialLang={initialLang}>
          <PublicLocaleProvider content={content} countryMaps={countryMaps}>
            <main className="flex flex-1 flex-col">{children}</main>
            {content.show_footer ? (
              <Footer
                logoUrl={content.logo_url}
                columns={content.footer_columns}
                socialLinks={content.footer_social}
              />
            ) : null}
          </PublicLocaleProvider>
        </SiteLangRoot>
      </body>
    </html>
  );
}
