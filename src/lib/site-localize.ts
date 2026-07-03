import type { FooterColumn } from "@/lib/admin/settings-store";
import type { PublicContentSettings } from "@/lib/public-content";
import type { SiteLang } from "@/lib/site-i18n";
import type { HomeStatisticsData, HomepageCategory, ProjectCardData } from "@/types";

const AR_MONTHS: Record<string, string> = {
  يناير: "January",
  فبراير: "February",
  مارس: "March",
  أبريل: "April",
  ابريل: "April",
  مايو: "May",
  يونيو: "June",
  يوليو: "July",
  أغسطس: "August",
  اغسطس: "August",
  سبتمبر: "September",
  أكتوبر: "October",
  اكتوبر: "October",
  نوفمبر: "November",
  ديسمبر: "December",
};

const AR_MONTH_SHORT: Record<string, string> = {
  ينا: "Jan",
  فبر: "Feb",
  مار: "Mar",
  أبر: "Apr",
  ابري: "Apr",
  ماي: "May",
  يون: "Jun",
  يول: "Jul",
  أغس: "Aug",
  اغس: "Aug",
  سبت: "Sep",
  أكت: "Oct",
  اكت: "Oct",
  نوف: "Nov",
  ديس: "Dec",
};

export const CATEGORY_NAME_EN: Record<string, string> = {
  "health-10x10": "Health",
  "educational.10x10": "Education",
  "lmshryaa-ldaawy": "Dawah",
  developments: "Development",
  "lmshryaa-lgthy": "Relief",
  orphans: "Orphans",
  "waters-10x10": "Water",
  mosque: "Mosque",
};

export const PUBLIC_CONTENT_EN: Pick<
  PublicContentSettings,
  | "site_title"
  | "site_description"
  | "hero_cta_label"
  | "transparency_title"
  | "transparency_text"
  | "whatsapp_subscribe_message"
  | "whatsapp_subscribe_button"
  | "impact_section_title"
  | "impact_section_subtitle"
  | "categories_section_title"
  | "footer_tagline"
  | "footer_copyright"
  | "footer_legal_line"
  | "footer_privacy_url"
  | "footer_donation_policy_url"
> = {
  site_title: "Direct Aid 10×10 Projects",
  site_description: "Direct Aid 10×10 humanitarian projects",
  hero_cta_label: "Explore our mission →",
  transparency_title: "Track transparency",
  transparency_text:
    "Stay informed about the latest updates from our field operations. We believe in full accountability for every donation and every life impacted through the Baraka 10×10 initiative.",
  whatsapp_subscribe_message: "Subscribe",
  whatsapp_subscribe_button: "Subscribe",
  impact_section_title: "Latest impact",
  impact_section_subtitle: "All projects — scroll down to load more.",
  categories_section_title: "Project categories",
  footer_tagline:
    "Direct Aid Society — a Kuwaiti charity delivering humanitarian and development aid in more than 30 countries.",
  footer_copyright: "Direct Aid Society. All rights reserved.",
  footer_legal_line: "Registered Kuwaiti non-profit charity — Registration No. 1999/81",
  footer_privacy_url:
    "https://direct-aid.org/cms/about-us/good-governance-in-direct-aid/privacy-policy/",
  footer_donation_policy_url: "https://direct-aid.org/cms/donation-policy/",
};

export const FOOTER_COLUMNS_EN: FooterColumn[] = [
  {
    title: "About us",
    links: [
      { href: "https://direct-aid.org/cms/about-us/", label: "About Direct Aid" },
      {
        href: "https://direct-aid.org/cms/about-us/good-governance-in-direct-aid/",
        label: "Governance",
      },
      { href: "https://direct-aid.org/cms/volunteer/", label: "Volunteer with us" },
    ],
  },
  {
    title: "Donate",
    links: [
      { href: "https://direct-aid.org/donate/", label: "Donate now" },
      { href: "https://direct-aid.org/cms/how-to-donate/", label: "How to donate" },
      { href: "https://direct-aid.org/cms/donation-policy/", label: "Donation policy" },
    ],
  },
  {
    title: "Contact",
    links: [
      { href: "https://direct-aid.org/cms/contact-us/", label: "Contact us" },
      {
        href: "https://direct-aid.org/cms/contact-us/branches-in-kuwait/",
        label: "Kuwait branches",
      },
      { href: "tel:1866888", label: "1866888" },
    ],
  },
];

export const HOME_STATISTICS_EN: Pick<HomeStatisticsData, "label" | "introText"> = {
  label: "people helped",
  introText:
    "The Baraka 10×10 project — we share impact with you by publishing field reports on this site regularly.",
};

export function localizeDateLabel(dateLabel: string, lang: SiteLang): string {
  if (lang === "ar" || !dateLabel.trim()) return dateLabel;

  const match = dateLabel.trim().match(/^(\S+)\s+(\d{4})$/);
  if (!match) return dateLabel;

  const [, monthAr, year] = match;
  const monthEn = AR_MONTHS[monthAr];
  return monthEn ? `${monthEn} ${year}` : dateLabel;
}

export function localizeYearCode(yearCode: string, lang: SiteLang): string {
  if (lang === "ar" || !yearCode.trim()) return yearCode;

  const match = yearCode.trim().match(/^(\d{4})\s+(\S+)$/);
  if (!match) return yearCode;

  const [, year, monthAr] = match;
  const monthEn = AR_MONTH_SHORT[monthAr] ?? AR_MONTHS[monthAr]?.slice(0, 3);
  return monthEn ? `${monthEn} ${year}` : yearCode;
}

export function formatEnglishCountryName(name: string): string {
  return name
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function localizeCategory(category: HomepageCategory, lang: SiteLang): HomepageCategory {
  if (lang === "ar") return category;

  const nameEn =
    category.nameEn?.trim() ||
    CATEGORY_NAME_EN[category.slug] ||
    category.titleLine2 ||
    category.titleLine1;

  return {
    ...category,
    titleLine1: nameEn,
    titleLine2: "Projects",
  };
}

export function getCategoryShortLabel(category: HomepageCategory, lang: SiteLang): string {
  if (lang === "ar") return category.titleLine2 || category.titleLine1;
  return (
    category.nameEn?.trim() ||
    CATEGORY_NAME_EN[category.slug] ||
    category.titleLine2 ||
    category.titleLine1
  );
}

export function localizePublicContent(
  content: PublicContentSettings,
  lang: SiteLang,
): PublicContentSettings {
  if (lang === "ar") return content;

  return {
    ...content,
    site_title: PUBLIC_CONTENT_EN.site_title,
    site_description: PUBLIC_CONTENT_EN.site_description,
    hero_cta_label:
      content.hero_cta_label_en ||
      content.hero_cta_label ||
      PUBLIC_CONTENT_EN.hero_cta_label,
    transparency_title:
      content.transparency_title_en ||
      content.transparency_title ||
      PUBLIC_CONTENT_EN.transparency_title,
    transparency_text:
      content.transparency_text_en ||
      content.transparency_text ||
      PUBLIC_CONTENT_EN.transparency_text,
    whatsapp_subscribe_message:
      content.whatsapp_subscribe_message_en ||
      content.whatsapp_subscribe_message ||
      PUBLIC_CONTENT_EN.whatsapp_subscribe_message,
    whatsapp_subscribe_button:
      content.whatsapp_subscribe_button_en ||
      content.whatsapp_subscribe_button ||
      PUBLIC_CONTENT_EN.whatsapp_subscribe_button,
    impact_section_title:
      content.impact_section_title_en ||
      content.impact_section_title ||
      PUBLIC_CONTENT_EN.impact_section_title,
    impact_section_subtitle:
      content.impact_section_subtitle_en ||
      content.impact_section_subtitle ||
      PUBLIC_CONTENT_EN.impact_section_subtitle,
    categories_section_title:
      content.categories_section_title_en ||
      content.categories_section_title ||
      PUBLIC_CONTENT_EN.categories_section_title,
    footer_tagline: PUBLIC_CONTENT_EN.footer_tagline,
    footer_copyright: PUBLIC_CONTENT_EN.footer_copyright,
    footer_legal_line: PUBLIC_CONTENT_EN.footer_legal_line,
    footer_privacy_url: PUBLIC_CONTENT_EN.footer_privacy_url,
    footer_donation_policy_url: PUBLIC_CONTENT_EN.footer_donation_policy_url,
    footer_columns:
      content.footer_columns.length > 0 ? FOOTER_COLUMNS_EN : content.footer_columns,
  };
}

export function localizeHomeStatistics(
  stats: HomeStatisticsData,
  lang: SiteLang,
): HomeStatisticsData {
  if (lang === "ar") return stats;

  return {
    ...stats,
    label: stats.labelEn || stats.label || HOME_STATISTICS_EN.label,
    introText: stats.introTextEn || stats.introText || HOME_STATISTICS_EN.introText,
  };
}

export function localizeProjectCard(
  project: ProjectCardData,
  lang: SiteLang,
  options: {
    countryBySlug?: Record<string, { name_en: string; name_ar: string }>;
    countryByNameAr?: Record<string, string>;
    translated?: Partial<Pick<ProjectCardData, "title" | "description" | "categoryLabel">> & {
      statistics?: { label?: string };
    };
  } = {},
): ProjectCardData {
  if (lang === "ar") return project;

  const { countryBySlug, countryByNameAr, translated } = options;
  let locationEn: string | undefined;

  if (project.countrySlug && countryBySlug?.[project.countrySlug]) {
    locationEn = formatEnglishCountryName(countryBySlug[project.countrySlug].name_en);
  } else if (project.location && countryByNameAr?.[project.location.trim()]) {
    locationEn = countryByNameAr[project.location.trim()];
  }

  const title =
    project.titleEn?.trim() ||
    translated?.title ||
    project.title;
  const description =
    project.descriptionEn?.trim() ||
    translated?.description ||
    project.description;
  const statLabel =
    project.statLabelEn?.trim() ||
    translated?.statistics?.label ||
    project.statistics?.label;

  return {
    ...project,
    title,
    description,
    categoryLabel:
      translated?.categoryLabel ??
      (project.categorySlug ? CATEGORY_NAME_EN[project.categorySlug] : undefined) ??
      project.categoryLabel,
    location: locationEn ?? project.location,
    metadata: {
      ...project.metadata,
      dateLabel: localizeDateLabel(project.metadata.dateLabel, lang),
      yearCode: project.metadata.yearCode
        ? localizeYearCode(project.metadata.yearCode, lang)
        : undefined,
    },
    statistics: project.statistics
      ? {
          value: project.statistics.value,
          label: statLabel ?? project.statistics.label,
        }
      : undefined,
  };
}
