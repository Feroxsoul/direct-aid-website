"use client";

import { createContext, useContext, useEffect, useMemo } from "react";
import type { PublicCountryMaps } from "@/lib/public-countries";
import type { PublicContentSettings } from "@/lib/public-content";
import { localizePublicContent } from "@/lib/site-localize";
import type { SiteLang } from "@/lib/site-i18n";
import { useSiteLang } from "@/lib/site-i18n-context";

type PublicLocaleContextValue = {
  lang: SiteLang;
  content: PublicContentSettings;
  countryMaps: PublicCountryMaps;
};

const PublicLocaleContext = createContext<PublicLocaleContextValue | null>(null);

export function PublicLocaleProvider({
  content,
  countryMaps,
  children,
}: {
  content: PublicContentSettings;
  countryMaps: PublicCountryMaps;
  children: React.ReactNode;
}) {
  const { lang } = useSiteLang();

  const value = useMemo(
    () => ({
      lang,
      content: localizePublicContent(content, lang),
      countryMaps,
    }),
    [lang, content, countryMaps],
  );

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.title = value.content.site_title;
    }
  }, [value.content.site_title]);

  return <PublicLocaleContext.Provider value={value}>{children}</PublicLocaleContext.Provider>;
}

export function usePublicLocale() {
  const ctx = useContext(PublicLocaleContext);
  if (!ctx) {
    return {
      lang: "ar" as SiteLang,
      content: localizePublicContent(
        {
          logo_url: "",
          site_title: "مشاريع 10×10",
          site_description: "",
          public_site_url: "https://da10.direct-aid.org",
          share_label: "مشاركة",
          share_icon_url: "",
          hero_cta_label: "استكشف مهمتنا ←",
          transparency_title: "راقب الشفافية",
          transparency_text: "",
          whatsapp_number: "9651866888",
          whatsapp_subscribe_message: "اشتراك",
          whatsapp_subscribe_button: "اشتراك",
          whatsapp_header_url: "",
          impact_section_title: "آخر نشاط للأثر",
          impact_section_subtitle: "جميع المشاريع — مرّر للأسفل لتحميل المزيد.",
          categories_section_title: "فئات المشاريع",
          footer_tagline: "",
          footer_copyright: "",
          footer_legal_line: "",
          footer_privacy_url: "",
          footer_donation_policy_url: "",
          footer_columns: [],
          footer_social: [],
          show_whatsapp_block: true,
          show_footer: true,
        },
        "ar",
      ),
      countryMaps: { bySlug: {}, nameEnByAr: {} } satisfies PublicCountryMaps,
    };
  }
  return ctx;
}
