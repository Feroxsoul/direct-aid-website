import Image from "next/image";
import Link from "next/link";
import type { ProjectDetailData } from "@/types";

const CDN =
  "https://cdn.prod.website-files.com/632a01171b125a156b28c038";
const BACK_ICON = `${CDN}/6354c31aa7b90c4bf6c16f65_Back.svg`;

type ProjectDetailProps = {
  project: ProjectDetailData;
};

export function ProjectDetail({ project }: ProjectDetailProps) {
  const tags = [
    project.categoryLabel,
    project.location,
    project.metadata.dateLabel,
  ].filter(Boolean) as string[];

  return (
    <div className="project-page">
      <nav className="project-navigation" aria-label="التنقل">
        <Link href="/" className="project-back-link da-text-button">
          <span>رجوع</span>
          <Image src={BACK_ICON} alt="" width={20} height={20} aria-hidden />
        </Link>
      </nav>

      <div
        className="project-hero"
        style={{ backgroundImage: `url("${project.imageUrl}")` }}
        role="img"
        aria-label={project.imageAlt ?? project.title}
      />

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

      {project.galleryUrls.length > 0 ? (
        <div className="project-gallery">
          {project.galleryUrls.map((url, index) => (
            <Image
              key={`${url}-${index}`}
              src={url}
              alt=""
              width={940}
              height={600}
              className="project-gallery-image"
              sizes="(max-width: 767px) 100vw, 940px"
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
