import type { CategoryAccent } from "@/lib/design-tokens";
import type { SettingRow } from "@/types";

export type FooterColumn = {
  title: string;
  links: { label: string; href: string }[];
};

export type ProjectDetailTagDef = {
  key: string;
  label: string;
};

export const DEFAULT_FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "أعمالنا",
    links: [
      { href: "/#categories", label: "فئات المشاريع" },
      { href: "/#impact", label: "آخر الأثر" },
      { href: "https://directaid.org", label: "البرامج العالمية" },
    ],
  },
  {
    title: "المؤسسة",
    links: [
      { href: "https://directaid.org", label: "عن العون المباشر" },
      { href: "/#transparency", label: "الشفافية" },
    ],
  },
  {
    title: "المساعدة والدعم",
    links: [
      { href: "https://directaid.org", label: "تواصل معنا" },
      { href: "https://directaid.org/donate", label: "تبرع الآن" },
      { href: "/#transparency", label: "النشرة البريدية" },
    ],
  },
];

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
  return parseJsonSetting(value, DEFAULT_FOOTER_COLUMNS);
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
