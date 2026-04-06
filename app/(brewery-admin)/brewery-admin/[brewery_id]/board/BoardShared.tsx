"use client";

/**
 * Shared sub-components used across multiple Board display formats.
 * Extracted from BoardTapList (Sprint 167).
 */

import { getGlass, getGlassSvgContent } from "@/lib/glassware";
import { C, FS, BOARD_SECTION_LABELS, formatPrice, type BoardBeer, type BeerStats, type BoardSettings } from "./board-types";
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

// ─── Size chips ───────────────────────────────────────────────────────────────

export function SizeChips({ sizes, fs }: { sizes: PourSize[]; fs: typeof FS[keyof typeof FS] }) {
  return (
    <div style={{ display: "flex", gap: 8, flexShrink: 0, flexWrap: "nowrap", alignItems: "center" }}>
      {sizes.map((size, idx) => (
        <div
          key={idx}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: C.chipBg,
            border: `1px solid ${C.chipBorder}`,
            borderRadius: 8,
            padding: `${fs.chipPadV}px ${fs.chipPadH}px`,
          }}
        >
          <div>
            <div className="font-mono" style={{
              fontSize: fs.chipLabel, letterSpacing: "0.08em",
              textTransform: "uppercase", color: C.textMuted, lineHeight: 1.2,
            }}>
              {size.label}
            </div>
            {size.oz != null && (
              <div className="font-mono" style={{ fontSize: fs.chipOz, color: C.textSubtle, opacity: 0.7 }}>
                {size.oz} oz
              </div>
            )}
          </div>
          <div style={{ width: 1, height: 26, background: C.chipBorder, flexShrink: 0 }} />
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
  beer, settings, featured = false,
}: {
  beer: BoardBeer; settings: BoardSettings; featured?: boolean;
}) {
  const { showABV, showStyle } = settings;
  const fs = FS[settings.fontSize];
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
  beer, settings, beerStats, featured = false,
}: {
  beer: BoardBeer; settings: BoardSettings; beerStats: BeerStats | undefined; featured?: boolean;
}) {
  const { showRating, showStats } = settings;
  const fs = FS[settings.fontSize];
  const rating = beerStats?.avgRating ?? beer.avg_rating;

  const hasRating = showRating && rating != null;
  const hasPours  = beerStats && beerStats.pourCount > 0;
  const hasAny = showStats && (hasRating || hasPours || beerStats?.biggestFan);
  if (!hasAny) return null;

  return (
    <div className="font-mono" style={{
      fontSize: featured ? 15 : fs.stat, color: C.textSubtle, marginTop: 6,
      display: "flex", alignItems: "center", gap: 0,
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

// ─── Section header (for multi-type menus) ─────────────────────────────────────

export function BoardSectionHeader({ type, count, delay = 0 }: { type: string; count: number; delay?: number }) {
  const section = BOARD_SECTION_LABELS[type] ?? { label: type, emoji: "" };
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      marginBottom: "clamp(10px, 1.5vh, 20px)",
    }}>
      <span style={{ fontSize: 20 }}>{section.emoji}</span>
      <span className="font-mono" style={{
        fontSize: 14, textTransform: "uppercase", letterSpacing: "0.2em",
        color: C.gold, fontWeight: 700,
      }}>
        {section.label}
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

// ─── Derive common beer lists ──────────────────────────────────────────────────

export function deriveBeerLists(beers: BoardBeer[]) {
  const featuredBeer     = beers.find(b => b.is_featured && !b.is_86d) ?? null;
  const activeTapBeers   = beers.filter(b => !b.is_featured && !b.is_86d);
  const eightySixedBeers = beers.filter(b => b.is_86d);
  const hasMultipleTypes = new Set(activeTapBeers.map(b => b.item_type ?? "beer")).size > 1;
  return { featuredBeer, activeTapBeers, eightySixedBeers, hasMultipleTypes };
}
