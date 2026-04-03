/**
 * Shared UI style constants — Sprint 134 (The Tidy)
 *
 * Consolidates pill toggle styles and status badge colors that were
 * duplicated across 5+ files.
 */

import type { CSSProperties } from "react";

// ─── Filter Pill Styles (active/inactive toggle) ────────────────────────────

export const PILL_ACTIVE: CSSProperties = {
  background: "color-mix(in srgb, var(--accent-gold) 15%, transparent)",
  color: "var(--accent-gold)",
  borderColor: "color-mix(in srgb, var(--accent-gold) 40%, transparent)",
};

export const PILL_INACTIVE: CSSProperties = {
  background: "var(--surface-2)",
  color: "var(--text-muted)",
  borderColor: "transparent",
};

// ─── Status Badge Styles ────────────────────────────────────────────────────

export interface StatusStyle {
  bg: string;
  color: string;
  label: string;
}

export const CLAIM_STATUS_STYLES: Record<string, StatusStyle> = {
  pending: {
    bg: "rgba(232,132,26,0.12)",
    color: "var(--accent-amber, #E8841A)",
    label: "Pending",
  },
  approved: {
    bg: "rgba(61,122,82,0.12)",
    color: "var(--success, #3D7A52)",
    label: "Approved",
  },
  rejected: {
    bg: "rgba(196,75,58,0.1)",
    color: "var(--danger)",
    label: "Rejected",
  },
} as const;

// ─── Form Input Styles (brand wizard, settings) ────────────────────────────

export const INPUT_STYLE: CSSProperties = {
  width: "100%",
  padding: "10px 16px",
  borderRadius: 12,
  border: "1px solid var(--border)",
  background: "var(--surface-2)",
  color: "var(--text-primary)",
  fontSize: 14,
  outline: "none",
};

export const TEXTAREA_STYLE: CSSProperties = {
  ...INPUT_STYLE,
  resize: "none" as const,
};
