import type { HomepageCategory } from "@/types";
import { CategoryTile } from "./CategoryTile";

type CategoryGridProps = {
  categories: HomepageCategory[];
};

export function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <section aria-label="فئات المشاريع" className="grid-box">
      {categories.map((category) => (
        <CategoryTile key={category.slug} {...category} />
      ))}
    </section>
  );
}
