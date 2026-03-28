// HopMark — Morgan's MP-5 "The One" · HopTrack Identity
// Single continuous SVG stroke. Never fill. Never rotate. Never stretch.
// Usage: <HopMark variant="horizontal" theme="dark" height={32} />

import type { CSSProperties } from "react";

// ── Canonical paths (200×260 viewBox) ──────────────────────────────────────
const MARK_PATH =
  "M 100 12 C 138 12, 160 40, 158 72 C 156 100, 136 120, 108 130 " +
  "C 100 132, 100 132, 100 132 C 100 132, 84 126, 72 114 " +
  "C 56 98, 48 76, 52 56 C 56 38, 70 24, 90 20 C 100 18, 112 22, 120 30 " +
  "C 134 44, 138 66, 128 82 C 118 98, 100 104, 86 98 " +
  "C 74 92, 70 78, 76 68 C 82 58, 94 54, 104 60";

// ── Horizontal lockup paths (340×72 viewBox, from spec) ───────────────────
const H_MARK_PATH =
  "M 36 6 C 49.4 6, 57.6 15.5, 57 25.9 C 56.4 35.4, 49.2 43.2, 38.9 46.8 " +
  "C 36 47.8, 36 47.8, 36 47.8 C 36 47.8, 30.2 45.6, 25.9 41.0 " +
  "C 20.2 35.3, 17.3 27.4, 18.7 20.2 C 20.2 13.7, 25.2 8.6, 32.4 7.2 " +
  "C 36 6.5, 40.3 7.9, 43.2 10.8 C 48.2 15.8, 49.7 23.7, 46.1 29.5 " +
  "C 42.4 35.3, 36 37.5, 30.9 35.3 C 26.6 33.3, 25.2 27.9, 27.4 24.2 " +
  "C 29.5 20.8, 33.8 19.4, 37.4 21.5";

export type HopMarkVariant = "mark" | "horizontal" | "stacked" | "wordmark";
export type HopMarkTheme = "dark" | "cream" | "gold-mono" | "white";

interface HopMarkProps {
  variant?: HopMarkVariant;
  theme?: HopMarkTheme;
  /** Controls rendered height in px. Width is derived from aspect ratio. */
  height?: number;
  className?: string;
  style?: CSSProperties;
  "aria-hidden"?: boolean;
}

const COLORS: Record<HopMarkTheme, { mark: string; text: string; ruleOpacity: number }> = {
  "dark":      { mark: "#C8962E", text: "#F5F0E8", ruleOpacity: 0.22 },
  "cream":     { mark: "#A67820", text: "#1A1A1A", ruleOpacity: 0.28 },
  "gold-mono": { mark: "#C8962E", text: "#C8962E", ruleOpacity: 0.22 },
  "white":     { mark: "#F5F0E8", text: "#F5F0E8", ruleOpacity: 0.22 },
};

export function HopMark({
  variant = "horizontal",
  theme = "dark",
  height = 32,
  className,
  style,
  "aria-hidden": ariaHidden,
}: HopMarkProps) {
  const c = COLORS[theme];

  // ── Mark only ────────────────────────────────────────────────────────────
  if (variant === "mark") {
    const w = Math.round((200 / 240) * height);
    return (
      <svg
        width={w}
        height={height}
        viewBox="0 0 200 240"
        fill="none"
        className={className}
        style={style}
        aria-label={ariaHidden ? undefined : "HopTrack"}
        aria-hidden={ariaHidden}
      >
        <path
          d={MARK_PATH}
          stroke={c.mark}
          strokeWidth={5.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Stem */}
        <path
          d="M 100 132 L 100 224"
          stroke={c.mark}
          strokeWidth={5}
          strokeLinecap="round"
        />
        {/* Side shoot */}
        <path
          d="M 100 198 C 116 202, 128 194, 134 180"
          stroke={c.mark}
          strokeWidth={3}
          strokeLinecap="round"
          opacity={0.4}
        />
      </svg>
    );
  }

  // ── Horizontal lockup ────────────────────────────────────────────────────
  if (variant === "horizontal") {
    const w = Math.round((340 / 72) * height);
    return (
      <svg
        width={w}
        height={height}
        viewBox="0 0 340 72"
        fill="none"
        className={className}
        style={style}
        aria-label={ariaHidden ? undefined : "HopTrack"}
        aria-hidden={ariaHidden}
      >
        {/* Hop mark */}
        <path
          d={H_MARK_PATH}
          stroke={c.mark}
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Stem */}
        <path
          d="M 36 47.8 L 36 64"
          stroke={c.mark}
          strokeWidth={2.0}
          strokeLinecap="round"
        />
        {/* Side shoot */}
        <path
          d="M 36 58 C 39.6 58.7, 42.5 56.6, 43.9 53.4"
          stroke={c.mark}
          strokeWidth={1.2}
          strokeLinecap="round"
          opacity={0.4}
        />
        {/* Wordmark — "Hop" 500 + "Track" 700, italic */}
        <text
          x={62}
          y={50}
          fontFamily="'Playfair Display', Georgia, serif"
          fontStyle="italic"
          fontSize={42}
          fontWeight={500}
          fill={c.text}
          letterSpacing={-0.4}
        >
          Hop<tspan fontWeight={700}>Track</tspan>
        </text>
        {/* Gold rule — the pour */}
        <line
          x1={62}
          y1={58}
          x2={338}
          y2={58}
          stroke={c.mark}
          strokeWidth={0.75}
          opacity={c.ruleOpacity}
        />
        <circle cx={338} cy={58} r={1.5} fill={c.mark} opacity={c.ruleOpacity * 1.7} />
      </svg>
    );
  }

  // ── Stacked lockup ───────────────────────────────────────────────────────
  if (variant === "stacked") {
    const w = Math.round((200 / 210) * height);
    return (
      <svg
        width={w}
        height={height}
        viewBox="0 0 200 210"
        fill="none"
        className={className}
        style={style}
        aria-label={ariaHidden ? undefined : "HopTrack"}
        aria-hidden={ariaHidden}
      >
        {/* Hop mark */}
        <path
          d={MARK_PATH}
          stroke={c.mark}
          strokeWidth={5.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Stem */}
        <path
          d="M 100 132 L 100 162"
          stroke={c.mark}
          strokeWidth={4.5}
          strokeLinecap="round"
        />
        {/* Wordmark below */}
        <text
          x={100}
          y={186}
          textAnchor="middle"
          fontFamily="'Playfair Display', Georgia, serif"
          fontStyle="italic"
          fontSize={22}
          fontWeight={500}
          fill={c.text}
          letterSpacing={-0.2}
        >
          Hop<tspan fontWeight={700}>Track</tspan>
        </text>
        {/* Rule */}
        <line
          x1={24}
          y1={194}
          x2={176}
          y2={194}
          stroke={c.mark}
          strokeWidth={0.75}
          opacity={c.ruleOpacity}
        />
        <circle cx={176} cy={194} r={1} fill={c.mark} opacity={c.ruleOpacity * 1.5} />
      </svg>
    );
  }

  // ── Wordmark only ─────────────────────────────────────────────────────────
  if (variant === "wordmark") {
    const w = Math.round((230 / 56) * height);
    return (
      <svg
        width={w}
        height={height}
        viewBox="0 0 230 56"
        fill="none"
        className={className}
        style={style}
        aria-label={ariaHidden ? undefined : "HopTrack"}
        aria-hidden={ariaHidden}
      >
        <text
          x={0}
          y={44}
          fontFamily="'Playfair Display', Georgia, serif"
          fontStyle="italic"
          fontSize={44}
          fontWeight={500}
          fill={c.text}
          letterSpacing={-0.5}
        >
          Hop<tspan fontWeight={700}>Track</tspan>
        </text>
        <line
          x1={0}
          y1={51}
          x2={228}
          y2={51}
          stroke={c.mark}
          strokeWidth={0.75}
          opacity={c.ruleOpacity}
        />
        <circle cx={228} cy={51} r={1.5} fill={c.mark} opacity={c.ruleOpacity * 1.7} />
      </svg>
    );
  }

  return null;
}

// ── App Icon SVG (for favicon/manifest generation) ────────────────────────
// Dark square with centered mark. Use at 512×512 for best results.
export function HopMarkIcon({ size = 80 }: { size?: number }) {
  const r = Math.round(size * 0.225); // border-radius ≈ iOS icon rounding
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      aria-label="HopTrack"
    >
      <rect width={80} height={80} rx={r} fill="#111109" />
      <g transform="translate(40,38) scale(0.255) translate(-100,-120)">
        <path
          d={MARK_PATH}
          stroke="#C8962E"
          strokeWidth={18}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M 100 132 L 100 215"
          stroke="#C8962E"
          strokeWidth={17}
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

// ── Raw SVG path data for canvas/export use ───────────────────────────────
// Use these when drawing the mark on canvas (QR tent PNG, share cards, etc.)
export const HOPMARK_PATHS = {
  // Mark body path in 200×260 coordinate space
  mark: MARK_PATH,
  // Horizontal lockup mark path in 340×72 coordinate space
  markHorizontal: H_MARK_PATH,
} as const;
