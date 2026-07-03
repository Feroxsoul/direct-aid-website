import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryListingHeader } from "@/components/listing/CategoryListingHeader";
import { LandingHeader } from "@/components/layout/LandingHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { ProjectGrid } from "@/components/project/ProjectGrid";
import {
  getCategoryBySlug,
  getCategoryLabel,
  getCategorySlugs,
  getProjectsByCategorySlug,
  getPublicSettings,
} from "@/lib/data";
import { getPublicContentSettings } from "@/lib/public-content";

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
  const [category, content] = await Promise.all([
    getCategoryBySlug(slug),
    getPublicContentSettings(),
  ]);

  if (!category) {
    return { title: "10x10 مشاريع" };
  }

  const label = getCategoryLabel(category);

  return {
    metadataBase: new URL(content.public_site_url),
    title: `${label} | 10x10 مشاريع`,
    description: label,
    openGraph: {
      title: `${label} | 10x10 مشاريع`,
      url: `${content.public_site_url}/lmshryaa/${slug}`,
    },
  };
}

export default async function CategoryProjectsPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const [category, projects, settings, content] = await Promise.all([
    getCategoryBySlug(slug),
    getProjectsByCategorySlug(slug),
    getPublicSettings(),
    getPublicContentSettings(),
  ]);

  if (!category) {
    notFound();
  }

  const label = getCategoryLabel(category);

  return (
    <PageContainer>
      <LandingHeader
        logoUrl={settings.logo_url || content.logo_url}
        siteTitle={settings.site_title || content.site_title}
        shareIconUrl={content.share_icon_url}
        shareTitle={label}
        shareText={label}
        whatsappHeaderUrl={content.whatsapp_header_url}
      />
      <CategoryListingHeader category={category} />
      <ProjectGrid projects={projects} variant="listing" />
    </PageContainer>
  );
}
