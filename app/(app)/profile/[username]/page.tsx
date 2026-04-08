import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Settings } from "lucide-react";
import { FriendButton } from "@/components/social/FriendButton";
import { getInitials } from "@/lib/utils";
import { getLevelProgress } from "@/lib/xp";
import { StyleBanner, getStyleBannerPalette } from "@/components/profile/StyleBanner";
import { PageEnterWrapper } from "@/components/ui/PageEnterWrapper";
import { calculateDrinkerKPIs } from "@/lib/kpi";
import { ProfileTabs } from "./ProfileTabs";
import { FourFavorites, type PinnedBeerItem } from "@/components/profile/FourFavorites";
import { PersonalityBadge } from "@/components/profile/PersonalityBadge";
import { computePersonality } from "@/lib/personality";
import { computeTemporalProfile } from "@/lib/temporal";

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("display_name").eq("username", username).single();
  return { title: data?.display_name ?? username };
}

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (!profile) notFound();

  const isOwnProfile = profile.id === user.id;
  const levelInfo = getLevelProgress(profile.xp);

  // One year ago (for heatmap + beer_logs scoping)
  const oneYearAgo = new Date();
  oneYearAgo.setDate(oneYearAgo.getDate() - 365);
  const oneYearAgoIso = oneYearAgo.toISOString();

  // Fetch earned achievements
  const { data: userAchievements } = await supabase
    .from("user_achievements")
    .select("*, achievement:achievements(*)")
    .eq("user_id", profile.id)
    .order("earned_at", { ascending: false });

  // Recent beer logs (Beer Journal — last 10)
  const { data: recentLogs } = await supabase
    .from("beer_logs")
    .select("id, beer_id, rating, quantity, flavor_tags, serving_style, comment, logged_at, beer:beers(id, name, style, abv, cover_image_url, brewery_id, brewery:breweries(name)), session:sessions(brewery_id, brewery:breweries(name, city, state))")
    .eq("user_id", profile.id)
    .order("logged_at", { ascending: false })
    .limit(10) as any;

  // Top breweries — 10 (was 3)
  const { data: topBreweries } = await supabase
    .from("brewery_visits")
    .select("*, brewery:breweries(*)")
    .eq("user_id", profile.id)
    .order("total_visits", { ascending: false })
    .limit(10);

  // Wishlist (own profile only)
  const wishlist = isOwnProfile
    ? (await supabase
        .from("wishlist")
        .select("*, beer:beers(id, name, style, abv, brewery_id, brewery:breweries(name))")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(12)).data ?? []
    : [];

  // Beer lists — own gets all, others get public only
  const beerListsQuery = supabase
    .from("beer_lists")
    .select("id, title, description, is_public, items:beer_list_items(id)")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });
  if (!isOwnProfile) beerListsQuery.eq("is_public", true);
  const { data: beerLists } = await beerListsQuery;

  // Beer logs for favorite beer + style DNA + heatmap (last 365 days)
  const { data: yearBeerLogs } = await supabase
    .from("beer_logs")
    .select("beer_id, quantity, rating, logged_at, beer:beers(*)")
    .eq("user_id", profile.id)
    .gte("logged_at", oneYearAgoIso)
    .limit(50000) as any;

  // Favorite beer — most logged beer this year
  const favBeer = (() => {
    if (!yearBeerLogs || yearBeerLogs.length === 0) return null;
    const counts: Record<string, { beer: any; count: number }> = {};
    for (const row of yearBeerLogs as any[]) {
      if (!row.beer_id) continue;
      counts[row.beer_id] = {
        beer: row.beer,
        count: (counts[row.beer_id]?.count ?? 0) + (row.quantity ?? 1),
      };
    }
    return Object.values(counts).sort((a, b) => b.count - a.count)[0] ?? null;
  })();

  // Mug club memberships
  const { data: mugClubMemberships } = await (supabase
    .from("mug_club_members")
    .select("id, status, joined_at, expires_at, mug_club:mug_clubs(id, name, brewery_id, annual_fee, perks), brewery:mug_clubs!inner(brewery:breweries(id, name, city, state))")
    .eq("user_id", profile.id)
    .eq("status", "active") as any);

  // ── Drinker KPI data ──────────────────────────────────────────────────
  const [
    { data: drinkerSessions },
    { data: drinkerBreweries },
    { count: friendCount },
    { count: reactionCount },
    { count: commentCount },
    { count: totalAchievementCount },
  ] = await Promise.all([
    supabase
      .from("sessions")
      .select("id, started_at, ended_at, brewery_id")
      .eq("user_id", profile.id)
      .eq("is_active", false) as any,
    supabase
      .from("breweries")
      .select("id, city, state") as any,
    supabase
      .from("friendships")
      .select("id", { count: "exact", head: true })
      .or(`user_id.eq.${profile.id},friend_id.eq.${profile.id}`)
      .eq("status", "accepted"),
    supabase
      .from("reactions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", profile.id),
    supabase
      .from("session_comments")
      .select("id", { count: "exact", head: true })
      .eq("user_id", profile.id),
    supabase
      .from("achievements")
      .select("id", { count: "exact", head: true }),
  ]);

  const drinkerKPIs = calculateDrinkerKPIs({
    sessions: ((drinkerSessions as any[]) ?? []),
    beerLogs: ((yearBeerLogs as any[]) ?? []).map((r: any) => ({
      beer_id: r.beer_id,
      rating: r.rating,
      quantity: r.quantity,
      logged_at: r.logged_at ?? new Date().toISOString(),
      beer: r.beer ? { style: r.beer.style, abv: r.beer.abv } : undefined,
    })),
    breweries: (drinkerBreweries as any[]) ?? [],
    friendCount: friendCount ?? 0,
    reactionCount: reactionCount ?? 0,
    commentCount: commentCount ?? 0,
    achievementCount: (userAchievements as any[])?.length ?? 0,
    totalAchievements: totalAchievementCount ?? 0,
  });

  // Taste DNA — style distribution from beer logs
  const styleDNA = (() => {
    if (!yearBeerLogs || yearBeerLogs.length === 0) return [];
    const styleMap: Record<string, { count: number; totalRating: number; ratedCount: number }> = {};
    for (const row of yearBeerLogs as any[]) {
      const style = row.beer?.style;
      if (!style) continue;
      if (!styleMap[style]) styleMap[style] = { count: 0, totalRating: 0, ratedCount: 0 };
      styleMap[style].count += row.quantity ?? 1;
      if (row.rating != null && row.rating > 0) {
        styleMap[style].totalRating += row.rating;
        styleMap[style].ratedCount++;
      }
    }
    return Object.entries(styleMap)
      .map(([style, data]) => ({
        style,
        count: data.count,
        avgRating: data.ratedCount > 0 ? data.totalRating / data.ratedCount : null,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  })();

  // ── Sprint 162 (The Identity) — pinned beers, snapshot, personality, temporal ──
  const { data: pinnedBeersRaw } = await supabase
    .from("user_pinned_beers")
    .select("beer_id, position, beer:beers(id, name, style, item_type, abv, avg_rating, cover_image_url, brewery:breweries(id, name))")
    .eq("user_id", profile.id)
    .order("position", { ascending: true }) as any;

  const pinnedBeers: PinnedBeerItem[] = ((pinnedBeersRaw as any[]) ?? []).map((row) => ({
    beer_id: row.beer_id,
    position: row.position,
    beer: row.beer ?? null,
  }));

  const { data: snapshotRow } = await supabase
    .from("user_stats_snapshots")
    .select("total_beers_percentile, unique_styles_percentile, top_style, top_style_percentile")
    .eq("user_id", profile.id)
    .maybeSingle() as any;

  const raritySnapshot = snapshotRow
    ? {
        total_beers_percentile: snapshotRow.total_beers_percentile,
        unique_styles_percentile: snapshotRow.unique_styles_percentile,
        top_style: snapshotRow.top_style,
        top_style_percentile: snapshotRow.top_style_percentile,
      }
    : null;

  // Compute personality from yearBeerLogs (needs beer.style + beer.item_type)
  const personality = computePersonality(
    ((yearBeerLogs as any[]) ?? []).map((r: any) => ({
      beer_id: r.beer_id,
      rating: r.rating,
      beer: r.beer
        ? { id: r.beer.id, style: r.beer.style, item_type: r.beer.item_type }
        : null,
    })),
  );

  // Temporal profile (day-of-week + hour breakdown)
  const temporalProfile = computeTemporalProfile(
    ((yearBeerLogs as any[]) ?? [])
      .filter((r: any) => r.logged_at)
      .map((r: any) => ({ logged_at: r.logged_at })),
  );

  // Heatmap — aggregate pours by date (with dominant style per day)
  const heatmapData = (() => {
    if (!yearBeerLogs || yearBeerLogs.length === 0) return [];
    const byDate: Record<string, { count: number; styles: Record<string, number> }> = {};
    for (const row of yearBeerLogs as any[]) {
      if (!row.logged_at) continue;
      const date = String(row.logged_at).split("T")[0];
      if (!byDate[date]) byDate[date] = { count: 0, styles: {} };
      byDate[date].count += row.quantity ?? 1;
      const style = row.beer?.style;
      if (style) {
        byDate[date].styles[style] = (byDate[date].styles[style] ?? 0) + (row.quantity ?? 1);
      }
    }
    return Object.entries(byDate).map(([date, data]) => {
      const dominantStyle = Object.entries(data.styles).sort((a, b) => b[1] - a[1])[0]?.[0];
      return { date, count: data.count, style: dominantStyle };
    });
  })();

  // Dominant beer style for banner
  const dominantStyle = styleDNA[0]?.style ?? null;
  const totalBeers = styleDNA.reduce((sum, s) => sum + s.count, 0);
  const { palette: bannerPalette, label: styleLabel } = getStyleBannerPalette(dominantStyle);

  return (
    <PageEnterWrapper>
      <div className="max-w-3xl mx-auto">
        {/* Profile hero — centered layout, beer-style dark gradient banner */}
        <div
          className="relative mx-4 mt-4 overflow-hidden"
          style={{
            borderRadius: "20px",
            background: "var(--card-bg)",
            border: "1px solid var(--border)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
          }}
        >
          {/* Dark beer-style gradient banner */}
          <StyleBanner style={dominantStyle} height={100}>
            {/* Style identity label */}
            <div
              className="absolute top-3 left-4 flex items-center gap-1.5 font-mono uppercase"
              style={{ fontSize: "10px", letterSpacing: "0.06em" }}
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: bannerPalette.dot }}
              />
              <span style={{ color: "rgba(255,255,255,0.7)" }}>{styleLabel}</span>
              <span style={{ color: "rgba(255,255,255,0.4)" }}>·</span>
              <span style={{ color: "rgba(255,255,255,0.5)" }}>{totalBeers} BEERS</span>
            </div>
            {isOwnProfile && (
              <Link
                href="/settings"
                className="absolute top-3 right-3 p-2 rounded-xl bg-black/30 backdrop-blur-sm text-white/70 hover:text-white transition-colors z-10"
              >
                <Settings size={16} />
              </Link>
            )}
          </StyleBanner>

          {/* Centered content below banner */}
          <div style={{ padding: "0 24px 22px" }}>
            {/* Avatar — 72px circle, 4px card-bg outer ring, gold glow */}
            <div className="flex justify-center" style={{ marginTop: "-36px" }}>
              <div
                className="rounded-full flex-shrink-0"
                style={{
                  padding: "4px",
                  background: "var(--card-bg)",
                  boxShadow: "0 0 0 1px var(--border), 0 4px 16px rgba(196, 136, 62, 0.25)",
                }}
              >
                {profile.avatar_url ? (
                  <div
                    className="relative rounded-full overflow-hidden"
                    style={{ width: "72px", height: "72px" }}
                  >
                    <Image
                      src={profile.avatar_url}
                      alt={profile.display_name ?? ""}
                      fill
                      className="object-cover"
                      sizes="72px"
                    />
                  </div>
                ) : (
                  <div
                    className="rounded-full flex items-center justify-center"
                    style={{
                      width: "72px",
                      height: "72px",
                      background: "linear-gradient(135deg, var(--accent-gold), var(--accent-amber, var(--accent-gold)))",
                    }}
                  >
                    <span
                      className="font-sans font-bold"
                      style={{ fontSize: "26px", color: "#fff" }}
                    >
                      {getInitials(profile.display_name ?? "")}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Name */}
            <h1
              className="text-center font-sans font-bold"
              style={{ fontSize: "24px", letterSpacing: "-0.02em", color: "var(--text-primary)", marginTop: "6px" }}
            >
              {profile.display_name}
            </h1>

            {/* Handle */}
            <p
              className="text-center font-mono"
              style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "1px" }}
            >
              @{profile.username}
            </p>

            {/* Bio */}
            {profile.bio && (
              <p
                className="text-center mx-auto font-sans"
                style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "12px", maxWidth: "400px", lineHeight: "1.5" }}
              >
                {profile.bio}
              </p>
            )}

            {/* Location */}
            {profile.home_city && (
              <p
                className="flex items-center justify-center gap-1.5"
                style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "8px" }}
              >
                <MapPin size={13} style={{ color: "var(--accent-gold)" }} />
                {profile.home_city}
              </p>
            )}

            {/* Friend button (other profiles) */}
            {!isOwnProfile && (
              <div className="flex justify-center" style={{ marginTop: "12px" }}>
                <FriendButton profileId={profile.id} currentUserId={user.id} />
              </div>
            )}

            {/* Quick stats — separator + row */}
            <div
              style={{
                marginTop: "16px",
                paddingTop: "16px",
                borderTop: "1px solid var(--border)",
              }}
            >
              <div className="flex justify-center" style={{ gap: "24px" }}>
                <div className="text-center">
                  <span className="font-sans font-bold" style={{ fontSize: "16px", color: "var(--text-primary)" }}>
                    {profile.total_checkins ?? 0}
                  </span>
                  <span className="font-sans" style={{ fontSize: "12px", color: "var(--text-muted)", marginLeft: "4px" }}>
                    sessions
                  </span>
                </div>
                <div className="text-center">
                  <span className="font-sans font-bold" style={{ fontSize: "16px", color: "var(--text-primary)" }}>
                    {profile.unique_beers ?? 0}
                  </span>
                  <span className="font-sans" style={{ fontSize: "12px", color: "var(--text-muted)", marginLeft: "4px" }}>
                    beers
                  </span>
                </div>
                <div className="text-center">
                  <span className="font-sans font-bold" style={{ fontSize: "16px", color: "var(--text-primary)" }}>
                    {profile.unique_breweries ?? 0}
                  </span>
                  <span className="font-sans" style={{ fontSize: "12px", color: "var(--text-muted)", marginLeft: "4px" }}>
                    breweries
                  </span>
                </div>
                <div className="text-center">
                  <span className="font-sans font-bold" style={{ fontSize: "16px", color: "var(--text-primary)" }}>
                    {friendCount ?? 0}
                  </span>
                  <span className="font-sans" style={{ fontSize: "12px", color: "var(--text-muted)", marginLeft: "4px" }}>
                    friends
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 mt-4">

          {/* Sprint 162 (The Identity) — Personality badge */}
          <PersonalityBadge
            personality={personality}
            userId={profile.id}
            isOwnProfile={isOwnProfile}
          />
          {/* Sprint 171: Four Favorites removed — doesn't work without real beer cover images */}

          {/* Tabs */}
          <ProfileTabs
            activityData={{
              recentLogs: (recentLogs as any[]) ?? [],
              favBeer,
              currentStreak: profile.current_streak ?? 0,
              longestStreak: profile.longest_streak ?? 0,
              freezesAvailable: profile.streak_freezes_available ?? 0,
            }}
            statsData={{
              username,
              userId: profile.id,
              isOwnProfile,
              profileStats: {
                total_checkins: profile.total_checkins ?? 0,
                unique_beers: profile.unique_beers ?? 0,
                unique_breweries: profile.unique_breweries ?? 0,
                current_streak: profile.current_streak ?? 0,
                longest_streak: profile.longest_streak ?? 0,
                level: profile.level ?? 1,
                xp: profile.xp ?? 0,
              },
              levelInfo,
              drinkerKPIs,
              styleDNA,
              heatmapData,
              raritySnapshot,
              temporalProfile,
            }}
            listsData={{
              isOwnProfile,
              wishlist: (wishlist as any[]) ?? [],
              beerLists: (beerLists as any[]) ?? [],
              achievements: (userAchievements as any[]) ?? [],
            }}
            breweriesData={{
              topBreweries: (topBreweries as any[]) ?? [],
              mugClubMemberships: (mugClubMemberships as any[]) ?? [],
            }}
          />
        </div>
      </div>
    </PageEnterWrapper>
  );
}
