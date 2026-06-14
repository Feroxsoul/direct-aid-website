import {
  categoryAccentColors,
  type CategoryAccent,
} from "@/lib/design-tokens";

const HEX_RE = /^#[0-9A-Fa-f]{6}$/;

export function isHexColor(value: string): boolean {
  return HEX_RE.test(value.trim());
}

export function normalizeHexColor(value: string, fallback = "#2c9942"): string {
  const trimmed = value.trim();
  if (isHexColor(trimmed)) return trimmed.toLowerCase();
  if (trimmed.startsWith("#") && trimmed.length === 7) return trimmed.toLowerCase();
  return fallback;
}

export function resolveCategoryColor(
  slug: string,
  accent: CategoryAccent,
  colorMap: Record<string, string>,
): string {
  const custom = colorMap[slug];
  if (custom && isHexColor(custom)) return custom.toLowerCase();
  if (custom && custom in categoryAccentColors) {
    return categoryAccentColors[custom as CategoryAccent];
  }
  return categoryAccentColors[accent];
}
