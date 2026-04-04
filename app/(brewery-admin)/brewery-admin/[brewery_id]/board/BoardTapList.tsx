"use client";

import { useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { getGlass, getGlassSvgContent } from "@/lib/glassware";
import {
  C, EASE, FS, BOARD_SECTION_LABELS, formatPrice,
  type BoardBeer, type BeerStats, type BoardSettings,
} from "./board-types";
import type { PourSize } from "@/lib/glassware";

// ─── Glass SVG ────────────────────────────────────────────────────────────────

function GlassIllustration({
  glassKey, instanceId, width, height,
}: {
  glassKey: string; instanceId: string; width: number; height: number; label: string;
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

function SizeChips({ sizes, fs }: { sizes: PourSize[]; fs: typeof FS[keyof typeof FS] }) {
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

// ─── Single beer row ──────────────────────────────────────────────────────────

function BeerRow({
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
  const { showABV, showPrice, showRating, showStyle, showStats, showGlass } = settings;
  const fs = FS[settings.fontSize];

  const rating = beerStats?.avgRating ?? beer.avg_rating;
  const hasStats = showStats && (
    (showRating && rating != null) ||
    (beerStats && beerStats.pourCount > 0) ||
    beerStats?.biggestFan
  );

  const glassKey = beer.glass_type ?? null;
  const glassObj = glassKey ? getGlass(glassKey) : null;
  const showGlassCol = showGlass && !!glassObj;

  const nameSize  = featured ? "clamp(40px, 4.5vw, 56px)" : fs.name;
  const priceSize = featured ? "clamp(40px, 4.5vw, 56px)" : fs.price;

  // ── 86'd row ──────────────────────────────────────────────────────────────
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
            86'D
          </span>
        </div>
      </motion.div>
    );
  }

  // ── Normal / featured row ─────────────────────────────────────────────────
  return (
    <motion.div
      key={beer.id} layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: featured ? 0.6 : 0.5, delay: animDelay, ease: EASE }}
      style={{ marginBottom: featured ? 0 : `clamp(14px, 2vh, 28px)` }}
    >
      {/* Glass + info row */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: showGlassCol ? (fs.glassW > 50 ? 20 : 14) : 0 }}>

        {/* Glass illustration */}
        {showGlassCol && glassObj && (
          <GlassIllustration
            glassKey={glassKey!}
            instanceId={beer.id}
            width={fs.glassW}
            height={fs.glassH}
            label={glassObj.name}
          />
        )}

        {/* Beer info */}
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

          {/* Meta row: style · ABV · IBU · promo */}
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

          {/* Stats row */}
          {hasStats && (() => {
            const hasRating = showRating && rating != null;
            const hasPours  = beerStats && beerStats.pourCount > 0;
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
          })()}
        </div>
      </div>
    </motion.div>
  );
}

// ─── BoardTapList ─────────────────────────────────────────────────────────────

export interface BoardTapListProps {
  beers: BoardBeer[];
  settings: BoardSettings;
  pourSizesMap: Record<string, PourSize[]>;
  beerStats: Record<string, BeerStats>;
  /** Called by the auto-scroll effect — ref forwarded from parent */
  listRef: React.RefObject<HTMLDivElement | null>;
}

export function BoardTapList({ beers, settings, pourSizesMap, beerStats, listRef }: BoardTapListProps) {
  const featuredBeer   = beers.find(b => b.is_featured && !b.is_86d);
  const activeTapBeers = beers.filter(b => !b.is_featured && !b.is_86d);
  const eightySixedBeers = beers.filter(b => b.is_86d);

  const hasMultipleTypes = new Set(activeTapBeers.map(b => b.item_type ?? "beer")).size > 1;

  const groupedByType: { type: string; items: BoardBeer[] }[] = (() => {
    if (!hasMultipleTypes) return [{ type: "beer", items: activeTapBeers }];
    const typeOrder = ["beer", "cider", "wine", "cocktail", "na_beverage", "food"];
    const groups: Record<string, BoardBeer[]> = {};
    for (const b of activeTapBeers) {
      const t = b.item_type ?? "beer";
      if (!groups[t]) groups[t] = [];
      groups[t].push(b);
    }
    return typeOrder
      .filter(t => groups[t] && groups[t].length > 0)
      .map(t => ({ type: t, items: groups[t] }));
  })();

  // Empty state
  if (beers.length === 0) {
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

  return (
    <>
      {/* ── Beer of the Week ──────────────────────────────────────── */}
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

          <BeerRow
            beer={featuredBeer}
            settings={settings}
            pourSizes={pourSizesMap[featuredBeer.id] ?? []}
            beerStats={beerStats[featuredBeer.id]}
            featured
          />

          <div style={{ marginTop: 16, height: 2, background: "rgba(212,168,67,0.35)" }} />
        </motion.div>
      )}

      {/* ── Tap list ─────────────────────────────────────────────── */}
      <div
        ref={listRef}
        style={{ flex: 1, minHeight: 0, padding: "16px 40px", overflowY: "auto" }}
      >
        <AnimatePresence mode="popLayout">
          {groupedByType.map((group, gi) => {
            const section  = BOARD_SECTION_LABELS[group.type] ?? { label: group.type, emoji: "" };
            const baseDelay = (featuredBeer ? 1 : 0) * 0.04;
            let itemOffset = 0;
            for (let k = 0; k < gi; k++) itemOffset += groupedByType[k].items.length;

            return (
              <div key={group.type}>
                {/* Section header — only for multi-type menus */}
                {hasMultipleTypes && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: baseDelay + itemOffset * 0.04 }}
                    style={{
                      display: "flex", alignItems: "center", gap: 12,
                      marginBottom: "clamp(10px, 1.5vh, 20px)",
                      marginTop: gi > 0 ? "clamp(16px, 2vh, 28px)" : 0,
                    }}
                  >
                    <span style={{ fontSize: 20 }}>{section.emoji}</span>
                    <span className="font-mono" style={{
                      fontSize: 14, textTransform: "uppercase", letterSpacing: "0.2em",
                      color: C.gold, fontWeight: 700,
                    }}>
                      {section.label}
                    </span>
                    <span className="font-mono" style={{ fontSize: 13, color: C.textSubtle }}>
                      ({group.items.length})
                    </span>
                    <div style={{ flex: 1, height: 1, background: "rgba(212,168,67,0.2)" }} />
                  </motion.div>
                )}

                {group.items.map((beer, i) => (
                  <BeerRow
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
            <BeerRow
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
