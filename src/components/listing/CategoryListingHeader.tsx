import Image from "next/image";
import { categoryAccentColors } from "@/lib/design-tokens";
import type { HomepageCategory } from "@/types";

type CategoryListingHeaderProps = {
  category: HomepageCategory;
};

export function CategoryListingHeader({ category }: CategoryListingHeaderProps) {
  const accentColor = categoryAccentColors[category.accent];

  return (
    <header className="w-full max-w-[var(--da-card-size)] px-5 pt-5">
      <div className="sub-box-container flex min-w-[var(--da-card-size)] items-center justify-between">
        <div className="sub-box-title flex flex-col items-start">
          <span className="text-block-7 da-text-card-title text-da-black">
            {category.titleLine1}
          </span>
          <span className="text-block-7 da-text-card-title text-da-black">
            {category.titleLine2}
          </span>
        </div>
        <Image
          src={category.iconUrl}
          alt=""
          width={40}
          height={40}
          className="h-10 w-10 shrink-0"
          aria-hidden
        />
      </div>

      <div
        className="category-box sub category-inbox mt-5 flex min-h-[120px] w-full max-w-[var(--da-card-size)] flex-col items-start justify-between overflow-hidden rounded-da-md bg-da-white text-da-black shadow-da-card"
        aria-label={`${category.titleLine1} ${category.titleLine2}`}
      >
        <Image
          src={category.iconUrl}
          alt=""
          width={40}
          height={40}
          className="me-5 mt-5 h-10 w-10"
          aria-hidden
        />
        <div className="category-title me-5 ms-5 pt-5 text-start">
          <span className="da-text-card-title block leading-6">
            {category.titleLine1}
            <br />
            {category.titleLine2}
          </span>
        </div>
        <div
          className="color-inbox min-h-[var(--da-color-bar-height)] w-full rounded-b-da-md"
          style={{ backgroundColor: accentColor }}
          aria-hidden
        />
      </div>
    </header>
  );
}
