/**
 * Tier gating — Sprint A (The Display Suite)
 *
 * Synchronous, typed feature-gate helpers for client components.
 * Complements `lib/api-helpers.ts` (async server-side tier checking) by giving
 * React components a pure function they can call with a brewery row already
 * in scope — no extra Supabase round-trip.
 *
 * Usage:
 *   import { canAccessFeature } from "@/lib/tier-gates";
 *
 *   if (canAccessFeature(brewery, "custom-brand-color")) {
 *     // show color picker
 *   } else {
 *     // show upgrade CTA
 *   }
 *
 * All gates key off `brewery.subscription_tier`. If the brewery belongs to a
 * brand, check `brand.subscription_tier` at the API layer via
 * `checkBrandCovered` before passing the brewery to a client component — this
 * helper only reads what's on the row it's given.
 */

import { PREMIUM_TIERS } from "./api-helpers";

/** Display Suite feature enum — one key per gated capability. */
export type DisplayFeature =
  // Board
  | "custom-brand-color"           // brewery.brand_color picker
  | "custom-background"            // upload your own background image
  | "custom-font"                  // pick from the 8 curated font pairs
  | "display-scale-override"       // manually pin monitor / large-tv / cinema
  | "board-gallery"                // The Gallery format (museum layout, Sprint B)
  // Promotions
  | "promo-carousel"               // board_promotions rotation between beers
  // QR
  | "qr-logo-embed"                // brewery logo in the center of the QR
  // Print
  | "pdf-print-suite"              // 5 templates beyond "Full Page"
  // Embed
  | "embed-brand-theme";           // iframe with brewery brand palette

/** Minimum brewery row shape needed for feature checks. */
export interface BreweryTierInfo {
  subscription_tier?: string | null;
}

/** Features gated behind Cask / Barrel. Everything else is available in Tap. */
const CASK_GATED_FEATURES: ReadonlySet<DisplayFeature> = new Set([
  "custom-brand-color",
  "custom-background",
  "custom-font",
  "display-scale-override",
  "board-gallery",
  "promo-carousel",
  "qr-logo-embed",
  "pdf-print-suite",
  "embed-brand-theme",
]);

/**
 * Check whether a brewery can access a Display Suite feature.
 * Pure function — no side effects, no async, safe in render paths.
 *
 * @returns `true` if the brewery's current tier grants access to `feature`,
 *          `false` otherwise (including when the brewery/tier is missing).
 */
export function canAccessFeature(
  brewery: BreweryTierInfo | null | undefined,
  feature: DisplayFeature,
): boolean {
  // If the feature is NOT in the Cask-gated set, it's available to everyone
  // (including Tap and free trials).
  if (!CASK_GATED_FEATURES.has(feature)) return true;

  // Cask-gated features require a premium tier on the brewery row.
  const tier = brewery?.subscription_tier;
  if (!tier) return false;
  return (PREMIUM_TIERS as readonly string[]).includes(tier);
}

/**
 * Convenience: get every feature the brewery can access.
 * Useful for feature-flag audits, admin debug panels, and tests.
 */
export function getAccessibleFeatures(
  brewery: BreweryTierInfo | null | undefined,
): DisplayFeature[] {
  const all: DisplayFeature[] = [
    "custom-brand-color",
    "custom-background",
    "custom-font",
    "display-scale-override",
    "board-gallery",
    "promo-carousel",
    "qr-logo-embed",
    "pdf-print-suite",
    "embed-brand-theme",
  ];
  return all.filter((f) => canAccessFeature(brewery, f));
}

/**
 * Human-readable upgrade message for a locked feature.
 * Used by the TierGate UI wrapper to render upsell CTAs.
 */
export function getUpgradeMessage(feature: DisplayFeature): string {
  const messages: Record<DisplayFeature, string> = {
    "custom-brand-color": "Customize your brewery's brand color across the Board, Web menu, and Print — upgrade to Cask.",
    "custom-background": "Upload a custom background image for your Board — upgrade to Cask.",
    "custom-font": "Choose from 8 curated font pairs — upgrade to Cask.",
    "display-scale-override": "Manually pin the display scale for your TV — upgrade to Cask.",
    "board-gallery": "Unlock The Gallery — our museum-style board layout designed for 65\"+ TVs. Upgrade to Cask.",
    "promo-carousel": "Rotate promotional slides between your beers on the Board — upgrade to Cask.",
    "qr-logo-embed": "Put your brewery logo in the center of your QR code — upgrade to Cask.",
    "pdf-print-suite": "Unlock all 6 printable menu templates — upgrade to Cask.",
    "embed-brand-theme": "Style your embedded menu with your brand colors — upgrade to Cask.",
  };
  return messages[feature];
}
