import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LandingHeader } from "@/components/layout/LandingHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { ProjectDetail } from "@/components/project/ProjectDetail";
import { getProjectBySlug, getProjectSlugs, getPublicSettings } from "@/lib/data";

export const revalidate = 60;

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const slugs = await getProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    return { title: "Direct Aid 10x10" };
  }

  return {
    title: `${project.title} | Direct Aid 10x10`,
    description: project.description.slice(0, 160),
    openGraph: {
      title: `${project.title} | Direct Aid 10x10`,
      images: [{ url: project.imageUrl }],
    },
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const [project, settings] = await Promise.all([
    getProjectBySlug(slug),
    getPublicSettings(),
  ]);

  if (!project) {
    notFound();
  }

  return (
    <PageContainer>
      <LandingHeader logoUrl={settings.logo_url} siteTitle={settings.site_title} />
      <ProjectDetail project={project} />
    </PageContainer>
  );
}
