import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { MapPin, Settings } from "lucide-react";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { ProfileBanner } from "@/components/profile/ProfileBanner";
import { FriendButton } from "@/components/social/FriendButton";
import { getLevelProgress } from "@/lib/xp";
import { generateGradientFromString } from "@/lib/utils";
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
  const _gradient = generateGradientFromString(profile.display_name + username);

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

  return (
    <PageEnterWrapper>
      <div className="max-w-3xl mx-auto">
        {/* Sprint 171: Profile hero — seamless Instagram-style integration */}
        <div className="relative mx-4 mt-4 rounded-[14px] overflow-hidden shadow-[var(--shadow-elevated)]">
          {/* Banner image */}
          <div className="h-36 sm:h-44">
            <ProfileBanner
              username={username}
              displayName={profile.display_name}
              bannerUrl={profile.banner_url}
            />
          </div>
          {/* Gradient fade into content area */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(to top, var(--card-bg) 0%, color-mix(in srgb, var(--card-bg) 60%, transparent) 35%, transparent 60%)",
            }}
          />
          {isOwnProfile && (
            <Link
              href="/settings"
              className="absolute top-3 right-3 p-2 rounded-xl bg-black/30 backdrop-blur-sm text-white/70 hover:text-white transition-colors z-20"
            >
              <Settings size={16} />
            </Link>
          )}

          {/* Avatar + name — positioned INSIDE the hero, over the gradient */}
          <div className="relative z-10 px-5 pb-4 -mt-10">
            <div className="flex items-end gap-3.5">
              <div className="rounded-full shadow-[var(--shadow-elevated)] flex-shrink-0">
                <UserAvatar profile={profile} size="lg" />
              </div>
              <div className="pb-0.5 flex-1 min-w-0">
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--text-primary)] leading-tight">
                  {profile.display_name}
                </h1>
                <p className="text-xs text-[var(--text-muted)]">@{profile.username}</p>
              </div>
              {!isOwnProfile && (
                <div className="pb-1 flex-shrink-0">
                  <FriendButton profileId={profile.id} currentUserId={user.id} />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 mt-4">

          {/* Bio + Location */}
          {profile.bio && (
            <p className="text-[var(--text-secondary)] leading-relaxed mb-4">{profile.bio}</p>
          )}
          {profile.home_city && (
            <p className="flex items-center gap-1.5 text-sm text-[var(--text-muted)] mb-6">
              <MapPin size={13} />
              {profile.home_city}
            </p>
          )}

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
