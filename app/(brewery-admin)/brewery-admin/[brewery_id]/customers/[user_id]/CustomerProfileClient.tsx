"use client";

import Link from "next/link";
import { ArrowLeft, Calendar, Beer, Star, Heart, Award, TrendingUp, Clock } from "lucide-react";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { formatRelativeTime } from "@/lib/dates";
import { getStyleVars } from "@/lib/beerStyleColors";
import type { CustomerProfile } from "@/lib/crm";

interface SessionDetail {
  id: string;
  started_at: string;
  ended_at: string | null;
  beers: { name: string; style: string; rating: number; quantity: number }[];
}

interface Props {
  profile: CustomerProfile;
  breweryId: string;
  recentSessions: SessionDetail[];
}

export function CustomerProfileClient({ profile, breweryId, recentSessions }: Props) {
  const p = profile;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pt-16 lg:pt-8 space-y-6">
      {/* Back link */}
      <Link
        href={`/brewery-admin/${breweryId}/customers`}
        className="inline-flex items-center gap-1.5 text-sm transition-opacity hover:opacity-70"
        style={{ color: "var(--accent-gold)" }}
      >
        <ArrowLeft size={14} />
        All Customers
      </Link>

      {/* Header card */}
      <div className="rounded-2xl border p-6" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="flex items-start gap-4">
          <UserAvatar
            profile={{ display_name: p.displayName, avatar_url: p.avatarUrl, username: p.username }}
            size="lg"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-display text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                {p.displayName}
              </h1>
              <span
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold"
                style={{ background: p.segmentConfig.bgColor, color: p.segmentConfig.color }}
              >
                {p.segmentConfig.emoji} {p.segmentConfig.label}
              </span>
            </div>
            <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>@{p.username}</p>

            {/* Engagement score bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                  Engagement Score
                </span>
                <span className="text-xs font-mono font-bold" style={{ color: "var(--accent-gold)" }}>
                  {p.engagementScore}/100 · {p.engagementLevel}
                </span>
              </div>
              <div className="h-2 rounded-full" style={{ background: "var(--surface-2)" }}>
                <div
                  className="h-2 rounded-full transition-all"
                  style={{
                    width: `${p.engagementScore}%`,
                    background: p.engagementScore >= 80 ? "var(--accent-gold)"
                      : p.engagementScore >= 60 ? "#a78bfa"
                      : p.engagementScore >= 40 ? "#60a5fa"
                      : "#4ade80",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          {[
            { icon: Calendar, label: "Total Visits", value: p.stats.totalVisits.toString() },
            { icon: Beer, label: "Beers Logged", value: p.stats.totalBeersLogged.toString() },
            { icon: Star, label: "Avg Rating", value: p.stats.avgRating ? `${p.stats.avgRating}/5` : "—" },
            { icon: Beer, label: "Unique Beers", value: p.stats.uniqueBeers.toString() },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-xl p-3" style={{ background: "var(--surface-2)" }}>
              <div className="flex items-center gap-1.5 mb-1">
                <Icon size={12} style={{ color: "var(--text-muted)" }} />
                <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{label}</span>
              </div>
              <p className="font-display text-xl font-bold" style={{ color: "var(--text-primary)" }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Visit dates + follow/loyalty status */}
        <div className="flex flex-wrap items-center gap-4 mt-4 text-xs" style={{ color: "var(--text-muted)" }}>
          {p.stats.firstVisit && (
            <span className="flex items-center gap-1">
              <Clock size={11} />
              First visit: {new Date(p.stats.firstVisit).toLocaleDateString()}
            </span>
          )}
          {p.stats.lastVisit && (
            <span className="flex items-center gap-1">
              <TrendingUp size={11} />
              Last visit: {formatRelativeTime(p.stats.lastVisit)}
            </span>
          )}
          {p.isFollowing && (
            <span className="flex items-center gap-1" style={{ color: "var(--accent-gold)" }}>
              <Heart size={11} fill="currentColor" />
              Following your brewery
            </span>
          )}
          {p.hasLoyaltyCard && (
            <span className="flex items-center gap-1" style={{ color: "var(--accent-gold)" }}>
              <Award size={11} />
              {p.loyaltyStamps} loyalty stamps
            </span>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {/* Top Styles */}
        <div className="rounded-2xl border p-5" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <h2 className="font-display font-bold mb-4" style={{ color: "var(--text-primary)" }}>Taste Profile</h2>
          {p.topStyles.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>No beers logged yet.</p>
          ) : (
            <div className="space-y-3">
              {p.topStyles.map((style, i) => {
                const vars = getStyleVars(style.style);
                const maxCount = p.topStyles[0]?.count ?? 1;
                const barWidth = Math.max(15, (style.count / maxCount) * 100);
                return (
                  <div key={style.style}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{style.style}</span>
                      <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>{style.count}</span>
                    </div>
                    <div className="h-2 rounded-full" style={{ background: "var(--surface-2)" }}>
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{ width: `${barWidth}%`, background: i === 0 ? "var(--accent-gold)" : vars?.primary ?? "var(--text-muted)" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Beers */}
        <div className="rounded-2xl border p-5" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <h2 className="font-display font-bold mb-4" style={{ color: "var(--text-primary)" }}>Favorite Beers</h2>
          {p.topBeers.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>No beers logged yet.</p>
          ) : (
            <div className="space-y-3">
              {p.topBeers.map((beer, i) => (
                <div key={beer.name} className="flex items-center gap-3">
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={i === 0
                      ? { background: "var(--accent-gold)", color: "var(--bg)" }
                      : { background: "var(--surface-2)", color: "var(--text-muted)" }
                    }
                  >
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{beer.name}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {beer.count} pour{beer.count !== 1 ? "s" : ""}
                      {beer.rating ? ` · ${beer.rating}★` : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Visit Timeline */}
      <div className="rounded-2xl border p-5" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <h2 className="font-display font-bold mb-4" style={{ color: "var(--text-primary)" }}>Visit Timeline</h2>
        {recentSessions.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>No visits recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {recentSessions.map((s) => {
              const beerCount = s.beers.reduce((sum, b) => sum + b.quantity, 0);
              const topBeer = s.beers.length > 0 ? s.beers[0].name : null;
              return (
                <div
                  key={s.id}
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: "var(--surface-2)" }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                    style={{ background: "rgba(212,168,67,0.1)" }}
                  >
                    🍺
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                      {beerCount > 0
                        ? `${beerCount} beer${beerCount !== 1 ? "s" : ""} logged`
                        : "Brewery visit"
                      }
                    </p>
                    <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                      {topBeer && `${topBeer}${s.beers.length > 1 ? ` +${s.beers.length - 1} more` : ""} · `}
                      {new Date(s.started_at).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                    </p>
                  </div>
                  <span className="text-xs flex-shrink-0" style={{ color: "var(--text-muted)" }}>
                    {formatRelativeTime(s.started_at)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
