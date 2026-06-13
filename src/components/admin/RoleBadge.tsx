import type { CSSProperties } from "react";

type RoleBadgeProps = {
  label: string;
  color: string;
  size?: "sm" | "md";
};

export function RoleBadge({ label, color, size = "md" }: RoleBadgeProps) {
  return (
    <span
      className={`dash-badge${size === "sm" ? " dash-badge--sm" : ""}`}
      style={
        {
          "--badge-color": color,
          backgroundColor: `color-mix(in srgb, ${color} 18%, transparent)`,
          color,
          borderColor: `color-mix(in srgb, ${color} 35%, transparent)`,
        } as CSSProperties
      }
    >
      {label}
    </span>
  );
}
