import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { MapPin, Settings, Star } from "lucide-react";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { AchievementBadge } from "@/components/achievements/AchievementBadge";
import { CheckinCard } from "@/components/social/CheckinCard";
import { ProfileBanner } from "@/components/profile/ProfileBanner";
import { BeerStyleBadge } from "@/components/ui/BeerStyleBadge";
import { AchievementsGrid } from "./AchievementsGrid";
import { getLevelProgress } from "@/lib/xp";
import { generateGradientFromString, formatABV } from "@/lib/utils";

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
  const gradient = generateGradientFromString(profile.display_name + username);

  // Fetch earned achievements
  const { data: userAchievements } = await supabase
    .from("user_achievements")
    .select("*, achievement:achievements(*)")
    .eq("user_id", profile.id)
    .order("earned_at", { ascending: false });

  // Recent check-ins
  const { data: checkins } = await supabase
    .from("checkins")
    .select("*, profile:profiles(*), brewery:breweries(*), beer:beers(*)")
    .eq("user_id", profile.id)
    .eq("share_to_feed", true)
    .order("created_at", { ascending: false })
    .limit(10);

  // Top breweries
  const { data: topBreweries } = await supabase
    .from("brewery_visits")
    .select("*, brewery:breweries(*)")
    .eq("user_id", profile.id)
    .order("total_visits", { ascending: false })
    .limit(3);

  // Favorite beer — most checked-in beer for this user
  const { data: favBeerRows } = await supabase
    .from("checkins")
    .select("beer_id, beer:beers(*)")
    .eq("user_id", profile.id)
    .not("beer_id", "is", null);

  const favBeer = (() => {
    if (!favBeerRows || favBeerRows.length === 0) return null;
    const counts: Record<string, { beer: any; count: number }> = {};
    for (const row of favBeerRows as any[]) {
      if (!row.beer_id) continue;
      counts[row.beer_id] = {
        beer: row.beer,
        count: (counts[row.beer_id]?.count ?? 0) + 1,
      };
    }
    return Object.values(counts).sort((a, b) => b.count - a.count)[0] ?? null;
  })();

  return (
    <div className="max-w-3xl mx-auto">
      {/* Hero Banner */}
      <div className="relative h-48 sm:h-64 overflow-hidden">
        <ProfileBanner
          username={username}
          displayName={(profile as any).display_name}
          bannerUrl={(profile as any).banner_url}
        />
        {/* gradient overlay — stronger at bottom for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F0E0C] via-[#0F0E0C]/30 to-transparent" />
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
          <div className="ring-4 ring-[#0F0E0C] rounded-full">
            <UserAvatar profile={profile} size="xl" />
          </div>
          <div className="pb-1 flex-1 min-w-0">
            <h1 className="font-display text-2xl font-bold text-[var(--text-primary)] leading-tight">{profile.display_name}</h1>
            <p className="text-sm text-[var(--text-muted)]">@{profile.username}</p>
          </div>
        </div>

        {/* Level + XP */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 mb-6 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-mono text-[#D4A843] uppercase tracking-wider">Level {profile.level}</span>
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
              className="h-full bg-gradient-to-r from-[#D4A843] to-[#E8841A] rounded-full transition-all duration-1000"
              style={{ width: `${levelInfo.progress}%` }}
            />
          </div>
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

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="text-center bg-[var(--surface)] border border-[var(--border)] rounded-2xl py-5">
            <p className="font-display text-3xl font-bold text-[#D4A843]">{profile.total_checkins}</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">Check-ins</p>
          </div>
          <div className="text-center bg-[var(--surface)] border border-[var(--border)] rounded-2xl py-5">
            <p className="font-display text-3xl font-bold text-[#D4A843]">{profile.unique_beers}</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">Unique Beers</p>
          </div>
          <div className="text-center bg-[var(--surface)] border border-[var(--border)] rounded-2xl py-5">
            <p className="font-display text-3xl font-bold text-[#D4A843]">{profile.unique_breweries}</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">Breweries</p>
          </div>
        </div>

        {/* Favorite Beer */}
        <div className="mb-8">
          <h2 className="font-display text-xl font-bold text-[var(--text-primary)] mb-4">Favorite Beer</h2>
          {favBeer ? (
            <Link href={`/beer/${favBeer.beer.id}`}>
              <div className="flex items-center gap-4 p-4 bg-[var(--surface)] border border-[var(--border)] hover:border-[#D4A843]/40 rounded-2xl transition-all group">
                <div
                  className="w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center text-2xl"
                  style={{ background: generateGradientFromString(favBeer.beer.name ?? "") }}
                >
                  🍺
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-bold text-[var(--text-primary)] group-hover:text-[#D4A843] transition-colors truncate">
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
                      <Star size={11} className="text-[#D4A843] fill-[#D4A843]" />
                      <span className="text-sm font-mono font-bold text-[#D4A843]">
                        {favBeer.beer.avg_rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                  <p className="text-xs text-[var(--text-muted)]">{favBeer.count}× checked in</p>
                </div>
              </div>
            </Link>
          ) : (
            <div className="flex items-center gap-4 p-4 bg-[var(--surface)] border border-dashed border-[var(--border)] rounded-2xl">
              <div className="w-14 h-14 rounded-2xl bg-[var(--surface-2)] flex items-center justify-center text-2xl opacity-40">
                🍺
              </div>
              <div>
                <p className="text-[var(--text-secondary)] text-sm">No favorite yet</p>
                <p className="text-[var(--text-muted)] text-xs mt-0.5">Your most-checked-in beer will appear here</p>
              </div>
            </div>
          )}
        </div>

        {/* Achievements */}
        {userAchievements && userAchievements.length > 0 && (
          <div className="mb-8">
            <AchievementsGrid achievements={userAchievements as any[]} />
          </div>
        )}

        {/* Top Breweries */}
        {topBreweries && topBreweries.length > 0 && (
          <div className="mb-8">
            <h2 className="font-display text-xl font-bold text-[var(--text-primary)] mb-4">Favorite Breweries</h2>
            <div className="space-y-3">
              {(topBreweries as any[]).map((visit) => (
                <Link key={visit.id} href={`/brewery/${visit.brewery_id}`}>
                  <div className="flex items-center gap-3 p-3 bg-[var(--surface)] border border-[var(--border)] hover:border-[#D4A843]/30 rounded-2xl transition-colors">
                    <div
                      className="w-12 h-12 rounded-xl"
                      style={{ background: generateGradientFromString(visit.brewery?.name ?? "") }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-semibold text-[var(--text-primary)] truncate">{visit.brewery?.name}</p>
                      <p className="text-xs text-[var(--text-muted)]">{visit.brewery?.city}, {visit.brewery?.state}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-[#D4A843]">{visit.total_visits}</p>
                      <p className="text-xs text-[var(--text-muted)]">visits</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recent Check-ins */}
        <div className="pb-8">
          <h2 className="font-display text-xl font-bold text-[var(--text-primary)] mb-4">Beer Journal</h2>
          {checkins && checkins.length > 0 ? (
            <div className="space-y-4">
              {(checkins as any[]).map((c) => (
                <CheckinCard key={c.id} checkin={c} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-[var(--surface)] rounded-2xl border border-[var(--border)]">
              <p className="text-[var(--text-secondary)]">No check-ins yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
