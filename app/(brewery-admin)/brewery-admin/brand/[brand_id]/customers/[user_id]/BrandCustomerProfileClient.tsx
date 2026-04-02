"use client";

import Link from "next/link";
import { ArrowLeft, Calendar, Beer, Star, MapPin, Clock, TrendingUp, Award } from "lucide-react";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { formatRelativeTime } from "@/lib/dates";
import { getStyleVars } from "@/lib/beerStyleColors";
import type { BrandCustomerProfile } from "@/lib/brand-crm";

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

interface Props {
  profile: BrandCustomerProfile;
  brandId: string;
  brandName: string;
  locations: { id: string; name: string }[];
}

export function BrandCustomerProfileClient({ profile: p, brandId, brandName, locations }: Props) {
  function getLocationColor(breweryId: string) {
    const idx = locations.findIndex((l) => l.id === breweryId);
    return LOCATION_COLORS[idx >= 0 ? idx % LOCATION_COLORS.length : 0];
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pt-16 lg:pt-8 space-y-6">
      {/* Back link */}
      <Link
        href={`/brewery-admin/brand/${brandId}/customers`}
        className="inline-flex items-center gap-1.5 text-sm transition-opacity hover:opacity-70"
        style={{ color: "var(--accent-gold)" }}
      >
        <ArrowLeft size={14} />
        Brand Customers
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
              {p.isCrossLocation && (
                <span
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold"
                  style={{ background: "rgba(45,212,191,0.15)", color: "#2dd4bf" }}
                >
                  <MapPin size={11} />
                  Cross-Location
                </span>
              )}
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
            { icon: MapPin, label: "Locations", value: p.stats.locationsVisited.toString() },
            { icon: Beer, label: "Beers Logged", value: p.stats.totalBeersLogged.toString() },
            { icon: Star, label: "Avg Rating", value: p.stats.avgRating ? `${p.stats.avgRating}/5` : "—" },
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

        {/* Visit dates + loyalty */}
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
          {p.brandLoyaltyCard && (
            <span className="flex items-center gap-1" style={{ color: "var(--accent-gold)" }}>
              <Award size={11} />
              {p.brandLoyaltyCard.stamps} stamps ({p.brandLoyaltyCard.lifetimeStamps} lifetime)
              {p.brandLoyaltyCard.lastStampBreweryName && ` · Last at ${p.brandLoyaltyCard.lastStampBreweryName}`}
            </span>
          )}
        </div>
      </div>

      {/* Location breakdown */}
      {p.locationBreakdown.length > 0 && (
        <div className="rounded-2xl border p-5" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <h2 className="font-display font-bold mb-4" style={{ color: "var(--text-primary)" }}>Location Breakdown</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {p.locationBreakdown.map((loc) => (
              <div
                key={loc.breweryId}
                className="rounded-xl p-4 border"
                style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ background: getLocationColor(loc.breweryId) }}
                  />
                  <span className="font-display font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                    {loc.breweryName}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span style={{ color: "var(--text-muted)" }}>Visits</span>
                    <p className="font-mono font-bold" style={{ color: "var(--text-primary)" }}>{loc.visits}</p>
                  </div>
                  <div>
                    <span style={{ color: "var(--text-muted)" }}>Beers</span>
                    <p className="font-mono font-bold" style={{ color: "var(--text-primary)" }}>{loc.beersLogged}</p>
                  </div>
                  <div>
                    <span style={{ color: "var(--text-muted)" }}>Last Visit</span>
                    <p className="font-medium" style={{ color: "var(--text-secondary)" }}>{formatRelativeTime(loc.lastVisit)}</p>
                  </div>
                  <div>
                    <span style={{ color: "var(--text-muted)" }}>Favorite</span>
                    <p className="font-medium truncate" style={{ color: "var(--text-secondary)" }}>{loc.favoriteBeer ?? "—"}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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

      {/* Journey Timeline */}
      <div className="rounded-2xl border p-5" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <h2 className="font-display font-bold mb-4" style={{ color: "var(--text-primary)" }}>Journey Timeline</h2>
        {p.journeyTimeline.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>No visits recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {p.journeyTimeline.map((entry) => (
              <div
                key={entry.sessionId}
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: "var(--surface-2)" }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                  style={{ background: `color-mix(in srgb, ${getLocationColor(entry.breweryId)} 15%, transparent)` }}
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ background: getLocationColor(entry.breweryId) }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    {entry.breweryName}
                  </p>
                  <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                    {entry.beerCount > 0
                      ? `${entry.beerCount} beer${entry.beerCount !== 1 ? "s" : ""}${entry.topBeer ? ` incl. ${entry.topBeer}` : ""}`
                      : "Checked in"
                    }
                    {" · "}
                    {new Date(entry.startedAt).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                  </p>
                </div>
                <span className="text-xs flex-shrink-0" style={{ color: "var(--text-muted)" }}>
                  {formatRelativeTime(entry.startedAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
