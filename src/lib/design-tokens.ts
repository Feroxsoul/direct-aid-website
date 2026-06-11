/** Design tokens — archived Webflow palette and layout. */

export const colors = {
  green: "#2c9942",
  white: "#f9f9f9",
  gray: "#49575f",
  black: "#050505",
  lightgreen: "#e2eed6",
  orange: "#f88d2a",
  red: "#df3b2c",
  darkblue: "#0457a2",
  olive: "#9ba538",
  yellow: "#f1bb1a",
  purple: "#904d9d",
  blue: "#27a8e0",
  lightgray: "#e5e5e4",
  background: "#ffffff",
  overlay: "#05050533",
  overlayLight: "#0505051a",
} as const;

export const fontFamily = '"Diaborient012", sans-serif';

export const fontSize = {
  xs: "0.625rem",
  sm: "0.75rem",
  base: "0.875rem",
  md: "1rem",
  lg: "1.125rem",
  xl: "1.25rem",
  stat: "1.8125rem",
  hero: "2.625rem",
} as const;

export const fontWeight = {
  light: 300,
  regular: 400,
  bold: 700,
  heavy: 900,
} as const;

export const lineHeight = {
  tight: "1.125rem",
  normal: "1.5em",
  title: "2.0625rem",
} as const;

export type CategoryAccent =
  | "red"
  | "green"
  | "blue"
  | "olive"
  | "yellow"
  | "orange"
  | "water"
  | "default";

export const categoryAccentColors: Record<CategoryAccent, string> = {
  red: colors.red,
  green: colors.green,
  blue: colors.darkblue,
  olive: colors.olive,
  yellow: colors.yellow,
  orange: colors.purple,
  water: colors.blue,
  default: colors.orange,
};

export const layout = {
  cardSize: 340,
  cardHeight: 340,
  featuredHeight: 379,
  categorySize: 160,
  heroMinHeight: 311,
  imageMinHeight: 264,
  infoRowHeight: 68,
  colorBarHeight: 8,
} as const;

export const breakpoints = {
  tablet: 991,
  tabletSm: 767,
  mobile: 479,
} as const;
