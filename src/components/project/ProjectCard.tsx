import Image from "next/image";
import Link from "next/link";
import { categoryAccentColors } from "@/lib/design-tokens";
import type {
  ProjectCardData,
  ProjectMetadata,
  ProjectStatistics,
} from "@/types";

export type ProjectCardProps = ProjectCardData & {
  className?: string;
};

export function ProjectCard({
  title,
  imageUrl,
  imageAlt,
  href,
  metadata,
  categoryAccent,
  statistics,
  iconUrl,
  className = "",
}: ProjectCardProps) {
  const accentColor = categoryAccentColors[categoryAccent];

  return (
    <article
      className={`box da-rtl flex w-[var(--da-card-size)] min-w-[var(--da-card-size)] max-w-[var(--da-card-size)] min-h-[var(--da-card-height)] max-h-[var(--da-card-height)] flex-col overflow-hidden rounded-da-md bg-transparent shadow-da-card ${className}`}
    >
      <ProjectCardImage
        imageUrl={imageUrl}
        imageAlt={imageAlt ?? title}
        metadata={metadata}
        statistics={statistics}
        href={href}
        title={title}
      />

      <ProjectCardInfo title={title} href={href} iconUrl={iconUrl} />

      <div
        className="color-inbox block min-h-[var(--da-color-bar-height)] w-full rounded-b-da-md"
        style={{ backgroundColor: accentColor }}
        aria-hidden
      />
    </article>
  );
}

type ProjectCardImageProps = {
  imageUrl: string;
  imageAlt: string;
  metadata: ProjectMetadata;
  statistics?: ProjectStatistics;
};

function ProjectCardImage({
  imageUrl,
  imageAlt,
  metadata,
  statistics,
  href,
  title,
}: ProjectCardImageProps & { href: string; title: string }) {
  const unoptimized = imageUrl.includes("cdn.prod.website-files.com");

  return (
    <div className="image-inbox relative flex min-h-[var(--da-image-min-height)] justify-end rounded-t-da-md">
      <Link
        href={href}
        className="absolute inset-0 z-[1] block"
        aria-label={`${title} — عرض التفاصيل`}
      >
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          className="rounded-t-da-md object-cover object-center"
          sizes="340px"
          unoptimized={unoptimized}
        />
      </Link>

      {statistics ? (
        <ProjectCardStatistics value={statistics.value} label={statistics.label} />
      ) : null}

      <ProjectCardMetadata dateLabel={metadata.dateLabel} yearCode={metadata.yearCode} />
    </div>
  );
}

type ProjectCardMetadataProps = ProjectMetadata;

function ProjectCardMetadata({ dateLabel, yearCode }: ProjectCardMetadataProps) {
  return (
    <div className="tag-year absolute bottom-0 end-0 z-10 m-[var(--da-space-7)] flex max-h-[21px] flex-col items-end gap-1">
      <div className="rounded-[3px] bg-da-overlay px-[var(--da-space-1)] backdrop-blur-[20px]">
        <span className="text-block-6 da-text-tag block px-1.5 text-da-white">
          {dateLabel}
        </span>
      </div>
      {yearCode ? (
        <div className="year-inbox flex h-[21px] w-[65px] items-center justify-center rounded-[3px] bg-da-overlay px-[var(--da-space-1)]">
          <span className="text-block-4 da-text-tag text-da-white">{yearCode}</span>
        </div>
      ) : null}
    </div>
  );
}

type ProjectCardStatisticsProps = ProjectStatistics;

function ProjectCardStatistics({ value, label }: ProjectCardStatisticsProps) {
  return (
    <div
      className="counter-box absolute top-0 end-0 z-10 m-[var(--da-space-7)] flex flex-col items-end rounded-da-sm bg-da-overlay px-3 py-2 backdrop-blur-[20px]"
      aria-label={`${value} ${label}`}
    >
      <span className="bold-text-3 da-text-stat leading-none text-da-white">{value}</span>
      <span className="text-block-10 da-text-card-title pt-1.5 text-da-white">{label}</span>
    </div>
  );
}

type ProjectCardInfoProps = {
  title: string;
  href: string;
  iconUrl?: string;
};

function ProjectCardInfo({ title, href, iconUrl }: ProjectCardInfoProps) {
  return (
    <div className="info-inbox flex min-h-[var(--da-info-row-height)] flex-1 items-center justify-between px-[var(--da-space-7)] max-[479px]:px-[15px]">
      <Link
        href={href}
        className="more-button flex min-h-[27px] min-w-[63px] shrink-0 items-center justify-center self-center rounded-da-sm bg-da-lightgray px-2 py-0.5 no-underline"
        aria-label={`المزيد — ${title}`}
      >
        <span className="text-tag">
          <strong className="bold-text-2 da-text-button block pb-0.5 text-center text-da-gray">
            + المزيد
          </strong>
        </span>
      </Link>

      <div className="title-project flex items-center justify-center">
        <h3 className="text-block-14 da-text-card-title m-0 text-end text-da-black">
          {title}
        </h3>
        {iconUrl ? (
          <div className="icon-project max-w-[30px] shrink-0 ps-3 max-[479px]:ms-1.5 max-[479px]:ps-0">
            <Image
              src={iconUrl}
              alt=""
              width={30}
              height={30}
              className="image-6 h-auto w-full max-w-[30px] py-3 ps-3 max-[479px]:p-0"
              aria-hidden
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
