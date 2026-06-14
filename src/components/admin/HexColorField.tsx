"use client";

import { useState } from "react";
import { normalizeHexColor } from "@/lib/category-colors";

type HexColorFieldProps = {
  name: string;
  label: string;
  defaultValue: string;
};

export function HexColorField({ name, label, defaultValue }: HexColorFieldProps) {
  const [color, setColor] = useState(normalizeHexColor(defaultValue));

  function updateColor(next: string) {
    setColor(normalizeHexColor(next, color));
  }

  return (
    <div className="admin-field">
      <label className="admin-label">{label}</label>
      <div className="admin-hex-color-row">
        <input
          type="color"
          className="admin-color-input"
          value={color}
          onChange={(event) => updateColor(event.target.value)}
          aria-label={`${label} picker`}
        />
        <input
          type="text"
          className="admin-input admin-hex-input"
          value={color}
          onChange={(event) => {
            const next = event.target.value;
            if (/^#[0-9A-Fa-f]{0,6}$/.test(next)) setColor(next);
          }}
          onBlur={() => updateColor(color)}
          dir="ltr"
          spellCheck={false}
          maxLength={7}
          placeholder="#2c9942"
        />
      </div>
      <input type="hidden" name={name} value={color} />
    </div>
  );
}
