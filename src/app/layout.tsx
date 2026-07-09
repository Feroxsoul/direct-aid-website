import type { Metadata } from "next";
import Script from "next/script";
import { cookies, headers } from "next/headers";
import { Footer } from "@/components/layout/Footer";
import { PublicLocaleProvider } from "@/lib/public-locale-context";
import { SiteLangRoot } from "@/components/layout/SiteLangRoot";
import { parseAdminLang } from "@/lib/admin-lang-cookie";
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
  const requestHeaders = await headers();
  const adminLangHeader = requestHeaders.get("x-admin-lang");
  const initialLang =
    adminLangHeader !== null
      ? parseAdminLang(adminLangHeader)
      : parseSiteLang(cookieStore.get(SITE_LANG_COOKIE)?.value);

  return (
    <html
      lang={initialLang}
      dir={initialLang === "ar" ? "rtl" : "ltr"}
      suppressHydrationWarning
    >
      <head>
        <Script id="admin-lang-bootstrap" strategy="beforeInteractive">
          {`(function(){try{if(!location.pathname.startsWith("/admin"))return;var l=localStorage.getItem("admin-lang");if(l!=="en"&&l!=="ar")l="en";document.documentElement.setAttribute("lang",l);document.documentElement.setAttribute("dir",l==="ar"?"rtl":"ltr");document.cookie="admin-lang="+l+"; Path=/; Max-Age=31536000; SameSite=Lax"}catch(e){}})();`}
        </Script>
      </head>
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
