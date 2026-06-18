const ARABIC_MONTHS: Record<string, number> = {
  يناير: 1,
  فبراير: 2,
  فبرير: 2,
  فبرابر: 2,
  مارس: 3,
  أبريل: 4,
  ابريل: 4,
  مايو: 5,
  يونيو: 6,
  يوليو: 7,
  أغسطس: 8,
  اغسطس: 8,
  سبتمبر: 9,
  أكتوبر: 10,
  اكتوبر: 10,
  نوفمبر: 11,
  ديسمبر: 12,
};

const ENGLISH_MONTHS: Record<string, number> = {
  jan: 1,
  january: 1,
  feb: 2,
  february: 2,
  mar: 3,
  march: 3,
  apr: 4,
  april: 4,
  may: 5,
  jun: 6,
  june: 6,
  jul: 7,
  july: 7,
  aug: 8,
  august: 8,
  sep: 9,
  sept: 9,
  september: 9,
  oct: 10,
  october: 10,
  nov: 11,
  november: 11,
  dec: 12,
  december: 12,
};

const ARABIC_MONTH_LABELS = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

export type ParsedProjectDate = {
  month: number;
  year: number;
  dateLabel: string;
};

/** Derive a lowercase ASCII slug key from an English category name. */
export function slugKeyFromEnglishName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 24);
}

/** Build slug: {categoryKey}{YY}{MM}{sequence} e.g. health190101 */
export function buildProjectSlug(
  categoryKey: string,
  year: number,
  month: number,
  sequence: number,
): string {
  const yy = String(year).slice(-2);
  const mm = String(month).padStart(2, "0");
  const seq = String(sequence).padStart(2, "0");
  return `${categoryKey}${yy}${mm}${seq}`;
}

export function formatArabicDateLabel(month: number, year: number): string {
  const label = ARABIC_MONTH_LABELS[month - 1] ?? String(month);
  return `${label} ${year}`;
}

export function parseProjectDateLabel(
  dateLabel: string | null | undefined,
  yearCode?: string | null,
  fallbackYear = 2020,
): ParsedProjectDate | null {
  const fromYearCode = parseYearCode(yearCode);
  if (fromYearCode) return fromYearCode;

  const text = (dateLabel ?? "").trim();
  if (!text) return null;

  const yearMatch = text.match(/\b(19|20)\d{2}\b/);
  const year = yearMatch ? Number(yearMatch[0]) : fallbackYear;

  for (const [name, month] of Object.entries(ARABIC_MONTHS)) {
    if (text.includes(name)) {
      return { month, year, dateLabel: formatArabicDateLabel(month, year) };
    }
  }

  const lower = text.toLowerCase();
  for (const [name, month] of Object.entries(ENGLISH_MONTHS)) {
    if (lower.includes(name)) {
      return { month, year, dateLabel: formatArabicDateLabel(month, year) };
    }
  }

  const numericMonth = text.match(/\b(0?[1-9]|1[0-2])\b/);
  if (numericMonth) {
    const month = Number(numericMonth[0]);
    return { month, year, dateLabel: formatArabicDateLabel(month, year) };
  }

  return { month: 1, year, dateLabel: formatArabicDateLabel(1, year) };
}

function parseYearCode(yearCode: string | null | undefined): ParsedProjectDate | null {
  const text = (yearCode ?? "").trim();
  if (!text) return null;

  const yearMatch = text.match(/\b(19|20)\d{2}\b/);
  if (!yearMatch) return null;
  const year = Number(yearMatch[0]);

  const upper = text.toUpperCase();
  for (const [name, month] of Object.entries(ENGLISH_MONTHS)) {
    if (upper.includes(name.toUpperCase())) {
      return { month, year, dateLabel: formatArabicDateLabel(month, year) };
    }
  }

  return { month: 1, year, dateLabel: formatArabicDateLabel(1, year) };
}

export function parseYearFromSlug(slug: string): number | null {
  const match = slug.match(/^(19|20)\d{2}/);
  return match ? Number(match[0]) : null;
}

export function countrySlugFromName(name: string): string {
  const map: Record<string, string> = {
    "سيراليون": "sierra-leone",
    "جزر القمر": "comoros",
    "السنغال": "senegal",
    "مالي": "mali",
    "النيجر": "niger",
    "بوركينا فاسو": "burkina-faso",
    "غانا": "ghana",
    "كينيا": "kenya",
    "إثيوبيا": "ethiopia",
    "اليمن": "yemen",
    "الصومال": "somalia",
    "موزمبيق": "mozambique",
    "مدغشقر": "madagascar",
    "تشاد": "chad",
    "غامبيا": "gambia",
    "بنين": "benin",
    "تنزانيا": "tanzania",
    "أوغندا": "uganda",
    "زامبيا": "zambia",
    "موريتانيا": "mauritania",
    "غينيا": "guinea",
    "السودان": "sudan",
    "ليبيريا": "liberia",
  };

  const trimmed = name.trim();
  if (map[trimmed]) return map[trimmed];

  return trimmed
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48) || "unknown";
}
