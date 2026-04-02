"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, ArrowUpDown, Users, MapPin, ChevronRight, Lightbulb } from "lucide-react";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { formatRelativeTime } from "@/lib/dates";
import { SEGMENTS, type CustomerSegment } from "@/lib/crm";
import type { BrandCustomerRow, RegularsInsight } from "@/lib/brand-crm";

type SortKey = "visits" | "last_visit" | "locations" | "name";
type SortDir = "asc" | "desc";
type FilterKey = CustomerSegment | "all" | "cross-location";

// Stable location colors (consistent per-location across the UI)
const LOCATION_COLORS = [
  "var(--accent-gold)",
  "#a78bfa",
  "#60a5fa",
  "#4ade80",
  "#f97316",
  "#f472b6",
  "#2dd4bf",
  "#fbbf24",
];

function SegmentBadge({ segment, segmentConfig }: { segment: CustomerSegment; segmentConfig: BrandCustomerRow["segmentConfig"] }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold"
      style={{ background: segmentConfig.bgColor, color: segmentConfig.color }}
    >
      {segmentConfig.emoji} {segmentConfig.label}
    </span>
  );
}

function LocationDots({ locationNames, locations }: { locationNames: string[]; locations: { id: string; name: string }[] }) {
  return (
    <div className="flex items-center gap-1" title={locationNames.join(", ")}>
      {locationNames.map((name, i) => {
        const locIndex = locations.findIndex((l) => l.name === name);
        const color = LOCATION_COLORS[locIndex % LOCATION_COLORS.length];
        return (
          <div
            key={name}
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ background: color }}
            title={name}
          />
        );
      })}
    </div>
  );
}

interface Props {
  brandId: string;
  brandName: string;
  customers: BrandCustomerRow[];
  locations: { id: string; name: string }[];
  crossLocationCount: number;
  regularsAtOtherLocations: RegularsInsight[];
}

export function BrandCustomersClient({
  brandId,
  brandName,
  customers,
  locations,
  crossLocationCount,
  regularsAtOtherLocations,
}: Props) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("visits");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [filter, setFilter] = useState<FilterKey>("all");

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "name" ? "asc" : "desc");
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    let list = customers;
    if (q) {
      list = list.filter(
        (c) =>
          c.displayName.toLowerCase().includes(q) ||
          c.username.toLowerCase().includes(q)
      );
    }
    if (filter === "cross-location") {
      list = list.filter((c) => c.isCrossLocation);
    } else if (filter !== "all") {
      list = list.filter((c) => c.segment === filter);
    }
    list = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "visits") cmp = a.totalVisits - b.totalVisits;
      else if (sortKey === "last_visit") cmp = a.lastVisit.localeCompare(b.lastVisit);
      else if (sortKey === "locations") cmp = a.locationsVisited - b.locationsVisited;
      else cmp = a.displayName.localeCompare(b.displayName);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [customers, search, sortKey, sortDir, filter]);

  // Segment counts
  const segmentCounts = useMemo(() => {
    const counts: Record<string, number> = { all: customers.length, "cross-location": crossLocationCount };
    SEGMENTS.forEach((s) => { counts[s.id] = 0; });
    customers.forEach((c) => {
      counts[c.segment] = (counts[c.segment] ?? 0) + 1;
    });
    return counts;
  }, [customers, crossLocationCount]);

  const crossLocationPct = customers.length > 0
    ? Math.round((crossLocationCount / customers.length) * 100)
    : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 pt-16 lg:pt-8 space-y-6">
      {/* Page header */}
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
          Brand Customers
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Cross-location customer intelligence for {brandName}.
        </p>
      </div>

      {/* Insight cards — only on "All" filter */}
      {filter === "all" && customers.length > 0 && (
        <div className="grid sm:grid-cols-2 gap-4">
          {/* Cross-location visitors */}
          <div
            className="rounded-2xl border p-5"
            style={{
              background: "linear-gradient(135deg, color-mix(in srgb, var(--accent-gold) 8%, var(--surface)), color-mix(in srgb, var(--accent-gold) 3%, var(--surface)))",
              borderColor: "color-mix(in srgb, var(--accent-gold) 30%, transparent)",
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <MapPin size={16} style={{ color: "var(--accent-gold)" }} />
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--accent-gold)" }}>
                Cross-Location Visitors
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
                {crossLocationCount}
              </span>
              <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                ({crossLocationPct}% of all customers)
              </span>
            </div>
            <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
              Customers who have visited 2+ of your locations.
            </p>
          </div>

          {/* Regulars at other locations */}
          {regularsAtOtherLocations.length > 0 && (
            <div
              className="rounded-2xl border p-5"
              style={{
                background: "linear-gradient(135deg, color-mix(in srgb, #a78bfa 8%, var(--surface)), color-mix(in srgb, #a78bfa 3%, var(--surface)))",
                borderColor: "color-mix(in srgb, #a78bfa 30%, transparent)",
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb size={16} style={{ color: "#a78bfa" }} />
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "#a78bfa" }}>
                  Regulars at Your Other Locations
                </span>
              </div>
              <div className="space-y-2">
                {regularsAtOtherLocations.map((r) => (
                  <Link
                    key={r.userId}
                    href={`/brewery-admin/brand/${brandId}/customers/${r.userId}`}
                    className="flex items-center gap-2.5 p-2 rounded-xl transition-colors hover:bg-[var(--surface-2)]"
                  >
                    <UserAvatar
                      profile={{ display_name: r.displayName, avatar_url: r.avatarUrl, username: r.username }}
                      size="sm"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                        {r.displayName}
                      </p>
                      <p className="text-[11px] truncate" style={{ color: "var(--text-muted)" }}>
                        VIP at {r.strongLocations[0]} · hasn&apos;t visited {r.missingLocations[0]}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Segment filter pills */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        <button
          onClick={() => setFilter("all")}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border min-h-[36px]"
          style={filter === "all"
            ? { background: "var(--accent-gold)", color: "var(--bg)", borderColor: "var(--accent-gold)" }
            : { background: "var(--surface)", color: "var(--text-secondary)", borderColor: "var(--border)" }
          }
        >
          <Users size={13} />
          All ({segmentCounts.all})
        </button>
        {SEGMENTS.map((seg) => (
          <button
            key={seg.id}
            onClick={() => setFilter(seg.id)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border min-h-[36px]"
            style={filter === seg.id
              ? { background: seg.color, color: "var(--bg)", borderColor: seg.color }
              : { background: seg.bgColor, color: seg.color, borderColor: "transparent" }
            }
          >
            {seg.emoji} {seg.label} ({segmentCounts[seg.id] ?? 0})
          </button>
        ))}
        <button
          onClick={() => setFilter("cross-location")}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border min-h-[36px]"
          style={filter === "cross-location"
            ? { background: "#2dd4bf", color: "var(--bg)", borderColor: "#2dd4bf" }
            : { background: "rgba(45,212,191,0.15)", color: "#2dd4bf", borderColor: "transparent" }
          }
        >
          <MapPin size={13} />
          Cross-Location ({segmentCounts["cross-location"] ?? 0})
        </button>
      </div>

      {/* Search + sort + table */}
      <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-4 border-b" style={{ borderColor: "var(--border)" }}>
          {/* Search */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none border"
              style={{
                background: "var(--surface-2)",
                borderColor: "var(--border)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          {/* Sort buttons */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {([
              { key: "visits" as SortKey, label: "Visits" },
              { key: "locations" as SortKey, label: "Locations" },
              { key: "last_visit" as SortKey, label: "Last Visit" },
              { key: "name" as SortKey, label: "Name" },
            ]).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => toggleSort(key)}
                className="flex items-center gap-1.5 px-3 py-2.5 sm:py-2 rounded-xl text-xs font-medium transition-all border min-h-[44px] sm:min-h-0 whitespace-nowrap"
                style={
                  sortKey === key
                    ? {
                        background: "color-mix(in srgb, var(--accent-gold) 15%, transparent)",
                        borderColor: "var(--accent-gold)",
                        color: "var(--accent-gold)",
                      }
                    : {
                        background: "var(--surface-2)",
                        borderColor: "var(--border)",
                        color: "var(--text-secondary)",
                      }
                }
              >
                <ArrowUpDown size={12} />
                {label}
                {sortKey === key && (
                  <span className="text-[10px]">{sortDir === "asc" ? "ASC" : "DESC"}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Customer list */}
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-display text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
              {search || filter !== "all" ? "No customers match that filter" : "No customers yet"}
            </p>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
              {search || filter !== "all"
                ? "Try a different search or filter."
                : "When people start visiting your locations, they'll show up here."}
            </p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {/* Header row — desktop only */}
            <div className="hidden sm:grid grid-cols-[1fr_80px_80px_100px_100px_32px] gap-4 px-4 py-3 text-xs font-medium" style={{ color: "var(--text-muted)" }}>
              <span>Customer</span>
              <span className="text-right">Visits</span>
              <span className="text-center">Locations</span>
              <span className="text-right">Last Visit</span>
              <span className="text-right">Segment</span>
              <span />
            </div>

            {filtered.map((c) => (
              <Link
                key={c.userId}
                href={`/brewery-admin/brand/${brandId}/customers/${c.userId}`}
                className="flex flex-col sm:grid sm:grid-cols-[1fr_80px_80px_100px_100px_32px] gap-2 sm:gap-4 items-start sm:items-center px-4 py-3 transition-colors hover:bg-[var(--surface-2)] cursor-pointer"
                style={{ borderColor: "var(--border)" }}
              >
                {/* Customer info */}
                <div className="flex items-center gap-3 min-w-0">
                  <UserAvatar
                    profile={{
                      display_name: c.displayName,
                      avatar_url: c.avatarUrl,
                      username: c.username,
                    }}
                    size="sm"
                  />
                  <div className="min-w-0">
                    <span
                      className="font-display font-semibold text-sm truncate block"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {c.displayName}
                    </span>
                    <span className="text-xs truncate block" style={{ color: "var(--text-muted)" }}>
                      @{c.username}
                    </span>
                  </div>
                </div>

                {/* Mobile: inline stats row */}
                <div className="flex items-center gap-3 sm:hidden text-xs" style={{ color: "var(--text-secondary)" }}>
                  <span>{c.totalVisits} visits</span>
                  <span>{c.locationsVisited} loc{c.locationsVisited !== 1 ? "s" : ""}</span>
                  <LocationDots locationNames={c.locationNames} locations={locations} />
                  <SegmentBadge segment={c.segment} segmentConfig={c.segmentConfig} />
                </div>

                {/* Desktop columns */}
                <span className="hidden sm:block text-sm font-mono text-right" style={{ color: "var(--text-primary)" }}>
                  {c.totalVisits}
                </span>
                <div className="hidden sm:flex justify-center items-center gap-1.5">
                  <LocationDots locationNames={c.locationNames} locations={locations} />
                  <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                    {c.locationsVisited}
                  </span>
                </div>
                <span className="hidden sm:block text-sm text-right" style={{ color: "var(--text-secondary)" }}>
                  {formatRelativeTime(c.lastVisit)}
                </span>
                <div className="hidden sm:flex justify-end">
                  <SegmentBadge segment={c.segment} segmentConfig={c.segmentConfig} />
                </div>
                <div className="hidden sm:flex justify-end">
                  <ChevronRight size={14} style={{ color: "var(--text-muted)" }} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
