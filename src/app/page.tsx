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
  getPublicSettings,
} from "@/lib/data";

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
  const [statistics, categories, projects, settings] = await Promise.all([
    getHomeStatistics(),
    getCategories(),
    getAllProjects(),
    getPublicSettings(),
  ]);

  return (
    <PageContainer>
      <LandingHeader logoUrl={settings.logo_url} siteTitle={settings.site_title} />
      <StatisticsSection {...statistics} />
      <HomeProjectsExplorer categories={categories} projects={projects} />
      <TransparencySection />
    </PageContainer>
  );
}
