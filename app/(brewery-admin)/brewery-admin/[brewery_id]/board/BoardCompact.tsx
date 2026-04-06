"use client";

/**
 * BoardCompact — Maximum density display format.
 * 2-column grid, name + price only, no glass art or metadata.
 * Perfect for breweries with 30+ beers, small screens, or embeds.
 * Sprint 167 — The Board.
 */

import { motion } from "motion/react";
import {
  C, EASE, FS, formatPrice,
  type BoardBeer, type BeerStats, type BoardSettings,
} from "./board-types";
import type { PourSize } from "@/lib/glassware";
import { BoardSectionHeader, EmptyBoardState, groupBeersByType, deriveBeerLists } from "./BoardShared";
import { useAutoScroll } from "./useAutoScroll";

// ─── Props ────────────────────────────────────────────────────────────────────

export interface BoardCompactProps {
  beers: BoardBeer[];
  settings: BoardSettings;
  pourSizesMap: Record<string, PourSize[]>;
  beerStats: Record<string, BeerStats>;
  listRef: React.RefObject<HTMLDivElement | null>;
}

// ─── Compact beer entry ───────────────────────────────────────────────────────

function CompactEntry({
  beer, pourSizes, fontSize, animDelay = 0, eightySixed = false,
}: {
  beer: BoardBeer;
  pourSizes: PourSize[];
  fontSize: typeof FS[keyof typeof FS];
  animDelay?: number;
  eightySixed?: boolean;
}) {
  const price = pourSizes.length > 0
    ? pourSizes[0].price
    : beer.price_per_pint;

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: animDelay, ease: EASE }}
      style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "10px 0",
        borderBottom: `1px solid ${C.border}`,
      }}
    >
      <span className="font-display" style={{
        fontWeight: 700, fontSize: fontSize.name * 0.7, lineHeight: 1.2,
        color: C.text, flex: 1, minWidth: 0,
      }}>
        {beer.name}
      </span>
      {price != null && (
        <span className="font-mono" style={{
          fontWeight: 700, fontSize: fontSize.price * 0.7,
          color: C.gold, flexShrink: 0, marginLeft: 12,
        }}>
          {formatPrice(price)}
        </span>
      )}
    </motion.div>
  );
}

// ─── BoardCompact ─────────────────────────────────────────────────────────────

export function BoardCompact({ beers, settings, pourSizesMap, beerStats, listRef }: BoardCompactProps) {
  const { featuredBeer, activeTapBeers, eightySixedBeers, hasMultipleTypes } = deriveBeerLists(beers);
  const groupedByType = groupBeersByType(activeTapBeers);
  const fs = FS[settings.fontSize];

  useAutoScroll(listRef, true, [beers, settings.fontSize]);

  if (beers.length === 0) return <EmptyBoardState />;

  let globalIdx = 0;

  return (
    <div
      ref={listRef}
      style={{ flex: 1, minHeight: 0, padding: "16px 40px", overflowY: "auto" }}
    >
      {/* Featured beer highlight */}
      {featuredBeer && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: EASE }}
          style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "12px 16px", marginBottom: 16,
            borderRadius: 10,
            background: "linear-gradient(90deg, rgba(212,168,67,0.12) 0%, rgba(212,168,67,0.04) 100%)",
            border: "1px solid rgba(212,168,67,0.25)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className="font-mono" style={{ fontSize: 10, color: C.gold, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em" }}>
              ★ BOTW
            </span>
            <span className="font-display" style={{ fontWeight: 700, fontSize: fs.name * 0.7, color: C.text }}>
              {featuredBeer.name}
            </span>
          </div>
          {(() => {
            const ps = pourSizesMap[featuredBeer.id] ?? [];
            const price = ps.length > 0 ? ps[0].price : featuredBeer.price_per_pint;
            return price != null ? (
              <span className="font-mono" style={{ fontWeight: 700, fontSize: fs.price * 0.7, color: C.gold }}>
                {formatPrice(price)}
              </span>
            ) : null;
          })()}
        </motion.div>
      )}

      {/* 2-column grid */}
      {groupedByType.map((group, gi) => (
        <div key={group.type}>
          {hasMultipleTypes && (
            <div style={{ marginTop: gi > 0 ? 20 : 0, marginBottom: 8, gridColumn: "1 / -1" }}>
              <BoardSectionHeader type={group.type} count={group.items.length} />
            </div>
          )}

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            columnGap: 32,
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
        <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(2, 1fr)", columnGap: 32 }}>
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
