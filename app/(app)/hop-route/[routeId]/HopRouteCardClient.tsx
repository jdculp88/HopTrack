"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Clock, Users, ChevronDown, ChevronUp, Beer, Share2, Sparkles, ArrowRight, Star, Play, CheckCircle2, Zap } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import { HopRouteShareCard } from "@/components/hop-route/HopRouteShareCard";

interface RouteStop {
  id: string;
  stop_order: number;
  arrival_time: string | null;
  departure_time: string | null;
  travel_to_next_minutes: number | null;
  reasoning_text: string | null;
  social_context: string | null;
  is_sponsored: boolean;
  checked_in: boolean;
  checked_in_at: string | null;
  brewery: {
    id: string;
    name: string;
    city: string | null;
    state: string | null;
    cover_image_url: string | null;
    brewery_type: string | null;
    hop_route_offer: string | null;
  } | null;
  hop_route_stop_beers: Array<{
    id: string;
    beer_id: string | null;
    beer_name: string | null;
    reason_text: string | null;
  }>;
}

interface HopRoute {
  id: string;
  title: string;
  location_city: string | null;
  stop_count: number;
  group_size: string;
  vibe: string[];
  transport: string;
  status: "draft" | "active" | "completed";
  created_at: string;
  hop_route_stops: RouteStop[];
}

interface HopRouteCardClientProps {
  route: HopRoute;
  userId: string;
}

function formatTime(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

export function HopRouteCardClient({ route: initialRoute, userId }: HopRouteCardClientProps) {
  const [route, setRoute] = useState(initialRoute);
  const [expandedStop, setExpandedStop] = useState<string | null>(initialRoute.hop_route_stops[0]?.id ?? null);
  const [showShare, setShowShare] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const router = useRouter();
  const { success, error: showError } = useToast();

  const stops = route.hop_route_stops.sort((a, b) => a.stop_order - b.stop_order);
  const checkedInCount = stops.filter(s => s.checked_in).length;
  const nextStop = stops.find(s => !s.checked_in) ?? null;

  function toggleStop(id: string) {
    setExpandedStop(prev => prev === id ? null : id);
  }

  async function handleAction(action: "start" | "complete", stopId?: string) {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/hop-route/${route.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, stop_id: stopId }),
      });
      if (!res.ok) {
        const data = await res.json();
        showError(data.error ?? "Something went wrong");
        return;
      }
      if (action === "start") {
        setRoute(r => ({ ...r, status: "active" }));
        success("HopRoute started! 🗺️");
      } else if (action === "complete") {
        setRoute(r => ({ ...r, status: "completed" }));
        success("HopRoute complete! 🎉 +100 XP");
      }
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCheckin(stopId: string) {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/hop-route/${route.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "checkin", stop_id: stopId }),
      });
      if (!res.ok) return;
      setRoute(r => ({
        ...r,
        hop_route_stops: r.hop_route_stops.map(s =>
          s.id === stopId ? { ...s, checked_in: true, checked_in_at: new Date().toISOString() } : s
        ),
      }));
      success("Checked in! 🍺");
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">{route.title}</h1>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              {route.location_city && (
                <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                  <MapPin size={11} /> {route.location_city}
                </span>
              )}
              <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                <Beer size={11} /> {stops.length} stops
              </span>
              {route.vibe?.length > 0 && (
                <span className="text-xs text-[var(--text-muted)]">✨ {route.vibe.join(", ")}</span>
              )}
            </div>
          </div>

          <button
            onClick={() => setShowShare(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono border transition-colors flex-shrink-0"
            style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text-muted)" }}
          >
            <Share2 size={12} /> Share
          </button>
        </div>

        {/* Status banner */}
        {route.status === "draft" && (
          <button
            onClick={() => handleAction("start")}
            disabled={actionLoading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-60"
            style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
          >
            <Play size={14} fill="currentColor" /> Start HopRoute
          </button>
        )}

        {route.status === "active" && (
          <div className="space-y-2">
            {/* Progress indicator */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 rounded-full" style={{ background: "var(--border)" }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${(checkedInCount / stops.length) * 100}%`, background: "var(--accent-gold)" }}
                />
              </div>
              <span className="text-xs font-mono text-[var(--text-muted)]">
                {checkedInCount}/{stops.length} stops
              </span>
            </div>

            {nextStop && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs" style={{ background: "color-mix(in srgb, var(--accent-gold) 10%, transparent)", color: "var(--accent-gold)" }}>
                <Zap size={12} /> You&apos;re here: <strong>{nextStop.brewery?.name ?? "Next stop"}</strong>
              </div>
            )}

            {checkedInCount === stops.length && (
              <button
                onClick={() => handleAction("complete")}
                disabled={actionLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-60"
                style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
              >
                <CheckCircle2 size={14} /> Complete HopRoute 🎉
              </button>
            )}
          </div>
        )}

        {route.status === "completed" && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm" style={{ background: "color-mix(in srgb, var(--accent-gold) 10%, transparent)", color: "var(--accent-gold)" }}>
            <Sparkles size={14} /> HopRoute Complete! 🍺
          </div>
        )}
      </div>

      {/* Stop cards */}
      <div className="space-y-3">
        {stops.map((stop, idx) => {
          const brewery = stop.brewery;
          const isExpanded = expandedStop === stop.id;
          const isLast = idx === stops.length - 1;

          return (
            <div key={stop.id} className="relative">
              {/* Connector line */}
              {!isLast && (
                <div className="absolute left-6 top-full h-3 w-px" style={{ background: "var(--border)", zIndex: 0 }} />
              )}

              <motion.div
                layout
                className={`rounded-2xl border overflow-hidden transition-all ${
                  stop.checked_in
                    ? "border-[var(--accent-gold)]/30 bg-[color-mix(in_srgb,var(--accent-gold)_3%,transparent)]"
                    : "border-[var(--border)] bg-[var(--surface)]"
                }`}
              >
                {/* Stop header — always visible */}
                <button
                  onClick={() => toggleStop(stop.id)}
                  className="w-full flex items-center gap-3 p-4 text-left"
                >
                  {/* Stop number / check indicator */}
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{
                      background: stop.checked_in
                        ? "var(--accent-gold)"
                        : "color-mix(in srgb, var(--accent-gold) 15%, transparent)",
                      color: stop.checked_in ? "var(--bg)" : "var(--accent-gold)",
                    }}
                  >
                    {stop.checked_in ? "✓" : stop.stop_order}
                  </div>

                  {/* Brewery cover */}
                  {brewery?.cover_image_url && (
                    <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 relative">
                      <Image
                        src={brewery.cover_image_url}
                        alt={brewery.name}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-sans font-semibold text-[var(--text-primary)] text-sm truncate">
                        {brewery?.name ?? "Unknown Brewery"}
                      </p>
                      {stop.is_sponsored && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono flex-shrink-0" style={{ background: "color-mix(in srgb, var(--accent-amber) 15%, transparent)", color: "var(--accent-amber)" }}>
                          Sponsored
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {stop.arrival_time && (
                        <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                          <Clock size={10} /> {formatTime(stop.arrival_time)}–{formatTime(stop.departure_time)}
                        </span>
                      )}
                      {brewery?.city && (
                        <span className="text-xs text-[var(--text-muted)]">{brewery.city}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex-shrink-0 text-[var(--text-muted)]">
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>

                {/* Expanded content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 space-y-3 border-t border-[var(--border)]">
                        {/* Sponsored offer */}
                        {stop.is_sponsored && brewery?.hop_route_offer && (
                          <div className="mt-3 p-3 rounded-xl flex items-start gap-2" style={{ background: "color-mix(in srgb, var(--accent-amber) 10%, transparent)" }}>
                            <Star size={14} className="flex-shrink-0 mt-0.5" style={{ color: "var(--accent-amber)" }} />
                            <p className="text-sm" style={{ color: "var(--accent-amber)" }}>{brewery.hop_route_offer}</p>
                          </div>
                        )}

                        {/* AI reasoning */}
                        {stop.reasoning_text && (
                          <div className="mt-3 p-3 rounded-xl" style={{ background: "var(--surface-2)" }}>
                            <p className="text-sm text-[var(--text-secondary)] italic leading-relaxed">"{stop.reasoning_text}"</p>
                          </div>
                        )}

                        {/* Social context */}
                        {stop.social_context && (
                          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                            <Users size={11} />
                            <span>{stop.social_context}</span>
                          </div>
                        )}

                        {/* Recommended beers */}
                        {stop.hop_route_stop_beers.length > 0 && (
                          <div className="space-y-1.5">
                            <p className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-wide">Try These</p>
                            {stop.hop_route_stop_beers.map((b) => (
                              <div key={b.id} className="flex items-start gap-2">
                                <Beer size={12} className="flex-shrink-0 mt-0.5 text-[var(--accent-gold)]" />
                                <div>
                                  <p className="text-sm font-medium text-[var(--text-primary)]">
                                    {b.beer_id ? (
                                      <Link href={`/beer/${b.beer_id}`} className="hover:underline">{b.beer_name}</Link>
                                    ) : b.beer_name}
                                  </p>
                                  {b.reason_text && (
                                    <p className="text-xs text-[var(--text-muted)]">{b.reason_text}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Check in CTA */}
                        {!stop.checked_in && route.status === "active" && (
                          <button
                            onClick={() => handleCheckin(stop.id)}
                            disabled={actionLoading}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-60"
                            style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
                          >
                            <CheckCircle2 size={14} /> Check In Here
                          </button>
                        )}
                        {!stop.checked_in && route.status !== "active" && (
                          <Link
                            href={`/home?brewery=${brewery?.id ?? ""}`}
                            className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors"
                            style={{ background: "var(--surface-2)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
                          >
                            View Brewery <ArrowRight size={14} />
                          </Link>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Travel time between stops */}
              {!isLast && stop.travel_to_next_minutes != null && stop.travel_to_next_minutes > 0 && (
                <div className="flex items-center gap-2 px-4 py-1.5">
                  <div className="w-px h-3 mx-2" style={{ background: "var(--border)" }} />
                  <span className="text-xs text-[var(--text-muted)]">
                    {route.transport === "walking" ? "🚶" : "🚗"} {stop.travel_to_next_minutes} min to next stop
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer actions */}
      <div className="flex gap-2 pt-2">
        <Link
          href="/hop-route/new"
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium border transition-colors"
          style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text-secondary)" }}
        >
          Plan Another Route
        </Link>
        <button
          onClick={() => setShowShare(true)}
          className="px-4 py-3 rounded-xl text-sm font-medium border transition-colors"
          style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text-muted)" }}
        >
          <Share2 size={16} />
        </button>
      </div>

      {/* Share card modal */}
      <AnimatePresence>
        {showShare && (
          <HopRouteShareCard
            route={route}
            stops={stops}
            onClose={() => setShowShare(false)}
            onCopied={() => { success("Link copied!"); setShowShare(false); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
