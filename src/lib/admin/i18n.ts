export type AdminLang = "en" | "ar";

export const ADMIN_LANG_STORAGE_KEY = "admin-lang";

type Dict = Record<string, string>;

const en: Dict = {
  "nav.homepage": "Home Page",
  "nav.categories": "Categories",
  "nav.projects": "Projects",
  "nav.footer": "Footer",
  "nav.logs": "Activity Log",
  "nav.settings": "Settings",
  "nav.general": "General Settings",
  "nav.users": "User Management",
  "nav.roles": "Roles",
  "nav.notifications": "Notifications",
  "shell.menu": "Open menu",
  "shell.theme": "Toggle theme",
  "shell.lang.en": "Switch to English",
  "shell.lang.ar": "Switch to Arabic",
  "page.dashboard": "Dashboard",
  "page.projects": "Projects",
  "page.users": "User Management",
  "page.categories": "Categories",
  "page.homepage": "Home Page",
  "page.footer": "Footer",
  "page.roles": "Roles",
  "page.logs": "Activity Log",
  "page.settings": "Settings",
  "page.notifications": "Notifications",
  "page.profile": "My Profile",
  "sidebar.sub": "Direct Aid · Admin",
};

const ar: Dict = {
  "nav.homepage": "الصفحة الرئيسية",
  "nav.categories": "الفئات",
  "nav.projects": "المشاريع",
  "nav.footer": "التذييل",
  "nav.logs": "سجل النشاط",
  "nav.settings": "الإعدادات",
  "nav.general": "الإعدادات العامة",
  "nav.users": "إدارة المستخدمين",
  "nav.roles": "الأدوار",
  "nav.notifications": "الإشعارات",
  "shell.menu": "فتح القائمة",
  "shell.theme": "تبديل المظهر",
  "shell.lang.en": "التبديل إلى الإنجليزية",
  "shell.lang.ar": "التبديل إلى العربية",
  "page.dashboard": "لوحة التحكم",
  "page.projects": "المشاريع",
  "page.users": "إدارة المستخدمين",
  "page.categories": "الفئات",
  "page.homepage": "الصفحة الرئيسية",
  "page.footer": "التذييل",
  "page.roles": "الأدوار",
  "page.logs": "سجل النشاط",
  "page.settings": "الإعدادات",
  "page.notifications": "الإشعارات",
  "page.profile": "ملفي الشخصي",
  "sidebar.sub": "العون المباشر · الإدارة",
};

const dictionaries: Record<AdminLang, Dict> = { en, ar };

export function t(lang: AdminLang, key: string): string {
  return dictionaries[lang][key] ?? dictionaries.en[key] ?? key;
}

export function getPageTitleKey(pathname: string): string {
  if (pathname === "/admin") return "page.dashboard";
  if (pathname.startsWith("/admin/projects")) return "page.projects";
  if (pathname.startsWith("/admin/users")) return "page.users";
  if (pathname.startsWith("/admin/categories")) return "page.categories";
  if (pathname.startsWith("/admin/homepage")) return "page.homepage";
  if (pathname.startsWith("/admin/footer")) return "page.footer";
  if (pathname.startsWith("/admin/roles")) return "page.roles";
  if (pathname.startsWith("/admin/logs")) return "page.logs";
  if (pathname.startsWith("/admin/settings")) return "page.settings";
  if (pathname.startsWith("/admin/notifications")) return "page.notifications";
  if (pathname.startsWith("/admin/profile")) return "page.profile";
  return "page.dashboard";
}
