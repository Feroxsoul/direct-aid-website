import Image from "next/image";
import Link from "next/link";
import type { ProjectDetailData } from "@/types";

const CDN =
  "https://cdn.prod.website-files.com/632a01171b125a156b28c038";
const BACK_ICON = `${CDN}/6354c31aa7b90c4bf6c16f65_Back.svg`;

type ProjectDetailProps = {
  project: ProjectDetailData;
};

function isWebflowCdn(url: string) {
  return url.includes("cdn.prod.website-files.com");
}

export function ProjectDetail({ project }: ProjectDetailProps) {
  const tags = [
    project.categoryLabel,
    project.location,
    project.metadata.dateLabel,
  ].filter(Boolean) as string[];

  const galleryUrls = [
    ...new Set(
      project.galleryUrls.filter((url) => url && url !== project.imageUrl),
    ),
  ];

  return (
    <div className="project-page">
      <nav className="project-navigation" aria-label="التنقل">
        <Link href="/" className="project-back-link da-text-button">
          <span>رجوع</span>
          <Image src={BACK_ICON} alt="" width={20} height={20} aria-hidden />
        </Link>
      </nav>

      <div className="project-hero">
        <Image
          src={project.imageUrl}
          alt={project.imageAlt ?? project.title}
          fill
          className="project-hero-image"
          sizes="(max-width: 767px) 100vw, 940px"
          priority
          unoptimized={isWebflowCdn(project.imageUrl)}
        />
      </div>

      <div className="project-detail">
        <div className="project-tags">
          {tags.map((tag) => (
            <span key={tag} className="project-tag">
              {tag}
            </span>
          ))}
        </div>

        <h1 className="project-detail-title da-text-card-title">{project.title}</h1>

        <p className="project-detail-description da-text-body">
          {project.description}
        </p>
      </div>

      {galleryUrls.length > 0 ? (
        <div className="project-gallery">
          <h2 className="project-gallery-title">صور المشروع</h2>
          {galleryUrls.map((url, index) => (
            <Image
              key={`${url}-${index}`}
              src={url}
              alt={`${project.title} — صورة ${index + 1}`}
              width={940}
              height={600}
              className="project-gallery-image"
              sizes="(max-width: 767px) 100vw, 940px"
              unoptimized={isWebflowCdn(url)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
