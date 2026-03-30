"use client";

import { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { formatDateShort } from "@/lib/dates";

interface AnalyticsClientProps {
  breweryId: string;
  sessions: any[];
  beerLogs: any[];
}

const COLORS = ["#D4A843", "#E8841A", "#4A7C59", "#C44B3A", "#A89F8C", "#6B6456", "#8B6E3C", "#5C8A6E"];

export function AnalyticsClient({ sessions, beerLogs }: AnalyticsClientProps) {
  // Visits by day (last 30 days)
  const dailyData = useMemo(() => {
    const days: Record<string, number> = {};
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = formatDateShort(d);
      days[key] = 0;
    }
    sessions.forEach(s => {
      const key = formatDateShort(s.started_at);
      if (key in days) days[key]++;
    });
    return Object.entries(days).map(([date, count]) => ({ date, count }));
  }, [sessions]);

  // Visits by day of week
  const dowData = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const counts = Array(7).fill(0);
    sessions.forEach(s => { counts[new Date(s.started_at).getDay()]++; });
    return days.map((day, i) => ({ day, count: counts[i] }));
  }, [sessions]);

  // Top beers from beer_logs
  const topBeers = useMemo(() => {
    const counts: Record<string, { name: string; count: number; totalRating: number; ratingCount: number }> = {};
    beerLogs.forEach(l => {
      if (!l.beer_id || !l.beer?.name) return;
      if (!counts[l.beer_id]) counts[l.beer_id] = { name: l.beer.name, count: 0, totalRating: 0, ratingCount: 0 };
      counts[l.beer_id].count += l.quantity ?? 1;
      if (l.rating > 0) { counts[l.beer_id].totalRating += l.rating; counts[l.beer_id].ratingCount++; }
    });
    return Object.values(counts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
      .map(b => ({ ...b, avgRating: b.ratingCount > 0 ? (b.totalRating / b.ratingCount).toFixed(1) : null }));
  }, [beerLogs]);

  // Style distribution from beer_logs
  const styleData = useMemo(() => {
    const counts: Record<string, number> = {};
    beerLogs.forEach(l => { if (l.beer?.style) counts[l.beer.style] = (counts[l.beer.style] ?? 0) + (l.quantity ?? 1); });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, value]) => ({ name, value }));
  }, [beerLogs]);

  // Rating distribution from beer_logs
  const ratingData = useMemo(() => {
    const dist = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map(r => ({ rating: `${r}★`, count: 0 }));
    beerLogs.forEach(l => {
      if (l.rating > 0) {
        const idx = dist.findIndex(d => parseFloat(d.rating) === l.rating);
        if (idx >= 0) dist[idx].count++;
      }
    });
    return dist;
  }, [beerLogs]);

  // Top beers by avg rating (min 3 ratings)
  const topBeersByRating = useMemo(() => {
    const stats: Record<string, { name: string; totalRating: number; ratingCount: number }> = {};
    beerLogs.forEach(l => {
      if (!l.beer_id || !l.beer?.name || !(l.rating > 0)) return;
      if (!stats[l.beer_id]) stats[l.beer_id] = { name: l.beer.name, totalRating: 0, ratingCount: 0 };
      stats[l.beer_id].totalRating += l.rating;
      stats[l.beer_id].ratingCount++;
    });
    return Object.values(stats)
      .filter(b => b.ratingCount >= 3)
      .map(b => ({ name: b.name, avgRating: parseFloat((b.totalRating / b.ratingCount).toFixed(2)), ratingCount: b.ratingCount }))
      .sort((a, b) => b.avgRating - a.avgRating)
      .slice(0, 8);
  }, [beerLogs]);

  // Peak session times by hour-of-day
  const hourlyData = useMemo(() => {
    const counts = Array.from({ length: 24 }, (_, h) => ({
      hour: h,
      label: h === 0 ? "12a" : h < 12 ? `${h}a` : h === 12 ? "12p" : `${h - 12}p`,
      count: 0,
    }));
    sessions.forEach(s => { counts[new Date(s.started_at).getHours()].count++; });
    return counts;
  }, [sessions]);

  const totalVisits = sessions.length;
  const totalBeersLogged = beerLogs.reduce((sum, l) => sum + (l.quantity ?? 1), 0);
  const rated = beerLogs.filter(l => l.rating > 0);
  const avgRating = rated.length > 0 ? (rated.reduce((a, l) => a + l.rating, 0) / rated.length).toFixed(2) : null;
  const thisWeek = sessions.filter(s => new Date(s.started_at) > new Date(Date.now() - 7 * 86400000)).length;
  const uniqueVisitors = useMemo(() => new Set(sessions.map(s => s.user_id).filter(Boolean)).size, [sessions]);

  // Repeat visitor %
  const repeatVisitorPct = useMemo(() => {
    const counts: Record<string, number> = {};
    sessions.forEach(s => { if (s.user_id) counts[s.user_id] = (counts[s.user_id] ?? 0) + 1; });
    const total = Object.keys(counts).length;
    if (total === 0) return null;
    const repeats = Object.values(counts).filter(c => c >= 2).length;
    return Math.round((repeats / total) * 100);
  }, [sessions]);

  // Beer Performance — per-beer engagement metrics with trending direction
  const beerPerformance = useMemo(() => {
    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 86400000;
    const sixtyDaysAgo = now - 60 * 86400000;

    const stats: Record<string, {
      name: string;
      style: string | null;
      pours: number;
      recentPours: number;
      olderPours: number;
      totalRating: number;
      ratingCount: number;
      firstSeen: number;
    }> = {};

    beerLogs.forEach((l: any) => {
      if (!l.beer_id || !l.beer?.name) return;
      if (!stats[l.beer_id]) {
        stats[l.beer_id] = {
          name: l.beer.name,
          style: l.beer.style ?? null,
          pours: 0,
          recentPours: 0,
          olderPours: 0,
          totalRating: 0,
          ratingCount: 0,
          firstSeen: now,
        };
      }
      const qty = l.quantity ?? 1;
      const logTime = new Date(l.logged_at).getTime();
      stats[l.beer_id].pours += qty;
      if (logTime >= thirtyDaysAgo) stats[l.beer_id].recentPours += qty;
      else if (logTime >= sixtyDaysAgo) stats[l.beer_id].olderPours += qty;
      if (l.rating > 0) { stats[l.beer_id].totalRating += l.rating; stats[l.beer_id].ratingCount++; }
      if (logTime < stats[l.beer_id].firstSeen) stats[l.beer_id].firstSeen = logTime;
    });

    return Object.values(stats)
      .map(b => {
        const avgRating = b.ratingCount > 0 ? parseFloat((b.totalRating / b.ratingCount).toFixed(1)) : null;
        const daysOnTap = Math.ceil((now - b.firstSeen) / 86400000);
        let trend: "up" | "down" | "steady" = "steady";
        if (b.olderPours > 0) {
          const ratio = b.recentPours / b.olderPours;
          if (ratio > 1.2) trend = "up";
          else if (ratio < 0.8) trend = "down";
        } else if (b.recentPours > 0) {
          trend = "up";
        }
        return { ...b, avgRating, daysOnTap, trend };
      })
      .sort((a, b) => b.pours - a.pours);
  }, [beerLogs]);

  const [beerPerfSort, setBeerPerfSort] = useState<"pours" | "rating" | "newest">("pours");

  const sortedBeerPerf = useMemo(() => {
    const list = [...beerPerformance];
    if (beerPerfSort === "rating") return list.sort((a, b) => (b.avgRating ?? 0) - (a.avgRating ?? 0));
    if (beerPerfSort === "newest") return list.sort((a, b) => b.firstSeen - a.firstSeen);
    return list;
  }, [beerPerformance, beerPerfSort]);

  const tooltipStyle = { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--text-primary)" };

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto pt-16 lg:pt-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold" style={{ color: "var(--text-primary)" }}>Analytics</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Last 90 days · {totalVisits} visit{totalVisits !== 1 ? "s" : ""} · {totalBeersLogged} beer{totalBeersLogged !== 1 ? "s" : ""} logged by {uniqueVisitors} visitor{uniqueVisitors !== 1 ? "s" : ""}</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {[
          { label: "Visits (90d)", value: totalVisits },
          { label: "Unique Visitors", value: uniqueVisitors },
          { label: "This Week", value: thisWeek },
          { label: "Avg Rating", value: avgRating ? `${avgRating} ★` : "—" },
          { label: "Repeat Visitors", value: repeatVisitorPct != null ? `${repeatVisitorPct}%` : "—" },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-2xl p-5 border text-center" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <p className="font-display text-3xl font-bold" style={{ color: "var(--accent-gold)" }}>{value}</p>
            <p className="text-xs mt-1 font-mono uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{label}</p>
          </div>
        ))}
      </div>

      {totalVisits === 0 && totalBeersLogged === 0 ? (
        <div className="rounded-2xl border p-16 text-center" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <p className="text-4xl mb-3">📊</p>
          <p className="font-display text-xl" style={{ color: "var(--text-primary)" }}>The charts are thirsty</p>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Analytics fill up as guests start sessions at your brewery. Share your HopTrack page to get the first pour flowing.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Daily visits */}
          <div className="rounded-2xl p-6 border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <h2 className="font-display font-bold mb-4" style={{ color: "var(--text-primary)" }}>Visits — Last 30 Days</h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--text-muted)" }} interval={6} />
                <YAxis tick={{ fontSize: 10, fill: "var(--text-muted)" }} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="count" stroke="#D4A843" strokeWidth={2} dot={false} name="Visits" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Day of week */}
            <div className="rounded-2xl p-6 border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <h2 className="font-display font-bold mb-4" style={{ color: "var(--text-primary)" }}>Busiest Days</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={dowData}>
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--text-muted)" }} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" fill="#D4A843" radius={[4,4,0,0]} name="Visits" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Style distribution */}
            {styleData.length > 0 && (
              <div className="rounded-2xl p-6 border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                <h2 className="font-display font-bold mb-4" style={{ color: "var(--text-primary)" }}>Top Styles</h2>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={styleData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={(props: any) => `${props.name ?? ""} ${(((props.percent) ?? 0)*100).toFixed(0)}%`} labelLine={false}>
                      {styleData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Top beers */}
          {topBeers.length > 0 && (
            <div className="rounded-2xl p-6 border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <h2 className="font-display font-bold mb-4" style={{ color: "var(--text-primary)" }}>Most Popular Beers</h2>
              <ResponsiveContainer width="100%" height={Math.max(200, topBeers.length * 40)}>
                <BarChart data={topBeers} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 11, fill: "var(--text-muted)" }} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" width={160} tick={{ fontSize: 11, fill: "var(--text-muted)" }} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`${v} pours`, ""]} />
                  <Bar dataKey="count" fill="#D4A843" radius={[0,4,4,0]} name="Pours" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Rating distribution */}
          {rated.length > 0 && (
            <div className="rounded-2xl p-6 border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <h2 className="font-display font-bold mb-4" style={{ color: "var(--text-primary)" }}>Rating Distribution</h2>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={ratingData}>
                  <XAxis dataKey="rating" tick={{ fontSize: 11, fill: "var(--text-muted)" }} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" fill="#E8841A" radius={[4,4,0,0]} name="Ratings" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Top beers by rating */}
          {topBeersByRating.length > 0 && (
            <div className="rounded-2xl p-6 border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <h2 className="font-display font-bold mb-1" style={{ color: "var(--text-primary)" }}>Top Beers by Rating</h2>
              <p className="text-xs mb-4 font-mono" style={{ color: "var(--text-muted)" }}>Minimum 3 ratings</p>
              <ResponsiveContainer width="100%" height={Math.max(200, topBeersByRating.length * 40)}>
                <BarChart data={topBeersByRating} layout="vertical">
                  <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 11, fill: "var(--text-muted)" }} />
                  <YAxis type="category" dataKey="name" width={160} tick={{ fontSize: 11, fill: "var(--text-muted)" }} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: any, _: any, p: any) => [`${v} ★ (${p.payload.ratingCount} ratings)`, ""]} />
                  <Bar dataKey="avgRating" fill="#4A7C59" radius={[0,4,4,0]} name="Avg Rating" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Peak session times */}
          <div className="rounded-2xl p-6 border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <h2 className="font-display font-bold mb-1" style={{ color: "var(--text-primary)" }}>Peak Visit Times</h2>
            <p className="text-xs mb-4 font-mono" style={{ color: "var(--text-muted)" }}>Sessions by hour of day (local time)</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={hourlyData}>
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "var(--text-muted)" }} interval={2} />
                <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [v, "Visits"]} labelFormatter={(label: any) => `${label}`} />
                <Bar dataKey="count" fill="#5B8DEF" radius={[4,4,0,0]} name="Visits" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Beer Performance */}
          {sortedBeerPerf.length > 0 && (
            <div className="rounded-2xl p-6 border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h2 className="font-display font-bold" style={{ color: "var(--text-primary)" }}>Beer Performance</h2>
                  <p className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>Which beers are driving engagement (90 days)</p>
                </div>
                <div className="flex gap-1.5">
                  {(["pours", "rating", "newest"] as const).map((key) => (
                    <button
                      key={key}
                      onClick={() => setBeerPerfSort(key)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all border"
                      style={
                        beerPerfSort === key
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
                      {key === "pours" ? "Most Pours" : key === "rating" ? "Highest Rated" : "Newest"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                {sortedBeerPerf.slice(0, 12).map((beer, i) => (
                  <div
                    key={beer.name + i}
                    className="flex items-center gap-4 px-4 py-3 rounded-xl"
                    style={{ background: i % 2 === 0 ? "var(--surface-2)" : "transparent" }}
                  >
                    {/* Rank */}
                    <span className="font-mono text-xs w-6 text-right shrink-0" style={{ color: "var(--text-muted)" }}>
                      {i + 1}
                    </span>

                    {/* Beer info */}
                    <div className="min-w-0 flex-1">
                      <p className="font-display font-semibold text-sm truncate" style={{ color: "var(--text-primary)" }}>
                        {beer.name}
                      </p>
                      {beer.style && (
                        <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{beer.style}</p>
                      )}
                    </div>

                    {/* Pours */}
                    <div className="text-right shrink-0">
                      <p className="font-mono text-sm font-bold" style={{ color: "var(--accent-gold)" }}>
                        {beer.pours}
                      </p>
                      <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>pours</p>
                    </div>

                    {/* Rating */}
                    <div className="text-right shrink-0 w-14">
                      {beer.avgRating ? (
                        <>
                          <p className="font-mono text-sm" style={{ color: "var(--text-primary)" }}>
                            {beer.avgRating} ★
                          </p>
                          <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{beer.ratingCount} ratings</p>
                        </>
                      ) : (
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>—</p>
                      )}
                    </div>

                    {/* Days on tap */}
                    <div className="text-right shrink-0 w-12 hidden sm:block">
                      <p className="font-mono text-xs" style={{ color: "var(--text-secondary)" }}>
                        {beer.daysOnTap}d
                      </p>
                    </div>

                    {/* Trend */}
                    <div className="shrink-0 w-6 text-center">
                      <span
                        className="text-sm"
                        style={{
                          color: beer.trend === "up" ? "#4A7C59" : beer.trend === "down" ? "#C44B3A" : "var(--text-muted)",
                        }}
                      >
                        {beer.trend === "up" ? "↑" : beer.trend === "down" ? "↓" : "→"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
