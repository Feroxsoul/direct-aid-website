import type { FooterColumn } from "@/lib/admin/settings-store";
import {
  DEFAULT_FOOTER_COLUMNS,
  DEFAULT_HEADER_NAV,
  parseFooterColumns,
  parseHeaderNav,
  parseJsonSetting,
} from "@/lib/admin/settings-store";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type PublicContentSettings = {
  logo_url: string;
  site_title: string;
  site_description: string;
  share_label: string;
  share_icon_url: string;
  hero_cta_label: string;
  donate_label: string;
  donate_url: string;
  transparency_title: string;
  transparency_text: string;
  newsletter_placeholder: string;
  newsletter_button: string;
  impact_section_title: string;
  impact_section_subtitle: string;
  categories_section_title: string;
  footer_tagline: string;
  footer_copyright: string;
  header_nav: { href: string; label: string }[];
  footer_columns: FooterColumn[];
};

const DEFAULTS: PublicContentSettings = {
  logo_url: "",
  site_title: "مشاريع 10×10",
  site_description: "",
  share_label: "المشاركة",
  share_icon_url: "",
  hero_cta_label: "استكشف مهمتنا ←",
  donate_label: "تبرع الآن",
  donate_url: "https://directaid.org/donate",
  transparency_title: "راقب الشفافية",
  transparency_text:
    "ابقَ على اطلاع بآخر مستجدات عملياتنا الميدانية. نؤمن بالمساءلة الكاملة عن كل تبرع وكل حياة تتأثر من خلال مبادرة البركة 10×10.",
  newsletter_placeholder: "أدخل بريدك الإلكتروني",
  newsletter_button: "انضم للمجتمع",
  impact_section_title: "آخر نشاط للأثر",
  impact_section_subtitle: "مشروع مميز من كل فئة — اختر فئة أعلاه لعرض المزيد.",
  categories_section_title: "فئات المشاريع",
  footer_tagline:
    "تمكين المجتمعات من خلال التنمية المستدامة والعمل الإنساني الشفاف في جميع أنحاء العالم.",
  footer_copyright: "العون المباشر الدولي. جميع الحقوق محفوظة.",
  header_nav: DEFAULT_HEADER_NAV,
  footer_columns: DEFAULT_FOOTER_COLUMNS,
};

export async function getPublicContentSettings(): Promise<PublicContentSettings> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return DEFAULTS;

  const { data } = await supabase.from("settings").select("key, value").eq("is_public", true);
  const map = Object.fromEntries((data ?? []).map((row) => [row.key, row.value ?? ""]));

  return {
    ...DEFAULTS,
    logo_url: map.logo_url ?? DEFAULTS.logo_url,
    site_title: map.site_title ?? DEFAULTS.site_title,
    site_description: map.site_description ?? DEFAULTS.site_description,
    share_label: map.share_label ?? DEFAULTS.share_label,
    share_icon_url: map.share_icon_url ?? DEFAULTS.share_icon_url,
    hero_cta_label: map.hero_cta_label ?? DEFAULTS.hero_cta_label,
    donate_label: map.donate_label ?? DEFAULTS.donate_label,
    donate_url: map.donate_url ?? DEFAULTS.donate_url,
    transparency_title: map.transparency_title ?? DEFAULTS.transparency_title,
    transparency_text: map.transparency_text ?? DEFAULTS.transparency_text,
    newsletter_placeholder: map.newsletter_placeholder ?? DEFAULTS.newsletter_placeholder,
    newsletter_button: map.newsletter_button ?? DEFAULTS.newsletter_button,
    impact_section_title: map.impact_section_title ?? DEFAULTS.impact_section_title,
    impact_section_subtitle: map.impact_section_subtitle ?? DEFAULTS.impact_section_subtitle,
    categories_section_title: map.categories_section_title ?? DEFAULTS.categories_section_title,
    footer_tagline: map.footer_tagline ?? DEFAULTS.footer_tagline,
    footer_copyright: map.footer_copyright ?? DEFAULTS.footer_copyright,
    header_nav: parseHeaderNav(map.header_nav_json),
    footer_columns: parseFooterColumns(map.footer_columns_json),
  };
}

export function parseProjectTagValuesFromSettings(value: string | undefined | null) {
  return parseJsonSetting<Record<string, Record<string, string>>>(value, {});
}
