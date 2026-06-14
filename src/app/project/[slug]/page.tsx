import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LandingHeader } from "@/components/layout/LandingHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { ProjectDetail } from "@/components/project/ProjectDetail";
import { getProjectBySlug, getProjectSlugs, getPublicSettings } from "@/lib/data";
import { getPublicContentSettings } from "@/lib/public-content";

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
  const [project, content] = await Promise.all([
    getProjectBySlug(slug),
    getPublicContentSettings(),
  ]);

  if (!project) {
    return { title: "Direct Aid 10x10" };
  }

  const title = project.metaTitle ?? project.title;
  const description =
    project.metaDescription ?? project.description.slice(0, 160);

  return {
    metadataBase: new URL(content.public_site_url),
    title: `${title} | Direct Aid 10x10`,
    description,
    openGraph: {
      title: `${title} | Direct Aid 10x10`,
      description,
      images: [{ url: project.imageUrl }],
      url: `${content.public_site_url}/project/${slug}`,
    },
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const [project, settings, content] = await Promise.all([
    getProjectBySlug(slug),
    getPublicSettings(),
    getPublicContentSettings(),
  ]);

  if (!project) {
    notFound();
  }

  return (
    <PageContainer>
      <LandingHeader
        logoUrl={settings.logo_url || content.logo_url}
        siteTitle={settings.site_title || content.site_title}
        shareIconUrl={content.share_icon_url}
        shareLabel={content.share_label}
        shareTitle={project.title}
        shareText={project.description.slice(0, 120)}
        whatsappHeaderUrl={content.whatsapp_header_url}
      />
      <ProjectDetail
        project={project}
        shareIconUrl={content.share_icon_url}
        shareLabel={content.share_label}
      />
    </PageContainer>
  );
}
