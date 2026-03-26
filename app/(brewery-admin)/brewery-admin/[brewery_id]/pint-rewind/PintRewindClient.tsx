"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, Users, Beer, Star, Trophy, Calendar, Share2 } from "lucide-react";
import { PintRewindShareCard } from "@/components/brewery-admin/PintRewindShareCard";

interface PintRewindClientProps {
  breweryName: string;
  sessions30: any[];
  beerLogs30: any[];
  sessionsAll: any[];
  beerLogsAll: any[];
  topVisitor: { username: string; avatar_url: string | null; count: number } | null;
}

type Scope = "30d" | "all";

export function PintRewindClient({ breweryName, sessions30, beerLogs30, sessionsAll, beerLogsAll, topVisitor }: PintRewindClientProps) {
  const [scope, setScope] = useState<Scope>("30d");
  const [shareOpen, setShareOpen] = useState(false);
  const sessions = (scope === "30d" ? sessions30 : sessionsAll) ?? [];
  const beerLogs = (scope === "30d" ? beerLogs30 : beerLogsAll) ?? [];

  const stats = useMemo(() => {
    const totalVisits = sessions.length;
    const totalBeersLogged = beerLogs.reduce((sum: number, l: any) => sum + (l.quantity ?? 1), 0);
    const uniqueVisitors = new Set(sessions.map((s: any) => s.user_id).filter(Boolean)).size;
    const rated = beerLogs.filter((l: any) => l.rating > 0);
    const avgRating = rated.length > 0
      ? (rated.reduce((a: number, l: any) => a + l.rating, 0) / rated.length).toFixed(1)
      : null;

    // Top beers from beer_logs
    const beerCounts: Record<string, { name: string; count: number; totalRating: number; ratingCount: number }> = {};
    beerLogs.forEach((l: any) => {
      if (!l.beer_id || !l.beer?.name) return;
      if (!beerCounts[l.beer_id]) beerCounts[l.beer_id] = { name: l.beer.name, count: 0, totalRating: 0, ratingCount: 0 };
      beerCounts[l.beer_id].count += l.quantity ?? 1;
      if (l.rating > 0) { beerCounts[l.beer_id].totalRating += l.rating; beerCounts[l.beer_id].ratingCount++; }
    });
    const topBeers = Object.values(beerCounts).sort((a, b) => b.count - a.count).slice(0, 5).map(b => ({
      ...b,
      avgRating: b.ratingCount > 0 ? (b.totalRating / b.ratingCount).toFixed(1) : null,
    }));

    // Busiest day of week (by visits/sessions)
    const dowCounts = Array(7).fill(0);
    sessions.forEach((s: any) => { dowCounts[new Date(s.started_at).getDay()]++; });
    const dowLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const busiestDowIdx = dowCounts.indexOf(Math.max(...dowCounts));
    const dowData = dowLabels.map((day, i) => ({ day, count: dowCounts[i] }));

    // Busiest hour (by session start time)
    const hourCounts: Record<number, number> = {};
    sessions.forEach((s: any) => {
      const h = new Date(s.started_at).getHours();
      hourCounts[h] = (hourCounts[h] ?? 0) + 1;
    });
    const busiestHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
    const formatHour = (h: string) => {
      const n = parseInt(h);
      return n === 0 ? "12am" : n < 12 ? `${n}am` : n === 12 ? "12pm" : `${n - 12}pm`;
    };

    return {
      totalCheckins: totalVisits,
      totalBeersLogged,
      uniqueVisitors,
      avgRating,
      topBeers,
      dowData,
      busiestDay: dowLabels[busiestDowIdx],
      busiestHour: busiestHour ? formatHour(busiestHour) : null,
    };
  }, [sessions, beerLogs]);

  const tooltipStyle = { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--text-primary)" };
  const scopeLabel = scope === "30d" ? "Last 30 Days" : "All Time";

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto pt-16 lg:pt-8">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs font-mono uppercase tracking-widest mb-1" style={{ color: "var(--accent-gold)" }}>Pint Rewind</p>
          <h1 className="font-display text-3xl font-bold" style={{ color: "var(--text-primary)" }}>{breweryName}</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Your story, told in pints.</p>
        </div>
        {/* Actions */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {stats.totalCheckins > 0 && (
            <button
              onClick={() => setShareOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-all hover:opacity-80"
              style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text-secondary)" }}
            >
              <Share2 size={14} />
              Share
            </button>
          )}
        {/* Scope toggle */}
        <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: "var(--border)" }}>
          {(["30d", "all"] as Scope[]).map((s) => (
            <button
              key={s}
              onClick={() => setScope(s)}
              className="px-4 py-2 text-sm font-medium transition-all"
              style={{
                background: scope === s ? "var(--accent-gold)" : "var(--surface)",
                color: scope === s ? "#0F0E0C" : "var(--text-muted)",
              }}
            >
              {s === "30d" ? "30 Days" : "All Time"}
            </button>
          ))}
        </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={scope}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        >
          {stats.totalCheckins === 0 ? (
            <div className="rounded-2xl border p-16 text-center" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <p className="text-4xl mb-3">🍺</p>
              <p className="font-display text-xl" style={{ color: "var(--text-primary)" }}>No visits yet</p>
              <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                {scope === "30d" ? "No visits in the last 30 days." : "No visits recorded yet."}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Hero stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { icon: TrendingUp, label: "Visits", value: stats.totalCheckins },
                  { icon: Users, label: "Visitors", value: stats.uniqueVisitors },
                  { icon: Star, label: "Avg Rating", value: stats.avgRating ? `${stats.avgRating} ★` : "—" },
                  { icon: Calendar, label: "Busiest Day", value: stats.busiestDay ?? "—" },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="rounded-2xl p-5 border text-center" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                    <Icon size={18} className="mx-auto mb-2" style={{ color: "var(--accent-gold)" }} />
                    <p className="font-display text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{value}</p>
                    <p className="text-xs mt-1 font-mono uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{label}</p>
                  </div>
                ))}
              </div>

              {/* Beers logged callout */}
              <div className="rounded-2xl p-5 border flex items-center gap-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                <span className="text-3xl">🍺</span>
                <div>
                  <p className="font-display font-bold" style={{ color: "var(--text-primary)" }}>
                    <span style={{ color: "var(--accent-gold)" }}>{stats.totalBeersLogged}</span> beer{stats.totalBeersLogged !== 1 ? "s" : ""} logged
                  </p>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    Across {stats.totalCheckins} visit{stats.totalCheckins !== 1 ? "s" : ""} {scopeLabel.toLowerCase()}.
                  </p>
                </div>
              </div>

              {/* Busiest hour callout */}
              {stats.busiestHour && (
                <div className="rounded-2xl p-5 border flex items-center gap-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                  <span className="text-3xl">⏰</span>
                  <div>
                    <p className="font-display font-bold" style={{ color: "var(--text-primary)" }}>
                      The rush hits at <span style={{ color: "var(--accent-gold)" }}>{stats.busiestHour}</span>
                    </p>
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                      That's your busiest hour {scopeLabel.toLowerCase()}. Staff accordingly.
                    </p>
                  </div>
                </div>
              )}

              {/* Day of week chart */}
              <div className="rounded-2xl p-6 border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                <h2 className="font-display font-bold mb-4" style={{ color: "var(--text-primary)" }}>Visits by Day</h2>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={stats.dowData}>
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--text-muted)" }} />
                    <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} allowDecimals={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="count" fill="#D4A843" radius={[4, 4, 0, 0]} name="Visits" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Top beers */}
              {stats.topBeers.length > 0 && (
                <div className="rounded-2xl p-6 border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                  <h2 className="font-display font-bold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                    <Beer size={18} style={{ color: "var(--accent-gold)" }} /> Top Beers
                  </h2>
                  <div className="space-y-3">
                    {stats.topBeers.map((beer, i) => (
                      <div key={beer.name} className="flex items-center gap-3">
                        <span className="text-sm font-mono w-5 text-center" style={{ color: i === 0 ? "var(--accent-gold)" : "var(--text-muted)" }}>
                          {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{beer.name}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-sm font-mono" style={{ color: "var(--text-muted)" }}>{beer.count} pour{beer.count !== 1 ? "s" : ""}</span>
                          {beer.avgRating && (
                            <span className="text-xs ml-2" style={{ color: "var(--accent-gold)" }}>{beer.avgRating} ★</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Most loyal visitor */}
              {topVisitor && (
                <div className="rounded-2xl p-6 border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                  <h2 className="font-display font-bold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                    <Trophy size={18} style={{ color: "var(--accent-gold)" }} /> Most Loyal Regular
                  </h2>
                  <div className="flex items-center gap-4">
                    {topVisitor.avatar_url ? (
                      <img src={topVisitor.avatar_url} alt={topVisitor.username} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold"
                        style={{ background: "rgba(212,168,67,0.15)", color: "var(--accent-gold)" }}>
                        {topVisitor.username[0]?.toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold" style={{ color: "var(--text-primary)" }}>@{topVisitor.username}</p>
                      <p className="text-sm" style={{ color: "var(--text-muted)" }}>{topVisitor.count} visit{topVisitor.count !== 1 ? "s" : ""} all time</p>
                    </div>
                    <span className="ml-auto text-2xl">🍺</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <PintRewindShareCard
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        breweryName={breweryName}
        scopeLabel={scopeLabel}
        stats={stats}
      />
    </div>
  );
}
