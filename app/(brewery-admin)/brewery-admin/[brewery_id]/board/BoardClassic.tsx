"use client";

/**
 * BoardClassic — The original Board display format.
 * Vertical auto-scroll list with dotted leaders, glass SVGs, and metadata rows.
 * Refactored from BoardTapList (Sprint 167).
 */

import { useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { getGlass } from "@/lib/glassware";
import {
  C, EASE, FS, formatPrice,
  type BoardBeer, type BeerStats, type BoardSettings,
} from "./board-types";
import type { PourSize } from "@/lib/glassware";
import {
  GlassIllustration, SizeChips, BeerMetaRow, BeerStatsRow,
  BoardSectionHeader, EmptyBoardState, groupBeersByType, deriveBeerLists,
} from "./BoardShared";
import { useAutoScroll } from "./useAutoScroll";

// ─── Props ────────────────────────────────────────────────────────────────────

export interface BoardClassicProps {
  beers: BoardBeer[];
  settings: BoardSettings;
  pourSizesMap: Record<string, PourSize[]>;
  beerStats: Record<string, BeerStats>;
  listRef: React.RefObject<HTMLDivElement | null>;
}

// ─── Classic beer row ─────────────────────────────────────────────────────────

function ClassicBeerRow({
  beer, settings, pourSizes, beerStats, featured = false, eightySixed = false, animDelay = 0,
}: {
  beer: BoardBeer;
  settings: BoardSettings;
  pourSizes: PourSize[];
  beerStats: BeerStats | undefined;
  featured?: boolean;
  eightySixed?: boolean;
  animDelay?: number;
}) {
  const { showPrice, showGlass } = settings;
  const fs = FS[settings.fontSize];

  const glassKey = beer.glass_type ?? null;
  const glassObj = glassKey ? getGlass(glassKey) : null;
  const showGlassCol = showGlass && !!glassObj;

  const nameSize  = featured ? "clamp(40px, 4.5vw, 56px)" : fs.name;
  const priceSize = featured ? "clamp(40px, 4.5vw, 56px)" : fs.price;

  // 86'd row
  if (eightySixed) {
    return (
      <motion.div
        key={beer.id} layout
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 0.5, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.5, delay: animDelay, ease: EASE }}
        style={{ marginBottom: `clamp(14px, 2vh, 28px)` }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span className="font-display" style={{
            fontWeight: 700, fontSize: fs.name, lineHeight: 1.15,
            color: C.danger, textDecoration: "line-through",
            textDecorationColor: C.danger, flexShrink: 0,
          }}>
            {beer.name}
          </span>
          <span className="font-mono" style={{
            fontSize: fs.style, fontWeight: 800, textTransform: "uppercase",
            letterSpacing: "0.1em", color: C.danger,
          }}>
            86&apos;D
          </span>
        </div>
      </motion.div>
    );
  }

  // Normal / featured row
  return (
    <motion.div
      key={beer.id} layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: featured ? 0.6 : 0.5, delay: animDelay, ease: EASE }}
      style={{ marginBottom: featured ? 0 : `clamp(14px, 2vh, 28px)` }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: showGlassCol ? (fs.glassW > 50 ? 20 : 14) : 0 }}>
        {showGlassCol && glassObj && (
          <GlassIllustration
            glassKey={glassKey!}
            instanceId={beer.id}
            width={fs.glassW}
            height={fs.glassH}
          />
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Name + leader + price */}
          <div style={{ display: "flex", alignItems: "center", gap: 0, flexWrap: "nowrap" }}>
            <span
              className="font-display"
              style={{ fontWeight: 700, fontSize: nameSize, lineHeight: 1.15, color: C.text, flexShrink: 0 }}
            >
              {beer.name}
            </span>

            {showPrice && pourSizes.length > 0 ? (
              <>
                <span style={{
                  flex: 1, borderBottom: "1.5px dotted rgba(212,168,67,0.35)",
                  marginBottom: 6, marginLeft: 10, marginRight: 10, minWidth: 16, alignSelf: "flex-end",
                }} />
                <SizeChips sizes={pourSizes} fs={fs} />
              </>
            ) : showPrice && beer.price_per_pint != null ? (
              <>
                <span style={{
                  flex: 1, borderBottom: "1.5px dotted rgba(212,168,67,0.35)",
                  marginBottom: 8, marginLeft: 10, marginRight: 10, minWidth: 16, alignSelf: "flex-end",
                }} />
                <span className="font-mono" style={{
                  fontWeight: 700, fontSize: priceSize, lineHeight: 1.15,
                  color: C.gold, flexShrink: 0,
                }}>
                  {formatPrice(beer.price_per_pint)}
                </span>
              </>
            ) : null}
          </div>

          <BeerMetaRow beer={beer} settings={settings} featured={featured} />
          <BeerStatsRow beer={beer} settings={settings} beerStats={beerStats} featured={featured} />
        </div>
      </div>
    </motion.div>
  );
}

// ─── BoardClassic ─────────────────────────────────────────────────────────────

export function BoardClassic({ beers, settings, pourSizesMap, beerStats, listRef }: BoardClassicProps) {
  const { featuredBeer, activeTapBeers, eightySixedBeers, hasMultipleTypes } = deriveBeerLists(beers);
  const groupedByType = groupBeersByType(activeTapBeers);

  useAutoScroll(listRef, true, [beers, settings.fontSize]);

  if (beers.length === 0) return <EmptyBoardState />;

  return (
    <>
      {/* Beer of the Week */}
      {featuredBeer && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: EASE }}
          style={{ padding: "20px 40px 0", flexShrink: 0 }}
        >
          <span className="font-mono" style={{
            fontSize: 14, textTransform: "uppercase", letterSpacing: "0.2em",
            color: C.gold, display: "block", marginBottom: 10,
          }}>
            ★ Beer of the Week
          </span>

          <ClassicBeerRow
            beer={featuredBeer}
            settings={settings}
            pourSizes={pourSizesMap[featuredBeer.id] ?? []}
            beerStats={beerStats[featuredBeer.id]}
            featured
          />

          <div style={{ marginTop: 16, height: 2, background: "rgba(212,168,67,0.35)" }} />
        </motion.div>
      )}

      {/* Tap list */}
      <div
        ref={listRef}
        style={{ flex: 1, minHeight: 0, padding: "16px 40px", overflowY: "auto" }}
      >
        <AnimatePresence mode="popLayout">
          {groupedByType.map((group, gi) => {
            const baseDelay = (featuredBeer ? 1 : 0) * 0.04;
            let itemOffset = 0;
            for (let k = 0; k < gi; k++) itemOffset += groupedByType[k].items.length;

            return (
              <div key={group.type}>
                {hasMultipleTypes && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: baseDelay + itemOffset * 0.04 }}
                    style={{ marginTop: gi > 0 ? "clamp(16px, 2vh, 28px)" : 0 }}
                  >
                    <BoardSectionHeader type={group.type} count={group.items.length} />
                  </motion.div>
                )}

                {group.items.map((beer, i) => (
                  <ClassicBeerRow
                    key={beer.id}
                    beer={beer}
                    settings={settings}
                    pourSizes={pourSizesMap[beer.id] ?? []}
                    beerStats={beerStats[beer.id]}
                    animDelay={baseDelay + (itemOffset + i) * 0.04}
                  />
                ))}
              </div>
            );
          })}

          {eightySixedBeers.map((beer, i) => (
            <ClassicBeerRow
              key={beer.id}
              beer={beer}
              settings={settings}
              pourSizes={pourSizesMap[beer.id] ?? []}
              beerStats={beerStats[beer.id]}
              eightySixed
              animDelay={((featuredBeer ? 1 : 0) + activeTapBeers.length + i) * 0.04}
            />
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
