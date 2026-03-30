import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Globe, Phone, Star, Users, ArrowLeft, TrendingUp, Beer, CheckCheck, Award, Calendar, Clock } from "lucide-react";
import type { Brewery, BreweryVisit, Profile } from "@/types/database";
import { BeerCard } from "@/components/beer/BeerCard";
import { BeerStyleBadge } from "@/components/ui/BeerStyleBadge";
import { LeaderboardRow } from "@/components/social/LeaderboardRow";
import { generateGradientFromString } from "@/lib/utils";
import BreweryCheckinButton from "@/components/checkin/BreweryCheckinButton";
import { BreweryReview } from "@/components/brewery/BreweryReview";
import { BreweryRatingHeader } from "@/components/brewery/BreweryRatingHeader";
import { FollowBreweryButton } from "@/components/brewery/FollowBreweryButton";

// Supabase join shapes for tables not in generated types
interface ActiveFriendSession {
  id: string;
  user_id: string;
  started_at: string;
  profile: {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
    notification_preferences: Record<string, boolean> | null;
  } | null;
  beer_logs: { id: string }[];
}

interface BreweryEvent {
  id: string;
  title: string;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  event_type: string;
  description: string | null;
}

interface BreweryBeerLog {
  beer_id: string | null;
  rating: number | null;
  quantity: number;
  beer: { name: string } | null;
}

interface TopVisitor extends BreweryVisit {
  profile: Profile;
}

export const revalidate = 60; // 1-minute ISR — mix of public data + auth-gated actions

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("breweries").select("name, city, state").eq("id", id).single();
  if (!data) return { title: "Brewery" };
  const title = `${data.name} · ${data.city}, ${data.state}`;
  const cityParam = [data.city, data.state].filter(Boolean).join(", ");
  const ogImage = `/og?type=brewery&brewery=${encodeURIComponent(data.name)}&city=${encodeURIComponent(cityParam)}`;
  return {
    title,
    openGraph: {
      title,
      images: [{ url: ogImage, width: 1200, height: 630, alt: data.name }],
    },
    twitter: {
      card: "summary_large_image" as const,
      title,
      images: [ogImage],
    },
  };
}

export default async function BreweryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: breweryRaw } = await supabase
    .from("breweries")
    .select("*")
    .eq("id", id)
    .single();

  if (!breweryRaw) notFound();
  const brewery = breweryRaw as Brewery;

  // Fetch beers
  const { data: beers } = await supabase
    .from("beers")
    .select("*, brewery:breweries(*)")
    .eq("brewery_id", id)
    .eq("is_active", true)
    .order("total_ratings", { ascending: false });

  // User's visit
  const { data: userVisitRaw } = await supabase
    .from("brewery_visits")
    .select("*")
    .eq("user_id", user.id)
    .eq("brewery_id", id)
    .single();
  const userVisit = userVisitRaw as BreweryVisit | null;

  // Friends Here Now — friends with active sessions at this brewery
  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
  const { data: friendshipsRaw } = await supabase
    .from("friendships")
    .select("requester_id, addressee_id")
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
    .eq("status", "accepted");
  const friendIds = (friendshipsRaw ?? []).map((f: { requester_id: string; addressee_id: string }) =>
    f.requester_id === user.id ? f.addressee_id : f.requester_id,
  );
  let friendsHere: ActiveFriendSession[] = [];
  if (friendIds.length > 0) {
    const { data: activeSessions } = await (supabase as any) // supabase join shape
      .from("sessions")
      .select(`
        id, user_id, started_at,
        profile:profiles!user_id(id, username, display_name, avatar_url, notification_preferences),
        beer_logs(id)
      `)
      .in("user_id", friendIds)
      .eq("brewery_id", id)
      .eq("is_active", true)
      .gte("started_at", sixHoursAgo);
    friendsHere = ((activeSessions ?? []) as ActiveFriendSession[]).filter((s) => {
      const prefs = s.profile?.notification_preferences ?? {};
      return prefs.share_live !== false;
    });
  }

  // Top visitors leaderboard
  const { data: topVisitorsRaw } = await supabase
    .from("brewery_visits")
    .select("*, profile:profiles(*)")
    .eq("brewery_id", id)
    .order("total_visits", { ascending: false })
    .limit(10);
  const topVisitors = (topVisitorsRaw ?? []) as TopVisitor[];

  // REQ-015: Enhanced brewery stats from sessions + beer_logs
  // 1. Total sessions + unique visitors
  const { data: brewerySessionsRaw } = await (supabase as any) // supabase join shape
    .from("sessions")
    .select("user_id")
    .eq("brewery_id", id)
    .eq("is_active", false);
  const brewerySessions = (brewerySessionsRaw ?? []) as { user_id: string }[];
  const totalCheckins = brewerySessions.length;
  const uniqueVisitors = new Set(brewerySessions.map((s) => s.user_id)).size;

  // Avg rating from beer_logs
  const { data: breweryLogsRaw } = await (supabase as any) // supabase join shape
    .from("beer_logs")
    .select("beer_id, rating, quantity, beer:beers(name)")
    .eq("brewery_id", id);
  const breweryLogs = (breweryLogsRaw ?? []) as BreweryBeerLog[];
  const ratingsWithValue = breweryLogs.filter((l) => l.rating != null && l.rating > 0);
  const avgRating =
    ratingsWithValue.length > 0
      ? ratingsWithValue.reduce((sum: number, l) => sum + Number(l.rating), 0) /
        ratingsWithValue.length
      : null;

  // 2. Most popular beer (beer with most logged quantity)
  const beerCountMap: Record<string, { name: string; count: number }> = {};
  for (const l of breweryLogs) {
    if (!l.beer_id) continue;
    if (!beerCountMap[l.beer_id]) {
      beerCountMap[l.beer_id] = { name: l.beer?.name ?? "Unknown", count: 0 };
    }
    beerCountMap[l.beer_id].count += l.quantity ?? 1;
  }
  const mostPopularBeer =
    Object.values(beerCountMap).sort((a, b) => b.count - a.count)[0] ?? null;

  // 3. Beers on tap (active beers)
  const beersOnTap = beers?.length ?? 0;

  // Beer of the Week
  const featuredBeer = (beers ?? []).find((b) => b.is_featured) ?? null;

  // Upcoming events
  const today = new Date().toISOString().split("T")[0];
  const { data: upcomingEventsRaw } = await (supabase as any) // supabase join shape
    .from("brewery_events")
    .select("id, title, event_date, start_time, end_time, event_type, description")
    .eq("brewery_id", id)
    .eq("is_active", true)
    .gte("event_date", today)
    .order("event_date", { ascending: true })
    .limit(5);
  const upcomingEvents = (upcomingEventsRaw ?? []) as BreweryEvent[]; // supabase join shape

  // Check if brewery has any admin accounts (for claim CTA)
  const { count: adminCount } = await supabase
    .from("brewery_accounts")
    .select("id", { count: "exact", head: true })
    .eq("brewery_id", id);
  const hasAdmin = (adminCount ?? 0) > 0;

  const gradient = generateGradientFromString(brewery.name);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero */}
      <div className="relative h-72 sm:h-96">
        <div
          className="absolute inset-0"
          style={!brewery.cover_image_url ? { background: gradient } : undefined}
        >
          {brewery.cover_image_url && (
            <Image src={brewery.cover_image_url} alt={brewery.name} fill className="object-cover" />
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/60 to-[var(--bg)]/20" />

        <div className="absolute top-4 left-4">
          <Link href="/explore" className="flex items-center gap-1.5 text-white/70 hover:text-white bg-black/30 backdrop-blur-sm px-3 py-2 rounded-xl text-sm transition-colors">
            <ArrowLeft size={14} />
            Back
          </Link>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6">
          {brewery.brewery_type && (
            <span className="text-xs font-mono text-[var(--accent-gold)] uppercase tracking-wider block mb-1">
              {brewery.brewery_type}
            </span>
          )}
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-white leading-tight drop-shadow-lg">
            {brewery.name}
          </h1>
          <div className="flex items-center gap-3 mt-2 text-sm text-white/80">
            <span className="flex items-center gap-1">
              <MapPin size={13} />
              {brewery.city}{brewery.state ? `, ${brewery.state}` : ""}
            </span>
            {userVisit && (
              <span className="flex items-center gap-1 text-[var(--accent-gold)]">
                ✓ {userVisit.total_visits} visit{userVisit.total_visits > 1 ? "s" : ""}
              </span>
            )}
          </div>
          <div className="mt-4 flex items-center gap-3 flex-wrap">
            <BreweryCheckinButton brewery={brewery as Brewery} />
            <FollowBreweryButton breweryId={id} />
            <Link
              href={`/hop-route/new?brewery=${id}&city=${encodeURIComponent(brewery.city ?? "")}`}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono border transition-colors"
              style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text-muted)" }}
            >
              <Beer size={12} /> Start a HopRoute here
            </Link>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-6 space-y-8">
        {/* Info */}
        <div className="flex flex-wrap gap-4 text-sm">
          {brewery.website_url && (
            <a href={brewery.website_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[var(--accent-gold)] hover:underline">
              <Globe size={14} />
              Website
            </a>
          )}
          {brewery.phone && (
            <a href={`tel:${brewery.phone}`} className="flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              <Phone size={14} />
              {brewery.phone}
            </a>
          )}
        </div>

        {brewery.description && (
          <p className="text-[var(--text-secondary)] leading-relaxed">{brewery.description}</p>
        )}

        {/* Friends Here Now — prominent position at top when friends are present */}
        {friendsHere.length > 0 && (
          <div className="card-bg-live border border-[var(--accent-gold)]/20 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2.5 h-2.5 rounded-full animate-pulse flex-shrink-0" style={{ background: "var(--live-green)" }} />
              <h2 className="font-display text-xl font-bold text-[var(--text-primary)]">Friends Here Now</h2>
              <span className="text-xs font-mono text-[var(--accent-gold)] ml-auto">{friendsHere.length} drinking</span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
              {friendsHere.map((s) => {
                const diffMs = Date.now() - new Date(s.started_at).getTime();
                const mins = Math.floor(diffMs / 60000);
                const elapsed = mins < 60 ? `${mins}m` : `${Math.floor(mins / 60)}h ${mins % 60}m`;
                const beerCount = Array.isArray(s.beer_logs) ? s.beer_logs.length : 0;
                return (
                  <Link
                    key={s.id}
                    href={`/profile/${s.profile?.username}`}
                    className="flex flex-col items-center gap-2 p-3 rounded-2xl border flex-shrink-0 w-[100px] hover:border-[var(--accent-gold)]/40 transition-colors"
                    style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                  >
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-[var(--surface-2)] flex items-center justify-center font-bold text-sm" style={{ color: "var(--accent-gold)" }}>
                        {s.profile?.avatar_url
                          ? <img src={s.profile.avatar_url} alt="" className="w-full h-full object-cover" />
                          : (s.profile?.display_name ?? s.profile?.username ?? "?")[0].toUpperCase()
                        }
                      </div>
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2" style={{ background: "var(--live-green)", borderColor: "var(--surface)" }} />
                    </div>
                    <p className="text-xs font-medium text-center truncate w-full" style={{ color: "var(--text-primary)" }}>
                      {(s.profile?.display_name ?? s.profile?.username ?? "Friend").split(" ")[0]}
                    </p>
                    <p className="text-[10px] font-mono text-center" style={{ color: "var(--live-green)" }}>
                      {beerCount} pours · {elapsed}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Brewery Rating — prominent position */}
        <BreweryRatingHeader breweryId={id} currentUserId={user.id} />

        {/* REQ-015: Brewery Stats Bar */}
        <div
          className="grid grid-cols-2 sm:grid-cols-5 gap-3"
          role="region"
          aria-label="Brewery statistics"
        >
          <div className="card-bg-stats border border-[var(--border)] rounded-2xl p-4 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
              <CheckCheck size={13} />
              <span className="text-xs font-mono uppercase tracking-wider">Visits</span>
            </div>
            <p className="font-display text-2xl font-bold text-[var(--text-primary)] leading-none">
              {totalCheckins.toLocaleString()}
            </p>
          </div>

          <div className="card-bg-stats border border-[var(--border)] rounded-2xl p-4 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
              <Users size={13} />
              <span className="text-xs font-mono uppercase tracking-wider">Visitors</span>
            </div>
            <p className="font-display text-2xl font-bold text-[var(--text-primary)] leading-none">
              {uniqueVisitors.toLocaleString()}
            </p>
          </div>

          <div className="card-bg-stats border border-[var(--border)] rounded-2xl p-4 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
              <Star size={13} />
              <span className="text-xs font-mono uppercase tracking-wider">Avg Rating</span>
            </div>
            {avgRating != null ? (
              <p className="font-display text-2xl font-bold text-[var(--accent-gold)] leading-none">
                {avgRating.toFixed(1)}
                <span className="text-sm font-sans font-normal text-[var(--text-muted)] ml-1">/5</span>
              </p>
            ) : (
              <p className="font-display text-2xl font-bold text-[var(--text-muted)] leading-none">—</p>
            )}
          </div>

          <div className="card-bg-stats border border-[var(--border)] rounded-2xl p-4 flex flex-col gap-1 col-span-2 sm:col-span-1">
            <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
              <TrendingUp size={13} />
              <span className="text-xs font-mono uppercase tracking-wider">Top Beer</span>
            </div>
            {mostPopularBeer ? (
              <p className="font-display text-sm font-bold text-[var(--text-primary)] leading-tight line-clamp-2">
                {mostPopularBeer.name}
              </p>
            ) : (
              <p className="font-display text-sm font-bold text-[var(--text-muted)] leading-none">—</p>
            )}
          </div>

          <div className="card-bg-stats border border-[var(--border)] rounded-2xl p-4 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
              <Beer size={13} />
              <span className="text-xs font-mono uppercase tracking-wider">On Tap</span>
            </div>
            <p className="font-display text-2xl font-bold text-[var(--text-primary)] leading-none">
              {beersOnTap}
            </p>
          </div>
        </div>

        {/* Beer of the Week */}
        {featuredBeer && (
          <Link href={`/beer/${featuredBeer.id}`}>
            <div className="card-bg-featured flex items-center gap-4 p-4 border border-[var(--accent-gold)]/30 rounded-2xl transition-all hover:border-[var(--accent-gold)]/60 group">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg, var(--accent-gold) 0%, var(--accent-amber) 100%)" }}>
                <Award size={22} className="text-[var(--bg)]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-mono uppercase tracking-wider text-[var(--accent-gold)] mb-0.5">Beer of the Week</p>
                <p className="font-display font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-gold)] transition-colors truncate">
                  {featuredBeer.name}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <BeerStyleBadge style={featuredBeer.style} size="xs" />
                  {featuredBeer.abv && <span className="text-xs font-mono text-[var(--text-muted)]">{featuredBeer.abv}% ABV</span>}
                </div>
              </div>
              {featuredBeer.avg_rating && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Star size={14} className="text-[var(--accent-gold)] fill-[var(--accent-gold)]" />
                  <span className="font-mono font-bold text-[var(--accent-gold)]">{featuredBeer.avg_rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </Link>
        )}

        {/* On Tap — Beer Menu */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-2xl font-bold text-[var(--text-primary)]">On Tap</h2>
            <span className="text-sm font-mono text-[var(--text-muted)]">{beers?.length ?? 0} beers</span>
          </div>

          {beers && beers.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {(beers ?? []).map((beer) => (
                <BeerCard key={beer.id} beer={beer} variant="grid" />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-[var(--surface)] rounded-2xl border border-[var(--border)]">
              <p className="text-4xl mb-3">🍺</p>
              <p className="font-display text-lg text-[var(--text-primary)]">Taps are quiet</p>
              <p className="text-sm text-[var(--text-secondary)] mt-1">This brewery hasn&apos;t added beers yet — check back soon.</p>
            </div>
          )}
        </div>

        {/* Upcoming Events */}
        <div>
          <h2 className="font-display text-2xl font-bold text-[var(--text-primary)] mb-3">Upcoming Events</h2>
          {upcomingEvents.length > 0 ? (
            <div className="space-y-2">
              {upcomingEvents.map((event) => {
                const EVENT_EMOJIS: Record<string, string> = {
                  tap_takeover: "🍺", release_party: "🎉", trivia: "🧠",
                  live_music: "🎵", food_pairing: "🍽️", other: "📅",
                };
                const emoji = EVENT_EMOJIS[event.event_type] ?? "📅";
                const dateStr = new Date(event.event_date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
                const timeStr = event.start_time ? `${event.start_time}${event.end_time ? ` – ${event.end_time}` : ""}` : null;
                return (
                  <div key={event.id} className="card-bg-notification flex items-center gap-4 p-4 rounded-2xl border border-[var(--border)]">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                      style={{ background: "color-mix(in srgb, var(--accent-gold) 10%, transparent)" }}>
                      {emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-bold text-[var(--text-primary)] truncate">{event.title}</p>
                      <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] mt-0.5">
                        <span className="flex items-center gap-1"><Calendar size={11} />{dateStr}</span>
                        {timeStr && <span className="flex items-center gap-1"><Clock size={11} />{timeStr}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 bg-[var(--surface)] rounded-2xl border border-[var(--border)]">
              <p className="text-3xl mb-2">📅</p>
              <p className="text-sm text-[var(--text-secondary)]">No upcoming events — stay tuned for tap takeovers, trivia nights, and more.</p>
            </div>
          )}
        </div>

        {/* Brewery Reviews — full list */}
        <div>
          <h2 className="font-display text-2xl font-bold text-[var(--text-primary)] mb-3">Reviews</h2>
          <BreweryReview breweryId={id} currentUserId={user.id} />
        </div>

        {/* Leaderboard */}
        <div>
          <h2 className="font-display text-2xl font-bold text-[var(--text-primary)] mb-4">Top Visitors</h2>
          {topVisitors && topVisitors.length > 0 ? (
            <div className="space-y-1">
              {topVisitors.map((visit, i) => (
                <LeaderboardRow
                  key={visit.id}
                  entry={{
                    rank: i + 1,
                    profile: visit.profile,
                    value: visit.total_visits,
                  }}
                  label="visits"
                  currentUserId={user.id}
                  index={i}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-[var(--surface)] rounded-2xl border border-[var(--border)]">
              <p className="text-3xl mb-2">🏆</p>
              <p className="text-sm text-[var(--text-secondary)]">No visitors yet — be the first to start a session here.</p>
            </div>
          )}
        </div>

        {/* Claim This Brewery CTA — only when no admin exists */}
        {!hasAdmin && (
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 text-center space-y-3">
            <p className="text-2xl">🍺</p>
            <h3 className="font-display text-lg font-bold text-[var(--text-primary)]">Own this brewery?</h3>
            <p className="text-sm text-[var(--text-secondary)] max-w-sm mx-auto">
              Claim your listing to manage your tap list, run loyalty programs, and see analytics.
            </p>
            <Link
              href={`/brewery-admin/claim?brewery_id=${id}`}
              className="inline-flex items-center gap-2 border border-[var(--accent-gold)] text-[var(--accent-gold)] hover:bg-[var(--accent-gold)] hover:text-[var(--bg)] font-semibold text-sm px-5 py-2.5 rounded-xl transition-all"
            >
              Is this your brewery? Claim it →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
