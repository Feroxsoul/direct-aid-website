#!/usr/bin/env node
/**
 * Migrates all project slugs to {categoryKey}{YY}{MM}{seq} format.
 * Updates src/data/webflow-projects.json and writes slug-map.json.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const catalogPath = join(root, "src/data/webflow-projects.json");
const mapPath = join(root, "src/data/project-slug-map.json");

const CATEGORY_KEYS = {
  "health-10x10": "health",
  "educational.10x10": "education",
  "lmshryaa-ldaawy": "dawah",
  developments: "development",
  "lmshryaa-lgthy": "relief",
  orphans: "orphans",
  "waters-10x10": "water",
  mosque: "mosque",
};

const ARABIC_MONTHS = {
  يناير: 1, فبراير: 2, فبرير: 2, فبرابر: 2, مارس: 3,
  أبريل: 4, ابريل: 4, مايو: 5, يونيو: 6, يوليو: 7,
  أغسطس: 8, اغسطس: 8, سبتمبر: 9, أكتوبر: 10, اكتوبر: 10,
  نوفمبر: 11, ديسمبر: 12,
};

const EN_MONTHS = {
  jan: 1, january: 1, feb: 2, february: 2, mar: 3, march: 3,
  apr: 4, april: 4, may: 5, jun: 6, june: 6, jul: 7, july: 7,
  aug: 8, august: 8, sep: 9, sept: 9, september: 9,
  oct: 10, october: 10, nov: 11, november: 11, dec: 12, december: 12,
};

const AR_LABELS = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

function parseDate(row) {
  const text = (row.date_label ?? "").trim();
  const yearMatch = text.match(/\b(19|20)\d{2}\b/) ?? row.slug?.match(/^(19|20)\d{2}/);
  const year = yearMatch ? Number(yearMatch[0].replace(/\D/g, "") || yearMatch[0]) : 2020;

  for (const [name, month] of Object.entries(ARABIC_MONTHS)) {
    if (text.includes(name)) return { month, year };
  }
  const lower = text.toLowerCase();
  for (const [name, month] of Object.entries(EN_MONTHS)) {
    if (lower.includes(name)) return { month, year };
  }
  if (row.year_code) {
    const yc = String(row.year_code);
    const ym = yc.match(/\b(19|20)\d{2}\b/);
    if (ym) {
      const y = Number(ym[0]);
      for (const [name, month] of Object.entries(EN_MONTHS)) {
        if (yc.toLowerCase().includes(name)) return { month, year: y };
      }
      return { month: 1, year: y };
    }
  }
  const slugYear = row.slug?.match(/^(19|20)\d{2}/);
  if (slugYear) return { month: 1, year: Number(slugYear[0]) };
  return { month: 1, year };
}

function buildSlug(key, year, month, seq) {
  const yy = String(year).slice(-2);
  const mm = String(month).padStart(2, "0");
  const s = String(seq).padStart(2, "0");
  return `${key}${yy}${mm}${s}`;
}

const projects = JSON.parse(readFileSync(catalogPath, "utf8"));
const slugMap = {};
const buckets = new Map();

for (const row of projects) {
  const catKey = CATEGORY_KEYS[row.category_slug] ?? "project";
  const { month, year } = parseDate(row);
  const bucketKey = `${catKey}:${year}:${month}`;
  if (!buckets.has(bucketKey)) buckets.set(bucketKey, []);
  buckets.get(bucketKey).push({ row, catKey, month, year });
}

for (const [, items] of buckets) {
  items.sort((a, b) => a.row.sort_order - b.row.sort_order);
  items.forEach((item, index) => {
    const newSlug = buildSlug(item.catKey, item.year, item.month, index + 1);
    slugMap[item.row.slug] = newSlug;
    item.row.slug = newSlug;
    item.row.project_month = item.month;
    item.row.project_year = item.year;
    item.row.date_label = `${AR_LABELS[item.month - 1]} ${item.year}`;
    item.row.year_code = `${item.year} ${AR_LABELS[item.month - 1].toUpperCase().slice(0, 3)}`;
  });
}

// Re-sort by year/month desc (newest first) for display order via created_at proxy
projects.sort((a, b) => {
  const ay = a.project_year ?? 0;
  const by = b.project_year ?? 0;
  if (by !== ay) return by - ay;
  return (b.project_month ?? 0) - (a.project_month ?? 0);
});

projects.forEach((row, index) => {
  row.sort_order = index + 1;
});

writeFileSync(catalogPath, JSON.stringify(projects, null, 2) + "\n");
writeFileSync(mapPath, JSON.stringify(slugMap, null, 2) + "\n");

const COUNTRY_SLUGS = {
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
  "الكاميرون": "cameroon",
  "توجو": "togo",
  "النيجر": "niger",
};

function countrySlug(name) {
  const trimmed = name.trim();
  return COUNTRY_SLUGS[trimmed] ?? trimmed.toLowerCase().replace(/\s+/g, "-").slice(0, 48);
}

const countries = new Map();
for (const row of projects) {
  const loc = (row.location ?? "").trim();
  if (!loc) continue;
  if (!countries.has(loc)) {
    const slug = countrySlug(loc);
    countries.set(loc, { slug, name_ar: loc, name_en: COUNTRY_SLUGS[loc] ?? loc });
  }
  row.country_slug = countries.get(loc).slug;
}

writeFileSync(catalogPath, JSON.stringify(projects, null, 2) + "\n");

const countriesSeed = [...countries.values()].map((c, i) => ({
  slug: c.slug,
  name_en: c.name_en,
  name_ar: c.name_ar,
  sort_order: i + 1,
  is_active: true,
}));

writeFileSync(
  join(root, "supabase/seed-countries.json"),
  JSON.stringify(countriesSeed, null, 2) + "\n",
);

console.log(`Migrated ${projects.length} project slugs.`);
console.log(`Extracted ${countriesSeed.length} countries → supabase/seed-countries.json`);
console.log(`Slug map → src/data/project-slug-map.json`);
