"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Beer, Star, Stamp, Search } from "lucide-react";
import { BeerStyleBadge } from "@/components/ui/BeerStyleBadge";
import { formatDate, generateGradientFromString } from "@/lib/utils";

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

type FilterKey = "all" | string;

export function PassportGrid({ stamps, totalBeers, totalStyles, totalBreweries }: PassportGridProps) {
  const [styleFilter, setStyleFilter] = useState<FilterKey>("all");
  const [search, setSearch] = useState("");

  // Get unique styles for filter
  const styles = useMemo(() => {
    const s = new Set(stamps.map((st) => st.style).filter(Boolean) as string[]);
    return Array.from(s).sort();
  }, [stamps]);

  // Apply filters
  const filtered = useMemo(() => {
    let result = stamps;
    if (styleFilter !== "all") {
      result = result.filter((s) => s.style === styleFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.beerName.toLowerCase().includes(q) ||
          s.breweryName.toLowerCase().includes(q)
      );
    }
    return result;
  }, [stamps, styleFilter, search]);

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-5"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4A843] to-[#E8841A] flex items-center justify-center">
            <Stamp size={20} className="text-[#0F0E0C]" />
          </div>
          <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">Beer Passport</h1>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="font-mono font-bold text-[#D4A843] text-2xl">{totalBeers}</p>
            <p className="text-xs text-[var(--text-muted)]">Beers</p>
          </div>
          <div className="text-center">
            <p className="font-mono font-bold text-[#D4A843] text-2xl">{totalStyles}</p>
            <p className="text-xs text-[var(--text-muted)]">Styles</p>
          </div>
          <div className="text-center">
            <p className="font-mono font-bold text-[#D4A843] text-2xl">{totalBreweries}</p>
            <p className="text-xs text-[var(--text-muted)]">Breweries</p>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search beers or breweries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-gold)]/50"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setStyleFilter("all")}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              styleFilter === "all"
                ? "bg-[#D4A843] text-[#0F0E0C]"
                : "bg-[var(--surface)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            }`}
          >
            All
          </button>
          {styles.map((style) => (
            <button
              key={style}
              onClick={() => setStyleFilter(style === styleFilter ? "all" : style)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                styleFilter === style
                  ? "bg-[#D4A843] text-[#0F0E0C]"
                  : "bg-[var(--surface)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              }`}
            >
              {style}
            </button>
          ))}
        </div>
      </div>

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
          {filtered.map((stamp, i) => (
            <motion.div
              key={stamp.beerId}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: Math.min(i * 0.03, 0.6), type: "spring", stiffness: 400, damping: 30 }}
            >
              <Link href={`/beer/${stamp.beerId}`}>
                <div
                  className={`p-3 bg-[var(--surface)] rounded-2xl border transition-all hover:border-[#D4A843]/40 ${
                    stamp.rating === 5
                      ? "border-[#D4A843]/60 shadow-[0_0_12px_rgba(212,168,67,0.15)]"
                      : "border-[var(--border)]"
                  }`}
                >
                  <div
                    className="w-full aspect-square rounded-xl mb-2.5 flex items-center justify-center text-3xl"
                    style={{ background: generateGradientFromString(stamp.beerName + stamp.breweryName) }}
                  >
                    🍺
                  </div>
                  <p className="font-display font-bold text-sm text-[var(--text-primary)] truncate leading-tight">
                    {stamp.beerName}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">
                    {stamp.breweryName}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    {stamp.style && <BeerStyleBadge style={stamp.style} size="xs" />}
                    {stamp.rating != null && (
                      <div className="flex items-center gap-0.5">
                        <Star size={10} className="text-[#D4A843] fill-[#D4A843]" />
                        <span className="text-xs font-mono text-[#D4A843]">{stamp.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-[var(--text-muted)] mt-1.5">
                    {formatDate(stamp.firstTriedAt)}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
