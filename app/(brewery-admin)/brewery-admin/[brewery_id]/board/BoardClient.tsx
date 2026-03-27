"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, X, Droplets, Calendar, Star, TrendingUp, Users, Award, Tag } from "lucide-react";
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

// ─── Design System ────────────────────────────────────────────────────────────

const C = {
  // Page (cream)
  cream: "#FBF7F0",
  creamBorder: "#E8DFC8",
  creamText: "#0F0E0C",
  creamMuted: "#6B6355",
  creamSubtle: "#A89F8C",
  // Cards (dark)
  dark: "#0F0E0C",
  darkSurface: "#1C1A16",
  darkSurface2: "#252219",
  darkBorder: "#3A3628",
  darkText: "#F5F0E8",
  darkMuted: "#A89F8C",
  darkSubtle: "#8B7E6A",
  // Accent
  gold: "#D4A843",
  goldDim: "rgba(212,168,67,0.15)",
  goldBorder: "rgba(212,168,67,0.3)",
  danger: "#C44B3A",
} as const;

// SVG grain — same as landing page
const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`;

const FONT_SIZES: Record<FontSize, { name: number; style: number; meta: number; price: number; desc: number }> = {
  medium: { name: 18, style: 10, meta: 10, price: 17, desc: 10 },
  large:  { name: 22, style: 11, meta: 11, price: 20, desc: 11 },
  xl:     { name: 26, style: 12, meta: 12, price: 23, desc: 12 },
};

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

const DEFAULT_SETTINGS: BoardSettings = {
  fontSize: "large",
  showABV: true,
  showDesc: false,
  showPrice: true,
  showRating: true,
  showStyle: true,
  showStats: true,
};

function loadSettings(breweryId: string): BoardSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const s = localStorage.getItem(`hoptrack-board-${breweryId}`);
    if (s) return { ...DEFAULT_SETTINGS, ...JSON.parse(s) };
  } catch {}
  return DEFAULT_SETTINGS;
}

function saveSettings(breweryId: string, s: BoardSettings) {
  try { localStorage.setItem(`hoptrack-board-${breweryId}`, JSON.stringify(s)); } catch {}
}

// ─── Brewery Crest ────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  const skip = ["the", "of", "and", "&", "co.", "co", "brewing", "brewery", "craft", "beer", "ales"];
  const words = name.split(/\s+/).filter(w => !skip.includes(w.toLowerCase()));
  if (words.length === 0) return name.charAt(0).toUpperCase();
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
}

function BreweryCrest({ name }: { name: string }) {
  const initials = getInitials(name);
  return (
    <svg viewBox="0 0 72 72" width="72" height="72" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="36" cy="36" r="34" stroke={C.gold} strokeWidth="1.5" fill="none" />
      <circle cx="36" cy="36" r="28" stroke={C.gold} strokeWidth="0.5" opacity="0.35" fill="none" />
      <polygon points="36,4 39.5,9 36,14 32.5,9" fill={C.gold} opacity="0.7" />
      <line x1="8" y1="36" x2="18" y2="36" stroke={C.gold} strokeWidth="0.75" opacity="0.4" />
      <line x1="54" y1="36" x2="64" y2="36" stroke={C.gold} strokeWidth="0.75" opacity="0.4" />
      <text
        x="36" y="38"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="'DM Sans', system-ui, sans-serif"
        fontWeight="800"
        fontSize={initials.length > 2 ? "17" : "21"}
        letterSpacing="2"
        fill={C.gold}
      >
        {initials}
      </text>
    </svg>
  );
}

// ─── Star Rating ──────────────────────────────────────────────────────────────

function StarRating({ rating, size = 12 }: { rating: number | null; size?: number }) {
  if (rating == null) return null;
  const rounded = Math.round(rating * 2) / 2;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
      {[1, 2, 3, 4, 5].map(s => (
        <span key={s} style={{ fontSize: size, color: s <= rounded ? C.gold : C.darkBorder, lineHeight: 1 }}>★</span>
      ))}
    </span>
  );
}

// ─── Beer Card ────────────────────────────────────────────────────────────────

function BeerCard({
  beer, fonts, isFeatured, showABV, showDesc, showPrice,
  showRating, showStyle, showStats, stats, index,
}: {
  beer: BoardBeer;
  fonts: (typeof FONT_SIZES)["large"];
  isFeatured?: boolean;
  showABV: boolean;
  showDesc: boolean;
  showPrice: boolean;
  showRating: boolean;
  showStyle: boolean;
  showStats: boolean;
  stats?: BeerStats;
  index: number;
}) {
  const is86d = !!beer.is_86d;
  const hasPromo = !is86d && !!beer.promo_text;
  const hasBotw = isFeatured && !is86d;
  const avgRating = stats?.avgRating ?? beer.avg_rating;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: is86d ? 0.3 : 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        borderRadius: 14,
        overflow: "hidden",
        gridColumn: isFeatured ? "span 2" : undefined,
        background: C.darkSurface,
        border: `1px solid ${hasBotw ? C.goldBorder : hasPromo ? "rgba(212,168,67,0.18)" : C.darkBorder}`,
        boxShadow: hasBotw
          ? `0 0 0 1px ${C.goldBorder}, 0 8px 32px rgba(0,0,0,0.35)`
          : "0 4px 16px rgba(0,0,0,0.25)",
      }}
    >
      {/* Gold top accent line — BOTW gets full gradient, promos get subtle */}
      <div style={{
        height: hasBotw ? 3 : hasPromo ? 2 : 1,
        background: hasBotw
          ? `linear-gradient(90deg, transparent, ${C.gold}, transparent)`
          : hasPromo
            ? `linear-gradient(90deg, transparent, rgba(212,168,67,0.5), transparent)`
            : C.darkBorder,
        flexShrink: 0,
      }} />

      {/* Card body */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "12px 16px 14px" }}>

        {/* Status badges row */}
        {(hasBotw || hasPromo) && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            {hasBotw && (
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "3px 8px", borderRadius: 99,
                background: C.goldDim,
                border: `1px solid ${C.goldBorder}`,
                fontSize: 9, fontFamily: "var(--font-mono), monospace",
                textTransform: "uppercase", letterSpacing: "0.2em",
                fontWeight: 600, color: C.gold,
              }}>
                <Star size={8} fill={C.gold} style={{ color: C.gold }} />
                Beer of the Week
              </span>
            )}
            {hasPromo && (
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "3px 8px", borderRadius: 99,
                background: "rgba(212,168,67,0.08)",
                border: `1px solid rgba(212,168,67,0.22)`,
                fontSize: 9, fontFamily: "var(--font-mono), monospace",
                textTransform: "uppercase", letterSpacing: "0.18em",
                fontWeight: 600, color: C.gold,
              }}>
                <Tag size={8} style={{ color: C.gold }} />
                {beer.promo_text}
              </span>
            )}
          </div>
        )}

        {/* Style + Price row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          {showStyle && beer.style ? (
            <span style={{
              fontFamily: "var(--font-mono), monospace",
              textTransform: "uppercase", letterSpacing: "0.16em",
              fontSize: fonts.style, color: C.darkMuted, lineHeight: 1,
            }}>
              {beer.style}
            </span>
          ) : <span />}
          {showPrice && beer.price_per_pint != null && (
            <span style={{
              fontFamily: "var(--font-mono), monospace",
              fontWeight: 700, fontSize: fonts.price,
              color: C.gold, lineHeight: 1,
            }}>
              ${beer.price_per_pint % 1 === 0
                ? beer.price_per_pint.toFixed(0)
                : beer.price_per_pint.toFixed(2)}
            </span>
          )}
        </div>

        {/* Beer name */}
        <h2 style={{
          fontFamily: "'DM Sans', system-ui, sans-serif",
          fontWeight: 800,
          fontSize: fonts.name,
          lineHeight: 1.15,
          color: C.darkText,
          textDecoration: is86d ? "line-through" : undefined,
          textDecorationColor: C.danger,
          marginBottom: 4,
          flex: isFeatured ? undefined : 1,
        }}>
          {beer.name}
        </h2>

        {/* ABV / IBU */}
        {showABV && (beer.abv != null || beer.ibu != null) && (
          <p style={{
            fontFamily: "var(--font-mono), monospace",
            fontSize: fonts.meta, color: C.darkSubtle,
            marginBottom: showDesc && beer.description ? 4 : 0,
            lineHeight: 1.4,
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
            fontSize: fonts.desc,
            color: C.darkMuted,
            lineHeight: 1.5,
            marginTop: 4,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}>
            {beer.description}
          </p>
        )}

        {/* Spacer for non-featured cards */}
        {!isFeatured && <div style={{ flex: 1, minHeight: 4 }} />}

        {/* ── Stats row ─────────────────────────────────────────── */}
        {showStats && (
          <div style={{
            display: "flex", alignItems: "center", gap: 0,
            marginTop: 10, paddingTop: 10,
            borderTop: `1px solid ${C.darkBorder}`,
          }}>
            {/* Rating */}
            {showRating && avgRating != null ? (
              <div style={{ display: "flex", alignItems: "center", gap: 5, flex: 1 }}>
                <StarRating rating={avgRating} size={11} />
                <span style={{
                  fontFamily: "var(--font-mono), monospace",
                  fontSize: 10, fontWeight: 600, color: C.gold,
                }}>
                  {avgRating.toFixed(1)}
                </span>
              </div>
            ) : showRating ? (
              <div style={{ flex: 1 }}>
                <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: 10, color: C.darkSubtle }}>
                  No ratings yet
                </span>
              </div>
            ) : <div style={{ flex: 1 }} />}

            {/* Divider */}
            {stats && stats.pourCount > 0 && (
              <div style={{ width: 1, height: 12, background: C.darkBorder, margin: "0 10px" }} />
            )}

            {/* Pour count */}
            {stats && stats.pourCount > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 4, flex: 1 }}>
                <span style={{ fontSize: 13, lineHeight: 1 }}>🍺</span>
                <span style={{
                  fontFamily: "var(--font-mono), monospace",
                  fontSize: 10, color: C.darkMuted,
                }}>
                  {stats.pourCount.toLocaleString()} {stats.pourCount === 1 ? "pour" : "pours"}
                </span>
              </div>
            )}

            {/* Divider */}
            {stats?.biggestFan && (
              <div style={{ width: 1, height: 12, background: C.darkBorder, margin: "0 10px" }} />
            )}

            {/* Biggest fan */}
            {stats?.biggestFan && (
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 13, lineHeight: 1 }}>👤</span>
                <span style={{
                  fontFamily: "var(--font-mono), monospace",
                  fontSize: 10, color: C.darkMuted,
                  maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {stats.biggestFan}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 86'd diagonal watermark */}
      {is86d && (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          pointerEvents: "none",
        }}>
          <span style={{
            fontFamily: "var(--font-mono), monospace",
            fontWeight: 800, fontSize: 28,
            color: C.danger, opacity: 0.18,
            transform: "rotate(-25deg)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            userSelect: "none",
          }}>
            86&apos;D
          </span>
        </div>
      )}
    </motion.div>
  );
}

// ─── Grid Columns ─────────────────────────────────────────────────────────────

function getGridColumns(count: number): number {
  if (count <= 4) return 2;
  if (count <= 8) return 3;
  if (count <= 12) return 4;
  return 5;
}

// ─── Format Event Date ────────────────────────────────────────────────────────

function formatEventDate(dateStr: string, time: string | null) {
  const date = new Date(dateStr + "T00:00:00");
  const dayName = date.toLocaleDateString(undefined, { weekday: "short" });
  const monthDay = date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  if (time) {
    const [h, m] = time.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 || 12;
    return `${dayName} ${monthDay} · ${hour12}:${m.toString().padStart(2, "0")} ${ampm}`;
  }
  return `${dayName} ${monthDay}`;
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
  const fonts = FONT_SIZES[fontSize];

  useEffect(() => { saveSettings(breweryId, settings); }, [breweryId, settings]);

  const updateSetting = <K extends keyof BoardSettings>(key: K, val: BoardSettings[K]) =>
    setSettings(prev => ({ ...prev, [key]: val }));

  const featuredBeer = beers.find(b => b.is_featured && !b.is_86d);
  const activeTapBeers = beers.filter(b => !b.is_featured && !b.is_86d);
  const eightySixedBeers = beers.filter(b => b.is_86d);

  const totalSlots = (featuredBeer ? 2 : 0) + activeTapBeers.length + eightySixedBeers.length;
  const gridCols = useMemo(() => getGridColumns(totalSlots), [totalSlots]);
  const gridRows = useMemo(() => Math.ceil(totalSlots / gridCols), [totalSlots, gridCols]);
  const activeBeerCount = (featuredBeer ? 1 : 0) + activeTapBeers.length;

  // Realtime
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
    const supabase = createClient();
    const { data } = await (supabase as any)
      .from("beers").select("*")
      .eq("brewery_id", breweryId).eq("is_on_tap", true)
      .order("display_order", { ascending: true }).order("name");
    if (data) setBeers(data);
  }, [breweryId]);

  // Auto-scroll for overflow
  useEffect(() => {
    const grid = gridRef.current?.querySelector("[data-grid]") as HTMLElement | null;
    if (!grid) return;
    let id: number, pos = 0, pause = 0;
    const tick = () => {
      if (grid.scrollHeight <= grid.clientHeight) { id = requestAnimationFrame(tick); return; }
      if (pause > 0) { pause--; id = requestAnimationFrame(tick); return; }
      pos += 0.15;
      if (pos >= grid.scrollHeight - grid.clientHeight) { pos = 0; pause = 180; }
      grid.scrollTop = pos;
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [beers, fontSize]);

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        display: "flex", flexDirection: "column",
        background: `
          radial-gradient(ellipse at 50% 0%, rgba(212,168,67,0.09) 0%, transparent 55%),
          radial-gradient(ellipse at 90% 90%, rgba(212,168,67,0.04) 0%, transparent 45%),
          ${C.cream}
        `,
      }}
    >
      {/* Grain overlay */}
      <div style={{
        position: "absolute", inset: 0, backgroundImage: GRAIN_SVG,
        opacity: 0.025, pointerEvents: "none", zIndex: 1,
      }} />

      <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", height: "100%" }}>

        {/* ── Header ──────────────────────────────────────────────── */}
        <div style={{ padding: "18px 28px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <BreweryCrest name={breweryName} />

            {/* Brewery name — Cormorant Garrigue */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{
                fontFamily: "'Cormorant Garrigue', 'Playfair Display', Georgia, serif",
                fontWeight: 700,
                fontSize: 52,
                lineHeight: 1,
                letterSpacing: "-0.01em",
                color: C.creamText,
              }}>
                {breweryName}
              </h1>
            </div>

            {/* On Tap count */}
            <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{
                fontSize: 11, fontFamily: "var(--font-mono), monospace",
                textTransform: "uppercase", letterSpacing: "0.22em", color: C.creamMuted,
              }}>
                On Tap
              </span>
              <span style={{ fontSize: 10, color: C.creamSubtle }}>·</span>
              <span style={{
                fontSize: 22, fontFamily: "var(--font-mono), monospace",
                fontWeight: 700, color: C.gold,
              }}>
                {activeBeerCount}
              </span>
            </div>
          </div>

          {/* Divider with gold center accent */}
          <div style={{ position: "relative", marginTop: 14, height: 1 }}>
            <div style={{ position: "absolute", inset: 0, background: C.creamBorder }} />
            <div style={{
              position: "absolute", left: "50%", transform: "translateX(-50%)",
              top: -1, width: 100, height: 3,
              background: `linear-gradient(90deg, transparent, ${C.gold}70, transparent)`,
            }} />
          </div>
        </div>

        {/* Settings gear */}
        <button
          onClick={() => setSettingsOpen(v => !v)}
          style={{
            position: "absolute", top: 18, right: 28,
            padding: 8, borderRadius: 10, border: "none",
            background: "transparent", cursor: "pointer",
            color: C.creamSubtle, zIndex: 10, transition: "color 0.2s",
          }}
          onMouseEnter={e => (e.currentTarget.style.color = C.creamMuted)}
          onMouseLeave={e => (e.currentTarget.style.color = C.creamSubtle)}
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
              style={{
                overflow: "hidden", margin: "0 28px 8px",
                borderRadius: 12, border: `1px solid ${C.creamBorder}`,
              }}
            >
              <div style={{
                padding: "10px 20px",
                display: "flex", flexWrap: "wrap", alignItems: "center", gap: 18,
                background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 9, fontFamily: "var(--font-mono), monospace", textTransform: "uppercase", letterSpacing: "0.1em", color: C.creamMuted }}>Font</span>
                  {(["medium", "large", "xl"] as FontSize[]).map(s => (
                    <button key={s} onClick={() => updateSetting("fontSize", s)} style={{
                      padding: "4px 10px", borderRadius: 8, border: "none", cursor: "pointer",
                      fontSize: 9, fontFamily: "var(--font-mono), monospace",
                      background: fontSize === s ? C.gold : C.creamBorder,
                      color: fontSize === s ? "#0F0E0C" : C.creamMuted,
                      fontWeight: 600, transition: "all 0.15s",
                    }}>
                      {s.toUpperCase()}
                    </button>
                  ))}
                </div>
                {([
                  { label: "Style", key: "showStyle" as const, checked: showStyle },
                  { label: "ABV", key: "showABV" as const, checked: showABV },
                  { label: "Desc", key: "showDesc" as const, checked: showDesc },
                  { label: "Price", key: "showPrice" as const, checked: showPrice },
                  { label: "Rating", key: "showRating" as const, checked: showRating },
                  { label: "Stats", key: "showStats" as const, checked: showStats },
                ]).map(({ label, key, checked }) => (
                  <label key={label} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                    <input type="checkbox" checked={checked} onChange={e => updateSetting(key, e.target.checked)} style={{ accentColor: C.gold }} />
                    <span style={{ fontSize: 9, fontFamily: "var(--font-mono), monospace", color: C.creamMuted }}>{label}</span>
                  </label>
                ))}
                <button onClick={() => setSettingsOpen(false)} style={{ marginLeft: "auto", padding: 4, background: "none", border: "none", cursor: "pointer", color: C.creamMuted }}>
                  <X size={14} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Events strip ────────────────────────────────────────── */}
        {events.length > 0 && (
          <div style={{ padding: "0 28px 12px", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            {events.map(event => (
              <div key={event.id} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "8px 16px", borderRadius: 10,
                background: C.darkSurface,
                border: `1px solid ${C.darkBorder}`,
              }}>
                <Calendar size={14} style={{ color: C.gold, flexShrink: 0 }} />
                <span style={{
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  fontWeight: 600, fontSize: 15, color: C.darkText,
                }}>
                  {event.title}
                </span>
                <span style={{
                  fontSize: 12, fontFamily: "var(--font-mono), monospace",
                  padding: "3px 8px", borderRadius: 6,
                  color: C.gold, background: C.goldDim,
                  flexShrink: 0,
                }}>
                  {formatEventDate(event.event_date, event.start_time)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* ── Beer Card Grid ───────────────────────────────────────── */}
        <div ref={gridRef} style={{ flex: 1, minHeight: 0, position: "relative" }}>
          {beers.length === 0 ? (
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", height: "100%", textAlign: "center", padding: "0 28px",
            }}>
              <Droplets size={48} style={{ color: `${C.creamSubtle}60`, marginBottom: 12 }} />
              <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 22, color: C.creamMuted }}>
                No beers on tap
              </p>
              <p style={{ fontSize: 14, marginTop: 4, color: C.creamSubtle }}>
                Add beers to your tap list to see them here
              </p>
            </div>
          ) : (
            <div
              data-grid
              style={{
                position: "absolute", inset: 0,
                display: "grid",
                gap: 12,
                padding: "0 28px 10px",
                gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
                gridTemplateRows: `repeat(${gridRows}, 1fr)`,
                overflow: "auto",
              }}
            >
              {featuredBeer && (
                <BeerCard
                  beer={featuredBeer} fonts={fonts} isFeatured
                  showABV={showABV} showDesc={showDesc} showPrice={showPrice}
                  showRating={showRating} showStyle={showStyle} showStats={showStats}
                  stats={beerStats[featuredBeer.id]} index={0}
                />
              )}
              {activeTapBeers.map((beer, i) => (
                <BeerCard
                  key={beer.id} beer={beer} fonts={fonts}
                  showABV={showABV} showDesc={showDesc} showPrice={showPrice}
                  showRating={showRating} showStyle={showStyle} showStats={showStats}
                  stats={beerStats[beer.id]} index={(featuredBeer ? 1 : 0) + i}
                />
              ))}
              {eightySixedBeers.map((beer, i) => (
                <BeerCard
                  key={beer.id} beer={beer} fonts={fonts}
                  showABV={showABV} showDesc={showDesc} showPrice={showPrice}
                  showRating={showRating} showStyle={showStyle} showStats={showStats}
                  stats={beerStats[beer.id]} index={(featuredBeer ? 1 : 0) + activeTapBeers.length + i}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Brewery Stats Bar ────────────────────────────────────── */}
        {showStats && breweryStats && breweryStats.totalPours > 0 && (
          <div style={{
            padding: "7px 28px",
            display: "flex", alignItems: "center", gap: 28,
            borderTop: `1px solid ${C.creamBorder}`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <TrendingUp size={13} style={{ color: C.gold }} />
              <span style={{ fontSize: 11, fontFamily: "var(--font-mono), monospace", color: C.creamMuted }}>
                <span style={{ color: C.creamText, fontWeight: 700 }}>{breweryStats.totalPours.toLocaleString()}</span> pours tracked
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Users size={13} style={{ color: C.gold }} />
              <span style={{ fontSize: 11, fontFamily: "var(--font-mono), monospace", color: C.creamMuted }}>
                <span style={{ color: C.creamText, fontWeight: 700 }}>{breweryStats.uniqueVisitors.toLocaleString()}</span> visitors
              </span>
            </div>
            {breweryStats.topRatedBeer && (
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Award size={13} style={{ color: C.gold }} />
                <span style={{ fontSize: 11, fontFamily: "var(--font-mono), monospace", color: C.creamMuted }}>
                  Top rated: <span style={{ color: C.creamText, fontWeight: 600 }}>{breweryStats.topRatedBeer}</span>
                  {breweryStats.topRatedScore && <span style={{ color: C.gold }}> {breweryStats.topRatedScore.toFixed(1)}★</span>}
                </span>
              </div>
            )}
            {breweryStats.mostPopularBeer && (
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <TrendingUp size={13} style={{ color: C.gold }} />
                <span style={{ fontSize: 11, fontFamily: "var(--font-mono), monospace", color: C.creamMuted }}>
                  Most popular: <span style={{ color: C.creamText, fontWeight: 600 }}>{breweryStats.mostPopularBeer}</span>
                </span>
              </div>
            )}
          </div>
        )}

        {/* ── Footer ───────────────────────────────────────────────── */}
        <div style={{
          padding: "6px 28px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          borderTop: `1px solid ${C.creamBorder}`,
        }}>
          <p style={{
            fontSize: 9, fontFamily: "var(--font-mono), monospace",
            textTransform: "uppercase", letterSpacing: "0.2em", color: C.creamSubtle,
          }}>
            Powered by HopTrack
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%", background: "#3D7A52",
              display: "inline-block", animation: "pulse 2s infinite",
            }} />
            <p style={{
              fontSize: 9, fontFamily: "var(--font-mono), monospace",
              textTransform: "uppercase", letterSpacing: "0.1em", color: C.creamSubtle,
            }}>
              Live
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
