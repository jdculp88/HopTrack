"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Stamp, Search, SlidersHorizontal } from "lucide-react";
import { BeerStyleBadge } from "@/components/ui/BeerStyleBadge";
import { formatDate } from "@/lib/utils";
import { getStyleFamily, getStyleVars } from "@/lib/beerStyleColors";

interface StampData {
  beerId: string;
  beerName: string;
  style: string | null;
  abv: number | null;
  breweryName: string;
  breweryId: string | null;
  rating: number | null;
  firstTriedAt: string;
}

interface PassportGridProps {
  stamps: StampData[];
  totalBeers: number;
  totalStyles: number;
  totalBreweries: number;
}

type SortKey = "date" | "rating" | "name";

export function PassportGrid({ stamps, totalBeers, totalStyles, totalBreweries }: PassportGridProps) {
  const [styleFilter, setStyleFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("date");

  // Unique style families for filter (group by family, not raw style)
  const styleOptions = useMemo(() => {
    const s = new Set(stamps.map((st) => st.style).filter(Boolean) as string[]);
    return Array.from(s).sort();
  }, [stamps]);

  // Avg rating across all rated stamps
  const avgRating = useMemo(() => {
    const rated = stamps.filter((s) => s.rating != null && s.rating > 0);
    if (!rated.length) return null;
    return rated.reduce((sum, s) => sum + (s.rating ?? 0), 0) / rated.length;
  }, [stamps]);

  // Apply filters + sort
  const filtered = useMemo(() => {
    let result = [...stamps];
    if (styleFilter !== "all") result = result.filter((s) => s.style === styleFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) => s.beerName.toLowerCase().includes(q) || s.breweryName.toLowerCase().includes(q)
      );
    }
    if (sort === "rating") result.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    else if (sort === "name") result.sort((a, b) => a.beerName.localeCompare(b.beerName));
    // "date" keeps original order (first tried, ascending from server)
    return result;
  }, [stamps, styleFilter, search, sort]);

  const isFiltered = styleFilter !== "all" || search.trim().length > 0;
  const activeStyleVars = styleFilter !== "all" ? getStyleVars(styleFilter) : null;

  return (
    <div className="space-y-5">

      {/* Passport cover — stats */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-bg-stats rounded-3xl p-5 border border-[var(--border)]"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[var(--accent-gold)] to-[var(--accent-amber)] flex items-center justify-center flex-shrink-0">
            <Stamp size={22} className="text-[var(--bg)]" />
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--accent-gold)]">Beer Passport</p>
            <h1 className="font-display text-2xl font-bold text-[var(--text-primary)] leading-tight">Your Collection</h1>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Beers", value: totalBeers },
            { label: "Styles", value: totalStyles },
            { label: "Breweries", value: totalBreweries },
            { label: "Avg ★", value: avgRating != null ? avgRating.toFixed(1) : "—" },
          ].map(({ label, value }) => (
            <div key={label} className="text-center rounded-2xl py-3 px-1" style={{ background: "color-mix(in srgb, var(--surface-2) 55%, transparent)" }}>
              <p className="font-mono font-bold text-[var(--accent-gold)] text-xl leading-none">{value}</p>
              <p className="text-[10px] text-[var(--text-muted)] mt-1 font-mono uppercase tracking-wide">{label}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-[var(--text-muted)] mt-4 leading-relaxed">
          Every unique beer you check in earns a stamp. Explore new styles and breweries to grow your collection.
        </p>
      </motion.div>

      {/* Search + sort row */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search beers or breweries…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-gold)]/50 transition-colors"
          />
        </div>
        <div className="relative flex-shrink-0">
          <SlidersHorizontal size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="pl-8 pr-3 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-sm text-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent-gold)]/50 appearance-none cursor-pointer"
          >
            <option value="date">Date</option>
            <option value="rating">Rating</option>
            <option value="name">A–Z</option>
          </select>
        </div>
      </div>

      {/* Style filter pills — style-colored when active */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setStyleFilter("all")}
          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex-shrink-0 border"
          style={styleFilter === "all"
            ? { background: "var(--accent-gold)", color: "var(--bg)", borderColor: "var(--accent-gold)" }
            : { background: "var(--surface)", color: "var(--text-muted)", borderColor: "var(--border)" }
          }
        >
          All {totalBeers}
        </button>
        {styleOptions.map((style) => {
          const sv = getStyleVars(style);
          const isActive = styleFilter === style;
          const count = stamps.filter((s) => s.style === style).length;
          return (
            <button
              key={style}
              onClick={() => setStyleFilter(isActive ? "all" : style)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex-shrink-0 border whitespace-nowrap"
              style={isActive
                ? { background: sv.primary, color: "var(--bg)", borderColor: sv.primary }
                : { background: "var(--surface)", color: "var(--text-muted)", borderColor: "var(--border)" }
              }
            >
              {style} {count}
            </button>
          );
        })}
      </div>

      {/* Results count */}
      <AnimatePresence>
        {isFiltered && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="text-xs font-mono overflow-hidden"
            style={{ color: activeStyleVars?.primary ?? "var(--accent-gold)" }}
          >
            {filtered.length} stamp{filtered.length !== 1 ? "s" : ""} · {styleFilter !== "all" ? styleFilter : "filtered"}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Stamps Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <span className="text-5xl block">📖</span>
          <div>
            <h3 className="font-display text-xl font-bold text-[var(--text-primary)]">
              {stamps.length === 0 ? "Your passport is empty" : "No matches"}
            </h3>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              {stamps.length === 0
                ? "Start a session to collect your first stamp"
                : "Try a different search or filter"}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filtered.map((stamp, i) => {
            const sv = getStyleVars(stamp.style);
            const isFivestar = stamp.rating === 5;

            return (
              <motion.div
                key={stamp.beerId}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: Math.min(i * 0.025, 0.5), type: "spring", stiffness: 400, damping: 30 }}
              >
                <Link href={`/beer/${stamp.beerId}`}>
                  <div
                    className={`card-bg-reco p-3 rounded-2xl border transition-all hover:scale-[1.02] ${
                      isFivestar
                        ? "border-[var(--accent-gold)]/60 shadow-[0_0_14px_color-mix(in_srgb,var(--accent-gold)_18%,transparent)]"
                        : "border-[var(--border)]"
                    }`}
                    data-style={getStyleFamily(stamp.style)}
                  >
                    {/* Style-colored image area */}
                    <div
                      className="w-full aspect-square rounded-xl mb-2.5 flex items-center justify-center text-3xl relative overflow-hidden"
                      style={{ background: `linear-gradient(135deg, ${sv.light}, ${sv.soft ?? sv.light})` }}
                    >
                      <span className="relative z-10">🍺</span>
                      {isFivestar && (
                        <div className="absolute top-1.5 right-1.5">
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full" style={{ background: "var(--accent-gold)", color: "var(--bg)" }}>★5</span>
                        </div>
                      )}
                      {/* Stamp number */}
                      <div className="absolute bottom-1.5 left-1.5">
                        <span className="text-[9px] font-mono opacity-50" style={{ color: sv.primary }}>
                          #{stamps.indexOf(stamp) + 1}
                        </span>
                      </div>
                    </div>

                    <p className="font-display font-bold text-sm text-[var(--text-primary)] truncate leading-tight">
                      {stamp.beerName}
                    </p>
                    <p className="text-[11px] text-[var(--text-muted)] truncate mt-0.5">
                      {stamp.breweryName}
                    </p>

                    <div className="flex items-center justify-between mt-2">
                      {stamp.style && <BeerStyleBadge style={stamp.style} size="xs" />}
                      {stamp.rating != null && stamp.rating > 0 && (
                        <div className="flex items-center gap-0.5 flex-shrink-0">
                          <Star size={10} className="fill-[var(--accent-gold)] text-[var(--accent-gold)]" />
                          <span className="text-xs font-mono font-bold text-[var(--accent-gold)]">{stamp.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>

                    <p className="text-[10px] text-[var(--text-muted)] mt-1.5 font-mono">
                      {formatDate(stamp.firstTriedAt)}
                    </p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
