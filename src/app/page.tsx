import type { Metadata } from "next";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { StatisticsSection } from "@/components/home/StatisticsSection";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { ProjectGrid } from "@/components/project/ProjectGrid";
import {
  getAllProjects,
  getCategories,
  getHomeStatistics,
  getPageBySlug,
  getPublicSettings,
} from "@/lib/data";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug("home");

  return {
    title: page?.title ?? "10x10 مشاريع",
    description: page?.meta_description ?? "10x10 مشاريع",
    openGraph: {
      title: page?.title ?? "10x10 مشاريع",
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
      <Header
        logoUrl={settings.logo_url}
        shareIconUrl={settings.share_icon_url}
        shareLabel={settings.share_label}
        siteTitle={settings.site_title}
      />
      <StatisticsSection {...statistics} />
      <CategoryGrid categories={categories} />
      <ProjectGrid projects={projects} variant="home" />
    </PageContainer>
  );
}
