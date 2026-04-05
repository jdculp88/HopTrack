// Brand constants — Sprint 162 (The Identity)
//
// Centralized brand colors, fonts, and dimensions for reuse in OG image routes
// and other surfaces that can't read CSS custom properties (edge runtime).

/** HopTrack brand color palette (dark theme / app interior). */
export const BRAND_COLORS = {
  // Backgrounds
  bg: "#0F0E0C",
  surface: "#1C1A16",
  surface2: "#252219",
  border: "#3A3628",

  // Text
  textPrimary: "#F5F0E8",
  textSecondary: "#A89F8C",
  textMuted: "#8B7D6E",

  // Accents
  accentGold: "#D4A843",
  accentAmber: "#E8841A",
  accentGreen: "#2D5A3D",

  // Functional
  danger: "#C44B3A",
  success: "#3D7A52",
} as const;

/** Gradient backgrounds used in OG image routes. */
export const BRAND_GRADIENTS = {
  ogDark: "linear-gradient(135deg, #0F0E0C 0%, #1A1814 50%, #0F0E0C 100%)",
  ogRadialGold:
    "radial-gradient(ellipse 80% 60% at 50% 40%, #1C1A16 0%, #0F0E0C 70%)",
  goldShimmer:
    "linear-gradient(135deg, #D4A843 0%, #E8D5A3 50%, #D4A843 100%)",
} as const;

/** Achievement tier colors (used by achievement + percentile OG cards). */
export const TIER_ACCENT_COLORS = {
  bronze: "#CD7F32",
  silver: "#C0C0C0",
  gold: "#D4A843",
  platinum: "#E5E4E2",
} as const;

/** Font family strings safe for next/og ImageResponse (system fonts). */
export const BRAND_FONTS = {
  display: "serif",        // Playfair Display aesthetic
  body: "system-ui, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, monospace",
} as const;

/** OG image dimensions. */
export const OG_DIMENSIONS = {
  /** Standard Open Graph: social link preview (1200×630). */
  standard: { width: 1200, height: 630 },
  /** Instagram Story / vertical social format (1080×1920). */
  story: { width: 1080, height: 1920 },
} as const;

/** Public base URL for share links + OG image URLs. */
export const HOPTRACK_BASE_URL = "https://hoptrack.beer";
