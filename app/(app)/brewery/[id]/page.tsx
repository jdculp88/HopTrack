import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Globe, Phone, Star, Users, TrendingUp, Beer, CheckCheck } from "lucide-react";
import { InstagramIcon, FacebookIcon, XTwitterIcon } from "@/components/ui/SocialIcons";
import { formatPhone } from "@/lib/brewery-utils";
import type { Brewery, BreweryVisit, Profile } from "@/types/database";
import { BreweryChallenges } from "@/components/brewery/BreweryChallenges";
import { MugClubSection } from "@/components/brewery/MugClubSection";
import { LoyaltyStampCard } from "@/components/loyalty/LoyaltyStampCard";
import { BrandLoyaltyStampCard } from "@/components/loyalty/BrandLoyaltyStampCard";
import { ClosedBreweryBanner } from "@/components/brewery/ClosedBreweryBanner";
import { BreweryRatingHeader } from "@/components/brewery/BreweryRatingHeader";
import { generateGradientFromString } from "@/lib/utils";
import { BreweryHeroSection } from "./BreweryHeroSection";
import { BreweryTapListSection } from "./BreweryTapListSection";
import { BreweryMenusSection } from "@/components/brewery/BreweryMenusSection";
import { BreweryEventsSection } from "./BreweryEventsSection";
import { BreweryReviewsSection } from "./BreweryReviewsSection";
import { AuthGate } from "@/components/ui/AuthGate";
import { StorefrontGate } from "@/components/ui/StorefrontGate";

// ─── Supabase join shapes ────────────────────────────────────────────────────

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

// ─── ISR ─────────────────────────────────────────────────────────────────────

export const revalidate = 60; // 1-minute ISR

// ─── Metadata ────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("breweries")
    .select(
      "name, city, state, street, postal_code, country, phone, website_url, description, latitude, longitude, brewery_type",
    )
    .eq("id", id)
    .single();
  if (!data) return { title: "Brewery" };
  const title = `${data.name} · ${data.city}, ${data.state}`;
  const cityParam = [data.city, data.state].filter(Boolean).join(", ");
  const ogImage = `/og?type=brewery&brewery=${encodeURIComponent(data.name)}&city=${encodeURIComponent(cityParam)}`;
  const description = data.description
    ? data.description.slice(0, 160)
    : `${data.name} in ${data.city}, ${data.state}. View tap list, menus, events, and reviews on HopTrack.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: data.name }],
    },
    twitter: {
      card: "summary_large_image" as const,
      title,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: `/brewery/${id}`,
    },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function BreweryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthenticated = !!user;
  const returnPath = `/brewery/${id}`;

  // ── Core brewery data (public) ──
  const { data: breweryRaw } = await supabase.from("breweries").select("*").eq("id", id).single();
  if (!breweryRaw) notFound();
  const brewery = breweryRaw as Brewery;

  // ── Beers (public) ──
  const { data: beers } = await supabase
    .from("beers")
    .select("*, brewery:breweries(id, name)")
    .eq("brewery_id", id)
    .eq("is_active", true)
    .order("total_ratings", { ascending: false });

  // ── User's visit (auth only) ──
  let userVisit: BreweryVisit | null = null;
  if (user) {
    const { data: userVisitRaw } = await supabase
      .from("brewery_visits")
      .select("*")
      .eq("user_id", user.id)
      .eq("brewery_id", id)
      .single();
    userVisit = userVisitRaw as BreweryVisit | null;
  }

  // ── Friends Here Now (auth only) ──
  let friendsHere: ActiveFriendSession[] = [];
  if (user) {
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
    const { data: friendshipsRaw } = await supabase
      .from("friendships")
      .select("requester_id, addressee_id")
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
      .eq("status", "accepted");
    const friendIds = (friendshipsRaw ?? []).map(
      (f: { requester_id: string; addressee_id: string }) =>
        f.requester_id === user.id ? f.addressee_id : f.requester_id,
    );
    if (friendIds.length > 0) {
      const { data: activeSessions } = await supabase // supabase join shape
        .from("sessions")
        .select(
          `id, user_id, started_at,
          profile:profiles!user_id(id, username, display_name, avatar_url, notification_preferences),
          beer_logs(id)`,
        )
        .in("user_id", friendIds)
        .eq("brewery_id", id)
        .eq("is_active", true)
        .gte("started_at", sixHoursAgo);
      friendsHere = ((activeSessions ?? []) as unknown as ActiveFriendSession[]).filter((s) => {
        const prefs = s.profile?.notification_preferences ?? {};
        return prefs.share_live !== false;
      });
    }
  }

  // ── Top visitors leaderboard (auth only) ──
  let topVisitors: TopVisitor[] = [];
  if (user) {
    const { data: topVisitorsRaw } = await supabase
      .from("brewery_visits")
      .select("*, profile:profiles(*)")
      .eq("brewery_id", id)
      .order("total_visits", { ascending: false })
      .limit(10);
    topVisitors = (topVisitorsRaw ?? []) as unknown as TopVisitor[];
  }

  // ── Brewery stats (public) ──
  const { data: brewerySessionsRaw } = await supabase // supabase join shape
    .from("sessions")
    .select("user_id")
    .eq("brewery_id", id)
    .eq("is_active", false);
  const brewerySessions = (brewerySessionsRaw ?? []) as { user_id: string }[];
  const totalCheckins = brewerySessions.length;
  const uniqueVisitors = new Set(brewerySessions.map((s) => s.user_id)).size;

  const { data: breweryLogsRaw } = await supabase // supabase join shape
    .from("beer_logs")
    .select("beer_id, rating, quantity, beer:beers(name)")
    .eq("brewery_id", id);
  const breweryLogs = (breweryLogsRaw ?? []) as unknown as BreweryBeerLog[];
  const ratingsWithValue = breweryLogs.filter((l) => l.rating != null && l.rating > 0);
  const avgRating =
    ratingsWithValue.length > 0
      ? ratingsWithValue.reduce((sum: number, l) => sum + Number(l.rating), 0) /
        ratingsWithValue.length
      : null;

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
  const beersOnTap = beers?.length ?? 0;

  // ── Upcoming events (public) ──
  const today = new Date().toISOString().split("T")[0];
  const { data: upcomingEventsRaw } = await supabase // supabase join shape
    .from("brewery_events")
    .select("id, title, event_date, start_time, end_time, event_type, description")
    .eq("brewery_id", id)
    .eq("is_active", true)
    .gte("event_date", today)
    .order("event_date", { ascending: true })
    .limit(5);
  const upcomingEvents = (upcomingEventsRaw ?? []) as unknown as BreweryEvent[];

  // ── Challenges (public — promotional content) ──
  const { data: challengesRaw } = await (supabase
    .from("challenges")
    .select(
      "id, name, description, icon, challenge_type, target_value, reward_description, reward_xp, ends_at",
    )
    .eq("brewery_id", id)
    .eq("is_active", true)
    .order("created_at", { ascending: false }) as any);
  const activeChallenges = (challengesRaw ?? []).filter(
    (c: any) => !c.ends_at || new Date(c.ends_at) >= new Date(),
  );

  // ── Challenge participations (auth only) ──
  let myParticipations: any[] = [];
  if (user && activeChallenges.length > 0) {
    const challengeIds = activeChallenges.map((c: any) => c.id);
    const { data: participationsRaw } = await (supabase
      .from("challenge_participants")
      .select(
        "id, current_progress, completed_at, challenge:challenges(id, name, description, icon, challenge_type, target_value, reward_description, reward_xp, ends_at)",
      )
      .eq("user_id", user.id)
      .in("challenge_id", challengeIds) as any);
    myParticipations = participationsRaw ?? [];
  }

  // ── Mug clubs (public — promotional content) ──
  const { data: mugClubsRaw } = await (supabase
    .from("mug_clubs")
    .select("*, member_count:mug_club_members(count)")
    .eq("brewery_id", id)
    .eq("is_active", true)
    .order("created_at", { ascending: false }) as any);
  const mugClubs = mugClubsRaw ?? [];

  // ── Mug club memberships (auth only) ──
  let myMugMemberships: any[] = [];
  if (user && mugClubs.length > 0) {
    const clubIds = mugClubs.map((c: any) => c.id);
    const { data: membershipsRaw } = await (supabase
      .from("mug_club_members")
      .select("*")
      .eq("user_id", user.id)
      .in("mug_club_id", clubIds) as any);
    myMugMemberships = membershipsRaw ?? [];
  }

  // ── Loyalty programs (public — promotional content) ──
  const { data: loyaltyPrograms } = await (supabase
    .from("loyalty_programs")
    .select("id, name, stamps_required, reward_description")
    .eq("brewery_id", id)
    .eq("is_active", true)
    .order("created_at", { ascending: false }) as any);

  // ── Loyalty cards (auth only) ──
  const myLoyaltyCards: Record<string, { stamps: number; lifetime_stamps: number }> = {};
  if (user && loyaltyPrograms?.length) {
    const { data: cardsRaw } = await (supabase
      .from("loyalty_cards")
      .select("program_id, stamps, lifetime_stamps")
      .eq("user_id", user.id)
      .eq("brewery_id", id) as any);
    for (const card of (cardsRaw ?? []) as any[]) {
      if (card.program_id) {
        myLoyaltyCards[card.program_id] = {
          stamps: card.stamps,
          lifetime_stamps: card.lifetime_stamps,
        };
      }
    }
  }

  // ── Brand loyalty (public metadata) ──
  let brandName: string | null = null;
  let hasBrandLoyalty = false;
  if (brewery.brand_id) {
    const { data: brandRow } = await (supabase
      .from("brewery_brands")
      .select("name")
      .eq("id", brewery.brand_id)
      .single() as any);
    brandName = brandRow?.name ?? null;
    const { data: blp } = await (supabase
      .from("brand_loyalty_programs")
      .select("id")
      .eq("brand_id", brewery.brand_id)
      .eq("is_active", true)
      .limit(1) as any);
    hasBrandLoyalty = (blp?.length ?? 0) > 0;
  }

  // ── Menus (public) ──
  const { data: breweryMenus } = await (supabase
    .from("brewery_menus")
    .select("*")
    .eq("brewery_id", id)
    .eq("is_active", true)
    .order("display_order") as any);

  // ── Event RSVPs (auth only) ──
  const eventIds = upcomingEvents.map((e) => e.id);
  const myEventRsvps: Record<string, { status: string }> = {};
  if (user && eventIds.length > 0) {
    const { data: rsvpsRaw } = await (supabase
      .from("event_rsvps")
      .select("event_id, status")
      .eq("user_id", user.id)
      .in("event_id", eventIds) as any);
    for (const rsvp of (rsvpsRaw ?? []) as any[]) {
      myEventRsvps[rsvp.event_id] = { status: rsvp.status };
    }
  }

  // ── Claim CTA check (public) ──
  const { count: adminCount } = await supabase
    .from("brewery_accounts")
    .select("id", { count: "exact", head: true })
    .eq("brewery_id", id);
  const hasAdmin = (adminCount ?? 0) > 0;

  // ── Storefront tier check ──
  // Claimed breweries on Tap+ tier get the full public Storefront
  // Unclaimed or free-tier breweries get a basic page with gated sections
  const paidTiers = ["tap", "cask", "barrel"];
  const hasStorefront = hasAdmin && paidTiers.includes(brewery.subscription_tier ?? "");

  const isClosed = brewery.brewery_type === "closed";
  const gradient = generateGradientFromString(brewery.name);

  // ── JSON-LD (public) ──
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Brewery",
    name: brewery.name,
    ...(brewery.description && { description: brewery.description }),
    ...(brewery.street && {
      address: {
        "@type": "PostalAddress",
        streetAddress: brewery.street,
        addressLocality: brewery.city,
        addressRegion: brewery.state,
        ...(brewery.postal_code && { postalCode: brewery.postal_code }),
        addressCountry: brewery.country || "US",
      },
    }),
    ...(!brewery.street &&
      brewery.city && {
        address: {
          "@type": "PostalAddress",
          addressLocality: brewery.city,
          addressRegion: brewery.state,
          addressCountry: brewery.country || "US",
        },
      }),
    ...(brewery.latitude &&
      brewery.longitude && {
        geo: {
          "@type": "GeoCoordinates",
          latitude: brewery.latitude,
          longitude: brewery.longitude,
        },
      }),
    ...(brewery.phone && { telephone: brewery.phone }),
    ...(brewery.website_url && { url: brewery.website_url }),
    ...(avgRating && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: avgRating.toFixed(1),
        ratingCount: ratingsWithValue.length,
        bestRating: 5,
      },
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-4xl mx-auto">
        {/* Hero */}
        <BreweryHeroSection
          brewery={brewery}
          userVisit={userVisit}
          gradient={gradient}
          isAuthenticated={isAuthenticated}
          returnPath={returnPath}
        />

        <div className="px-4 sm:px-6 py-6 space-y-8">
          {/* Closed Brewery Banner */}
          {isClosed && <ClosedBreweryBanner breweryName={brewery.name} />}

          {/* Contact info */}
          <div className="flex flex-wrap gap-4 text-sm">
            {brewery.website_url && (
              <a
                href={brewery.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[var(--accent-gold)] hover:underline"
              >
                <Globe size={14} />
                Website
              </a>
            )}
            {brewery.phone && (
              <a
                href={`tel:${brewery.phone}`}
                className="flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <Phone size={14} />
                {formatPhone(brewery.phone)}
              </a>
            )}
            {brewery.instagram_url && (
              <a
                href={brewery.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <InstagramIcon size={14} />
                Instagram
              </a>
            )}
            {brewery.facebook_url && (
              <a
                href={brewery.facebook_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <FacebookIcon size={14} />
                Facebook
              </a>
            )}
            {brewery.twitter_url && (
              <a
                href={brewery.twitter_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <XTwitterIcon size={14} />
                X
              </a>
            )}
            {brewery.untappd_url && (
              <a
                href={brewery.untappd_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <Beer size={14} />
                Untappd
              </a>
            )}
          </div>

          {brewery.description && (
            <p className="text-[var(--text-secondary)] leading-relaxed">{brewery.description}</p>
          )}

          {/* Friends Here Now — auth only */}
          {isAuthenticated && friendsHere.length > 0 && (
            <div className="card-bg-live border border-[var(--accent-gold)]/20 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="w-2.5 h-2.5 rounded-full animate-pulse flex-shrink-0"
                  style={{ background: "var(--live-green)" }}
                />
                <h2 className="font-display text-xl font-bold text-[var(--text-primary)]">
                  Friends Here Now
                </h2>
                <span className="text-xs font-mono text-[var(--accent-gold)] ml-auto">
                  {friendsHere.length} drinking
                </span>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
                {friendsHere.map((s) => {
                  const diffMs = Date.now() - new Date(s.started_at).getTime();
                  const mins = Math.floor(diffMs / 60000);
                  const elapsed =
                    mins < 60 ? `${mins}m` : `${Math.floor(mins / 60)}h ${mins % 60}m`;
                  const beerCount = Array.isArray(s.beer_logs) ? s.beer_logs.length : 0;
                  return (
                    <Link
                      key={s.id}
                      href={`/profile/${s.profile?.username}`}
                      className="flex flex-col items-center gap-2 p-3 rounded-2xl border flex-shrink-0 w-[100px] hover:border-[var(--accent-gold)]/40 transition-colors"
                      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                    >
                      <div className="relative">
                        <div
                          className="w-10 h-10 rounded-full overflow-hidden bg-[var(--surface-2)] flex items-center justify-center font-bold text-sm"
                          style={{ color: "var(--accent-gold)" }}
                        >
                          {s.profile?.avatar_url ? (
                            <img
                              src={s.profile.avatar_url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            (
                              s.profile?.display_name ??
                              s.profile?.username ??
                              "?"
                            )[0].toUpperCase()
                          )}
                        </div>
                        <span
                          className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2"
                          style={{
                            background: "var(--live-green)",
                            borderColor: "var(--surface)",
                          }}
                        />
                      </div>
                      <p
                        className="text-xs font-medium text-center truncate w-full"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {(
                          s.profile?.display_name ??
                          s.profile?.username ??
                          "Friend"
                        ).split(" ")[0]}
                      </p>
                      <p
                        className="text-[10px] font-mono text-center"
                        style={{ color: "var(--live-green)" }}
                      >
                        {beerCount} pours · {elapsed}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Brewery Rating */}
          <BreweryRatingHeader
            breweryId={id}
            currentUserId={user?.id ?? null}
            isAuthenticated={isAuthenticated}
            returnPath={returnPath}
          />

          {/* Stats Bar */}
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
                  <span className="text-sm font-sans font-normal text-[var(--text-muted)] ml-1">
                    /5
                  </span>
                </p>
              ) : (
                <p className="font-display text-2xl font-bold text-[var(--text-muted)] leading-none">
                  —
                </p>
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
                <p className="font-display text-sm font-bold text-[var(--text-muted)] leading-none">
                  —
                </p>
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

          {/* Tap List + Food Menu — gated for unclaimed/free-tier on public view */}
          {isAuthenticated || hasStorefront ? (
            <BreweryTapListSection
              beers={(beers ?? []) as any[]}
              breweryName={brewery.name}
              menuImageUrl={brewery.menu_image_url ?? null}
            />
          ) : (
            <StorefrontGate isUnlocked={hasStorefront} sectionName="Tap List" breweryId={id}>
              <BreweryTapListSection
                beers={(beers ?? []) as any[]}
                breweryName={brewery.name}
                menuImageUrl={brewery.menu_image_url ?? null}
              />
            </StorefrontGate>
          )}

          {/* Menus — gated for unclaimed/free-tier on public view */}
          {isAuthenticated || hasStorefront ? (
            <BreweryMenusSection menus={breweryMenus ?? []} />
          ) : (breweryMenus ?? []).length > 0 ? (
            <StorefrontGate isUnlocked={hasStorefront} sectionName="Menus & Food" breweryId={id}>
              <BreweryMenusSection menus={breweryMenus ?? []} />
            </StorefrontGate>
          ) : null}

          {/* Challenges — gated for unclaimed/free-tier on public view */}
          {activeChallenges.length > 0 && (
            isAuthenticated || hasStorefront ? (
              <BreweryChallenges
                challenges={activeChallenges}
                myParticipations={myParticipations}
                isAuthenticated={isAuthenticated}
                returnPath={returnPath}
              />
            ) : (
              <StorefrontGate isUnlocked={hasStorefront} sectionName="Challenges" breweryId={id}>
                <BreweryChallenges
                  challenges={activeChallenges}
                  myParticipations={[]}
                  isAuthenticated={false}
                  returnPath={returnPath}
                />
              </StorefrontGate>
            )
          )}

          {/* Mug Clubs — gated for unclaimed/free-tier on public view */}
          {mugClubs.length > 0 && (
            isAuthenticated || hasStorefront ? (
              <MugClubSection
                clubs={mugClubs}
                myMemberships={myMugMemberships}
                breweryId={brewery.id}
                isAuthenticated={isAuthenticated}
                returnPath={returnPath}
              />
            ) : (
              <StorefrontGate isUnlocked={hasStorefront} sectionName="Mug Clubs" breweryId={id}>
                <MugClubSection
                  clubs={mugClubs}
                  myMemberships={[]}
                  breweryId={brewery.id}
                  isAuthenticated={false}
                  returnPath={returnPath}
                />
              </StorefrontGate>
            )
          )}

          {/* Brand-Wide Loyalty — gated for unclaimed/free-tier on public view */}
          {hasBrandLoyalty && brewery.brand_id && brandName && (
            <div>
              <h2 className="font-display text-2xl font-bold text-[var(--text-primary)] mb-3">
                {brandName} Passport
              </h2>
              {isAuthenticated ? (
                <BrandLoyaltyStampCard
                  brandId={brewery.brand_id}
                  brandName={brandName}
                  breweryId={brewery.id}
                  breweryName={brewery.name}
                />
              ) : hasStorefront ? (
                <AuthGate isAuthenticated={false} featureName="track loyalty stamps" returnPath={returnPath}>
                  <BrandLoyaltyStampCard
                    brandId={brewery.brand_id}
                    brandName={brandName}
                    breweryId={brewery.id}
                    breweryName={brewery.name}
                  />
                </AuthGate>
              ) : (
                <StorefrontGate isUnlocked={hasStorefront} sectionName="Loyalty Program" breweryId={id}>
                  <BrandLoyaltyStampCard
                    brandId={brewery.brand_id}
                    brandName={brandName}
                    breweryId={brewery.id}
                    breweryName={brewery.name}
                  />
                </StorefrontGate>
              )}
            </div>
          )}

          {/* Per-Location Loyalty Programs — gated for unclaimed/free-tier on public view */}
          {!hasBrandLoyalty && (loyaltyPrograms ?? []).length > 0 && (
            <div>
              <h2 className="font-display text-2xl font-bold text-[var(--text-primary)] mb-3">
                Loyalty Program
              </h2>
              {isAuthenticated ? (
                <div className="space-y-4">
                  {(loyaltyPrograms as any[]).map((program: any) => (
                    <LoyaltyStampCard
                      key={program.id}
                      program={program}
                      card={myLoyaltyCards[program.id] ?? null}
                      breweryName={brewery.name}
                      breweryId={brewery.id}
                    />
                  ))}
                </div>
              ) : hasStorefront ? (
                <AuthGate isAuthenticated={false} featureName="earn loyalty stamps" returnPath={returnPath}>
                  <div className="space-y-4">
                    {(loyaltyPrograms as any[]).map((program: any) => (
                      <LoyaltyStampCard
                        key={program.id}
                        program={program}
                        card={null}
                        breweryName={brewery.name}
                        breweryId={brewery.id}
                      />
                    ))}
                  </div>
                </AuthGate>
              ) : (
                <StorefrontGate isUnlocked={hasStorefront} sectionName="Loyalty Program" breweryId={id}>
                  <div className="space-y-4">
                    {(loyaltyPrograms as any[]).map((program: any) => (
                      <LoyaltyStampCard
                        key={program.id}
                        program={program}
                        card={null}
                        breweryName={brewery.name}
                        breweryId={brewery.id}
                      />
                    ))}
                  </div>
                </StorefrontGate>
              )}
            </div>
          )}

          {/* Events — gated for unclaimed/free-tier on public view */}
          {isAuthenticated || hasStorefront ? (
            <BreweryEventsSection
              events={upcomingEvents}
              myEventRsvps={myEventRsvps}
              isAuthenticated={isAuthenticated}
              returnPath={returnPath}
            />
          ) : upcomingEvents.length > 0 ? (
            <StorefrontGate isUnlocked={hasStorefront} sectionName="Events" breweryId={id}>
              <BreweryEventsSection
                events={upcomingEvents}
                myEventRsvps={{}}
                isAuthenticated={false}
                returnPath={returnPath}
              />
            </StorefrontGate>
          ) : null}

          {/* Reviews + Top Visitors */}
          <BreweryReviewsSection
            breweryId={id}
            currentUserId={user?.id ?? null}
            topVisitors={topVisitors}
            isAuthenticated={isAuthenticated}
            returnPath={returnPath}
          />

          {/* Claim This Brewery CTA */}
          {!hasAdmin && (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 text-center space-y-3">
              <p className="text-2xl">🍺</p>
              <h3 className="font-display text-lg font-bold text-[var(--text-primary)]">
                Own this brewery?
              </h3>
              <p className="text-sm text-[var(--text-secondary)] max-w-sm mx-auto">
                Claim your listing to manage your tap list, run loyalty programs, and see
                analytics.
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
    </>
  );
}
