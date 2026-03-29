"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, ArrowUpDown, Users, Crown, Star, TrendingUp } from "lucide-react";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { formatRelativeTime } from "@/lib/dates";

interface CustomerRow {
  user_id: string;
  display_name: string;
  username: string;
  avatar_url: string | null;
  visits: number;
  last_visit: string;
  favorite_beer: string | null;
}

type SortKey = "visits" | "last_visit" | "name";
type SortDir = "asc" | "desc";

function getTier(visits: number): "VIP" | "Power User" | "Regular" | null {
  if (visits >= 30) return "VIP";
  if (visits >= 15) return "Power User";
  if (visits >= 5) return "Regular";
  return null;
}

function TierBadge({ tier }: { tier: "VIP" | "Power User" | "Regular" | null }) {
  if (!tier) return null;

  if (tier === "VIP") {
    return (
      <span
        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold"
        style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
      >
        <Crown size={11} />
        VIP
      </span>
    );
  }

  if (tier === "Power User") {
    return (
      <span
        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border"
        style={{
          borderColor: "var(--accent-gold)",
          color: "var(--accent-gold)",
          background: "color-mix(in srgb, var(--accent-gold) 10%, transparent)",
        }}
      >
        <Star size={11} />
        Power User
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{
        background: "var(--surface-2)",
        color: "var(--text-secondary)",
      }}
    >
      Regular
    </span>
  );
}

export function CustomersClient({ customers }: { customers: CustomerRow[] }) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("visits");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

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
          c.display_name.toLowerCase().includes(q) ||
          c.username.toLowerCase().includes(q)
      );
    }
    list = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "visits") cmp = a.visits - b.visits;
      else if (sortKey === "last_visit") cmp = a.last_visit.localeCompare(b.last_visit);
      else cmp = a.display_name.localeCompare(b.display_name);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [customers, search, sortKey, sortDir]);

  const totalCustomers = customers.length;
  const regulars = customers.filter((c) => getTier(c.visits) === "Regular").length;
  const powerUsers = customers.filter((c) => getTier(c.visits) === "Power User").length;
  const vips = customers.filter((c) => getTier(c.visits) === "VIP").length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Page header */}
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
          Customer Insights
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Your regulars, power users, and VIPs at a glance.
        </p>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SummaryCard icon={Users} label="Total Customers" value={totalCustomers} />
        <SummaryCard icon={TrendingUp} label="Regulars (5+)" value={regulars} />
        <SummaryCard icon={Star} label="Power Users (15+)" value={powerUsers} accent />
        <SummaryCard icon={Crown} label="VIPs (30+)" value={vips} accent />
      </div>

      {/* Search + sort controls */}
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
          <div className="flex gap-2">
            {(
              [
                { key: "visits" as SortKey, label: "Visits" },
                { key: "last_visit" as SortKey, label: "Last Visit" },
                { key: "name" as SortKey, label: "Name" },
              ] as const
            ).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => toggleSort(key)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all border"
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
              {search ? "No customers match that search" : "No customers yet"}
            </p>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
              {search
                ? "Try a different name."
                : "When people start visiting, they'll show up here."}
            </p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {/* Header row — desktop only */}
            <div className="hidden sm:grid grid-cols-[1fr_100px_120px_160px_120px] gap-4 px-4 py-3 text-xs font-medium" style={{ color: "var(--text-muted)" }}>
              <span>Customer</span>
              <span className="text-right">Visits</span>
              <span className="text-right">Last Visit</span>
              <span>Favorite Beer</span>
              <span className="text-right">Tier</span>
            </div>

            {filtered.map((c) => {
              const tier = getTier(c.visits);
              return (
                <div
                  key={c.user_id}
                  className="flex flex-col sm:grid sm:grid-cols-[1fr_100px_120px_160px_120px] gap-2 sm:gap-4 items-start sm:items-center px-4 py-3 transition-colors"
                  style={{ borderColor: "var(--border)" }}
                >
                  {/* Customer info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <UserAvatar
                      profile={{
                        display_name: c.display_name,
                        avatar_url: c.avatar_url,
                        username: c.username,
                      }}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <Link
                        href={`/profile/${c.username}`}
                        className="font-display font-semibold text-sm truncate block transition-colors hover:opacity-80"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {c.display_name}
                      </Link>
                      <span className="text-xs truncate block" style={{ color: "var(--text-muted)" }}>
                        @{c.username}
                      </span>
                    </div>
                  </div>

                  {/* Mobile: inline stats row */}
                  <div className="flex items-center gap-4 sm:hidden text-xs" style={{ color: "var(--text-secondary)" }}>
                    <span>{c.visits} visits</span>
                    <span>{formatRelativeTime(c.last_visit)}</span>
                    {c.favorite_beer && <span className="truncate max-w-[120px]">{c.favorite_beer}</span>}
                    <TierBadge tier={tier} />
                  </div>

                  {/* Desktop columns */}
                  <span className="hidden sm:block text-sm font-mono text-right" style={{ color: "var(--text-primary)" }}>
                    {c.visits}
                  </span>
                  <span className="hidden sm:block text-sm text-right" style={{ color: "var(--text-secondary)" }}>
                    {formatRelativeTime(c.last_visit)}
                  </span>
                  <span className="hidden sm:block text-sm truncate" style={{ color: "var(--text-secondary)" }}>
                    {c.favorite_beer ?? "--"}
                  </span>
                  <div className="hidden sm:flex justify-end">
                    <TierBadge tier={tier} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div
      className="rounded-2xl border p-4 space-y-1"
      style={{
        background: accent
          ? "color-mix(in srgb, var(--accent-gold) 8%, var(--surface))"
          : "var(--surface)",
        borderColor: accent ? "color-mix(in srgb, var(--accent-gold) 30%, transparent)" : "var(--border)",
      }}
    >
      <div className="flex items-center gap-2">
        <span style={{ color: accent ? "var(--accent-gold)" : "var(--text-muted)" }}>
          <Icon size={14} />
        </span>
        <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
          {label}
        </span>
      </div>
      <p
        className="font-display text-2xl font-bold"
        style={{ color: accent ? "var(--accent-gold)" : "var(--text-primary)" }}
      >
        {value}
      </p>
    </div>
  );
}
