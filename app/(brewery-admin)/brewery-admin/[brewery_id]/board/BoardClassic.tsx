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
  C, EASE, getScaledFS, formatPrice,
  type BoardBeer, type BeerStats, type BoardSettings, type ResolvedDisplayScale,
} from "./board-types";
import type { PourSize } from "@/lib/glassware";
import {
  GlassIllustration, SizeChips, BeerMetaRow, BeerStatsRow,
  BoardSectionHeader, EmptyBoardState, groupBeersByStyleFamily, deriveBeerLists,
} from "./BoardShared";
import { useAutoScroll } from "./useAutoScroll";

// ─── Props ────────────────────────────────────────────────────────────────────

export interface BoardClassicProps {
  beers: BoardBeer[];
  settings: BoardSettings;
  pourSizesMap: Record<string, PourSize[]>;
  beerStats: Record<string, BeerStats>;
  listRef: React.RefObject<HTMLDivElement | null>;
  resolvedScale: ResolvedDisplayScale;
}

// ─── Classic beer row ─────────────────────────────────────────────────────────

function ClassicBeerRow({
  beer, settings, pourSizes, beerStats, eightySixed = false, animDelay = 0, resolvedScale,
}: {
  beer: BoardBeer;
  settings: BoardSettings;
  pourSizes: PourSize[];
  beerStats: BeerStats | undefined;
  eightySixed?: boolean;
  animDelay?: number;
  resolvedScale: ResolvedDisplayScale;
}) {
  const { showPrice, showGlass } = settings;
  const fs = getScaledFS(settings, resolvedScale);
  const isFeatured = beer.is_featured && !eightySixed;

  const glassKey = beer.glass_type ?? null;
  const glassObj = glassKey ? getGlass(glassKey) : null;
  const showGlassCol = showGlass && !!glassObj;

  // Sprint A: featured beers no longer use hero sizing. They appear inline at
  // normal size with a small gold star designation before the name — keeps
  // scroll pacing snappy (Joshua's feedback: the BotW hero was slowing scroll).
  const nameSize  = fs.name;
  const priceSize = fs.price;

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

  // Normal row (featured beers get an inline gold star prefix, same size otherwise)
  return (
    <motion.div
      key={beer.id} layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.5, delay: animDelay, ease: EASE }}
      style={{ marginBottom: `clamp(14px, 2vh, 28px)` }}
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
            {isFeatured && (
              <span
                className="font-display"
                style={{
                  fontSize: nameSize, lineHeight: 1.15, color: C.gold,
                  flexShrink: 0, marginRight: 12,
                }}
                aria-label="Featured beer"
              >
                ★
              </span>
            )}
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

          <BeerMetaRow beer={beer} settings={settings} resolvedScale={resolvedScale} />
          <BeerStatsRow beer={beer} settings={settings} beerStats={beerStats} resolvedScale={resolvedScale} />
        </div>
      </div>
    </motion.div>
  );
}

// ─── BoardClassic ─────────────────────────────────────────────────────────────

export function BoardClassic({ beers, settings, pourSizesMap, beerStats, listRef, resolvedScale }: BoardClassicProps) {
  const { featuredBeer, activeTapBeers, eightySixedBeers } = deriveBeerLists(beers);
  // Sprint A: featured beer appears inline inside its style-family group
  // (with a gold star designation) instead of in a separate hero banner.
  const allActive = featuredBeer ? [featuredBeer, ...activeTapBeers] : activeTapBeers;
  const groupedByFamily = groupBeersByStyleFamily(allActive);

  useAutoScroll(listRef, true, [beers, settings.fontSize, resolvedScale]);

  if (beers.length === 0) return <EmptyBoardState />;

  return (
    <div
      ref={listRef}
      style={{ flex: 1, minHeight: 0, padding: "20px 40px", overflowY: "auto" }}
    >
      <AnimatePresence mode="popLayout">
        {groupedByFamily.map((group, gi) => {
          let itemOffset = 0;
          for (let k = 0; k < gi; k++) itemOffset += groupedByFamily[k].items.length;

          return (
            <div key={group.family}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: itemOffset * 0.04 }}
                style={{ marginTop: gi > 0 ? "clamp(16px, 2vh, 28px)" : 0 }}
              >
                <BoardSectionHeader label={group.label} emoji={group.emoji} count={group.items.length} />
              </motion.div>

              {group.items.map((beer, i) => (
                <ClassicBeerRow
                  key={beer.id}
                  beer={beer}
                  settings={settings}
                  pourSizes={pourSizesMap[beer.id] ?? []}
                  beerStats={beerStats[beer.id]}
                  animDelay={(itemOffset + i) * 0.04}
                  resolvedScale={resolvedScale}
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
            animDelay={(allActive.length + i) * 0.04}
            resolvedScale={resolvedScale}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
