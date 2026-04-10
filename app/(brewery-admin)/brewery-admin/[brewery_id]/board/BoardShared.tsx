"use client";

/**
 * Shared sub-components used across multiple Board display formats.
 * Extracted from BoardTapList (Sprint 167).
 *
 * Sprint A (Display Suite): BeerMetaRow and BeerStatsRow now accept an
 * optional `resolvedScale` prop so their internal font-size calculation
 * respects the big-screen display scale. Defaults to "monitor" for
 * back-compat.
 */

import { getGlass, getGlassSvgContent } from "@/lib/glassware";
import { getStyleFamily, type BeerStyleFamily } from "@/lib/beerStyleColors";
import { C, getScaledFS, formatPrice, type BoardBeer, type BeerStats, type BoardSettings, type ResolvedDisplayScale, type FSEntry } from "./board-types";
import type { PourSize } from "@/lib/glassware";

// ─── Glass SVG ────────────────────────────────────────────────────────────────

export function GlassIllustration({
  glassKey, instanceId, width, height,
}: {
  glassKey: string; instanceId: string; width: number; height: number; label?: string;
}) {
  const glass = getGlass(glassKey);
  if (!glass) return null;
  const svgHtml = getGlassSvgContent(glass, instanceId);
  return (
    <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
      <svg
        viewBox="0 0 80 120"
        width={width}
        height={height}
        style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.08))", display: "block" }}
        dangerouslySetInnerHTML={{ __html: svgHtml }}
      />
      <span className="font-mono" style={{
        fontSize: glass.name.length > 8 ? 8 : 9,
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        color: C.textSubtle,
        textAlign: "center",
        lineHeight: 1.2,
        maxWidth: width + 8,
      }}>
        {glass.name}
      </span>
    </div>
  );
}

// ─── Compact chip FS ──────────────────────────────────────────────────────────
//
// Scales down the chip-related fs fields so narrow cards (Grid, Compact,
// PosterCompactRow) can fit 3–4 chips without overflowing. Other fields
// (name, price, etc.) are untouched.

export function compactChipFs(fs: FSEntry): FSEntry {
  return {
    ...fs,
    chipLabel: Math.max(8, Math.round(fs.chipLabel * 0.75)),
    chipOz: Math.max(7, Math.round(fs.chipOz * 0.75)),
    chipPrice: Math.max(13, Math.round(fs.chipPrice * 0.75)),
    chipPadV: Math.max(3, Math.round(fs.chipPadV * 0.6)),
    chipPadH: Math.max(6, Math.round(fs.chipPadH * 0.6)),
  };
}

// ─── Size chips ───────────────────────────────────────────────────────────────
//
// Chips wrap to a new row when their container is too narrow (e.g. Grid cards,
// Compact rows) instead of overflowing. Every chip is forced to a uniform
// minHeight so a label like "HALF PINT" that wraps to two lines doesn't make
// its chip taller than the one next to it. Labels use `whiteSpace: nowrap` so
// they stay on a single line; chip width grows to fit instead.
//
// Pass `wrap={true}` (Grid, Compact) to let the chip row shrink inside its
// parent and wrap to multiple rows. Default (Classic, Poster hero) is
// `flexShrink: 0` so the row sits intact next to the leader / hero glass.

export function SizeChips({
  sizes, fs, wrap = false, justify = "flex-start",
}: {
  sizes: PourSize[];
  fs: FSEntry;
  wrap?: boolean;
  justify?: "flex-start" | "center" | "flex-end";
}) {
  // Uniform chip height = label line + oz line + 2× vertical padding + a bit of slack.
  const chipMinHeight = Math.round(
    fs.chipLabel * 1.2 + fs.chipOz * 1.2 + fs.chipPadV * 2 + 4,
  );
  return (
    <div style={{
      display: "flex",
      gap: 8,
      rowGap: 8,
      alignItems: "center",
      flexWrap: "wrap",
      justifyContent: justify,
      // Classic/Poster hero: nowrap-style (flex-shrink: 0, no max-width).
      // Grid/Compact: shrink to fit, constrain to parent width so chips wrap.
      flexShrink: wrap ? 1 : 0,
      maxWidth: wrap ? "100%" : undefined,
      minWidth: 0,
    }}>
      {sizes.map((size, idx) => (
        <div
          key={idx}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            minHeight: chipMinHeight,
            background: C.chipBg,
            border: `1px solid ${C.chipBorder}`,
            borderRadius: 8,
            padding: `${fs.chipPadV}px ${fs.chipPadH}px`,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div className="font-mono" style={{
              fontSize: fs.chipLabel, letterSpacing: "0.08em",
              textTransform: "uppercase", color: C.textMuted, lineHeight: 1.2,
              whiteSpace: "nowrap",
            }}>
              {size.label}
            </div>
            {size.oz != null && (
              <div className="font-mono" style={{
                fontSize: fs.chipOz, color: C.textSubtle, opacity: 0.7,
                whiteSpace: "nowrap",
              }}>
                {size.oz} oz
              </div>
            )}
          </div>
          <div style={{ width: 1, alignSelf: "stretch", background: C.chipBorder, flexShrink: 0 }} />
          <div className="font-mono" style={{ fontWeight: 700, fontSize: fs.chipPrice, color: C.gold, lineHeight: 1, flexShrink: 0 }}>
            {formatPrice(size.price)}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Meta row (style · ABV · IBU · promo) ─────────────────────────────────────

export function BeerMetaRow({
  beer, settings, featured = false, resolvedScale = "monitor",
}: {
  beer: BoardBeer; settings: BoardSettings; featured?: boolean;
  resolvedScale?: ResolvedDisplayScale;
}) {
  const { showABV, showStyle } = settings;
  const fs = getScaledFS(settings, resolvedScale);
  const hasAny = (showStyle && beer.style) || (showABV && beer.abv != null) || beer.promo_text;
  if (!hasAny) return null;

  return (
    <div className="font-mono" style={{ display: "flex", alignItems: "center", gap: 0, marginTop: 4 }}>
      {showStyle && beer.style && (
        <span style={{
          fontSize: featured ? 16 : fs.style,
          textTransform: "uppercase", letterSpacing: "0.15em", color: C.textMuted,
        }}>
          {beer.style}
        </span>
      )}
      {showStyle && beer.style && showABV && beer.abv != null && (
        <span style={{ margin: "0 8px", fontSize: featured ? 15 : fs.meta, color: C.textSubtle }}>·</span>
      )}
      {showABV && beer.abv != null && (
        <span style={{ fontSize: featured ? 15 : fs.meta, color: C.textSubtle }}>
          {beer.abv.toFixed(1)}% ABV
        </span>
      )}
      {showABV && beer.ibu != null && beer.abv != null && (
        <span style={{ margin: "0 8px", fontSize: featured ? 15 : fs.meta, color: C.textSubtle }}>·</span>
      )}
      {showABV && beer.ibu != null && (
        <span style={{ fontSize: featured ? 15 : fs.meta, color: C.textSubtle }}>
          {beer.ibu} IBU
        </span>
      )}
      {beer.promo_text && (
        <>
          <span style={{ margin: "0 8px", fontSize: featured ? 15 : fs.meta, color: C.textSubtle }}>·</span>
          <span style={{ fontSize: 14, color: C.gold }}>✦ {beer.promo_text}</span>
        </>
      )}
    </div>
  );
}

// ─── Stats row (rating · pours · biggest fan) ─────────────────────────────────

export function BeerStatsRow({
  beer, settings, beerStats, featured = false, resolvedScale = "monitor", centered = false,
}: {
  beer: BoardBeer; settings: BoardSettings; beerStats: BeerStats | undefined; featured?: boolean;
  resolvedScale?: ResolvedDisplayScale;
  /** Center the stats row and stack biggest-fan on its own line. Used by narrow Grid cards. */
  centered?: boolean;
}) {
  const { showRating, showStats } = settings;
  const fs = getScaledFS(settings, resolvedScale);
  const rating = beerStats?.avgRating ?? beer.avg_rating;

  const hasRating = showRating && rating != null;
  const hasPours  = beerStats && beerStats.pourCount > 0;
  const hasAny = showStats && (hasRating || hasPours || beerStats?.biggestFan);
  if (!hasAny) return null;

  // In centered mode (Grid cards), the biggest-fan stat renders on its own
  // line to avoid horizontal overflow in narrow cards. In default mode
  // (Classic / Poster / Slideshow), everything stays on one horizontal line.
  if (centered) {
    return (
      <div className="font-mono" style={{
        fontSize: featured ? 15 : fs.stat, color: C.textSubtle, marginTop: 6,
        display: "flex", flexDirection: "column", alignItems: "center",
        gap: 2, maxWidth: "100%",
      }}>
        {(hasRating || hasPours) && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
            {hasRating && (
              <span style={{ color: C.gold, fontWeight: 700 }}>⭐ {rating!.toFixed(1)}</span>
            )}
            {hasRating && hasPours && <span>·</span>}
            {hasPours && (
              <span>{beerStats!.pourCount.toLocaleString()} {beerStats!.pourCount === 1 ? "pour" : "pours"}</span>
            )}
          </div>
        )}
        {beerStats?.biggestFan && (
          <div style={{
            maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            Biggest fan: {beerStats.biggestFan}
          </div>
        )}
      </div>
    );
  }

  // Classic / Poster / Slideshow: default horizontal layout with wrap fallback
  return (
    <div className="font-mono" style={{
      fontSize: featured ? 15 : fs.stat, color: C.textSubtle, marginTop: 6,
      display: "flex", alignItems: "center", gap: 0,
      flexWrap: "wrap", rowGap: 4, maxWidth: "100%",
    }}>
      {hasRating && (
        <span style={{ color: C.gold, fontWeight: 700 }}>⭐ {rating!.toFixed(1)}</span>
      )}
      {hasRating && hasPours && <span style={{ margin: "0 8px" }}>·</span>}
      {hasPours && (
        <span>{beerStats!.pourCount.toLocaleString()} {beerStats!.pourCount === 1 ? "pour" : "pours"}</span>
      )}
      {beerStats?.biggestFan && (
        <>
          <span style={{ margin: "0 8px" }}>·</span>
          <span>Biggest fan: {beerStats.biggestFan}</span>
        </>
      )}
    </div>
  );
}

// ─── Section header (style-family or item-type labeled) ──────────────────────

export function BoardSectionHeader({
  label, emoji, count, _delay = 0,
}: {
  label: string;
  emoji?: string;
  count: number;
  _delay?: number;
}) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      marginBottom: "clamp(10px, 1.5vh, 20px)",
    }}>
      {emoji && <span style={{ fontSize: 20 }}>{emoji}</span>}
      <span className="font-mono" style={{
        fontSize: 14, textTransform: "uppercase", letterSpacing: "0.2em",
        color: C.gold, fontWeight: 700,
      }}>
        {label}
      </span>
      <span className="font-mono" style={{ fontSize: 13, color: C.textSubtle }}>
        ({count})
      </span>
      <div style={{ flex: 1, height: 1, background: "rgba(212,168,67,0.2)" }} />
    </div>
  );
}

// ─── Empty board state ─────────────────────────────────────────────────────────

export function EmptyBoardState() {
  return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", textAlign: "center", padding: 40,
    }}>
      <p className="font-display" style={{ fontSize: 32, color: "rgba(26,23,20,0.25)", fontStyle: "italic" }}>
        No beers on tap
      </p>
      <p style={{ fontSize: 16, marginTop: 8, color: C.textSubtle }}>
        Add beers to your tap list to see them here
      </p>
    </div>
  );
}

// ─── Group beers by item type ──────────────────────────────────────────────────

export function groupBeersByType(beers: BoardBeer[]): { type: string; items: BoardBeer[] }[] {
  const hasMultipleTypes = new Set(beers.map(b => b.item_type ?? "beer")).size > 1;
  if (!hasMultipleTypes) return [{ type: "beer", items: beers }];

  const typeOrder = ["beer", "cider", "wine", "cocktail", "na_beverage", "food"];
  const groups: Record<string, BoardBeer[]> = {};
  for (const b of beers) {
    const t = b.item_type ?? "beer";
    if (!groups[t]) groups[t] = [];
    groups[t].push(b);
  }
  return typeOrder
    .filter(t => groups[t] && groups[t].length > 0)
    .map(t => ({ type: t, items: groups[t] }));
}

// ─── Group beers by style family (IPAs, Stouts, Ciders, Wine, etc.) ──────────
//
// Sprint A — per Joshua's feedback, Board should show named section headings
// grouped by style family (IPAs, Lagers, Stouts) rather than the coarser
// item-type groupings (beer/cider/wine). The `getStyleFamily()` helper
// handles both cases: beer styles map via name, non-beer item types map via
// their item_type enum.

export const BOARD_STYLE_GROUP_LABELS: Record<BeerStyleFamily, { label: string; emoji: string }> = {
  ipa:      { label: "IPAs",                     emoji: "🌿" },
  dipa:     { label: "Double & Imperial IPAs",   emoji: "🌲" },
  pale_ale: { label: "Pale Ales",                emoji: "🍺" },
  pilsner:  { label: "Pilsners",                 emoji: "🍻" },
  lager:    { label: "Lagers",                   emoji: "🍻" },
  saison:   { label: "Saisons & Farmhouse",      emoji: "🌾" },
  amber:    { label: "Ambers & Reds",            emoji: "🔥" },
  porter:   { label: "Porters & Browns",         emoji: "🟤" },
  stout:    { label: "Stouts",                   emoji: "☕" },
  sour:     { label: "Sours & Wild Ales",        emoji: "🍇" },
  cider:    { label: "Ciders",                   emoji: "🍏" },
  wine:     { label: "Wine",                     emoji: "🍷" },
  cocktail: { label: "Cocktails",                emoji: "🍹" },
  na:       { label: "Non-Alcoholic",            emoji: "🥤" },
  default:  { label: "Other",                    emoji: "🍺" },
};

/** Display order for style-family groups (lighter → darker → non-beer). */
const STYLE_GROUP_ORDER: BeerStyleFamily[] = [
  "pilsner", "lager", "pale_ale", "ipa", "dipa",
  "saison", "amber", "porter", "stout", "sour",
  "cider", "wine", "cocktail", "na",
  "default",
];

export interface StyleGroup {
  family: BeerStyleFamily;
  label: string;
  emoji: string;
  items: BoardBeer[];
}

export function groupBeersByStyleFamily(beers: BoardBeer[]): StyleGroup[] {
  if (beers.length === 0) return [];

  const groups = new Map<BeerStyleFamily, BoardBeer[]>();
  for (const beer of beers) {
    const family = getStyleFamily(beer.style, beer.item_type);
    if (!groups.has(family)) groups.set(family, []);
    groups.get(family)!.push(beer);
  }

  return STYLE_GROUP_ORDER
    .filter(f => groups.has(f))
    .map(f => ({
      family: f,
      label: BOARD_STYLE_GROUP_LABELS[f].label,
      emoji: BOARD_STYLE_GROUP_LABELS[f].emoji,
      items: groups.get(f)!,
    }));
}

// ─── Derive common beer lists ──────────────────────────────────────────────────

export function deriveBeerLists(beers: BoardBeer[]) {
  const featuredBeer     = beers.find(b => b.is_featured && !b.is_86d) ?? null;
  const activeTapBeers   = beers.filter(b => !b.is_featured && !b.is_86d);
  const eightySixedBeers = beers.filter(b => b.is_86d);
  const hasMultipleTypes = new Set(activeTapBeers.map(b => b.item_type ?? "beer")).size > 1;
  return { featuredBeer, activeTapBeers, eightySixedBeers, hasMultipleTypes };
}
