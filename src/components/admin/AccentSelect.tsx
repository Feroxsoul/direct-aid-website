import { categoryAccentColors } from "@/lib/design-tokens";
import type { CategoryAccent } from "@/lib/design-tokens";

const accents: CategoryAccent[] = [
  "red",
  "green",
  "blue",
  "olive",
  "yellow",
  "orange",
  "water",
  "default",
];

const accentLabels: Record<CategoryAccent, string> = {
  red: "أحمر — تعليمية",
  green: "أخضر — صحية",
  blue: "أزرق — تنموية",
  olive: "زيتي — دعوية",
  yellow: "أصفر — إغاثية",
  orange: "برتقالي — أيتام",
  water: "أزرق فاتح — مياه",
  default: "رمادي — مساجد",
};

type AccentSelectProps = {
  name?: string;
  defaultValue: CategoryAccent;
};

export function AccentSelect({ name = "accent", defaultValue }: AccentSelectProps) {
  return (
    <select name={name} className="admin-select" defaultValue={defaultValue}>
      {accents.map((accent) => (
        <option key={accent} value={accent}>
          {accentLabels[accent]} ({categoryAccentColors[accent]})
        </option>
      ))}
    </select>
  );
}
