import Image from "next/image";
import Link from "next/link";
import { categoryAccentColors } from "@/lib/design-tokens";
import type { HomepageCategory } from "@/types";

type CategoryTileProps = HomepageCategory;

export function CategoryTile({
  slug,
  titleLine1,
  titleLine2,
  iconUrl,
  accent,
}: CategoryTileProps) {
  const accentColor = categoryAccentColors[accent];

  return (
    <Link
      href={`/lmshryaa/${slug}`}
      className="category-box flex h-[var(--da-category-size)] min-h-[var(--da-category-size)] w-[var(--da-category-size)] max-w-[var(--da-category-size)] flex-col items-end justify-between overflow-hidden rounded-da-md bg-da-white text-da-black shadow-da-card no-underline"
    >
      <Image
        src={iconUrl}
        alt=""
        width={40}
        height={40}
        className="me-5 mt-5 h-10 w-10"
        aria-hidden
      />
      <div className="category-title me-5 ms-5 pt-5 text-end">
        <span className="da-text-card-title block leading-6">
          {titleLine1}
          <br />
          {titleLine2}
        </span>
      </div>
      <div
        className="color-inbox min-h-[var(--da-color-bar-height)] w-full rounded-b-da-md"
        style={{ backgroundColor: accentColor }}
        aria-hidden
      />
    </Link>
  );
}
