import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Brewery, BreweryVisit, Profile } from "@/types/database";
import { generateGradientFromString } from "@/lib/utils";
import { BreweryHeroSection } from "./BreweryHeroSection";
import { BreweryHeroShrink } from "./BreweryHeroShrink";
import { BreweryDetailClient } from "./BreweryDetailClient";
import { getCachedBreweryDetailMetadata, getCachedBreweryPublicData } from "@/lib/cached-data";

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

// ─── Metadata ────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getCachedBreweryDetailMetadata(id);
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

  // ── Core brewery + beers data (cached — Sprint 158) ──
  const { brewery: breweryRaw, beers } = await getCachedBreweryPublicData(id);
  if (!breweryRaw) notFound();
  const brewery = breweryRaw as Brewery;

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
    // eslint-disable-next-line react-hooks/rules-of-hooks -- server component, Date.now() is fine
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
        .gte("started_at", sixHoursAgo)
        .lt("started_at", new Date().toISOString());
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
  const [{ count: totalCheckins }, { data: brewerySessionsRaw }] = await Promise.all([
    supabase.from("sessions").select("id", { count: "exact", head: true }).eq("brewery_id", id).eq("is_active", false) as any,
    supabase.from("sessions").select("user_id").eq("brewery_id", id).eq("is_active", false).limit(50000),
  ]);
  const brewerySessions = (brewerySessionsRaw ?? []) as { user_id: string }[];
  const uniqueVisitors = new Set(brewerySessions.map((s) => s.user_id)).size;

  const { data: breweryLogsRaw } = await supabase // supabase join shape
    .from("beer_logs")
    .select("beer_id, rating, quantity, beer:beers(name)")
    .eq("brewery_id", id)
    .limit(50000);
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
        {/* Hero with scroll-linked darkening */}
        <BreweryHeroShrink>
          <BreweryHeroSection
            brewery={brewery}
            userVisit={userVisit}
            gradient={gradient}
            isAuthenticated={isAuthenticated}
            returnPath={returnPath}
          />
        </BreweryHeroShrink>

        <div className="py-6">
          <BreweryDetailClient
            brewery={brewery}
            userVisit={userVisit}
            isAuthenticated={isAuthenticated}
            currentUserId={user?.id ?? null}
            returnPath={returnPath}
            hasAdmin={hasAdmin}
            hasStorefront={hasStorefront}
            isClosed={isClosed}
            totalCheckins={totalCheckins ?? 0}
            uniqueVisitors={uniqueVisitors}
            avgRating={avgRating}
            mostPopularBeer={mostPopularBeer}
            beersOnTap={beersOnTap}
            friendsHere={friendsHere as any}
            topVisitors={topVisitors}
            beers={beers ?? []}
            breweryMenus={breweryMenus ?? []}
            upcomingEvents={upcomingEvents}
            activeChallenges={activeChallenges}
            myParticipations={myParticipations}
            myEventRsvps={myEventRsvps}
            mugClubs={mugClubs}
            myMugMemberships={myMugMemberships}
            loyaltyPrograms={loyaltyPrograms ?? null}
            myLoyaltyCards={myLoyaltyCards}
            brandName={brandName}
            hasBrandLoyalty={hasBrandLoyalty}
          />
        </div>
      </div>
    </>
  );
}
