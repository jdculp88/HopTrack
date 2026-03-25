"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Search, Map, List, Loader2 } from "lucide-react";
import { BreweryCard } from "@/components/brewery/BreweryCard";
import { SkeletonCard } from "@/components/ui/SkeletonLoader";
import type { BreweryWithStats } from "@/types/database";
import { searchBreweries, mapOpenBreweryToDb } from "@/lib/openbrewerydb";

// Leaflet requires browser APIs — must be loaded client-side only
const BreweryMap = dynamic(
  () => import("@/components/map/BreweryMap").then((m) => m.BreweryMap),
  {
    ssr: false,
    loading: () => (
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl h-[480px] flex items-center justify-center gap-2 text-[var(--text-muted)]">
        <Loader2 size={18} className="animate-spin" />
        <span className="text-sm">Loading map...</span>
      </div>
    ),
  }
);

interface ExploreClientProps {
  breweries: BreweryWithStats[];
}

type ViewMode = "list" | "map";
type VisitFilter = "all" | "visited" | "unvisited";

export function ExploreClient({ breweries: initialBreweries }: ExploreClientProps) {
  const [view, setView] = useState<ViewMode>("list");
  const [query, setQuery] = useState("");
  const [visitFilter, setVisitFilter] = useState<VisitFilter>("all");
  const [breweries, setBreweries] = useState(initialBreweries);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!query.trim()) { setBreweries(initialBreweries); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      const raw = await searchBreweries(query, 20);
      setBreweries(raw.map((r) => ({ ...mapOpenBreweryToDb(r), id: r.id, created_at: "" } as any)));
      setSearching(false);
    }, 300);
    return () => clearTimeout(t);
  }, [query, initialBreweries]);

  // Apply visit filter when not actively searching
  const filteredBreweries = query.trim()
    ? breweries
    : breweries.filter((b: any) => {
        if (visitFilter === "visited")   return !!b.user_visit;
        if (visitFilter === "unvisited") return !b.user_visit;
        return true;
      });

  const visitedCount   = initialBreweries.filter((b: any) => !!b.user_visit).length;
  const unvisitedCount = initialBreweries.filter((b: any) => !b.user_visit).length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-[var(--text-primary)]">Explore</h1>
        <div className="flex items-center gap-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-1">
          <button
            onClick={() => setView("list")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${view === "list" ? "bg-[#D4A843]/10 text-[#D4A843]" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"}`}
          >
            <List size={14} /> List
          </button>
          <button
            onClick={() => setView("map")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${view === "map" ? "bg-[#D4A843]/10 text-[#D4A843]" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"}`}
          >
            <Map size={14} /> Map
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search breweries by name or city..."
          className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-2xl pl-11 pr-4 py-3.5 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#D4A843] transition-colors"
        />
      </div>

      {/* Visit filter — only show when not searching */}
      {!query.trim() && view === "list" && (
        <div className="flex items-center gap-2">
          {(["all", "visited", "unvisited"] as VisitFilter[]).map((f) => {
            const labels = {
              all: `All (${initialBreweries.length})`,
              visited: `Visited (${visitedCount})`,
              unvisited: `New to me (${unvisitedCount})`,
            };
            return (
              <button
                key={f}
                onClick={() => setVisitFilter(f)}
                className="px-3 py-1.5 rounded-xl text-sm transition-all border"
                style={
                  visitFilter === f
                    ? { background: "rgba(212,168,67,0.1)", color: "#D4A843", borderColor: "rgba(212,168,67,0.3)" }
                    : { background: "var(--surface)", color: "var(--text-muted)", borderColor: "var(--border)" }
                }
              >
                {labels[f]}
              </button>
            );
          })}
        </div>
      )}

      {view === "map" ? (
        <BreweryMap breweries={filteredBreweries} className="h-[480px]" />
      ) : (
        <>
          {/* Discovery sections (no search) */}
          {!query.trim() && (
            <>
              <Section title={visitFilter === "all" ? "All Breweries" : visitFilter === "visited" ? "Visited" : "New to Me"} count={filteredBreweries.length}>
                {searching
                  ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
                  : filteredBreweries.map((b: any, i: number) => (
                      <motion.div
                        key={b.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                      >
                        <BreweryCard brewery={b} />
                      </motion.div>
                    ))
                }
              </Section>
            </>
          )}

          {/* Search results */}
          {query.trim() && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {searching
                ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
                : breweries.length === 0
                ? <p className="col-span-full text-center text-[var(--text-muted)] py-12">No breweries found for &ldquo;{query}&rdquo;</p>
                : breweries.map((b: any, i: number) => (
                    <motion.div
                      key={b.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <BreweryCard brewery={b} />
                    </motion.div>
                  ))
              }
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <h2 className="font-display text-xl font-bold text-[var(--text-primary)]">{title}</h2>
        <span className="text-sm text-[var(--text-muted)]">({count})</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {children}
      </div>
    </div>
  );
}

