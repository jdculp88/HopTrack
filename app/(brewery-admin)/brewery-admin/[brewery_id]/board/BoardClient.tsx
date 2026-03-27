"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, X, Calendar, Star, TrendingUp, Users, Award, Tag, Hop } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BoardBeer {
  id: string;
  name: string;
  style: string | null;
  abv: number | null;
  ibu: number | null;
  description: string | null;
  is_featured: boolean;
  is_on_tap: boolean;
  is_86d?: boolean;
  avg_rating: number | null;
  price_per_pint?: number | null;
  promo_text?: string | null;
}

interface BoardEvent {
  id: string;
  title: string;
  event_date: string;
  start_time: string | null;
}

interface BeerStats {
  pourCount: number;
  avgRating: number | null;
  biggestFan: string | null;
}

interface BreweryStats {
  totalPours: number;
  uniqueVisitors: number;
  topRatedBeer: string | null;
  topRatedScore: number | null;
  mostPopularBeer: string | null;
  mostPopularCount: number;
}

interface BoardClientProps {
  breweryId: string;
  breweryName: string;
  initialBeers: BoardBeer[];
  events?: BoardEvent[];
  breweryStats?: BreweryStats;
  beerStats?: Record<string, BeerStats>;
}

type FontSize = "medium" | "large" | "xl";

// ─── Design System — exact match to LandingContent.tsx ───────────────────────

const C = {
  cream: "#FBF7F0",
  dark: "#0F0E0C",
  darkSurface: "#1C1A16",
  darkSurface2: "#252219",
  darkBorder: "#3A3628",
  gold: "#D4A843",
  text: "#1A1714",
  textMuted: "#6B5E4E",
  textSubtle: "#9E8E7A",
  border: "#E5DDD0",
  creamText: "#F5F0E8",
  creamMuted: "#A89F8C",
  creamSubtle: "#8B7E6A",
  danger: "#C44B3A",
} as const;

const EASE = [0.16, 1, 0.3, 1] as const;

// ─── Settings ─────────────────────────────────────────────────────────────────

interface BoardSettings {
  fontSize: FontSize;
  showABV: boolean;
  showDesc: boolean;
  showPrice: boolean;
  showRating: boolean;
  showStyle: boolean;
  showStats: boolean;
}

const DEFAULT: BoardSettings = {
  fontSize: "large",
  showABV: true,
  showDesc: false,
  showPrice: true,
  showRating: true,
  showStyle: true,
  showStats: true,
};

function loadSettings(id: string): BoardSettings {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const s = localStorage.getItem(`hoptrack-board-${id}`);
    return s ? { ...DEFAULT, ...JSON.parse(s) } : DEFAULT;
  } catch { return DEFAULT; }
}

function saveSettings(id: string, s: BoardSettings) {
  try { localStorage.setItem(`hoptrack-board-${id}`, JSON.stringify(s)); } catch {}
}

// Font size maps
const FS: Record<FontSize, { name: number; style: number; meta: number; price: number }> = {
  medium: { name: 20, style: 10, meta: 10, price: 18 },
  large:  { name: 24, style: 11, meta: 11, price: 21 },
  xl:     { name: 29, style: 12, meta: 12, price: 25 },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  const skip = ["the", "of", "and", "&", "co.", "co", "brewing", "brewery", "craft", "beer", "ales", "taproom", "pub"];
  const words = name.split(/\s+/).filter(w => !skip.includes(w.toLowerCase()));
  if (!words.length) return name[0]?.toUpperCase() ?? "?";
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

function formatEventDate(dateStr: string, time: string | null) {
  const date = new Date(dateStr + "T00:00:00");
  const day = date.toLocaleDateString(undefined, { weekday: "short" });
  const md = date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  if (!time) return `${day} ${md}`;
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${day} ${md} · ${h % 12 || 12}:${String(m).padStart(2, "0")} ${ampm}`;
}

function getGridCols(count: number): number {
  if (count <= 4) return 2;
  if (count <= 9) return 3;
  if (count <= 12) return 4;
  return 5;
}

// ─── Star Rating ──────────────────────────────────────────────────────────────

function Stars({ rating, size = 11 }: { rating: number | null; size?: number }) {
  if (!rating) return null;
  const r = Math.round(rating * 2) / 2;
  return (
    <span style={{ display: "inline-flex", gap: 1 }}>
      {[1,2,3,4,5].map(s => (
        <span key={s} style={{ fontSize: size, color: s <= r ? C.gold : C.darkBorder, lineHeight: 1 }}>★</span>
      ))}
    </span>
  );
}

// ─── Beer Card ────────────────────────────────────────────────────────────────

function BeerCard({
  beer, fs, isFeatured, showABV, showDesc, showPrice,
  showRating, showStyle, showStats, stats, index,
}: {
  beer: BoardBeer; fs: (typeof FS)["large"]; isFeatured?: boolean;
  showABV: boolean; showDesc: boolean; showPrice: boolean;
  showRating: boolean; showStyle: boolean; showStats: boolean;
  stats?: BeerStats; index: number;
}) {
  const is86d = !!beer.is_86d;
  const hasPromo = !is86d && !!beer.promo_text;
  const isBotw = isFeatured && !is86d;
  const rating = stats?.avgRating ?? beer.avg_rating;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: is86d ? 0.28 : 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: EASE }}
      style={{
        position: "relative",
        gridColumn: isFeatured ? "span 2" : undefined,
        display: "flex",
        flexDirection: "column",
        borderRadius: 16,
        overflow: "hidden",
        background: isBotw
          ? C.darkSurface
          : C.darkSurface,
        border: `1px solid ${isBotw ? "rgba(212,168,67,0.28)" : hasPromo ? "rgba(212,168,67,0.16)" : C.darkBorder}`,
      }}
    >
      {/* BOTW radial glow — matches landing page dark section treatment */}
      {isBotw && (
        <div style={{
          position: "absolute", top: 0, right: 0,
          width: "60%", height: "100%",
          background: "radial-gradient(circle at 85% 15%, rgba(212,168,67,0.09) 0%, transparent 60%)",
          pointerEvents: "none",
        }} />
      )}

      {/* Top accent line */}
      <div style={{
        height: isBotw ? 2 : hasPromo ? 1 : 0,
        flexShrink: 0,
        background: isBotw
          ? `linear-gradient(90deg, transparent, ${C.gold}, transparent)`
          : `linear-gradient(90deg, transparent, rgba(212,168,67,0.4), transparent)`,
      }} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "14px 18px 15px", position: "relative" }}>

        {/* ── Status labels — same style as landing page section labels ── */}
        {(isBotw || hasPromo) && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            {isBotw && (
              <span style={{
                fontSize: 9,
                fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                color: C.gold,
                display: "inline-flex", alignItems: "center", gap: 5,
              }}>
                <Star size={8} fill={C.gold} style={{ color: C.gold }} />
                Beer of the Week
              </span>
            )}
            {hasPromo && (
              <span style={{
                fontSize: 9,
                fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
                textTransform: "uppercase",
                letterSpacing: "0.18em",
                color: C.gold,
                display: "inline-flex", alignItems: "center", gap: 5,
              }}>
                <Tag size={8} style={{ color: C.gold }} />
                {beer.promo_text}
              </span>
            )}
          </div>
        )}

        {/* Style + Price */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
          {showStyle && beer.style ? (
            <span style={{
              fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
              fontSize: fs.style,
              textTransform: "uppercase",
              letterSpacing: "0.16em",
              color: C.creamSubtle,
              lineHeight: 1.3,
            }}>
              {beer.style}
            </span>
          ) : <span />}
          {showPrice && beer.price_per_pint != null && (
            <span style={{
              fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
              fontWeight: 700,
              fontSize: fs.price,
              color: C.gold,
              lineHeight: 1,
              flexShrink: 0,
            }}>
              ${beer.price_per_pint % 1 === 0
                ? beer.price_per_pint.toFixed(0)
                : beer.price_per_pint.toFixed(2)}
            </span>
          )}
        </div>

        {/* Beer name — Playfair Display, same as landing page headlines */}
        <h2 className="font-display" style={{
          fontWeight: 700,
          fontSize: fs.name,
          lineHeight: 1.15,
          color: C.creamText,
          textDecoration: is86d ? "line-through" : undefined,
          textDecorationColor: C.danger,
          marginBottom: 5,
        }}>
          {beer.name}
        </h2>

        {/* ABV / IBU */}
        {showABV && (beer.abv != null || beer.ibu != null) && (
          <p style={{
            fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
            fontSize: fs.meta,
            color: C.creamMuted,
            lineHeight: 1.5,
            marginBottom: showDesc && beer.description ? 4 : 0,
          }}>
            {beer.abv != null && `${beer.abv.toFixed(1)}% ABV`}
            {beer.abv != null && beer.ibu != null && "  ·  "}
            {beer.ibu != null && `${beer.ibu} IBU`}
          </p>
        )}

        {/* Description */}
        {showDesc && beer.description && (
          <p style={{
            fontFamily: "'DM Sans', system-ui, sans-serif",
            fontSize: fs.meta,
            color: C.creamMuted,
            lineHeight: 1.55,
            marginTop: 4,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}>
            {beer.description}
          </p>
        )}

        {/* Spacer */}
        <div style={{ flex: 1, minHeight: 6 }} />

        {/* ── Stats row ────────────────────────────────────────── */}
        {showStats && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 0,
            paddingTop: 10,
            marginTop: 6,
            borderTop: `1px solid ${C.darkBorder}`,
          }}>
            {/* Rating */}
            {showRating && (
              <div style={{ display: "flex", alignItems: "center", gap: 5, flex: "0 0 auto", marginRight: 12 }}>
                {rating != null ? (
                  <>
                    <Stars rating={rating} size={10} />
                    <span style={{
                      fontFamily: "var(--font-mono), monospace",
                      fontSize: 10, fontWeight: 700, color: C.gold,
                    }}>
                      {rating.toFixed(1)}
                    </span>
                  </>
                ) : (
                  <span style={{
                    fontFamily: "var(--font-mono), monospace",
                    fontSize: 9, color: C.creamSubtle,
                  }}>No ratings</span>
                )}
              </div>
            )}

            {/* Pour count */}
            {stats && stats.pourCount > 0 && (
              <>
                <div style={{ width: 1, height: 10, background: C.darkBorder, flexShrink: 0, marginRight: 12 }} />
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginRight: 12 }}>
                  <span style={{ fontSize: 11, lineHeight: 1 }}>🍺</span>
                  <span style={{
                    fontFamily: "var(--font-mono), monospace",
                    fontSize: 10, color: C.creamSubtle,
                  }}>
                    {stats.pourCount.toLocaleString()}
                  </span>
                </div>
              </>
            )}

            {/* Biggest fan */}
            {stats?.biggestFan && (
              <>
                <div style={{ width: 1, height: 10, background: C.darkBorder, flexShrink: 0, marginRight: 12 }} />
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 11, lineHeight: 1 }}>👤</span>
                  <span style={{
                    fontFamily: "var(--font-mono), monospace",
                    fontSize: 10, color: C.creamSubtle,
                    maxWidth: 90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {stats.biggestFan}
                  </span>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* 86'd watermark */}
      {is86d && (
        <div style={{
          position: "absolute", inset: 0, display: "flex",
          alignItems: "center", justifyContent: "center", pointerEvents: "none",
        }}>
          <span style={{
            fontFamily: "var(--font-mono), monospace",
            fontWeight: 800, fontSize: 32,
            color: C.danger, opacity: 0.15,
            transform: "rotate(-20deg)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            userSelect: "none",
          }}>
            86&apos;d
          </span>
        </div>
      )}
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function BoardClient({
  breweryId, breweryName, initialBeers, events = [], breweryStats, beerStats = {},
}: BoardClientProps) {
  const [beers, setBeers] = useState<BoardBeer[]>(initialBeers);
  const [settings, setSettings] = useState<BoardSettings>(() => loadSettings(breweryId));
  const [settingsOpen, setSettingsOpen] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  const { fontSize, showABV, showDesc, showPrice, showRating, showStyle, showStats } = settings;
  const fs = FS[fontSize];

  useEffect(() => { saveSettings(breweryId, settings); }, [breweryId, settings]);
  const set = <K extends keyof BoardSettings>(k: K, v: BoardSettings[K]) =>
    setSettings(p => ({ ...p, [k]: v }));

  const featuredBeer = beers.find(b => b.is_featured && !b.is_86d);
  const activeTapBeers = beers.filter(b => !b.is_featured && !b.is_86d);
  const eightySixedBeers = beers.filter(b => b.is_86d);

  const totalSlots = (featuredBeer ? 2 : 0) + activeTapBeers.length + eightySixedBeers.length;
  const gridCols = useMemo(() => getGridCols(totalSlots), [totalSlots]);
  const gridRows = useMemo(() => Math.ceil(totalSlots / gridCols), [totalSlots, gridCols]);
  const activeBeerCount = (featuredBeer ? 1 : 0) + activeTapBeers.length;
  const initials = getInitials(breweryName);

  // Realtime updates
  useEffect(() => {
    const supabase = createClient();
    const ch = supabase
      .channel(`board-${breweryId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "beers", filter: `brewery_id=eq.${breweryId}` }, refetchBeers)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [breweryId]);

  const refetchBeers = useCallback(async () => {
    const s = createClient();
    const { data } = await (s as any)
      .from("beers").select("*")
      .eq("brewery_id", breweryId).eq("is_on_tap", true)
      .order("display_order", { ascending: true }).order("name");
    if (data) setBeers(data);
  }, [breweryId]);

  // Auto-scroll for overflow
  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    let id: number, pos = 0, pause = 0;
    const tick = () => {
      if (!el || el.scrollHeight <= el.clientHeight) { id = requestAnimationFrame(tick); return; }
      if (pause > 0) { pause--; id = requestAnimationFrame(tick); return; }
      pos += 0.15;
      if (pos >= el.scrollHeight - el.clientHeight) { pos = 0; pause = 180; }
      el.scrollTop = pos;
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [beers, fontSize]);

  return (
    <div
      className="font-sans"
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        display: "flex", flexDirection: "column",
        background: `
          radial-gradient(ellipse at 50% 0%, rgba(212,168,67,0.07) 0%, transparent 55%),
          ${C.cream}
        `,
        color: C.text,
      }}
    >
      {/* ── Header — cream area ──────────────────────────────────────────── */}
      <header style={{ padding: "16px 32px 14px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>

          {/* Brand mark — matches landing page nav */}
          <div style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: C.dark,
          }}>
            <span style={{
              fontFamily: "var(--font-mono), monospace",
              fontWeight: 800, fontSize: 14,
              color: C.gold, letterSpacing: 1,
            }}>
              {initials}
            </span>
          </div>

          {/* Brewery name — Playfair Display italic, like landing page hero */}
          <h1 className="font-display" style={{
            fontWeight: 700,
            fontStyle: "italic",
            fontSize: "clamp(36px, 4.5vw, 60px)",
            lineHeight: 1,
            letterSpacing: "-0.01em",
            color: C.text,
            flex: 1,
            minWidth: 0,
          }}>
            {breweryName}
          </h1>

          {/* On Tap count */}
          <div style={{ flexShrink: 0, display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: 10, textTransform: "uppercase", letterSpacing: "0.22em",
              color: C.textSubtle,
            }}>
              On Tap
            </span>
            <span style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: 10, color: C.textSubtle,
            }}>·</span>
            <span style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: 26, fontWeight: 700, lineHeight: 1,
              color: C.gold,
            }}>
              {activeBeerCount}
            </span>
          </div>
        </div>
      </header>

      {/* Settings gear */}
      <button
        onClick={() => setSettingsOpen(v => !v)}
        style={{
          position: "absolute", top: 16, right: 32,
          padding: 8, borderRadius: 10, border: "none",
          background: "transparent", cursor: "pointer",
          color: C.textSubtle, zIndex: 10,
        }}
        onMouseEnter={e => (e.currentTarget.style.color = C.textMuted)}
        onMouseLeave={e => (e.currentTarget.style.color = C.textSubtle)}
      >
        <Settings size={17} />
      </button>

      {/* Settings panel */}
      <AnimatePresence>
        {settingsOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            style={{ overflow: "hidden", margin: "0 32px 8px", borderRadius: 12, border: `1px solid ${C.border}`, flexShrink: 0 }}
          >
            <div style={{
              padding: "10px 20px",
              display: "flex", flexWrap: "wrap", alignItems: "center", gap: 18,
              background: "rgba(251,247,240,0.95)", backdropFilter: "blur(12px)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 9, fontFamily: "var(--font-mono), monospace", textTransform: "uppercase", letterSpacing: "0.1em", color: C.textSubtle }}>Size</span>
                {(["medium", "large", "xl"] as FontSize[]).map(s => (
                  <button key={s} onClick={() => set("fontSize", s)} style={{
                    padding: "4px 10px", borderRadius: 99, border: "none", cursor: "pointer",
                    fontSize: 9, fontFamily: "var(--font-mono), monospace",
                    background: fontSize === s ? C.dark : C.border,
                    color: fontSize === s ? C.creamText : C.textMuted,
                    fontWeight: 600,
                  }}>
                    {s.toUpperCase()}
                  </button>
                ))}
              </div>
              {([
                { label: "Style", key: "showStyle" as const, val: showStyle },
                { label: "ABV", key: "showABV" as const, val: showABV },
                { label: "Desc", key: "showDesc" as const, val: showDesc },
                { label: "Price", key: "showPrice" as const, val: showPrice },
                { label: "Rating", key: "showRating" as const, val: showRating },
                { label: "Stats", key: "showStats" as const, val: showStats },
              ]).map(({ label, key, val }) => (
                <label key={label} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                  <input type="checkbox" checked={val} onChange={e => set(key, e.target.checked)} style={{ accentColor: C.gold }} />
                  <span style={{ fontSize: 9, fontFamily: "var(--font-mono), monospace", color: C.textSubtle }}>{label}</span>
                </label>
              ))}
              <button onClick={() => setSettingsOpen(false)} style={{ marginLeft: "auto", padding: 4, background: "none", border: "none", cursor: "pointer", color: C.textSubtle }}>
                <X size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Dark floating section — matches landing page sections ────────── */}
      <div style={{
        flex: 1, minHeight: 0,
        margin: "0 0px",
        background: C.dark,
        borderRadius: "1.5rem 1.5rem 0 0",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}>

        {/* Landing page dark section radial glow */}
        <div style={{
          position: "absolute", top: 0, right: 0,
          width: 600, height: 450,
          background: "radial-gradient(circle at 80% 10%, rgba(212,168,67,0.06) 0%, transparent 55%)",
          pointerEvents: "none",
          zIndex: 0,
        }} />
        <div style={{
          position: "absolute", bottom: 0, left: 0,
          width: 400, height: 300,
          background: "radial-gradient(circle at 20% 90%, rgba(212,168,67,0.03) 0%, transparent 50%)",
          pointerEvents: "none",
          zIndex: 0,
        }} />

        {/* Content above z-index */}
        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", height: "100%" }}>

          {/* ── Events strip — inside the dark section ──────────────── */}
          {events.length > 0 && (
            <div style={{
              padding: "12px 28px",
              display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
              borderBottom: `1px solid ${C.darkBorder}`,
              flexShrink: 0,
            }}>
              <span style={{
                fontFamily: "var(--font-mono), monospace",
                fontSize: 9, textTransform: "uppercase", letterSpacing: "0.22em",
                color: C.creamSubtle, marginRight: 4, flexShrink: 0,
              }}>
                Events
              </span>
              {events.map(ev => (
                <div key={ev.id} style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "6px 14px",
                  borderRadius: 8,
                  background: C.darkSurface,
                  border: `1px solid ${C.darkBorder}`,
                }}>
                  <Calendar size={12} style={{ color: C.gold, flexShrink: 0 }} />
                  <span style={{
                    fontFamily: "'DM Sans', system-ui, sans-serif",
                    fontWeight: 600, fontSize: 14,
                    color: C.creamText,
                  }}>
                    {ev.title}
                  </span>
                  <span style={{
                    fontFamily: "var(--font-mono), monospace",
                    fontSize: 11,
                    color: C.gold,
                    padding: "2px 8px",
                    borderRadius: 5,
                    background: "rgba(212,168,67,0.08)",
                    flexShrink: 0,
                  }}>
                    {formatEventDate(ev.event_date, ev.start_time)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* ── Beer grid ────────────────────────────────────────────── */}
          {beers.length === 0 ? (
            <div style={{
              flex: 1, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", textAlign: "center",
              padding: 32,
            }}>
              <p className="font-display" style={{ fontSize: 24, color: `${C.creamText}40`, fontStyle: "italic" }}>
                No beers on tap
              </p>
              <p style={{ fontSize: 14, marginTop: 6, color: C.creamSubtle }}>
                Add beers to your tap list to see them here
              </p>
            </div>
          ) : (
            <div
              ref={gridRef}
              style={{
                flex: 1, minHeight: 0,
                padding: "16px 24px 12px",
                display: "grid",
                gap: 12,
                gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
                gridTemplateRows: `repeat(${gridRows}, 1fr)`,
                overflow: "auto",
                alignContent: "stretch",
              }}
            >
              {featuredBeer && (
                <BeerCard
                  beer={featuredBeer} fs={fs} isFeatured
                  showABV={showABV} showDesc={showDesc} showPrice={showPrice}
                  showRating={showRating} showStyle={showStyle} showStats={showStats}
                  stats={beerStats[featuredBeer.id]} index={0}
                />
              )}
              {activeTapBeers.map((beer, i) => (
                <BeerCard
                  key={beer.id} beer={beer} fs={fs}
                  showABV={showABV} showDesc={showDesc} showPrice={showPrice}
                  showRating={showRating} showStyle={showStyle} showStats={showStats}
                  stats={beerStats[beer.id]} index={(featuredBeer ? 1 : 0) + i}
                />
              ))}
              {eightySixedBeers.map((beer, i) => (
                <BeerCard
                  key={beer.id} beer={beer} fs={fs}
                  showABV={showABV} showDesc={showDesc} showPrice={showPrice}
                  showRating={showRating} showStyle={showStyle} showStats={showStats}
                  stats={beerStats[beer.id]} index={(featuredBeer ? 1 : 0) + activeTapBeers.length + i}
                />
              ))}
            </div>
          )}

          {/* ── Brewery stats + footer ───────────────────────────────── */}
          <div style={{
            flexShrink: 0,
            borderTop: `1px solid ${C.darkBorder}`,
            padding: "8px 28px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            {/* Stats */}
            <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
              {showStats && breweryStats && breweryStats.totalPours > 0 && (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <TrendingUp size={12} style={{ color: C.gold }} />
                    <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: 10, color: C.creamSubtle }}>
                      <span style={{ color: C.creamText, fontWeight: 700 }}>{breweryStats.totalPours.toLocaleString()}</span> pours
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Users size={12} style={{ color: C.gold }} />
                    <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: 10, color: C.creamSubtle }}>
                      <span style={{ color: C.creamText, fontWeight: 700 }}>{breweryStats.uniqueVisitors.toLocaleString()}</span> visitors
                    </span>
                  </div>
                  {breweryStats.topRatedBeer && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Award size={12} style={{ color: C.gold }} />
                      <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: 10, color: C.creamSubtle }}>
                        <span style={{ color: C.creamText }}>{breweryStats.topRatedBeer}</span>
                        {breweryStats.topRatedScore && <span style={{ color: C.gold }}> {breweryStats.topRatedScore.toFixed(1)}★</span>}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Powered by + Live */}
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 14, height: 14, borderRadius: 4, background: C.gold, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Hop size={8} style={{ color: C.dark }} />
                </div>
                <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.18em", color: C.creamSubtle }}>
                  HopTrack
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#3D7A52", display: "inline-block" }} />
                <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: C.creamSubtle }}>Live</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
