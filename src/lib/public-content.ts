import type { FooterColumn, FooterSocialLink } from "@/lib/admin/settings-store";
import {
  DEFAULT_FOOTER_COLUMNS,
  DEFAULT_FOOTER_DONATION_POLICY_URL,
  DEFAULT_FOOTER_LEGAL,
  DEFAULT_FOOTER_PRIVACY_URL,
  DEFAULT_FOOTER_SOCIAL,
  DEFAULT_PUBLIC_SITE_URL,
  parseFooterColumns,
  parseFooterSocial,
  parseJsonSetting,
  parsePublicBoolean,
  sanitizePublicCopyright,
  sanitizePublicTagline,
} from "@/lib/admin/settings-store";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type PublicContentSettings = {
  logo_url: string;
  site_title: string;
  site_description: string;
  public_site_url: string;
  share_label: string;
  share_icon_url: string;
  hero_cta_label: string;
  transparency_title: string;
  transparency_text: string;
  whatsapp_number: string;
  whatsapp_subscribe_message: string;
  whatsapp_subscribe_button: string;
  impact_section_title: string;
  impact_section_subtitle: string;
  categories_section_title: string;
  footer_tagline: string;
  footer_copyright: string;
  footer_legal_line: string;
  footer_privacy_url: string;
  footer_donation_policy_url: string;
  footer_columns: FooterColumn[];
  footer_social: FooterSocialLink[];
  show_whatsapp_block: boolean;
  show_footer: boolean;
};

const DEFAULTS: PublicContentSettings = {
  logo_url: "",
  site_title: "مشاريع 10×10",
  site_description: "",
  public_site_url: DEFAULT_PUBLIC_SITE_URL,
  share_label: "مشاركة",
  share_icon_url: "",
  hero_cta_label: "استكشف مهمتنا ←",
  transparency_title: "راقب الشفافية",
  transparency_text:
    "ابقَ على اطلاع بآخر مستجدات عملياتنا الميدانية. نؤمن بالمساءلة الكاملة عن كل تبرع وكل حياة تتأثر من خلال مبادرة البركة 10×10.",
  whatsapp_number: "9651866888",
  whatsapp_subscribe_message: "اشتراك",
  whatsapp_subscribe_button: "اشتراك",
  impact_section_title: "آخر نشاط للأثر",
  impact_section_subtitle: "جميع المشاريع — مرّر للأسفل لتحميل المزيد.",
  categories_section_title: "فئات المشاريع",
  footer_tagline:
    "جمعية العون المباشر — مؤسسة خيرية كويتية تعمل على تقديم العون الإنساني والتنموي في أكثر من 30 دولة.",
  footer_copyright: "جمعية العون المباشر. جميع الحقوق محفوظة.",
  footer_legal_line: DEFAULT_FOOTER_LEGAL,
  footer_privacy_url: DEFAULT_FOOTER_PRIVACY_URL,
  footer_donation_policy_url: DEFAULT_FOOTER_DONATION_POLICY_URL,
  footer_columns: DEFAULT_FOOTER_COLUMNS,
  footer_social: DEFAULT_FOOTER_SOCIAL,
  show_whatsapp_block: true,
  show_footer: true,
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
    public_site_url: map.public_site_url ?? DEFAULTS.public_site_url,
    share_label: map.share_label ?? DEFAULTS.share_label,
    share_icon_url: map.share_icon_url ?? DEFAULTS.share_icon_url,
    hero_cta_label: map.hero_cta_label ?? DEFAULTS.hero_cta_label,
    transparency_title: map.transparency_title ?? DEFAULTS.transparency_title,
    transparency_text: map.transparency_text ?? DEFAULTS.transparency_text,
    whatsapp_number: map.whatsapp_number ?? DEFAULTS.whatsapp_number,
    whatsapp_subscribe_message:
      map.whatsapp_subscribe_message ?? DEFAULTS.whatsapp_subscribe_message,
    whatsapp_subscribe_button:
      map.whatsapp_subscribe_button ?? DEFAULTS.whatsapp_subscribe_button,
    impact_section_title: map.impact_section_title ?? DEFAULTS.impact_section_title,
    impact_section_subtitle: map.impact_section_subtitle ?? DEFAULTS.impact_section_subtitle,
    categories_section_title: map.categories_section_title ?? DEFAULTS.categories_section_title,
    footer_tagline: sanitizePublicTagline(map.footer_tagline) ?? DEFAULTS.footer_tagline,
    footer_copyright: sanitizePublicCopyright(map.footer_copyright) ?? DEFAULTS.footer_copyright,
    footer_legal_line: map.footer_legal_line ?? DEFAULTS.footer_legal_line,
    footer_privacy_url: map.footer_privacy_url ?? DEFAULTS.footer_privacy_url,
    footer_donation_policy_url:
      map.footer_donation_policy_url ?? DEFAULTS.footer_donation_policy_url,
    footer_columns: parseFooterColumns(map.footer_columns_json),
    footer_social: parseFooterSocial(map.footer_social_json),
    show_whatsapp_block: parsePublicBoolean(map.show_whatsapp_block, true),
    show_footer: parsePublicBoolean(map.show_footer, true),
  };
}

export function parseProjectTagValuesFromSettings(value: string | undefined | null) {
  return parseJsonSetting<Record<string, Record<string, string>>>(value, {});
}
