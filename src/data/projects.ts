import { getDefaultDescription, projectDetailFields } from "@/data/project-details";
import type { ProjectCardData, ProjectDetailData } from "@/types";

type ProjectRecord = Omit<ProjectCardData, "href">;

/** Local project list when Supabase is unavailable. */
const projectRecords: ProjectRecord[] = [
  {
    id: "2024slewat5001",
    title: "صيانة ابار",
    categorySlug: "waters-10x10",
    imageUrl:
      "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=680&h=528&fit=crop",
    metadata: { dateLabel: "فبراير 2024", yearCode: "2024 FEB" },
    categoryAccent: "water",
    statistics: { value: "3,200", label: "انسان مستفيد" },
  },
  {
    id: "2024mliwat5004",
    title: "بئر ارتوازي كبير",
    categorySlug: "waters-10x10",
    imageUrl:
      "https://images.unsplash.com/photo-1593113646773-028c64a8f94b?w=680&h=528&fit=crop",
    metadata: { dateLabel: "نوفمبر 2024", yearCode: "2024 NOV" },
    categoryAccent: "water",
  },
  {
    id: "2024mliwat5064",
    title: "بئر ارتوازي صغير",
    categorySlug: "waters-10x10",
    imageUrl:
      "https://images.unsplash.com/photo-1629073779107-9eb4c1aee1f2?w=680&h=528&fit=crop",
    metadata: { dateLabel: "يونيو 2024" },
    categoryAccent: "water",
  },
  {
    id: "water-tank-2024",
    title: "خزان مياه البركة 19",
    categorySlug: "waters-10x10",
    imageUrl:
      "https://images.unsplash.com/photo-1541845156444-79bda4d3d0d6?w=680&h=528&fit=crop",
    metadata: { dateLabel: "فبراير 2024" },
    categoryAccent: "water",
  },
  {
    id: "health-ct-2024",
    title: "جهاز الأشعة المقطعية لمستشفى جامعة سيمد",
    categorySlug: "health-10x10",
    imageUrl:
      "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=680&h=528&fit=crop",
    metadata: { dateLabel: "يونيو 2024", yearCode: "2024 JUN" },
    categoryAccent: "green",
    statistics: { value: "12,500", label: "انسان مستفيد" },
  },
  {
    id: "dev-clinic-2023",
    title: "تطوير مستوصف",
    categorySlug: "health-10x10",
    imageUrl:
      "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=680&h=528&fit=crop",
    metadata: { dateLabel: "أبريل 2023", yearCode: "2023 APR" },
    categoryAccent: "green",
  },
  {
    id: "health-vaccine-2024",
    title: "حملة تطعيم",
    categorySlug: "health-10x10",
    imageUrl:
      "https://images.unsplash.com/photo-1584036561566-daf0ddf07628?w=680&h=528&fit=crop",
    metadata: { dateLabel: "سبتمبر 2024" },
    categoryAccent: "green",
    statistics: { value: "5,100", label: "انسان مستفيد" },
  },
  {
    id: "edu-books-2023",
    title: "توزيع كتب و مناهج دراسية",
    categorySlug: "educational.10x10",
    imageUrl:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=680&h=528&fit=crop",
    metadata: { dateLabel: "سبتمبر 2023", yearCode: "2023 SEP" },
    categoryAccent: "red",
  },
  {
    id: "edu-grant-2024",
    title: "منح تعليم جامعي",
    categorySlug: "educational.10x10",
    imageUrl:
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=680&h=528&fit=crop",
    metadata: { dateLabel: "مايو 2024" },
    categoryAccent: "red",
  },
  {
    id: "edu-school-2023",
    title: "تغذية مدرسية إغاثية",
    categorySlug: "educational.10x10",
    imageUrl:
      "https://images.unsplash.com/photo-1497633768975-8d3aa1c9885f?w=680&h=528&fit=crop",
    metadata: { dateLabel: "مارس 2023" },
    categoryAccent: "red",
  },
  {
    id: "relief-yemen-2024",
    title: "إغاثات غذائية عاجلة لليمن",
    categorySlug: "lmshryaa-lgthy",
    imageUrl:
      "https://images.unsplash.com/photo-1488523785073-6df9f2a4b098?w=680&h=528&fit=crop",
    metadata: { dateLabel: "اكتوبر 2024" },
    categoryAccent: "yellow",
    statistics: { value: "8,750", label: "انسان مستفيد" },
  },
  {
    id: "relief-corona-2020",
    title: "إغاثة كورونا لتوزيع الكمامات",
    categorySlug: "lmshryaa-lgthy",
    imageUrl:
      "https://images.unsplash.com/photo-1584036561566-daf0ddf07628?w=680&h=528&fit=crop",
    metadata: { dateLabel: "كورونا 2020" },
    categoryAccent: "yellow",
    statistics: { value: "15,000", label: "انسان مستفيد" },
  },
  {
    id: "relief-food-2024",
    title: "بنك الحبوب",
    categorySlug: "lmshryaa-lgthy",
    imageUrl:
      "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=680&h=528&fit=crop",
    metadata: { dateLabel: "ديسمبر 2024" },
    categoryAccent: "yellow",
  },
  {
    id: "dev-clinic-infra",
    title: "ممرات",
    categorySlug: "developments",
    imageUrl:
      "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=680&h=528&fit=crop",
    metadata: { dateLabel: "يونيو 2023" },
    categoryAccent: "blue",
  },
  {
    id: "dev-playground",
    title: "ملاعب",
    categorySlug: "developments",
    imageUrl:
      "https://images.unsplash.com/photo-1517649763962-0c62306601b7?w=680&h=528&fit=crop",
    metadata: { dateLabel: "أكتوبر 2024" },
    categoryAccent: "blue",
  },
  {
    id: "dev-solar",
    title: "طاقة شمسية البركة 48",
    categorySlug: "developments",
    imageUrl:
      "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=680&h=528&fit=crop",
    metadata: { dateLabel: "يوليو 2024" },
    categoryAccent: "blue",
  },
  {
    id: "dawah-radio",
    title: "برامج إذاعية",
    categorySlug: "lmshryaa-ldaawy",
    imageUrl:
      "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=680&h=528&fit=crop",
    metadata: { dateLabel: "نوفمبر 2023" },
    categoryAccent: "olive",
  },
  {
    id: "dawah-building",
    title: "مبنى إذاعة البركة 14",
    categorySlug: "lmshryaa-ldaawy",
    imageUrl:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=680&h=528&fit=crop",
    metadata: { dateLabel: "مارس 2019" },
    categoryAccent: "olive",
  },
  {
    id: "orphans-support-2023",
    title: "أغنوهم عن السؤال",
    categorySlug: "orphans",
    imageUrl:
      "https://images.unsplash.com/photo-1488523785073-6df9f2a4b098?w=680&h=528&fit=crop",
    metadata: { dateLabel: "أغسطس 2023", yearCode: "2023 AUG" },
    categoryAccent: "orange",
    statistics: { value: "420", label: "انسان مستفيد" },
  },
  {
    id: "orphans-sponsor",
    title: "اغنوهم عن السؤال",
    categorySlug: "orphans",
    imageUrl:
      "https://images.unsplash.com/photo-1503454537198-1eaff22c8f88?w=680&h=528&fit=crop",
    metadata: { dateLabel: "فبراير 2024" },
    categoryAccent: "orange",
  },
  {
    id: "mosque-2024",
    title: "مسجد",
    categorySlug: "mosque",
    imageUrl:
      "https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=680&h=528&fit=crop",
    metadata: { dateLabel: "مارس 2023", yearCode: "2023 MAR" },
    categoryAccent: "default",
  },
  {
    id: "mosque-renovation",
    title: "صيانة منشآت",
    categorySlug: "mosque",
    imageUrl:
      "https://images.unsplash.com/photo-1591604466376-068e5edd577d?w=680&h=528&fit=crop",
    metadata: { dateLabel: "يناير 2024" },
    categoryAccent: "default",
  },
];

const categoryLabels: Record<string, string> = {
  "educational.10x10": "المشاريع التعليمية",
  "health-10x10": "المشاريع الصحية",
  "lmshryaa-ldaawy": "المشاريع الدعوية",
  developments: "المشاريع التنموية",
  "lmshryaa-lgthy": "المشاريع الإغاثية",
  orphans: "مشاريع الأيتام",
  "waters-10x10": "مشاريع المياه",
  mosque: "مشاريع المساجد",
};

function toCard(project: ProjectRecord): ProjectCardData {
  return { ...project, href: `/project/${project.id}` };
}

export const fallbackProjects: ProjectCardData[] = projectRecords.map(toCard);

export function getFallbackProjectsByCategorySlug(
  slug: string,
): ProjectCardData[] {
  return fallbackProjects.filter((project) => project.categorySlug === slug);
}

export function getFallbackProjectSlugs(): string[] {
  return projectRecords.map((project) => project.id);
}

export function getFallbackProjectBySlug(
  slug: string,
  categoryLabel?: string,
): ProjectDetailData | undefined {
  const project = projectRecords.find((record) => record.id === slug);
  if (!project) return undefined;

  const label =
    categoryLabel ?? categoryLabels[project.categorySlug] ?? "المشاريع";
  const extra = projectDetailFields[slug];
  const card = toCard(project);

  return {
    ...card,
    imageUrl: extra?.imageUrl ?? card.imageUrl,
    categoryLabel: label,
    location: extra?.location,
    description:
      extra?.description ?? getDefaultDescription(project.title, label),
    galleryUrls: extra?.galleryUrls ?? [],
  };
}
