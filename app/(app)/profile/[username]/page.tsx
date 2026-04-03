import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { MapPin, Settings, Star, Bookmark, Stamp, Flame } from "lucide-react";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { ProfileBanner } from "@/components/profile/ProfileBanner";
import { BeerStyleBadge } from "@/components/ui/BeerStyleBadge";
import { AchievementsGrid } from "./AchievementsGrid";
import { FriendButton } from "@/components/social/FriendButton";
import { getLevelProgress } from "@/lib/xp";
import { generateGradientFromString, formatABV } from "@/lib/utils";
import { getStyleFamily, getStyleVars } from "@/lib/beerStyleColors";
import { BeerDNACard } from "@/components/profile/BeerDNACard";
import { EmptyState } from "@/components/ui/EmptyState";
import { DrinkerStatsCard } from "@/components/profile/DrinkerStatsCard";
import { PageEnterWrapper } from "@/components/ui/PageEnterWrapper";
import { MugClubMemberships } from "@/components/profile/MugClubMemberships";
import { calculateDrinkerKPIs } from "@/lib/kpi";

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

  // Fetch earned achievements
  const { data: userAchievements } = await supabase
    .from("user_achievements")
    .select("*, achievement:achievements(*)")
    .eq("user_id", profile.id)
    .order("earned_at", { ascending: false });

  // Recent beer logs (Beer Journal)
  const { data: recentLogs } = await supabase
    .from("beer_logs")
    .select("id, beer_id, rating, quantity, flavor_tags, serving_style, comment, logged_at, beer:beers(id, name, style, abv, cover_image_url, brewery_id, brewery:breweries(name)), session:sessions(brewery_id, brewery:breweries(name, city, state))")
    .eq("user_id", profile.id)
    .order("logged_at", { ascending: false })
    .limit(10) as any;

  // Top breweries
  const { data: topBreweries } = await supabase
    .from("brewery_visits")
    .select("*, brewery:breweries(*)")
    .eq("user_id", profile.id)
    .order("total_visits", { ascending: false })
    .limit(3);

  // Wishlist (own profile only)
  const wishlist = isOwnProfile
    ? (await supabase
        .from("wishlist")
        .select("*, beer:beers(id, name, style, abv, brewery_id, brewery:breweries(name))")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(6)).data ?? []
    : [];

  // Favorite beer — most logged beer for this user
  const { data: favBeerRows } = await supabase
    .from("beer_logs")
    .select("beer_id, quantity, rating, beer:beers(*)")
    .eq("user_id", profile.id) as any;

  const favBeer = (() => {
    if (!favBeerRows || favBeerRows.length === 0) return null;
    const counts: Record<string, { beer: any; count: number }> = {};
    for (const row of favBeerRows as any[]) {
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

  // ── Drinker KPI data (Sprint 124) ──────────────────────────────────────
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
    beerLogs: ((favBeerRows as any[]) ?? []).map((r: any) => ({
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
    if (!favBeerRows || favBeerRows.length === 0) return [];
    const styleMap: Record<string, { count: number; totalRating: number; ratedCount: number }> = {};
    for (const row of favBeerRows as any[]) {
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
  return (
    <PageEnterWrapper>
    <div className="max-w-3xl mx-auto">
      {/* Hero Banner */}
      <div className="relative h-48 sm:h-64 mx-4 mt-4 rounded-2xl overflow-hidden">
        <ProfileBanner
          username={username}
          displayName={profile.display_name}
          bannerUrl={profile.banner_url}
        />
        {/* gradient overlay — stronger at bottom for readability */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, var(--bg), color-mix(in srgb, var(--bg) 30%, transparent), transparent)" }} />
        {isOwnProfile && (
          <Link
            href="/settings"
            className="absolute top-4 right-4 p-2.5 rounded-xl bg-black/30 backdrop-blur-sm text-white/70 hover:text-white transition-colors"
          >
            <Settings size={18} />
          </Link>
        )}
      </div>

      <div className="px-4 sm:px-6 -mt-12 relative z-10">
        {/* Avatar + Info */}
        <div className="flex items-end gap-4 mb-6">
          <div className="ring-4 ring-[var(--bg)] rounded-full">
            <UserAvatar profile={profile} size="xl" />
          </div>
          <div className="pb-1 flex-1 min-w-0">
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-[var(--text-primary)] leading-tight drop-shadow-lg">{profile.display_name}</h1>
            <p className="text-sm text-[var(--text-muted)]">@{profile.username}</p>
          </div>
          {!isOwnProfile && (
            <div className="pb-1">
              <FriendButton profileId={profile.id} currentUserId={user.id} />
            </div>
          )}
        </div>

        {/* Stats — single merged card */}
        <div className="card-bg-stats border border-[var(--border)] rounded-2xl p-4 mb-6">
          <div className="grid grid-cols-4 gap-2">
            <div className="text-center rounded-2xl py-3 px-1" style={{ background: "color-mix(in srgb, var(--surface-2) 55%, transparent)" }}>
              <p className="font-mono font-bold text-xl leading-none text-[var(--accent-gold)]">{profile.total_checkins}</p>
              <p className="text-[10px] text-[var(--text-muted)] mt-1 font-mono uppercase tracking-wide">Sessions</p>
            </div>
            <div className="text-center rounded-2xl py-3 px-1" style={{ background: "color-mix(in srgb, var(--surface-2) 55%, transparent)" }}>
              <p className="font-mono font-bold text-xl leading-none text-[var(--accent-gold)]">{profile.unique_beers}</p>
              <p className="text-[10px] text-[var(--text-muted)] mt-1 font-mono uppercase tracking-wide">Unique Beers</p>
            </div>
            <div className="text-center rounded-2xl py-3 px-1" style={{ background: "color-mix(in srgb, var(--surface-2) 55%, transparent)" }}>
              <p className="font-mono font-bold text-xl leading-none text-[var(--accent-gold)]">{profile.unique_breweries}</p>
              <p className="text-[10px] text-[var(--text-muted)] mt-1 font-mono uppercase tracking-wide">Breweries</p>
            </div>
            <div className="text-center rounded-2xl py-3 px-1" style={{ background: "color-mix(in srgb, var(--surface-2) 55%, transparent)" }}>
              <p className="font-mono font-bold text-xl leading-none" style={{ color: (profile.current_streak ?? 0) > 0 ? "var(--accent-amber)" : "var(--accent-gold)" }}>
                {profile.current_streak ?? 0}
              </p>
              <p className="text-[10px] text-[var(--text-muted)] mt-1 font-mono uppercase tracking-wide">Day Streak</p>
            </div>
          </div>
        </div>

        {/* Level + XP Progress */}
        <div className="card-bg-stats border border-[var(--border)] rounded-2xl p-4 mb-6 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-mono text-[var(--accent-gold)] uppercase tracking-wider">Level {profile.level}</span>
              <p className="font-display font-semibold text-[var(--text-primary)]">{levelInfo.current.name}</p>
            </div>
            {levelInfo.next && (
              <div className="text-right">
                <p className="text-xs text-[var(--text-muted)]">Next: {levelInfo.next.name}</p>
                <p className="text-xs font-mono text-[var(--text-secondary)]">{levelInfo.xpToNext} XP to go</p>
              </div>
            )}
          </div>
          <div className="h-2 bg-[var(--surface-2)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{ background: "linear-gradient(to right, var(--accent-gold), var(--accent-amber))", width: `${levelInfo.progress}%` }}
            />
          </div>
          {(profile.current_streak > 0 || profile.longest_streak > 0) && (
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[var(--border)]">
              {profile.current_streak > 0 && (
                <div className="flex items-center gap-1.5">
                  <Flame
                    size={14}
                    className={profile.current_streak >= 30 ? "text-[var(--accent-amber)]" : profile.current_streak >= 7 ? "text-[var(--accent-gold)]" : "text-[var(--text-muted)]"}
                  />
                  <span className="text-sm font-mono font-bold" style={{ color: profile.current_streak >= 7 ? 'var(--accent-gold)' : 'var(--text-secondary)' }}>
                    {profile.current_streak}
                  </span>
                  <span className="text-xs text-[var(--text-muted)]">day streak</span>
                </div>
              )}
              {profile.longest_streak > profile.current_streak && (
                <div className="flex items-center gap-1 ml-auto">
                  <span className="text-xs text-[var(--text-muted)]">Best: {profile.longest_streak}d</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Drinker Stats (Sprint 124) */}
        <div className="mb-6">
          <DrinkerStatsCard kpis={drinkerKPIs} username={username} isOwnProfile={isOwnProfile} />
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="text-[var(--text-secondary)] leading-relaxed mb-4">{profile.bio}</p>
        )}
        {profile.home_city && (
          <p className="flex items-center gap-1.5 text-sm text-[var(--text-muted)] mb-6">
            <MapPin size={13} />
            {profile.home_city}
          </p>
        )}

        {/* Beer Passport Link */}
        <Link
          href={`/profile/${username}/passport`}
          className="card-bg-featured flex items-center gap-3 p-4 mb-8 border border-[var(--border)] hover:border-[var(--accent-gold)]/40 rounded-2xl transition-all group"
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, var(--accent-gold), var(--accent-amber))" }}>
            <Stamp size={18} className="text-[var(--bg)]" />
          </div>
          <div className="flex-1">
            <p className="font-display font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-gold)] transition-colors">Beer Passport</p>
            <p className="text-xs text-[var(--text-muted)]">{profile.unique_beers} unique beers &middot; {styleDNA.length} of 26 styles explored</p>
            <div className="mt-1.5 h-1 rounded-full overflow-hidden" style={{ backgroundColor: "var(--surface-2)" }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${Math.min((styleDNA.length / 26) * 100, 100)}%`, backgroundColor: "var(--accent-gold)" }} />
            </div>
          </div>
          <span className="text-[var(--text-muted)] text-sm">→</span>
        </Link>

        {/* Beer DNA */}
        <div className="mb-8">
          {styleDNA.length >= 3 ? (
            <BeerDNACard styleDNA={styleDNA} username={username} />
          ) : (
            <EmptyState
              emoji="🧬"
              title="Unlock Your Beer DNA"
              description="Check in 3+ different beer styles to reveal your taste profile"
              size="sm"
            />
          )}
        </div>

        {/* Want to Try (Wishlist) */}
        {isOwnProfile && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Bookmark size={18} className="text-[var(--accent-gold)]" />
              <h2 className="font-display text-2xl font-bold text-[var(--text-primary)]">Want to Try</h2>
            </div>
            {(wishlist as any[]).length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(wishlist as any[]).map((item: any) => (
                  <Link key={item.id} href={`/beer/${item.beer?.id}`}>
                    <div className="card-bg-reco flex items-center gap-3 p-3 border border-[var(--border)] hover:border-[var(--accent-gold)]/30 rounded-2xl transition-colors" data-style={getStyleFamily(item.beer?.style)}>
                      <div
                        className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-lg"
                        style={{ background: `linear-gradient(135deg, ${getStyleVars(item.beer?.style).light}, ${getStyleVars(item.beer?.style).soft ?? getStyleVars(item.beer?.style).light})` }}
                      >
                        🍺
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-display font-semibold text-sm text-[var(--text-primary)] truncate">{item.beer?.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {item.beer?.style && <BeerStyleBadge style={item.beer.style} size="xs" />}
                          <span className="text-xs text-[var(--text-muted)] truncate">{item.beer?.brewery?.name}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <Link href="/explore">
                <div className="flex items-center gap-4 p-4 bg-[var(--surface)] border border-dashed border-[var(--border)] hover:border-[var(--accent-gold)]/30 rounded-2xl transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-[var(--surface-2)] flex items-center justify-center text-lg opacity-40">
                    🍺
                  </div>
                  <div>
                    <p className="text-[var(--text-secondary)] text-sm font-medium">Save beers you want to try</p>
                    <p className="text-[var(--text-muted)] text-xs mt-0.5">Tap the heart on any beer to add it to your list</p>
                  </div>
                </div>
              </Link>
            )}
          </div>
        )}

        {/* Favorite Beer */}
        <div className="mb-8">
          <h2 className="font-display text-2xl font-bold text-[var(--text-primary)] mb-4">Favorite Beer</h2>
          {favBeer ? (
            <Link href={`/beer/${favBeer.beer.id}`}>
              <div className="card-bg-reco flex items-center gap-4 p-4 border border-[var(--border)] hover:border-[var(--accent-gold)]/40 rounded-2xl transition-all group" data-style={getStyleFamily(favBeer.beer.style)}>
                <div
                  className="w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center text-2xl"
                  style={{ background: `linear-gradient(135deg, ${getStyleVars(favBeer.beer.style).light}, ${getStyleVars(favBeer.beer.style).soft ?? getStyleVars(favBeer.beer.style).light})` }}
                >
                  🍺
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-gold)] transition-colors truncate">
                    {favBeer.beer.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    {favBeer.beer.style && <BeerStyleBadge style={favBeer.beer.style} size="xs" />}
                    {favBeer.beer.abv && (
                      <span className="text-xs font-mono text-[var(--text-muted)]">{formatABV(favBeer.beer.abv)}</span>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  {favBeer.beer.avg_rating && (
                    <div className="flex items-center gap-1 justify-end mb-0.5">
                      <Star size={11} className="text-[var(--accent-gold)] fill-[var(--accent-gold)]" />
                      <span className="text-sm font-mono font-bold text-[var(--accent-gold)]">
                        {favBeer.beer.avg_rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                  <p className="text-xs text-[var(--text-muted)]">{favBeer.count}× poured</p>
                </div>
              </div>
            </Link>
          ) : (
            <div className="text-center py-10 bg-[var(--surface)] rounded-2xl border border-[var(--border)]">
              <p className="text-3xl mb-2">🍺</p>
              <p className="font-display text-base text-[var(--text-primary)]">Still exploring the menu</p>
              <p className="text-sm text-[var(--text-secondary)] mt-1">Your most-poured beer will earn its spot here.</p>
            </div>
          )}
        </div>

        {/* Achievements */}
        <div className="mb-8 card-bg-achievement rounded-2xl p-5" style={{ border: "1px solid var(--border)" }}>
          {userAchievements && userAchievements.length > 0 ? (
            <AchievementsGrid achievements={userAchievements as any[]} />
          ) : (
            <div>
              <h2 className="font-display text-2xl font-bold text-[var(--text-primary)] mb-4">Achievements</h2>
              <Link href="/achievements">
                <div className="text-center py-10 bg-[var(--surface)] rounded-2xl border border-[var(--border)] hover:border-[var(--accent-gold)]/30 transition-colors">
                  <p className="text-3xl mb-2">🏆</p>
                  <p className="font-display text-base text-[var(--text-primary)]">No badges yet</p>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">Log beers, visit breweries, and unlock achievements along the way.</p>
                </div>
              </Link>
            </div>
          )}
        </div>

        {/* Mug Club Memberships */}
        <div className="mb-8">
          {mugClubMemberships && mugClubMemberships.length > 0 ? (
            <MugClubMemberships memberships={mugClubMemberships as any[]} />
          ) : (
            <EmptyState
              emoji="🍺"
              title="Join a Mug Club"
              description="Members get exclusive perks at their favorite breweries"
              size="sm"
            />
          )}
        </div>

        {/* Top Breweries */}
        <div className="mb-8">
          <h2 className="font-display text-2xl font-bold text-[var(--text-primary)] mb-4">Favorite Breweries</h2>
          {topBreweries && topBreweries.length > 0 ? (
            <div className="space-y-3">
              {(topBreweries as any[]).map((visit) => (
                <Link key={visit.id} href={`/brewery/${visit.brewery_id}`}>
                  <div className="card-bg-hoproute flex items-center gap-3 p-3 border border-[var(--border)] hover:border-[var(--accent-amber)]/40 rounded-2xl transition-colors">
                    <div
                      className="w-12 h-12 rounded-xl flex-shrink-0"
                      style={{ background: generateGradientFromString(visit.brewery?.name ?? "") }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-semibold text-[var(--text-primary)] truncate">{visit.brewery?.name}</p>
                      <p className="text-xs text-[var(--text-muted)]">{visit.brewery?.city}, {visit.brewery?.state}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-[var(--accent-gold)]">{visit.total_visits}</p>
                      <p className="text-xs text-[var(--text-muted)]">visits</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <Link href="/explore">
              <div className="text-center py-10 bg-[var(--surface)] rounded-2xl border border-[var(--border)] hover:border-[var(--accent-gold)]/30 transition-colors">
                <p className="text-3xl mb-2">🏠</p>
                <p className="font-display text-base text-[var(--text-primary)]">No regular haunts yet</p>
                <p className="text-sm text-[var(--text-secondary)] mt-1">Visit a few taprooms and your favorites will show up here.</p>
              </div>
            </Link>
          )}
        </div>

        {/* Beer Journal */}
        <div className="pb-8">
          <h2 className="font-display text-2xl font-bold text-[var(--text-primary)] mb-4">Beer Journal</h2>
          {recentLogs && recentLogs.length > 0 ? (
            <div className="space-y-3">
              {(recentLogs as any[]).map((log: any) => (
                <Link key={log.id} href={`/beer/${log.beer?.id}`}>
                  <div className="card-bg-reco flex items-center gap-3 p-3 border border-[var(--border)] hover:border-[var(--accent-gold)]/30 rounded-2xl transition-colors" data-style={getStyleFamily(log.beer?.style)}>
                    <div
                      className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-lg"
                      style={{ background: `linear-gradient(135deg, ${getStyleVars(log.beer?.style).light}, ${getStyleVars(log.beer?.style).soft ?? getStyleVars(log.beer?.style).light})` }}
                    >
                      🍺
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-semibold text-sm text-[var(--text-primary)] truncate">{log.beer?.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {log.beer?.style && <BeerStyleBadge style={log.beer.style} size="xs" />}
                        <span className="text-xs text-[var(--text-muted)]">
                          {log.session?.brewery?.name ?? "At home"}
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {log.rating > 0 && (
                        <div className="flex items-center gap-1 justify-end mb-0.5">
                          <Star size={11} className="text-[var(--accent-gold)] fill-[var(--accent-gold)]" />
                          <span className="text-sm font-mono font-bold text-[var(--accent-gold)]">{log.rating}</span>
                        </div>
                      )}
                      <p className="text-xs text-[var(--text-muted)]">
                        {new Date(log.logged_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-[var(--surface)] rounded-2xl border border-[var(--border)]">
              <p className="text-3xl mb-2">📓</p>
              <p className="font-display text-base text-[var(--text-primary)]">The journal is empty</p>
              <p className="text-sm text-[var(--text-secondary)] mt-1">Start a session to begin tracking your pours.</p>
            </div>
          )}
        </div>
      </div>
    </div>
    </PageEnterWrapper>
  );
}
