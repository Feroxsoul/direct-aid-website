"use client";

import Image from "next/image";
import Link from "next/link";
import { ShareButton } from "@/components/layout/ShareButton";
import { useLocalizedProject } from "@/hooks/use-localized-project";
import { useSiteLang } from "@/lib/site-i18n-context";
import type { ProjectDetailData } from "@/types";

type ProjectDetailProps = {
  project: ProjectDetailData;
  shareIconUrl?: string;
};

function isWebflowCdn(url: string) {
  return url.includes("cdn.prod.website-files.com");
}

export function ProjectDetail({ project, shareIconUrl }: ProjectDetailProps) {
  const { t } = useSiteLang();
  const localized = useLocalizedProject(project);
  const tags = [
    localized.categoryLabel,
    localized.location,
    localized.metadata.dateLabel,
  ].filter(Boolean) as string[];

  const galleryUrls = [
    ...new Set(
      project.galleryUrls.filter((url) => url && url !== localized.imageUrl),
    ),
  ];

  return (
    <div className="project-page landing-container">
      <div className="project-toolbar landing-reveal">
        <Link href="/#impact" className="project-back-link">
          <span>{t("project.back")}</span>
        </Link>
        <ShareButton
          iconUrl={shareIconUrl}
          label={t("share")}
          title={localized.title}
          text={(localized.description ?? project.description).slice(0, 120)}
          className="project-share-btn landing-share-btn"
        />
      </div>

      <div
        className="project-hero landing-reveal"
        style={{ animationDelay: "90ms" }}
      >
        <Image
          src={localized.imageUrl}
          alt={localized.imageAlt ?? localized.title}
          fill
          className="project-hero-image"
          sizes="(max-width: 767px) 100vw, 940px"
          priority
          loading="eager"
          unoptimized={isWebflowCdn(localized.imageUrl)}
        />
      </div>

      <div
        className="project-detail landing-reveal"
        style={{ animationDelay: "160ms" }}
      >
        <div className="project-tags">
          {tags.map((tag) => (
            <span key={tag} className="project-tag">
              {tag}
            </span>
          ))}
        </div>

        <h1 className="project-detail-title">{localized.title}</h1>

        <p className="project-detail-description">{localized.description ?? project.description}</p>
      </div>

      {galleryUrls.length > 0 ? (
        <div
          className="project-gallery landing-reveal"
          style={{ animationDelay: "230ms" }}
        >
          <h2 className="project-gallery-title">{t("project.galleryTitle")}</h2>
          <div className="project-gallery-grid">
            {galleryUrls.map((url, index) => (
              <Image
                key={`${url}-${index}`}
                src={url}
                alt={t("project.galleryImage", { title: localized.title, index: index + 1 })}
                width={940}
                height={600}
                className="project-gallery-image"
                sizes="(max-width: 767px) 100vw, 940px"
                loading="lazy"
                unoptimized={isWebflowCdn(url)}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
