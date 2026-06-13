import type { Metadata } from "next";
import { HomeProjectsExplorer } from "@/components/home/HomeProjectsExplorer";
import { StatisticsSection } from "@/components/home/StatisticsSection";
import { TransparencySection } from "@/components/home/TransparencySection";
import { LandingHeader } from "@/components/layout/LandingHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import {
  getAllProjects,
  getCategories,
  getHomeStatistics,
  getPageBySlug,
} from "@/lib/data";
import { getPublicContentSettings } from "@/lib/public-content";

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug("home");

  return {
    title: page?.title ?? "مشاريع العون المباشر 10×10",
    description: page?.meta_description ?? "مشاريع العون المباشر 10×10",
    openGraph: {
      title: page?.title ?? "مشاريع العون المباشر 10×10",
    },
  };
}

export default async function Home() {
  const [statistics, categories, projects, content] = await Promise.all([
    getHomeStatistics(),
    getCategories(),
    getAllProjects(),
    getPublicContentSettings(),
  ]);

  return (
    <PageContainer>
      <LandingHeader
        logoUrl={content.logo_url}
        siteTitle={content.site_title}
        navLinks={content.header_nav}
        donateLabel={content.donate_label}
        donateUrl={content.donate_url}
      />
      <StatisticsSection {...statistics} ctaLabel={content.hero_cta_label} />
      <HomeProjectsExplorer
        categories={categories}
        projects={projects}
        categoriesSectionTitle={content.categories_section_title}
        impactSectionTitle={content.impact_section_title}
        impactSectionSubtitle={content.impact_section_subtitle}
      />
      <TransparencySection
        title={content.transparency_title}
        text={content.transparency_text}
        newsletterPlaceholder={content.newsletter_placeholder}
        newsletterButton={content.newsletter_button}
      />
    </PageContainer>
  );
}
