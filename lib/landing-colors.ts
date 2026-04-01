/**
 * Hardcoded color constants for marketing/landing pages.
 * These intentionally do NOT use CSS variables (design decision from Sprint 11).
 * App interior uses CSS vars; marketing pages use these constants.
 */
export const C = {
  cream: "#FBF7F0",
  dark: "#0F0E0C",
  darkSurface: "#1C1A16",
  darkBorder: "#3A3628",
  gold: "#D4A843",
  goldDark: "#C49A35",
  green: "#2D5A3D",
  text: "#1A1714",
  textMuted: "#6B5E4E",
  textSubtle: "#9E8E7A",
  border: "#E5DDD0",
  creamText: "#F5F0E8",
  creamMuted: "#A89F8C",
  creamSubtle: "#8B7E6A",
} as const;
