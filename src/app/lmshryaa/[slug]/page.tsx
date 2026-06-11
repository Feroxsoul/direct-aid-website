import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryListingHeader } from "@/components/listing/CategoryListingHeader";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { ProjectGrid } from "@/components/project/ProjectGrid";
import {
  getCategoryBySlug,
  getCategoryLabel,
  getCategorySlugs,
  getProjectsByCategorySlug,
  getPublicSettings,
} from "@/lib/data";

export const revalidate = 60;

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const slugs = await getCategorySlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return { title: "10x10 مشاريع" };
  }

  const label = getCategoryLabel(category);

  return {
    title: `${label} | 10x10 مشاريع`,
    description: label,
    openGraph: {
      title: `${label} | 10x10 مشاريع`,
    },
  };
}

export default async function CategoryProjectsPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const [category, projects, settings] = await Promise.all([
    getCategoryBySlug(slug),
    getProjectsByCategorySlug(slug),
    getPublicSettings(),
  ]);

  if (!category) {
    notFound();
  }

  return (
    <PageContainer>
      <Header
        logoUrl={settings.logo_url}
        shareIconUrl={settings.share_icon_url}
        shareLabel={settings.share_label}
        siteTitle={settings.site_title}
      />
      <CategoryListingHeader category={category} />
      <ProjectGrid projects={projects} variant="listing" />
    </PageContainer>
  );
}
