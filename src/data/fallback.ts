import type {
  HomeStatisticsData,
  HomepageCategory,
  PageMeta,
  SiteSettings,
} from "@/types";

const CDN =
  "https://cdn.prod.website-files.com/632a01171b125a156b28c038";

export const fallbackCategories: HomepageCategory[] = [
  {
    slug: "educational.10x10",
    titleLine1: "المشاريع",
    titleLine2: "التعليمية",
    iconUrl: `${CDN}/63610050d0f67a575ed3ecd6_Education.svg`,
    accent: "red",
  },
  {
    slug: "health-10x10",
    titleLine1: "المشاريع",
    titleLine2: "الصحية",
    iconUrl: `${CDN}/6361005099039888194fd661_Health.svg`,
    accent: "green",
  },
  {
    slug: "lmshryaa-ldaawy",
    titleLine1: "المشاريع",
    titleLine2: "الدعوية",
    iconUrl: `${CDN}/63610050e0286a567063baf5_Protection.svg`,
    accent: "olive",
  },
  {
    slug: "developments",
    titleLine1: "المشاريع",
    titleLine2: "التنموية",
    iconUrl: `${CDN}/638861263306178fc86cd368_Asset%20980.svg`,
    accent: "blue",
  },
  {
    slug: "lmshryaa-lgthy",
    titleLine1: "المشاريع",
    titleLine2: "الإغاثية",
    iconUrl: `${CDN}/63610050a4caac2871e76bf6_Food-Security.svg`,
    accent: "yellow",
  },
  {
    slug: "orphans",
    titleLine1: "مشاريع",
    titleLine2: "الأيتام",
    iconUrl: `${CDN}/6388608ccb240c085344fc04_Asset%20979.svg`,
    accent: "orange",
  },
  {
    slug: "waters-10x10",
    titleLine1: "مشاريع",
    titleLine2: "المياه",
    iconUrl: `${CDN}/6388662476d96e5b12680c98_Asset%20982.svg`,
    accent: "water",
  },
  {
    slug: "mosque",
    titleLine1: "مشاريع",
    titleLine2: "المساجد",
    iconUrl: `${CDN}/638864a7e20a48444517d8b4_Asset%20981.svg`,
    accent: "default",
  },
];

export const fallbackHomeStatistics: HomeStatisticsData = {
  value: "6,284,069",
  label: "انسان مستفيد",
  iconUrl: `${CDN}/6351161938c7c905d020e3c1_Group%2012%20Copy%202.svg`,
  illustrationUrl: `${CDN}/6354b9eae708dc82e540dd5b_Group%203.svg`,
  introText:
    "مشروع البركة 10×10 من باب مشاركة الأثر معكم نقوم برفع التقارير الخاصة في هذا الموقع بشكل دوري",
};

export const fallbackSettings: SiteSettings = {
  site_title: "10x10 مشاريع",
  site_description: "10x10 مشاريع",
  share_label: "المشاركة",
  logo_url: `${CDN}/64c8cde2258c815c760717a9_small.png`,
  share_icon_url: `${CDN}/6354b9e95ee93e437d920d4b_Share.svg`,
};

export const fallbackPages: Record<string, PageMeta> = {
  home: {
    title: "10x10 مشاريع",
    meta_description: "10x10 مشاريع",
  },
  "category-listing": {
    title: "قائمة المشاريع",
    meta_description: "قائمة مشاريع حسب الفئة",
  },
};
