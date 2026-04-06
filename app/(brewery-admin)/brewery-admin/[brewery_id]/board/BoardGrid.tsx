"use client";

/**
 * BoardGrid — Card-based grid display format.
 * 2-3 column responsive layout with style-tinted card backgrounds and glass art.
 * Sprint 167 — The Board.
 */

import { useRef } from "react";
import { motion } from "motion/react";
import { getGlass } from "@/lib/glassware";
import { getStyleFamily } from "@/lib/beerStyleColors";
import {
  C, EASE, FS, formatPrice,
  type BoardBeer, type BeerStats, type BoardSettings,
} from "./board-types";
import type { PourSize } from "@/lib/glassware";
import {
  GlassIllustration, BeerMetaRow, BeerStatsRow,
  BoardSectionHeader, EmptyBoardState, groupBeersByType, deriveBeerLists,
} from "./BoardShared";
import { useAutoScroll } from "./useAutoScroll";

// ─── Props ────────────────────────────────────────────────────────────────────

export interface BoardGridProps {
  beers: BoardBeer[];
  settings: BoardSettings;
  pourSizesMap: Record<string, PourSize[]>;
  beerStats: Record<string, BeerStats>;
  listRef: React.RefObject<HTMLDivElement | null>;
}

// ─── Style color hex values (for inline styles in Board's cream context) ──────

const STYLE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  ipa:      { bg: "rgba(90,138,74,0.08)",   border: "rgba(90,138,74,0.20)",   text: "#5a8a4a" },
  stout:    { bg: "rgba(61,43,31,0.08)",     border: "rgba(107,84,69,0.20)",   text: "#6b5445" },
  sour:     { bg: "rgba(168,69,106,0.08)",   border: "rgba(168,69,106,0.20)",  text: "#a8456a" },
  porter:   { bg: "rgba(92,61,94,0.08)",     border: "rgba(92,61,94,0.20)",    text: "#5c3d5e" },
  lager:    { bg: "rgba(74,122,138,0.08)",   border: "rgba(74,122,138,0.20)",  text: "#4a7a8a" },
  saison:   { bg: "rgba(212,138,80,0.08)",   border: "rgba(212,138,80,0.20)",  text: "#d48a50" },
  cider:    { bg: "rgba(184,92,74,0.08)",    border: "rgba(184,92,74,0.20)",   text: "#B85C4A" },
  wine:     { bg: "rgba(114,47,55,0.08)",    border: "rgba(114,47,55,0.20)",   text: "#722F37" },
  cocktail: { bg: "rgba(26,142,128,0.08)",   border: "rgba(26,142,128,0.20)",  text: "#1A8E80" },
  na:       { bg: "rgba(191,160,50,0.08)",   border: "rgba(191,160,50,0.20)",  text: "#BFA032" },
  default:  { bg: "rgba(212,168,67,0.06)",   border: "rgba(212,168,67,0.15)",  text: C.gold },
};

function getStyleColor(style: string | null | undefined, itemType?: string) {
  const family = getStyleFamily(style, itemType);
  return STYLE_COLORS[family] ?? STYLE_COLORS.default;
}

// ─── Grid beer card ───────────────────────────────────────────────────────────

function GridBeerCard({
  beer, settings, pourSizes, beerStats, featured = false, animDelay = 0,
}: {
  beer: BoardBeer;
  settings: BoardSettings;
  pourSizes: PourSize[];
  beerStats: BeerStats | undefined;
  featured?: boolean;
  animDelay?: number;
}) {
  const { showGlass, showPrice } = settings;
  const fs = FS[settings.fontSize];
  const styleColor = getStyleColor(beer.style, beer.item_type);

  const glassKey = beer.glass_type ?? null;
  const glassObj = glassKey ? getGlass(glassKey) : null;
  const showGlassArt = showGlass && !!glassObj;

  const mainPrice = pourSizes.length > 0
    ? pourSizes[0].price
    : beer.price_per_pint;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: animDelay, ease: EASE }}
      style={{
        borderRadius: 16,
        border: `1px solid ${featured ? "rgba(212,168,67,0.4)" : styleColor.border}`,
        background: featured
          ? "linear-gradient(135deg, rgba(212,168,67,0.12) 0%, rgba(212,168,67,0.04) 100%)"
          : styleColor.bg,
        padding: 20,
        display: "flex", flexDirection: "column", alignItems: "center",
        gap: 12,
        gridColumn: featured ? "1 / -1" : undefined,
      }}
    >
      {/* Featured label */}
      {featured && (
        <span className="font-mono" style={{
          fontSize: 11, textTransform: "uppercase", letterSpacing: "0.2em",
          color: C.gold, fontWeight: 700,
        }}>
          ★ Beer of the Week
        </span>
      )}

      {/* Glass illustration */}
      {showGlassArt && glassObj && (
        <GlassIllustration
          glassKey={glassKey!}
          instanceId={`grid-${beer.id}`}
          width={featured ? 80 : 60}
          height={featured ? 114 : 86}
        />
      )}

      {/* Beer name */}
      <div className="font-display" style={{
        fontWeight: 700,
        fontSize: featured ? "clamp(28px, 3vw, 36px)" : "clamp(20px, 2.2vw, 28px)",
        lineHeight: 1.15, textAlign: "center", color: C.text,
      }}>
        {beer.name}
      </div>

      {/* Style badge */}
      {settings.showStyle && beer.style && (
        <span className="font-mono" style={{
          fontSize: 10, textTransform: "uppercase", letterSpacing: "0.15em",
          color: styleColor.text, fontWeight: 700,
          padding: "3px 10px", borderRadius: 99,
          background: styleColor.bg,
          border: `1px solid ${styleColor.border}`,
        }}>
          {beer.style}
        </span>
      )}

      {/* ABV + Price row */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {settings.showABV && beer.abv != null && (
          <span className="font-mono" style={{ fontSize: 13, color: C.textSubtle }}>
            {beer.abv.toFixed(1)}%
          </span>
        )}
        {showPrice && mainPrice != null && (
          <span className="font-mono" style={{ fontWeight: 700, fontSize: 20, color: C.gold }}>
            {formatPrice(mainPrice)}
          </span>
        )}
      </div>

      {/* Stats */}
      <BeerStatsRow beer={beer} settings={settings} beerStats={beerStats} />
    </motion.div>
  );
}

// ─── 86'd row for grid ────────────────────────────────────────────────────────

function GridEightySixed({ beer, fs }: { beer: BoardBeer; fs: typeof FS[keyof typeof FS] }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10, padding: "8px 0",
      opacity: 0.45,
    }}>
      <span className="font-display" style={{
        fontWeight: 700, fontSize: fs.name * 0.6, lineHeight: 1.15,
        color: C.danger, textDecoration: "line-through",
      }}>
        {beer.name}
      </span>
      <span className="font-mono" style={{
        fontSize: 11, fontWeight: 800, textTransform: "uppercase",
        letterSpacing: "0.1em", color: C.danger,
      }}>
        86&apos;D
      </span>
    </div>
  );
}

// ─── BoardGrid ────────────────────────────────────────────────────────────────

export function BoardGrid({ beers, settings, pourSizesMap, beerStats, listRef }: BoardGridProps) {
  const { featuredBeer, activeTapBeers, eightySixedBeers, hasMultipleTypes } = deriveBeerLists(beers);
  const groupedByType = groupBeersByType(activeTapBeers);
  const fs = FS[settings.fontSize];

  useAutoScroll(listRef, true, [beers, settings.fontSize]);

  if (beers.length === 0) return <EmptyBoardState />;

  let globalIdx = 0;

  return (
    <div
      ref={listRef}
      style={{ flex: 1, minHeight: 0, padding: "20px 40px", overflowY: "auto" }}
    >
      {/* Featured card — full width */}
      {featuredBeer && (
        <div style={{ marginBottom: 20 }}>
          <GridBeerCard
            beer={featuredBeer}
            settings={settings}
            pourSizes={pourSizesMap[featuredBeer.id] ?? []}
            beerStats={beerStats[featuredBeer.id]}
            featured
            animDelay={0}
          />
        </div>
      )}

      {/* Beer grid */}
      {groupedByType.map((group, gi) => (
        <div key={group.type}>
          {hasMultipleTypes && (
            <div style={{ marginTop: gi > 0 ? 24 : 0, marginBottom: 12 }}>
              <BoardSectionHeader type={group.type} count={group.items.length} />
            </div>
          )}

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 16,
            marginBottom: 16,
          }}>
            {group.items.map((beer) => {
              const delay = (++globalIdx) * 0.04;
              return (
                <GridBeerCard
                  key={beer.id}
                  beer={beer}
                  settings={settings}
                  pourSizes={pourSizesMap[beer.id] ?? []}
                  beerStats={beerStats[beer.id]}
                  animDelay={delay}
                />
              );
            })}
          </div>
        </div>
      ))}

      {/* 86'd beers */}
      {eightySixedBeers.length > 0 && (
        <div style={{ marginTop: 16, paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
          {eightySixedBeers.map(beer => (
            <GridEightySixed key={beer.id} beer={beer} fs={fs} />
          ))}
        </div>
      )}
    </div>
  );
}
