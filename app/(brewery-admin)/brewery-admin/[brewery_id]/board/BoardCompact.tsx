"use client";

/**
 * BoardCompact — Maximum density display format.
 * 2-column grid, name + price only, no glass art or metadata.
 * Perfect for breweries with 30+ beers, small screens, or embeds.
 * Sprint 167 — The Board.
 */

import { motion } from "motion/react";
import {
  C, EASE, getScaledFS, formatPrice,
  type BoardBeer, type BeerStats, type BoardSettings, type ResolvedDisplayScale, type FSEntry,
} from "./board-types";
import type { PourSize } from "@/lib/glassware";
import { SizeChips, compactChipFs, BoardSectionHeader, EmptyBoardState, groupBeersByStyleFamily, deriveBeerLists } from "./BoardShared";
import { useAutoScroll } from "./useAutoScroll";

// ─── Props ────────────────────────────────────────────────────────────────────

export interface BoardCompactProps {
  beers: BoardBeer[];
  settings: BoardSettings;
  pourSizesMap: Record<string, PourSize[]>;
  beerStats: Record<string, BeerStats>;
  listRef: React.RefObject<HTMLDivElement | null>;
  resolvedScale: ResolvedDisplayScale;
}

// ─── Compact beer entry ───────────────────────────────────────────────────────

function CompactEntry({
  beer, pourSizes, fontSize, animDelay = 0, eightySixed = false,
}: {
  beer: BoardBeer;
  pourSizes: PourSize[];
  fontSize: FSEntry;
  animDelay?: number;
  eightySixed?: boolean;
}) {
  const isFeatured = beer.is_featured && !eightySixed;
  const chipFs = compactChipFs(fontSize);

  if (eightySixed) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ duration: 0.3, delay: animDelay, ease: EASE }}
        style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "10px 0",
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        <span className="font-display" style={{
          fontWeight: 700, fontSize: fontSize.name * 0.7, lineHeight: 1.2,
          color: C.danger, textDecoration: "line-through",
        }}>
          {beer.name}
        </span>
        <span className="font-mono" style={{
          fontSize: 10, fontWeight: 800, textTransform: "uppercase",
          letterSpacing: "0.1em", color: C.danger, flexShrink: 0, marginLeft: 8,
        }}>
          86&apos;D
        </span>
      </motion.div>
    );
  }

  const fallbackPrice = pourSizes.length === 0 ? beer.price_per_pint : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: animDelay, ease: EASE }}
      style={{
        display: "flex", flexDirection: "column", gap: 6,
        padding: "10px 0",
        borderBottom: `1px solid ${C.border}`,
      }}
    >
      {/* Row 1: full beer name (no truncation) */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, minWidth: 0 }}>
        {isFeatured && (
          <span className="font-display" style={{
            fontSize: fontSize.name * 0.7, lineHeight: 1.2, color: C.gold, flexShrink: 0,
          }} aria-label="Featured beer">
            ★
          </span>
        )}
        <span className="font-display" style={{
          fontWeight: 700, fontSize: fontSize.name * 0.7, lineHeight: 1.2,
          color: C.text, flex: 1, minWidth: 0,
        }}>
          {beer.name}
        </span>
      </div>

      {/* Row 2: pour size chips (or fallback price) */}
      {pourSizes.length > 0 ? (
        <SizeChips sizes={pourSizes} fs={chipFs} wrap />
      ) : fallbackPrice != null ? (
        <span className="font-mono" style={{
          fontWeight: 700, fontSize: fontSize.price * 0.7,
          color: C.gold, alignSelf: "flex-start",
        }}>
          {formatPrice(fallbackPrice)}
        </span>
      ) : null}
    </motion.div>
  );
}

// ─── BoardCompact ─────────────────────────────────────────────────────────────

export function BoardCompact({ beers, settings, pourSizesMap, beerStats: _beerStats, listRef, resolvedScale }: BoardCompactProps) {
  const { featuredBeer, activeTapBeers, eightySixedBeers } = deriveBeerLists(beers);
  // Sprint A: featured beer appears inline with a gold star prefix, no BotW highlight bar.
  const allActive = featuredBeer ? [featuredBeer, ...activeTapBeers] : activeTapBeers;
  const groupedByFamily = groupBeersByStyleFamily(allActive);
  const fs = getScaledFS(settings, resolvedScale);

  useAutoScroll(listRef, true, [beers, settings.fontSize, resolvedScale]);

  if (beers.length === 0) return <EmptyBoardState />;

  let globalIdx = 0;

  return (
    <div
      ref={listRef}
      style={{ flex: 1, minHeight: 0, padding: "16px 40px", overflowY: "auto" }}
    >
      {/* 2-column grid, grouped by style family */}
      {groupedByFamily.map((group, gi) => (
        <div key={group.family}>
          <div style={{ marginTop: gi > 0 ? 20 : 0, marginBottom: 8 }}>
            <BoardSectionHeader label={group.label} emoji={group.emoji} count={group.items.length} />
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            columnGap: 32,
            alignItems: "start",
          }}>
            {group.items.map((beer) => {
              const delay = (++globalIdx) * 0.02;
              return (
                <CompactEntry
                  key={beer.id}
                  beer={beer}
                  pourSizes={pourSizesMap[beer.id] ?? []}
                  fontSize={fs}
                  animDelay={delay}
                />
              );
            })}
          </div>
        </div>
      ))}

      {/* 86'd */}
      {eightySixedBeers.length > 0 && (
        <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", columnGap: 32 }}>
          {eightySixedBeers.map((beer, i) => (
            <CompactEntry
              key={beer.id}
              beer={beer}
              pourSizes={[]}
              fontSize={fs}
              eightySixed
              animDelay={i * 0.02}
            />
          ))}
        </div>
      )}
    </div>
  );
}
