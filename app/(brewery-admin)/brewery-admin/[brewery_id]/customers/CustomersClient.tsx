"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Search, ArrowUpDown, Users, Crown, Star, TrendingUp, Download } from "lucide-react";
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
  const { brewery_id } = useParams<{ brewery_id: string }>();
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

  // Superfans: top 5 visitors by visit count (minimum 5 visits to qualify)
  const superfans = useMemo(() => {
    const qualified = customers.filter((c) => c.visits >= 5);
    if (qualified.length === 0) return { fans: [], sessionPct: 0 };
    const sorted = [...qualified].sort((a, b) => b.visits - a.visits).slice(0, 5);
    const totalSessions = customers.reduce((sum, c) => sum + c.visits, 0);
    const fanSessions = sorted.reduce((sum, c) => sum + c.visits, 0);
    const sessionPct = totalSessions > 0 ? Math.round((fanSessions / totalSessions) * 100) : 0;
    return { fans: sorted, sessionPct };
  }, [customers]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
            Customer Insights
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Your regulars, power users, and VIPs at a glance.
          </p>
        </div>
        {customers.length > 0 && (
          <a
            href={`/api/brewery/${brewery_id}/customers/export`}
            download
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border shrink-0"
            style={{
              background: "color-mix(in srgb, var(--accent-gold) 12%, transparent)",
              borderColor: "var(--accent-gold)",
              color: "var(--accent-gold)",
            }}
          >
            <Download size={16} />
            Export CSV
          </a>
        )}
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SummaryCard icon={Users} label="Total Customers" value={totalCustomers} />
        <SummaryCard icon={TrendingUp} label="Regulars (5+)" value={regulars} />
        <SummaryCard icon={Star} label="Power Users (15+)" value={powerUsers} accent />
        <SummaryCard icon={Crown} label="VIPs (30+)" value={vips} accent />
      </div>

      {/* Superfans highlight */}
      {superfans.fans.length > 0 && (
        <div
          className="rounded-2xl border p-5 space-y-4"
          style={{
            background: "linear-gradient(135deg, color-mix(in srgb, var(--accent-gold) 8%, var(--surface)), color-mix(in srgb, var(--accent-gold) 3%, var(--surface)))",
            borderColor: "color-mix(in srgb, var(--accent-gold) 30%, transparent)",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown size={18} style={{ color: "var(--accent-gold)" }} />
              <h2 className="font-display text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                Your Superfans
              </h2>
            </div>
            <span
              className="text-xs font-mono px-3 py-1 rounded-full"
              style={{
                background: "color-mix(in srgb, var(--accent-gold) 15%, transparent)",
                color: "var(--accent-gold)",
              }}
            >
              {superfans.sessionPct}% of all sessions
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {superfans.fans.map((fan, i) => (
              <div
                key={fan.user_id}
                className="flex sm:flex-col items-center gap-3 sm:gap-2 p-3 rounded-xl text-center"
                style={{
                  background: "color-mix(in srgb, var(--accent-gold) 6%, var(--surface))",
                }}
              >
                <div className="relative">
                  <UserAvatar
                    profile={{
                      display_name: fan.display_name,
                      avatar_url: fan.avatar_url,
                      username: fan.username,
                    }}
                    size="md"
                  />
                  {i === 0 && (
                    <span
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px]"
                      style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
                    >
                      👑
                    </span>
                  )}
                </div>
                <div className="sm:text-center text-left min-w-0">
                  <p className="font-display font-semibold text-sm truncate" style={{ color: "var(--text-primary)" }}>
                    {fan.display_name}
                  </p>
                  <p className="text-xs font-mono" style={{ color: "var(--accent-gold)" }}>
                    {fan.visits} visits
                  </p>
                  {fan.favorite_beer && (
                    <p className="text-[11px] truncate mt-0.5" style={{ color: "var(--text-muted)" }}>
                      Loves {fan.favorite_beer}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
