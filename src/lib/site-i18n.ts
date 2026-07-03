export const SITE_LANG_STORAGE_KEY = "site-lang";

export type SiteLang = "ar" | "en";

type Dict = Record<string, string>;

const en: Dict = {
  "lang.switchToEn": "English",
  "lang.switchToAr": "العربية",
  "lang.aria": "Change language",
  "share": "Share",
  "whatsapp": "WhatsApp",
  "hero.cta": "Explore our mission →",
  "categories.aria": "Project categories",
  "impact.aria": "Latest impact",
  "impact.allInCategory": "All projects ({count}) in {category}.",
  "impact.subtitle": "All projects — scroll down to load more. ({count} projects)",
  "impact.showAll": "Show all projects →",
  "impact.empty": "No projects in this category yet.",
  "impact.loading": "Loading more…",
  "project.back": "← Back to projects",
  "project.viewDetails": "View details",
  "project.more": "+ More",
  "project.moreAria": "More — {title}",
  "project.details": "Project details",
  "project.listAria": "Project list",
  "project.galleryTitle": "Project photos",
  "project.galleryImage": "{title} — image {index}",
  "footer.privacy": "Privacy policy",
  "footer.donation": "Donation policy",
  "transparency.aria": "Transparency",
};

const ar: Dict = {
  "lang.switchToEn": "English",
  "lang.switchToAr": "العربية",
  "lang.aria": "تغيير اللغة",
  "share": "مشاركة",
  "whatsapp": "واتساب",
  "hero.cta": "استكشف مهمتنا ←",
  "categories.aria": "فئات المشاريع",
  "impact.aria": "آخر الأثر",
  "impact.allInCategory": "جميع المشاريع ({count}) في {category}.",
  "impact.subtitle": "جميع المشاريع — مرّر للأسفل لتحميل المزيد. ({count} مشروع)",
  "impact.showAll": "عرض كل المشاريع ←",
  "impact.empty": "لا توجد مشاريع في هذه الفئة حالياً.",
  "impact.loading": "جاري تحميل المزيد…",
  "project.back": "→ رجوع للمشاريع",
  "project.viewDetails": "عرض التفاصيل",
  "project.more": "+ المزيد",
  "project.moreAria": "المزيد — {title}",
  "project.details": "تفاصيل المشروع",
  "project.listAria": "قائمة المشاريع",
  "project.galleryTitle": "صور المشروع",
  "project.galleryImage": "{title} — صورة {index}",
  "footer.privacy": "سياسة الخصوصية",
  "footer.donation": "سياسة التبرع",
  "transparency.aria": "الشفافية",
};

const dictionaries: Record<SiteLang, Dict> = { en, ar };

export function siteT(
  lang: SiteLang,
  key: string,
  vars?: Record<string, string | number>,
): string {
  let text = dictionaries[lang][key] ?? dictionaries.en[key] ?? key;
  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      text = text.replace(new RegExp(`\\{${name}\\}`, "g"), String(value));
    }
  }
  return text;
}
