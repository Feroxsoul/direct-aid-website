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
  const [page, content] = await Promise.all([
    getPageBySlug("home"),
    getPublicContentSettings(),
  ]);

  return {
    metadataBase: new URL(content.public_site_url),
    title: page?.title ?? "مشاريع العون المباشر 10×10",
    description: page?.meta_description ?? "مشاريع العون المباشر 10×10",
    openGraph: {
      title: page?.title ?? "مشاريع العون المباشر 10×10",
      url: content.public_site_url,
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
        shareIconUrl={content.share_icon_url}
        shareLabel={content.share_label}
        shareTitle={content.site_title}
        shareText={content.site_description || content.site_title}
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
        whatsappNumber={content.whatsapp_number}
        whatsappMessage={content.whatsapp_subscribe_message}
        subscribeButtonLabel={content.whatsapp_subscribe_button}
      />
    </PageContainer>
  );
}
