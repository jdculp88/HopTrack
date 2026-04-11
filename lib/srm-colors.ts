/**
 * SRM (Standard Reference Method) color lookup — 1 to 40.
 *
 * SRM is the beer color scale used by brewers worldwide. The hex values below
 * are the standard reference colors published in the BJCP guidelines and used
 * by every major homebrew/pro-brew tool (BeerSmith, Brewer's Friend, etc.).
 * Rendering uses the RGB approximation of how that color appears through a
 * standard 1/2" diameter glass column.
 *
 * - SRM  1–3:  pale straw / very light (Pilsner, American Light Lager)
 * - SRM  4–6:  straw → light gold (German Pils, Kölsch, Cream Ale)
 * - SRM  7–9:  gold → deep gold (Blonde Ale, English Bitter)
 * - SRM 10–14: amber → copper (Pale Ale, Oktoberfest, IPA)
 * - SRM 15–19: deep copper → red (Red Ale, Brown Ale, ESB)
 * - SRM 20–27: brown → dark brown (Dunkel, Doppelbock, Porter)
 * - SRM 28–34: very dark brown → black (Stout, Schwarzbier)
 * - SRM 35–40: jet black, opaque (Imperial Stout, Russian Imperial Stout)
 *
 * Values beyond 40 exist (up to ~80 for Imperial Stouts) but are visually
 * indistinguishable from SRM 40 — pitch black — so we clamp at 40.
 */

export const SRM_MIN = 1;
export const SRM_MAX = 40;

/** Hex value per SRM step (1-indexed; index 0 is a padding entry). */
const SRM_HEX: readonly string[] = [
  "#FFE699", // 0 placeholder (never used)
  "#FFE699", //  1 — pale straw
  "#FFD878", //  2
  "#FFCA5A", //  3
  "#FFBF42", //  4
  "#FBB123", //  5
  "#F8A600", //  6
  "#F39C00", //  7
  "#EA8F00", //  8
  "#E58500", //  9
  "#DE7C00", // 10 — amber
  "#D77200", // 11
  "#CF6900", // 12
  "#CB6200", // 13
  "#C35900", // 14
  "#BB5100", // 15 — copper
  "#B54C00", // 16
  "#B04500", // 17
  "#A63E00", // 18
  "#A13700", // 19
  "#9B3200", // 20 — deep copper / brown
  "#952D00", // 21
  "#8E2900", // 22
  "#882300", // 23
  "#821E00", // 24
  "#7B1A00", // 25
  "#771900", // 26
  "#701400", // 27
  "#6A0E00", // 28 — dark brown
  "#660D00", // 29
  "#5E0B00", // 30 — very dark brown
  "#5A0A02", // 31
  "#560A05", // 32
  "#520907", // 33
  "#4C0505", // 34
  "#470606", // 35 — black
  "#440607", // 36
  "#3F0708", // 37
  "#3B0607", // 38
  "#380607", // 39
  "#340606", // 40 — pitch black
] as const;

/**
 * Get the hex color for a given SRM value. Clamps to 1-40 and returns a safe
 * default if the input is null/undefined/out-of-range.
 */
export function srmToHex(srm: number | null | undefined): string {
  if (srm == null || Number.isNaN(srm)) return SRM_HEX[5]!; // mid-gold default
  const clamped = Math.max(SRM_MIN, Math.min(SRM_MAX, Math.round(srm)));
  return SRM_HEX[clamped]!;
}

/**
 * Short label for the SRM value — useful for accessibility and picker
 * tooltips. Buckets follow standard brewer vocabulary.
 */
export function srmLabel(srm: number | null | undefined): string {
  if (srm == null || Number.isNaN(srm)) return "—";
  const s = Math.max(SRM_MIN, Math.min(SRM_MAX, Math.round(srm)));
  if (s <= 3) return "Pale Straw";
  if (s <= 5) return "Straw";
  if (s <= 7) return "Pale Gold";
  if (s <= 9) return "Deep Gold";
  if (s <= 12) return "Amber";
  if (s <= 17) return "Copper";
  if (s <= 22) return "Deep Copper";
  if (s <= 27) return "Brown";
  if (s <= 32) return "Dark Brown";
  if (s <= 37) return "Very Dark";
  return "Black";
}

/**
 * Is this SRM value dark enough that white text on the swatch is a better
 * contrast choice than dark text? Used by the SRM picker and Slideshow glass
 * art to pick foreground color.
 */
export function isDarkSrm(srm: number | null | undefined): boolean {
  if (srm == null) return false;
  return srm >= 17;
}
