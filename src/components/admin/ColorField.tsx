"use client";

import { useState } from "react";

type ColorFieldProps = {
  name: string;
  label: string;
  defaultValue: string;
  presets: { value: string; label: string }[];
};

export function ColorField({ name, label, defaultValue, presets }: ColorFieldProps) {
  const [color, setColor] = useState(defaultValue);

  return (
    <div className="admin-field">
      <label className="admin-label">{label}</label>
      <div className="admin-row">
        <select
          className="admin-select"
          value={color}
          onChange={(event) => setColor(event.target.value)}
        >
          {presets.map((preset) => (
            <option key={preset.value} value={preset.value}>
              {preset.label}
            </option>
          ))}
        </select>
        <input
          type="color"
          className="admin-color-input"
          value={color}
          onChange={(event) => setColor(event.target.value)}
          aria-label="لون مخصص"
        />
      </div>
      <input type="hidden" name={name} value={color} />
    </div>
  );
}
