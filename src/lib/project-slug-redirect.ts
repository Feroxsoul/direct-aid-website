import slugMapJson from "@/data/project-slug-map.json";

const slugMap = slugMapJson as Record<string, string>;

export function resolveLegacyProjectSlug(slug: string): string {
  return slugMap[slug] ?? slug;
}

export function getLegacyProjectSlug(targetSlug: string): string | undefined {
  return Object.entries(slugMap).find(([, value]) => value === targetSlug)?.[0];
}
