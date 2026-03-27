"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, X, Droplets, Calendar } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

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
}

interface BoardEvent {
  id: string;
  title: string;
  event_date: string;
  start_time: string | null;
}

interface BoardClientProps {
  breweryId: string;
  breweryName: string;
  initialBeers: BoardBeer[];
  events?: BoardEvent[];
}

type FontSize = "medium" | "large" | "xl";

const FONT_SIZES: Record<FontSize, { name: string; sub: string; detail: string }> = {
  medium: { name: "text-xl",  sub: "text-sm",   detail: "text-xs" },
  large:  { name: "text-2xl", sub: "text-base", detail: "text-sm" },
  xl:     { name: "text-3xl", sub: "text-lg",   detail: "text-base" },
};

// Subtle chalk noise texture via inline SVG data URI
const CHALK_TEXTURE = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E")`;

export function BoardClient({ breweryId, breweryName, initialBeers, events = [] }: BoardClientProps) {
  const [beers, setBeers] = useState<BoardBeer[]>(initialBeers);
  const [fontSize, setFontSize] = useState<FontSize>("large");
  const [showABV, setShowABV] = useState(true);
  const [showDesc, setShowDesc] = useState(true);
  const [showPrice, setShowPrice] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fonts = FONT_SIZES[fontSize];

  // Separate featured, active, and 86'd beers
  const featuredBeer = beers.find(b => b.is_featured && !b.is_86d);
  const activeTapBeers = beers.filter(b => !b.is_featured && !b.is_86d);
  const eightySixedBeers = beers.filter(b => b.is_86d);

  // Supabase Realtime
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`board-${breweryId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "beers", filter: `brewery_id=eq.${breweryId}` }, () => refetchBeers())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [breweryId]);

  const refetchBeers = useCallback(async () => {
    const supabase = createClient();
    const { data } = await (supabase as any)
      .from("beers")
      .select("*")
      .eq("brewery_id", breweryId)
      .eq("is_on_tap", true)
      .order("display_order", { ascending: true })
      .order("name");
    if (data) setBeers(data);
  }, [breweryId]);

  // Auto-scroll for overflow
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let animationId: number;
    let scrollPos = 0;
    const speed = 0.3;

    function animate() {
      if (!el) return;
      if (el.scrollHeight <= el.clientHeight) {
        animationId = requestAnimationFrame(animate);
        return;
      }
      scrollPos += speed;
      if (scrollPos >= el.scrollHeight - el.clientHeight) scrollPos = 0;
      el.scrollTop = scrollPos;
      animationId = requestAnimationFrame(animate);
    }

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [beers, fontSize]);

  // Dotted leader line component
  function LeaderDots() {
    return <span className="flex-1 mx-2 border-b border-dotted border-white/15 self-end mb-1.5" />;
  }

  // Format event date
  function formatEventDate(dateStr: string, time: string | null) {
    const date = new Date(dateStr + "T00:00:00");
    const dayName = date.toLocaleDateString(undefined, { weekday: "long" });
    const monthDay = date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    if (time) return `${dayName} ${monthDay} · ${time}`;
    return `${dayName} ${monthDay}`;
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col"
      style={{
        background: "#0F0E0C",
        backgroundImage: CHALK_TEXTURE,
        backgroundRepeat: "repeat",
      }}
    >
      {/* ── Header: Brewery name ──────────────────────────────────── */}
      <div className="px-8 pt-8 pb-2">
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-white tracking-tight">
          {breweryName}
        </h1>
        <div className="mt-3 border-b border-dashed border-white/20" />
      </div>

      {/* ── Section header: ON TAP ────────────────────────────────── */}
      <div className="px-8 pt-4 pb-2">
        <p className="text-xs font-mono uppercase tracking-[0.3em] text-white/40">
          On Tap
        </p>
      </div>

      {/* Settings gear — floating top right */}
      <button
        onClick={() => setSettingsOpen(!settingsOpen)}
        className="absolute top-6 right-6 p-2 rounded-xl hover:bg-white/5 transition-colors text-white/30 hover:text-white/60 z-10"
      >
        <Settings size={18} />
      </button>

      {/* Settings panel */}
      <AnimatePresence>
        {settingsOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="overflow-hidden mx-8 border border-white/10 rounded-xl"
          >
            <div className="px-6 py-4 flex flex-wrap items-center gap-6 bg-[#1A1918]">
              <div className="flex items-center gap-3">
                <span className="text-xs text-white/40 font-mono uppercase">Font</span>
                {(["medium", "large", "xl"] as FontSize[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setFontSize(s)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors ${
                      fontSize === s
                        ? "bg-[#D4A843] text-[#0F0E0C]"
                        : "bg-[#2A2826] text-white/50 hover:text-white"
                    }`}
                  >
                    {s.toUpperCase()}
                  </button>
                ))}
              </div>

              {[
                { label: "ABV", checked: showABV, onChange: setShowABV },
                { label: "Description", checked: showDesc, onChange: setShowDesc },
                { label: "Price", checked: showPrice, onChange: setShowPrice },
              ].map(({ label, checked, onChange }) => (
                <label key={label} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    className="accent-[#D4A843]"
                  />
                  <span className="text-xs text-white/40 font-mono">{label}</span>
                </label>
              ))}

              <button
                onClick={() => setSettingsOpen(false)}
                className="ml-auto p-1 text-white/40 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Beer list ─────────────────────────────────────────────── */}
      <div ref={scrollRef} className="flex-1 overflow-hidden px-8 py-2">
        {beers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Droplets size={48} className="text-white/10 mb-4" />
            <p className="font-display text-xl text-white/30">No beers on tap</p>
            <p className="text-sm text-white/15 mt-1">Add beers to your tap list to see them here</p>
          </div>
        ) : (
          <div className="space-y-1">
            {/* Beer of the Week — highlighted */}
            {featuredBeer && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl px-5 py-4 mb-2"
                style={{ background: "rgba(212, 168, 67, 0.08)", border: "1px solid rgba(212, 168, 67, 0.2)" }}
              >
                <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#D4A843] mb-2 flex items-center gap-2">
                  <span className="text-[#D4A843]">&#9733;</span> Beer of the Week
                </p>
                <div className="flex items-baseline">
                  <h2 className={`font-display font-bold text-white ${fonts.name}`}>
                    {featuredBeer.name}
                  </h2>
                  <LeaderDots />
                  <div className="flex items-baseline gap-4 flex-shrink-0">
                    {showABV && featuredBeer.abv != null && (
                      <span className="font-mono text-white/70 text-sm">{featuredBeer.abv.toFixed(1)}%</span>
                    )}
                    {showPrice && featuredBeer.price_per_pint != null && (
                      <span className="font-mono text-[#D4A843] text-sm font-bold">${featuredBeer.price_per_pint.toFixed(0)}</span>
                    )}
                  </div>
                </div>
                {showDesc && (featuredBeer.style || featuredBeer.description) && (
                  <p className={`text-white/40 ${fonts.detail} mt-1 line-clamp-1`}>
                    {featuredBeer.style}{featuredBeer.description ? ` · ${featuredBeer.description}` : ""}
                  </p>
                )}
              </motion.div>
            )}

            {/* Active beers */}
            {activeTapBeers.map((beer, i) => (
              <motion.div
                key={beer.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="px-5 py-3"
              >
                <div className="flex items-baseline">
                  <h2 className={`font-display font-bold text-white ${fonts.name}`}>
                    {beer.name}
                  </h2>
                  <LeaderDots />
                  <div className="flex items-baseline gap-4 flex-shrink-0">
                    {showABV && beer.abv != null && (
                      <span className="font-mono text-white/60 text-sm">{beer.abv.toFixed(1)}%</span>
                    )}
                    {showPrice && beer.price_per_pint != null && (
                      <span className="font-mono text-[#D4A843] text-sm">${beer.price_per_pint.toFixed(0)}</span>
                    )}
                  </div>
                </div>
                {showDesc && (beer.style || beer.description) && (
                  <p className={`text-white/35 ${fonts.detail} mt-0.5 line-clamp-1`}>
                    {beer.style}{beer.description ? ` · ${beer.description}` : ""}
                  </p>
                )}
              </motion.div>
            ))}

            {/* 86'd beers — crossed out */}
            {eightySixedBeers.length > 0 && (
              <>
                {eightySixedBeers.map((beer) => (
                  <div key={beer.id} className="px-5 py-2 flex items-center gap-3">
                    <span className={`font-display font-bold text-white/20 line-through ${fonts.name}`}>
                      {beer.name}
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#C44B3A]/60 bg-[#C44B3A]/10 px-2 py-0.5 rounded">
                      86&apos;d
                    </span>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Events bar + footer ───────────────────────────────────── */}
      <div className="px-8 border-t border-dashed border-white/10">
        {/* Upcoming events */}
        {events.length > 0 && (
          <div className="py-3 space-y-1">
            {events.map((event) => (
              <div key={event.id} className="flex items-center gap-3">
                <Calendar size={13} className="text-[#D4A843]/60 flex-shrink-0" />
                <span className="font-display text-sm text-white/50">
                  {event.title}
                </span>
                <span className="text-xs font-mono text-white/25">
                  {formatEventDate(event.event_date, event.start_time)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="py-3 flex items-center justify-between border-t border-white/5">
          <p className="text-[10px] text-white/15 font-mono uppercase tracking-[0.2em]">
            Powered by HopTrack
          </p>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3D7A52] animate-pulse" />
            <p className="text-[10px] text-white/15 font-mono">
              Live
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
