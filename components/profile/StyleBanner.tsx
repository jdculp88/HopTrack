import type { ReactNode } from "react";
import { getStyleFamily, type BeerStyleFamily } from "@/lib/beerStyleColors";

interface StyleBannerProps {
  /** Beer style string (e.g., "IPA", "Stout") */
  style: string | null;
  /** Banner height in px (default 100) */
  height?: number;
  /** Content overlaid on the banner (labels, settings gear, etc.) */
  children?: ReactNode;
}

/**
 * Dark gradient banner tinted by beer style identity.
 * Each style family has a unique dark palette:
 *   - base: dark linear-gradient at 135deg
 *   - radial1: style color highlight (30% 70%)
 *   - radial2: gold accent highlight (70% 30%)
 *
 * Reusable anywhere a style-colored dark banner is needed.
 */

interface BannerPalette {
  base: string;
  radial1: string;
  radial2: string;
  /** Visible dot color for labels on the dark background */
  dot: string;
}

const BANNER_PALETTES: Record<BeerStyleFamily, BannerPalette> = {
  ipa: {
    base: "linear-gradient(135deg, #1E2A18 0%, #2C3B20 50%, #1A2414 100%)",
    radial1: "radial-gradient(ellipse at 30% 70%, rgba(74,124,46,0.35) 0%, transparent 55%)",
    radial2: "radial-gradient(ellipse at 70% 30%, rgba(196,136,62,0.2) 0%, transparent 50%)",
    dot: "#4A7C2E",
  },
  dipa: {
    base: "linear-gradient(135deg, #1A2816 0%, #283820 50%, #162214 100%)",
    radial1: "radial-gradient(ellipse at 30% 70%, rgba(60,112,40,0.35) 0%, transparent 55%)",
    radial2: "radial-gradient(ellipse at 70% 30%, rgba(196,136,62,0.2) 0%, transparent 50%)",
    dot: "#3C7028",
  },
  pale_ale: {
    base: "linear-gradient(135deg, #1E2818 0%, #2C3820 50%, #1A2414 100%)",
    radial1: "radial-gradient(ellipse at 30% 70%, rgba(100,148,62,0.35) 0%, transparent 55%)",
    radial2: "radial-gradient(ellipse at 70% 30%, rgba(196,136,62,0.2) 0%, transparent 50%)",
    dot: "#649E3E",
  },
  stout: {
    base: "linear-gradient(135deg, #1A1210 0%, #2A1E18 50%, #171210 100%)",
    radial1: "radial-gradient(ellipse at 30% 70%, rgba(101,67,45,0.35) 0%, transparent 55%)",
    radial2: "radial-gradient(ellipse at 70% 30%, rgba(196,136,62,0.2) 0%, transparent 50%)",
    dot: "#65432D",
  },
  porter: {
    base: "linear-gradient(135deg, #1E1418 0%, #2C1E24 50%, #1A1216 100%)",
    radial1: "radial-gradient(ellipse at 30% 70%, rgba(128,62,92,0.35) 0%, transparent 55%)",
    radial2: "radial-gradient(ellipse at 70% 30%, rgba(196,136,62,0.2) 0%, transparent 50%)",
    dot: "#803E5C",
  },
  sour: {
    base: "linear-gradient(135deg, #2A1824 0%, #361E2E 50%, #221420 100%)",
    radial1: "radial-gradient(ellipse at 30% 70%, rgba(168,56,98,0.35) 0%, transparent 55%)",
    radial2: "radial-gradient(ellipse at 70% 30%, rgba(196,136,62,0.2) 0%, transparent 50%)",
    dot: "#A83862",
  },
  lager: {
    base: "linear-gradient(135deg, #141E2A 0%, #1E2C3B 50%, #121A24 100%)",
    radial1: "radial-gradient(ellipse at 30% 70%, rgba(46,98,148,0.35) 0%, transparent 55%)",
    radial2: "radial-gradient(ellipse at 70% 30%, rgba(196,136,62,0.2) 0%, transparent 50%)",
    dot: "#2E6294",
  },
  saison: {
    base: "linear-gradient(135deg, #2A2218 0%, #3B3020 50%, #241E14 100%)",
    radial1: "radial-gradient(ellipse at 30% 70%, rgba(196,148,74,0.35) 0%, transparent 55%)",
    radial2: "radial-gradient(ellipse at 70% 30%, rgba(196,136,62,0.2) 0%, transparent 50%)",
    dot: "#C4943A",
  },
  pilsner: {
    base: "linear-gradient(135deg, #242018 0%, #342C1E 50%, #1E1A14 100%)",
    radial1: "radial-gradient(ellipse at 30% 70%, rgba(180,156,80,0.35) 0%, transparent 55%)",
    radial2: "radial-gradient(ellipse at 70% 30%, rgba(196,136,62,0.2) 0%, transparent 50%)",
    dot: "#B49C50",
  },
  amber: {
    base: "linear-gradient(135deg, #2A1E14 0%, #3B2A18 50%, #241A12 100%)",
    radial1: "radial-gradient(ellipse at 30% 70%, rgba(196,120,46,0.35) 0%, transparent 55%)",
    radial2: "radial-gradient(ellipse at 70% 30%, rgba(196,136,62,0.2) 0%, transparent 50%)",
    dot: "#C4782E",
  },
  cider: {
    base: "linear-gradient(135deg, #2A1820 0%, #3B1E2C 50%, #241418 100%)",
    radial1: "radial-gradient(ellipse at 30% 70%, rgba(196,102,128,0.35) 0%, transparent 55%)",
    radial2: "radial-gradient(ellipse at 70% 30%, rgba(196,136,62,0.2) 0%, transparent 50%)",
    dot: "#C46680",
  },
  wine: {
    base: "linear-gradient(135deg, #241418 0%, #341E24 50%, #201216 100%)",
    radial1: "radial-gradient(ellipse at 30% 70%, rgba(140,46,78,0.35) 0%, transparent 55%)",
    radial2: "radial-gradient(ellipse at 70% 30%, rgba(196,136,62,0.2) 0%, transparent 50%)",
    dot: "#8C2E4E",
  },
  cocktail: {
    base: "linear-gradient(135deg, #142424 0%, #1E3434 50%, #122020 100%)",
    radial1: "radial-gradient(ellipse at 30% 70%, rgba(46,140,140,0.35) 0%, transparent 55%)",
    radial2: "radial-gradient(ellipse at 70% 30%, rgba(196,136,62,0.2) 0%, transparent 50%)",
    dot: "#2E8C8C",
  },
  na: {
    base: "linear-gradient(135deg, #24221A 0%, #34301E 50%, #201E16 100%)",
    radial1: "radial-gradient(ellipse at 30% 70%, rgba(196,180,58,0.35) 0%, transparent 55%)",
    radial2: "radial-gradient(ellipse at 70% 30%, rgba(196,136,62,0.2) 0%, transparent 50%)",
    dot: "#C4B43A",
  },
  default: {
    base: "linear-gradient(135deg, #2A2418 0%, #3B3220 50%, #241E14 100%)",
    radial1: "radial-gradient(ellipse at 30% 70%, rgba(196,156,62,0.35) 0%, transparent 55%)",
    radial2: "radial-gradient(ellipse at 70% 30%, rgba(196,136,62,0.2) 0%, transparent 50%)",
    dot: "#C49C3E",
  },
};

/** Style family → human-readable label for banner */
const FAMILY_LABELS: Record<BeerStyleFamily, string> = {
  ipa: "IPA DRINKER",
  dipa: "DIPA DRINKER",
  pale_ale: "PALE ALE DRINKER",
  stout: "STOUT DRINKER",
  porter: "PORTER DRINKER",
  sour: "SOUR DRINKER",
  lager: "LAGER DRINKER",
  saison: "SAISON DRINKER",
  pilsner: "PILSNER DRINKER",
  amber: "AMBER DRINKER",
  cider: "CIDER DRINKER",
  wine: "WINE DRINKER",
  cocktail: "COCKTAIL DRINKER",
  na: "NA DRINKER",
  default: "CRAFT DRINKER",
};

export function getStyleBannerPalette(style: string | null) {
  const family = getStyleFamily(style);
  return {
    palette: BANNER_PALETTES[family] ?? BANNER_PALETTES.default,
    label: FAMILY_LABELS[family] ?? FAMILY_LABELS.default,
  };
}

export function StyleBanner({ style, height = 100, children }: StyleBannerProps) {
  const family = getStyleFamily(style);
  const g = BANNER_PALETTES[family] ?? BANNER_PALETTES.default;

  return (
    <div
      style={{
        height: `${height}px`,
        background: `${g.radial1}, ${g.radial2}, ${g.base}`,
        position: "relative",
      }}
    >
      {children}
    </div>
  );
}
