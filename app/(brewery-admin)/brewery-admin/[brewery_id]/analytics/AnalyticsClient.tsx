"use client";

import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, PieChart, Pie, Cell } from "recharts";

interface AnalyticsClientProps {
  breweryId: string;
  checkins: any[];
}

const COLORS = ["#D4A843", "#E8841A", "#4A7C59", "#C44B3A", "#A89F8C", "#6B6456", "#8B6E3C", "#5C8A6E"];

export function AnalyticsClient({ checkins }: AnalyticsClientProps) {
  // Check-ins by day (last 30 days)
  const dailyData = useMemo(() => {
    const days: Record<string, number> = {};
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      days[key] = 0;
    }
    checkins.forEach(c => {
      const key = new Date(c.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (key in days) days[key]++;
    });
    return Object.entries(days).map(([date, count]) => ({ date, count }));
  }, [checkins]);

  // Check-ins by day of week
  const dowData = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const counts = Array(7).fill(0);
    checkins.forEach(c => { counts[new Date(c.created_at).getDay()]++; });
    return days.map((day, i) => ({ day, count: counts[i] }));
  }, [checkins]);

  // Top beers
  const topBeers = useMemo(() => {
    const counts: Record<string, { name: string; count: number; totalRating: number; ratingCount: number }> = {};
    checkins.forEach(c => {
      if (!c.beer_id || !c.beer?.name) return;
      if (!counts[c.beer_id]) counts[c.beer_id] = { name: c.beer.name, count: 0, totalRating: 0, ratingCount: 0 };
      counts[c.beer_id].count++;
      if (c.rating > 0) { counts[c.beer_id].totalRating += c.rating; counts[c.beer_id].ratingCount++; }
    });
    return Object.values(counts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
      .map(b => ({ ...b, avgRating: b.ratingCount > 0 ? (b.totalRating / b.ratingCount).toFixed(1) : null }));
  }, [checkins]);

  // Style distribution
  const styleData = useMemo(() => {
    const counts: Record<string, number> = {};
    checkins.forEach(c => { if (c.beer?.style) counts[c.beer.style] = (counts[c.beer.style] ?? 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, value]) => ({ name, value }));
  }, [checkins]);

  // Rating distribution
  const ratingData = useMemo(() => {
    const dist = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map(r => ({ rating: `${r}★`, count: 0 }));
    checkins.forEach(c => {
      if (c.rating > 0) {
        const idx = dist.findIndex(d => parseFloat(d.rating) === c.rating);
        if (idx >= 0) dist[idx].count++;
      }
    });
    return dist;
  }, [checkins]);

  const totalCheckins = checkins.length;
  const rated = checkins.filter(c => c.rating > 0);
  const avgRating = rated.length > 0 ? (rated.reduce((a, c) => a + c.rating, 0) / rated.length).toFixed(2) : null;
  const thisWeek = checkins.filter(c => new Date(c.created_at) > new Date(Date.now() - 7 * 86400000)).length;
  const uniqueVisitors = useMemo(() => new Set(checkins.map(c => c.user_id).filter(Boolean)).size, [checkins]);

  const tooltipStyle = { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--text-primary)" };

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto pt-16 lg:pt-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold" style={{ color: "var(--text-primary)" }}>Analytics</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Last 90 days · {totalCheckins} check-in{totalCheckins !== 1 ? "s" : ""} from {uniqueVisitors} visitor{uniqueVisitors !== 1 ? "s" : ""}</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Check-ins (90d)", value: totalCheckins },
          { label: "Unique Visitors", value: uniqueVisitors },
          { label: "This Week", value: thisWeek },
          { label: "Avg Rating", value: avgRating ? `${avgRating} ★` : "—" },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-2xl p-5 border text-center" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <p className="font-display text-3xl font-bold" style={{ color: "var(--accent-gold)" }}>{value}</p>
            <p className="text-xs mt-1 font-mono uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{label}</p>
          </div>
        ))}
      </div>

      {totalCheckins === 0 ? (
        <div className="rounded-2xl border p-16 text-center" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <p className="text-4xl mb-3">📊</p>
          <p className="font-display text-xl" style={{ color: "var(--text-primary)" }}>No data yet</p>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Analytics will appear as customers check in at your brewery.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Daily check-ins */}
          <div className="rounded-2xl p-6 border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <h2 className="font-display font-bold mb-4" style={{ color: "var(--text-primary)" }}>Check-ins — Last 30 Days</h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--text-muted)" }} interval={6} />
                <YAxis tick={{ fontSize: 10, fill: "var(--text-muted)" }} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="count" stroke="#D4A843" strokeWidth={2} dot={false} name="Check-ins" />
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
                  <Bar dataKey="count" fill="#D4A843" radius={[4,4,0,0]} name="Check-ins" />
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
              <h2 className="font-display font-bold mb-4" style={{ color: "var(--text-primary)" }}>Most Checked-In Beers</h2>
              <ResponsiveContainer width="100%" height={Math.max(200, topBeers.length * 40)}>
                <BarChart data={topBeers} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 11, fill: "var(--text-muted)" }} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" width={160} tick={{ fontSize: 11, fill: "var(--text-muted)" }} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`${v} check-ins`, ""]} />
                  <Bar dataKey="count" fill="#D4A843" radius={[0,4,4,0]} name="Check-ins" />
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
        </div>
      )}
    </div>
  );
}
