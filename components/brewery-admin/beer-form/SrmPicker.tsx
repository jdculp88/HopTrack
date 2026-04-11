"use client";

/**
 * SrmPicker — numeric input (1–40) paired with a live color swatch preview.
 *
 * SRM (Standard Reference Method) is the brewer's scale for beer color.
 * `lib/srm-colors.ts` maps the value to a hex swatch we render next to the
 * input so brewers get immediate visual feedback as they type.
 *
 * Controlled component. Stores the value as a string to match the rest of
 * the BeerFormData shape (abv/ibu/price are all strings too — lets the
 * input round-trip empty state cleanly).
 */

import { srmToHex, srmLabel, SRM_MIN, SRM_MAX, isDarkSrm } from "@/lib/srm-colors";

interface SrmPickerProps {
  value: string;
  onChange: (next: string) => void;
  error?: string;
}

export function SrmPicker({ value, onChange, error }: SrmPickerProps) {
  const parsed = value === "" ? null : parseInt(value, 10);
  const isValid =
    parsed != null && !Number.isNaN(parsed) && parsed >= SRM_MIN && parsed <= SRM_MAX;
  const effectiveValue = isValid ? parsed : null;
  const hex = srmToHex(effectiveValue);
  const label = effectiveValue != null ? srmLabel(effectiveValue) : "\u2014";

  return (
    <div>
      <label
        className="text-xs font-mono uppercase tracking-wider block mb-1.5"
        style={{ color: "var(--text-muted)" }}
      >
        SRM{" "}
        <span
          style={{
            color: "var(--text-muted)",
            fontWeight: 400,
            textTransform: "none",
            letterSpacing: 0,
          }}
        >
          (beer color, 1&ndash;40)
        </span>
      </label>
      <div className="flex items-stretch gap-2">
        <input
          type="number"
          step="1"
          min={SRM_MIN}
          max={SRM_MAX}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="e.g. 8"
          className="flex-1 px-4 py-2.5 rounded-xl border text-sm focus:outline-none"
          style={{
            background: "var(--surface-2)",
            borderColor: error ? "var(--danger)" : "var(--border)",
            color: "var(--text-primary)",
          }}
        />
        <div
          role="img"
          aria-label={effectiveValue != null ? `SRM ${effectiveValue} — ${label}` : "No SRM set"}
          className="flex items-center justify-center rounded-xl border font-mono text-xs font-semibold px-3"
          style={{
            minWidth: 96,
            background: hex,
            borderColor: "var(--border)",
            color: isDarkSrm(effectiveValue) ? "#FBF7F0" : "#1A1714",
          }}
        >
          {label}
        </div>
      </div>
      {error && (
        <p className="text-xs mt-1" style={{ color: "var(--danger)" }}>
          {error}
        </p>
      )}
    </div>
  );
}
