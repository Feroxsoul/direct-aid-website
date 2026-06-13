"use client";

import Image from "next/image";
import { useState } from "react";
import { normalizeCdnImageUrl } from "@/lib/image-url";

const FALLBACK =
  "https://cdn.prod.website-files.com/632a01171b125a156b28c038/64c8cde2258c815c760717a9_small.png";

type ProjectCoverImageProps = {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  fallbackSrc?: string;
};

export function ProjectCoverImage({
  src,
  alt,
  className = "object-cover",
  sizes = "(max-width: 768px) 100vw, 50vw",
  fill = true,
  width,
  height,
  fallbackSrc = FALLBACK,
}: ProjectCoverImageProps) {
  const normalized = normalizeCdnImageUrl(src) || fallbackSrc;
  const [currentSrc, setCurrentSrc] = useState(normalized);
  const unoptimized =
    currentSrc.includes("cdn.prod.website-files.com") ||
    currentSrc.includes("images.unsplash.com");

  const imageProps = fill
    ? { fill: true as const, sizes, className }
    : { width: width ?? 300, height: height ?? 300, className };

  return (
    <Image
      {...imageProps}
      src={currentSrc}
      alt={alt}
      unoptimized={unoptimized}
      onError={() => {
        if (currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc);
        }
      }}
    />
  );
}
