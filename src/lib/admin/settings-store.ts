import type { CategoryAccent } from "@/lib/design-tokens";
import type { SettingRow } from "@/types";

export type FooterColumn = {
  title: string;
  links: { label: string; href: string }[];
};

export type FooterSocialLink = {
  label: string;
  href: string;
};

export type ProjectDetailTagDef = {
  key: string;
  label: string;
};

export const DEFAULT_PUBLIC_SITE_URL = "https://da10.direct-aid.org";

export const DEFAULT_FOOTER_SOCIAL: FooterSocialLink[] = [
  { label: "Facebook", href: "https://www.facebook.com/directaidorg/" },
  { label: "YouTube", href: "https://www.youtube.com/user/directaidorg" },
  { label: "X", href: "https://twitter.com/directaidorg/" },
  { label: "Instagram", href: "https://www.instagram.com/directaidorg/" },
  { label: "Telegram", href: "https://t.me/directaidorg" },
];

export const DEFAULT_FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "عن الجمعية",
    links: [
      { href: "https://direct-aid.org/cms/about-us-ar/", label: "نبذة عن الجمعية" },
      {
        href: "https://direct-aid.org/cms/about-us-ar-2/good-governance-in-direct-aid/",
        label: "الحوكمة",
      },
      { href: "https://direct-aid.org/cms/volunteer-ar/", label: "التطوع معنا" },
    ],
  },
  {
    title: "التبرع",
    links: [
      { href: "https://direct-aid.org/donate/", label: "تبرع الآن" },
      { href: "https://direct-aid.org/cms/how-to-donate-ar/", label: "كيف تتبرع" },
      { href: "https://direct-aid.org/cms/donation-policy-ar/", label: "سياسة التبرع" },
    ],
  },
  {
    title: "تواصل معنا",
    links: [
      { href: "https://direct-aid.org/cms/contact-us-ar/", label: "اتصل بنا" },
      {
        href: "https://direct-aid.org/cms/contact-us-ar/branches-in-kuwait-ar/",
        label: "فروع الكويت",
      },
      { href: "tel:1866888", label: "1866888" },
    ],
  },
];

export const DEFAULT_FOOTER_LEGAL =
  "مؤسسة خيرية كويتية غير ربحية — رقم التسجيل 1999/81";

export const DEFAULT_FOOTER_PRIVACY_URL =
  "https://direct-aid.org/cms/about-us-ar-2/good-governance-in-direct-aid/privacy-policy/";

export const DEFAULT_FOOTER_DONATION_POLICY_URL =
  "https://direct-aid.org/cms/donation-policy-ar/";

export const DEFAULT_HEADER_NAV = [
  { href: "/", label: "الرئيسية" },
  { href: "/#hero", label: "من نحن" },
  { href: "/#categories", label: "المشاريع" },
  { href: "/#impact", label: "التقارير" },
  { href: "/#transparency", label: "تواصل" },
];

export function settingsMap(rows: SettingRow[]) {
  return Object.fromEntries(rows.map((row) => [row.key, row.value ?? ""]));
}

export function parseJsonSetting<T>(value: string | undefined | null, fallback: T): T {
  if (!value?.trim()) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function parseFooterColumns(value: string | undefined | null): FooterColumn[] {
  const parsed = parseJsonSetting(value, DEFAULT_FOOTER_COLUMNS);
  if (isLegacyEnglishFooter(parsed)) return DEFAULT_FOOTER_COLUMNS;
  return parsed.length ? parsed : DEFAULT_FOOTER_COLUMNS;
}

const LEGACY_ENGLISH_FOOTER_TITLES = new Set([
  "Our work",
  "The Foundation",
  "Help and support",
  "Help and Support",
]);

function isLegacyEnglishFooter(columns: FooterColumn[]): boolean {
  return columns.some((column) => LEGACY_ENGLISH_FOOTER_TITLES.has(column.title));
}

export function sanitizePublicTagline(value: string | undefined | null): string | undefined {
  if (!value?.trim()) return undefined;
  const normalized = value.trim().toLowerCase();
  if (
    normalized.includes("empowering communities") ||
    normalized.includes("sustainable development and transparent humanitarian")
  ) {
    return undefined;
  }
  return value;
}

export function sanitizePublicCopyright(value: string | undefined | null): string | undefined {
  if (!value?.trim()) return undefined;
  if (value.trim().toLowerCase().includes("direct aid international. all rights reserved")) {
    return undefined;
  }
  return value;
}

export function parseFooterSocial(value: string | undefined | null): FooterSocialLink[] {
  return parseJsonSetting(value, DEFAULT_FOOTER_SOCIAL);
}

export function parseHeaderNav(value: string | undefined | null) {
  return parseJsonSetting(value, DEFAULT_HEADER_NAV);
}

export function parseCategoryAccentMap(
  value: string | undefined | null,
): Record<string, CategoryAccent> {
  return parseJsonSetting<Record<string, CategoryAccent>>(value, {});
}

export function parseProjectTagDefs(value: string | undefined | null): ProjectDetailTagDef[] {
  return parseJsonSetting<ProjectDetailTagDef[]>(value, []);
}

export function parseProjectTagValues(
  value: string | undefined | null,
): Record<string, Record<string, string>> {
  return parseJsonSetting<Record<string, Record<string, string>>>(value, {});
}

export function parsePublicBoolean(
  value: string | undefined | null,
  defaultValue = true,
): boolean {
  if (value == null || value === "") return defaultValue;
  return value === "true" || value === "1";
}
