"use client";

/**
 * BreweriesListClient — Sprint 143 (The Superadmin III)
 *
 * Rich brewery list with summary stats, filter/sort controls,
 * debounced search, and enriched table rows.
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Beer,
  Building2,
  Search,
  ChevronRight,
  MapPin,
  Crown,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { StatsGrid } from "@/components/ui/StatsGrid";
import { spring, stagger } from "@/lib/animation";
import {
  SUBSCRIPTION_TIER_COLORS,
  SUBSCRIPTION_TIER_LABELS,
} from "@/lib/constants/tiers";
import type {
  BreweryListResult,
  BreweryListSort,
  BreweryListFilter,
} from "@/lib/superadmin-brewery-list";

// ── Types ─────────────────────────────────────────────────────────────

interface Props {
  initialData: BreweryListResult;
  initialSearch: string;
}

// ── Filter config ─────────────────────────────────────────────────────

const FILTERS: { value: BreweryListFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "free", label: "Free" },
  { value: "tap", label: "Tap" },
  { value: "cask", label: "Cask" },
  { value: "barrel", label: "Barrel" },
  { value: "unclaimed", label: "Unclaimed" },
];

const SORT_OPTIONS: { value: BreweryListSort; label: string }[] = [
  { value: "name", label: "Name" },
  { value: "sessions", label: "Sessions" },
  { value: "last_active", label: "Last Active" },
  { value: "created", label: "Created" },
];

// ── Tier badge colors ─────────────────────────────────────────────────

const TIER_BADGE: Record<string, { color: string; bg: string; label: string }> = {
  free: {
    color: SUBSCRIPTION_TIER_COLORS.free,
    bg: `color-mix(in srgb, ${SUBSCRIPTION_TIER_COLORS.free} 15%, transparent)`,
    label: "Free",
  },
  tap: {
    color: SUBSCRIPTION_TIER_COLORS.tap,
    bg: `color-mix(in srgb, ${SUBSCRIPTION_TIER_COLORS.tap} 15%, transparent)`,
    label: "Tap",
  },
  cask: {
    color: SUBSCRIPTION_TIER_COLORS.cask,
    bg: `color-mix(in srgb, ${SUBSCRIPTION_TIER_COLORS.cask} 15%, transparent)`,
    label: "Cask",
  },
  barrel: {
    color: SUBSCRIPTION_TIER_COLORS.barrel,
    bg: `color-mix(in srgb, ${SUBSCRIPTION_TIER_COLORS.barrel} 15%, transparent)`,
    label: "Barrel",
  },
};

// ── Helpers ───────────────────────────────────────────────────────────

function formatRelativeTime(iso: string | null): string {
  if (!iso) return "Never";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function formatMrr(cents: number): string {
  if (cents >= 1000) return `$${(cents / 1000).toFixed(1)}k`;
  return `$${cents}`;
}

// ── Component ─────────────────────────────────────────────────────────

export default function BreweriesListClient({ initialData, initialSearch }: Props) {
  const [data, setData] = useState<BreweryListResult>(initialData);
  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [filter, setFilter] = useState<BreweryListFilter>("all");
  const [sort, setSort] = useState<BreweryListSort>("created");
  const [page, setPage] = useState(initialData.page);
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // ── Debounced search ──────────────────────────────────────────────
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 300);
  }, []);

  // ── Fetch ─────────────────────────────────────────────────────────
  const fetchData = useCallback(async (p: number, s: BreweryListSort, f: BreweryListFilter, q: string) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(p),
        sort: s,
        filter: f,
      });
      if (q.trim()) params.set("q", q.trim());
      const res = await fetch(`/api/superadmin/breweries?${params}`);
      if (res.ok) {
        const json = await res.json();
        setData(json.data);
      }
    } catch {
      // Silently fail — data stays stale
    }
    setIsLoading(false);
  }, []);

  // ── Refetch on filter/sort/search/page change ─────────────────────
  useEffect(() => {
    // Skip initial render — we already have initialData
    fetchData(page, sort, filter, debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, sort, filter, debouncedSearch]);

  // ── Derived ───────────────────────────────────────────────────────
  const { breweries, summary, totalCount, pageSize } = data;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  // ── Stats ─────────────────────────────────────────────────────────
  const stats = [
    { label: "Total Breweries", value: summary.total.toLocaleString() },
    { label: "Claimed", value: summary.claimed.toLocaleString() },
    { label: "Verified", value: summary.verified.toLocaleString() },
    { label: "Paid", value: summary.paid.toLocaleString() },
    { label: "Est. MRR", value: formatMrr(summary.mrrEstimate) },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Beer size={15} style={{ color: "var(--text-muted)" }} />
          <p
            className="text-xs font-mono uppercase tracking-wider"
            style={{ color: "var(--text-muted)" }}
          >
            Platform Breweries
          </p>
        </div>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1
            className="font-display text-2xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Breweries
          </h1>
          <div className="flex items-center gap-3">
            {isLoading && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <RefreshCw size={14} style={{ color: "var(--text-muted)" }} />
              </motion.div>
            )}
            <span className="text-sm" style={{ color: "var(--text-muted)" }}>
              {totalCount.toLocaleString()} total
            </span>
          </div>
        </div>
      </div>

      {/* ── Summary Stats ───────────────────────────────────────────── */}
      <StatsGrid stats={stats} />

      {/* ── Search + Filter + Sort ──────────────────────────────────── */}
      <div className="space-y-3">
        {/* Search */}
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "var(--text-muted)" }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by name or city..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm outline-none transition-colors"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              color: "var(--text-primary)",
            }}
          />
        </div>

        {/* Filter pills + Sort */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => { setFilter(f.value); setPage(1); }}
                className="px-3 py-1.5 rounded-lg text-xs font-mono transition-all"
                style={{
                  background: filter === f.value ? "#D4A843" : "transparent",
                  color: filter === f.value ? "#0F0E0C" : "var(--text-secondary)",
                  border: filter === f.value ? "1px solid #D4A843" : "1px solid var(--border)",
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value as BreweryListSort); setPage(1); }}
            className="px-3 py-1.5 rounded-lg text-xs font-mono border outline-none cursor-pointer"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              color: "var(--text-secondary)",
            }}
          >
            {SORT_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                Sort: {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Table ───────────────────────────────────────────────────── */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        {/* Header row */}
        <div
          className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-4 px-5 py-3 text-xs font-mono uppercase tracking-wider border-b"
          style={{
            color: "var(--text-muted)",
            borderColor: "var(--border)",
            background: "var(--surface-2)",
          }}
        >
          <span>Brewery</span>
          <span className="w-16 text-center">Tier</span>
          <span className="w-16 text-right">Sessions</span>
          <span className="w-20 text-right hidden md:block">Last Active</span>
          <span className="w-20 text-center hidden sm:block">Brand</span>
          <span className="w-6" />
        </div>

        {/* Rows */}
        <AnimatePresence mode="wait">
          {breweries.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-5 py-10 text-center text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              No breweries found
            </motion.div>
          ) : (
            <motion.div
              key={`${filter}-${sort}-${debouncedSearch}-${page}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {breweries.map((brewery, i) => {
                const tierBadge = TIER_BADGE[brewery.tier];
                const isUnclaimed = brewery.tier === "unclaimed";

                return (
                  <Link
                    key={brewery.id}
                    href={`/superadmin/breweries/${brewery.id}`}
                    className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-4 px-5 py-3.5 items-center transition-colors hover:bg-[var(--surface-2)]"
                    style={{
                      borderTop: i > 0 ? "1px solid var(--border)" : undefined,
                    }}
                  >
                    {/* Brewery name + location */}
                    <div className="min-w-0">
                      <span
                        className="text-sm font-medium truncate block"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {brewery.name}
                      </span>
                      {(brewery.city || brewery.state) && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <MapPin size={10} style={{ color: "var(--text-muted)" }} />
                          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                            {[brewery.city, brewery.state].filter(Boolean).join(", ")}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Tier badge */}
                    <div className="w-16 flex justify-center">
                      {isUnclaimed ? (
                        <span
                          className="text-xs font-mono"
                          style={{ color: "var(--text-muted)" }}
                        >
                          --
                        </span>
                      ) : tierBadge ? (
                        <span
                          className="inline-flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded-full"
                          style={{
                            background: tierBadge.bg,
                            color: tierBadge.color,
                          }}
                        >
                          {brewery.tier === "barrel" && <Crown size={10} />}
                          {tierBadge.label}
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center text-xs font-mono px-2 py-0.5 rounded-full"
                          style={{
                            background: "color-mix(in srgb, var(--text-muted) 15%, transparent)",
                            color: "var(--text-muted)",
                          }}
                        >
                          {brewery.tier}
                        </span>
                      )}
                    </div>

                    {/* Sessions */}
                    <span
                      className="text-sm font-mono text-right w-16"
                      style={{
                        color: brewery.sessionCount > 0 ? "var(--accent-gold)" : "var(--text-muted)",
                      }}
                    >
                      {brewery.sessionCount.toLocaleString()}
                    </span>

                    {/* Last Active */}
                    <span
                      className="text-xs text-right w-20 hidden md:block"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {formatRelativeTime(brewery.lastActive)}
                    </span>

                    {/* Brand */}
                    <div className="w-20 hidden sm:flex justify-center">
                      {brewery.brandName ? (
                        <span
                          className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full max-w-full truncate"
                          style={{
                            background: "color-mix(in srgb, var(--accent-gold) 10%, transparent)",
                            color: "var(--accent-gold)",
                          }}
                        >
                          <Building2 size={10} className="flex-shrink-0" />
                          <span className="truncate">{brewery.brandName}</span>
                        </span>
                      ) : (
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                          --
                        </span>
                      )}
                    </div>

                    {/* Arrow */}
                    <ChevronRight size={14} style={{ color: "var(--text-muted)" }} />
                  </Link>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Pagination ──────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg text-sm border transition-all"
                style={{
                  background: "var(--surface)",
                  borderColor: "var(--border)",
                  color: "var(--text-secondary)",
                }}
              >
                Prev
              </button>
            )}
            {page < totalPages && (
              <button
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg text-sm border transition-all"
                style={{
                  background: "var(--surface)",
                  borderColor: "var(--border)",
                  color: "var(--text-secondary)",
                }}
              >
                Next
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
