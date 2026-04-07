import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";
import { WishlistButton } from "@/components/ui/WishlistButton";
import { BeerStyleBadge } from "@/components/ui/BeerStyleBadge";
import { RatingDisplay } from "@/components/ui/StarRating";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { generateGradientFromString, formatABV } from "@/lib/utils";
import { beerTransitionName } from "@/lib/view-transitions";
import { BeerReviewSection } from "@/components/beer/BeerReviewSection";
import { getSimilarBeers } from "@/lib/recommendations";
import { getStyleFamily, getStyleVars } from "@/lib/beerStyleColors";
import { Card } from "@/components/ui/Card";
import type { Beer } from "@/types/database";

// Supabase join shapes for tables not in generated types
interface BeerWithBrewery extends Beer {
  brewery: { id: string; name: string; city: string | null } | null;
}

interface BeerLogEntry {
  id: string;
  rating: number | null;
  quantity: number;
  flavor_tags: string[] | null;
  serving_style: string | null;
  comment: string | null;
  logged_at: string;
  user_id: string;
  profile: {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface SimilarBeer {
  id: string;
  name: string;
  style: string | null;
  abv: number | null;
  avg_rating: number | null;
  total_ratings: number;
  brewery: { id: string; name: string; city: string | null } | null;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("beers").select("name, style").eq("id", id).single();
  return { title: data ? `${data.name}` : "Beer" };
}

export default async function BeerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: beerRaw } = await supabase
    .from("beers")
    .select("*, brewery:breweries(*)")
    .eq("id", id)
    .single();

  if (!beerRaw) notFound();
  const beer = beerRaw as BeerWithBrewery;

  // Recent beer logs for this beer
  const { data: beerLogsRaw } = await supabase // supabase join shape
    .from("beer_logs")
    .select("id, rating, quantity, flavor_tags, serving_style, comment, logged_at, user_id, profile:profiles(id, username, display_name, avatar_url)")
    .eq("beer_id", id)
    .order("logged_at", { ascending: false })
    .limit(20);
  const beerLogs = (beerLogsRaw ?? []) as unknown as BeerLogEntry[];

  // On wishlist?
  const { data: wishlistItem } = await supabase
    .from("wishlist")
    .select("id")
    .eq("user_id", user.id)
    .eq("beer_id", id)
    .single();

  // Flavor tag frequencies from beer_logs
  const allTags = beerLogs.flatMap((l) => l.flavor_tags ?? []);
  const tagFreq: Record<string, number> = {};
  allTags.forEach((t: string) => { tagFreq[t] = (tagFreq[t] ?? 0) + 1; });
  const sortedTags = Object.entries(tagFreq).sort((a, b) => b[1] - a[1]).slice(0, 10);

  // Similar beers
  const similarBeers = (await getSimilarBeers(id, beer.style, beer.brewery_id).catch(() => [])) as SimilarBeer[];

  const gradient = generateGradientFromString(beer.name + beer.brewery_id);
  const brewery = beer.brewery;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-8">
      {/* Back */}
      <Link href={`/brewery/${beer.brewery_id}`} className="inline-flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm transition-colors">
        <ArrowLeft size={14} />
        {brewery?.name ?? "Back"}
      </Link>

      {/* Header */}
      <Card elevated className="!rounded-3xl overflow-hidden !p-0">
        <div className="h-56 relative" style={!beer.cover_image_url ? { background: gradient } : undefined}>
          {beer.cover_image_url && (
            <Image src={beer.cover_image_url} alt={beer.name} fill className="object-cover" />
          )}
          {/* Two-layer gradient: bottom fade + subtle top vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-transparent to-[var(--bg)]/20" />
        </div>
        <div className="p-6 -mt-12 relative">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <h1 className="font-display text-3xl font-bold text-[var(--text-primary)] leading-tight" style={beerTransitionName(id)}>{beer.name}</h1>
              <Link href={`/brewery/${beer.brewery_id}`}>
                <p className="hover:underline text-sm mt-1" style={{ color: "var(--accent-gold)" }}>{brewery?.name}</p>
              </Link>
            </div>
            <WishlistButton beerId={id} initialWishlisted={!!wishlistItem} />
          </div>

          {/* Metadata stat pills */}
          <div className="inline-flex flex-wrap items-center gap-2 bg-[var(--surface-2)] rounded-xl px-3 py-2">
            <BeerStyleBadge style={beer.style} size="md" />
            {beer.abv && (
              <span className="font-mono text-sm text-[var(--text-secondary)]">{formatABV(beer.abv)}</span>
            )}
            {beer.ibu && (
              <>
                <span className="text-[var(--border)]">·</span>
                <span className="font-mono text-sm text-[var(--text-muted)]">{beer.ibu} IBU</span>
              </>
            )}
          </div>

          {beer.avg_rating && (
            <div className="mt-4" style={(beer.avg_rating ?? 0) >= 4.5 ? { filter: "drop-shadow(0 0 6px var(--accent-gold))" } : undefined}>
              <RatingDisplay rating={beer.avg_rating} count={beer.total_ratings} size="md" />
            </div>
          )}

          {beer.description && (
            <div className="mt-4 rounded-xl p-3 bg-[var(--surface-2)]/50">
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{beer.description}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Flavor Tag Cloud — audit #26: style-colored tasting note badges */}
      {sortedTags.length > 0 && (() => {
        const styleVars = getStyleVars(beer.style, beer.item_type);
        return (
          <div>
            <h2 className="font-display text-xl font-bold text-[var(--text-primary)] mb-3">Flavor Profile</h2>
            <div className="flex flex-wrap gap-2">
              {sortedTags.map(([tag, count]) => (
                <span
                  key={tag}
                  className="px-3 py-1.5 rounded-[8px] font-mono font-semibold border"
                  style={{
                    fontSize: `${Math.max(10.5, Math.min(14, 10.5 + count * 1))}px`,
                    background: `color-mix(in srgb, ${styleVars.primary} 10%, transparent)`,
                    color: styleVars.primary,
                    borderColor: `color-mix(in srgb, ${styleVars.primary} 20%, transparent)`,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Similar Beers */}
      {similarBeers.length > 0 && (
        <div>
          <h2 className="font-display text-xl font-bold text-[var(--text-primary)] mb-3">Similar Beers</h2>
          <div className="grid grid-cols-2 gap-3">
            {similarBeers.map((similar) => (
              <Link key={similar.id} href={`/beer/${similar.id}`}>
                <Card bgClass="card-bg-reco" padding="compact" hoverable flat className="!rounded-xl" data-style={getStyleFamily(similar.style)}>
                  <p className="font-display font-bold text-sm truncate text-[var(--text-primary)]">{similar.name}</p>
                  {similar.brewery && (
                    <p className="text-[10px] truncate text-[var(--text-muted)] mt-0.5">{similar.brewery.name}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1.5">
                    {similar.style && <BeerStyleBadge style={similar.style} size="xs" />}
                    {(similar.avg_rating ?? 0) > 0 && (
                      <span className="text-xs font-mono text-[var(--accent-gold)]">★ {similar.avg_rating!.toFixed(1)}</span>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Beer Reviews — dedicated reviews from beer_reviews table */}
      <BeerReviewSection beerId={id} currentUserId={user.id} />

      {/* Activity Log — audit #24: group by user, hierarchy (review vs rating-only), cap at 10 */}
      <div>
        <h2 className="font-display text-xl font-bold text-[var(--text-primary)] mb-4">
          Activity <span className="text-[var(--text-muted)] font-sans text-sm font-normal">({beerLogs?.length ?? 0} pours)</span>
        </h2>
        {beerLogs && beerLogs.length > 0 ? (() => {
          // Group by user
          const userGroups = new Map<string, typeof beerLogs>();
          for (const log of beerLogs) {
            const uid = log.user_id;
            if (!userGroups.has(uid)) userGroups.set(uid, []);
            userGroups.get(uid)!.push(log);
          }
          const groups = Array.from(userGroups.values());
          const sv = getStyleVars(beer.style, beer.item_type);

          return (
            <div className="space-y-2">
              {groups.slice(0, 10).map((userLogs) => {
                const profile = userLogs[0].profile;
                const hasComment = userLogs.some(l => l.comment);
                const avgRating = userLogs.filter(l => (l.rating ?? 0) > 0).reduce((s, l) => s + (l.rating ?? 0), 0) / Math.max(userLogs.filter(l => (l.rating ?? 0) > 0).length, 1);

                // Full card for users with comments
                if (hasComment) {
                  const commentLog = userLogs.find(l => l.comment)!;
                  return (
                    <Card key={commentLog.id}>
                      <div className="flex items-center gap-3 mb-2">
                        <UserAvatar profile={profile ?? { display_name: null, avatar_url: null }} size="sm" />
                        <div className="flex-1 min-w-0">
                          <Link href={`/profile/${profile?.username}`} className="font-display font-semibold text-sm text-[var(--text-primary)] hover:text-[var(--accent-gold)] transition-colors">
                            {profile?.display_name ?? profile?.username}
                          </Link>
                          <p className="text-xs text-[var(--text-muted)]">
                            {userLogs.length} pour{userLogs.length > 1 ? "s" : ""} · avg ★ {avgRating.toFixed(1)}
                          </p>
                        </div>
                        {avgRating > 0 && <RatingDisplay rating={avgRating} size="sm" />}
                      </div>
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{commentLog.comment}</p>
                      {(commentLog.flavor_tags?.length ?? 0) > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {commentLog.flavor_tags!.map((tag: string) => (
                            <span key={tag} className="px-2 py-0.5 rounded-[6px] text-[10.5px] font-mono font-semibold border" style={{ background: `color-mix(in srgb, ${sv.primary} 10%, transparent)`, color: sv.primary, borderColor: `color-mix(in srgb, ${sv.primary} 20%, transparent)` }}>{tag}</span>
                          ))}
                        </div>
                      )}
                    </Card>
                  );
                }

                // Compact row for rating-only users — NO card wrapper per audit spec
                return (
                  <div
                    key={userLogs[0].id}
                    className="flex items-center gap-2.5 py-2 px-1"
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    <UserAvatar profile={profile ?? { display_name: null, avatar_url: null }} size="sm" />
                    <div className="flex-1 min-w-0">
                      <span className="text-[13px] font-medium" style={{ color: "var(--text-secondary)" }}>
                        {profile?.display_name ?? profile?.username}
                      </span>
                      {userLogs.length > 1 && (
                        <span className="text-[10px] font-mono ml-1.5" style={{ color: "var(--text-muted)" }}>
                          · {userLogs.length} pours
                        </span>
                      )}
                    </div>
                    {avgRating > 0 && (
                      <span className="font-mono text-[13px]" style={{ color: "var(--amber, var(--accent-gold))" }}>
                        ★ {avgRating.toFixed(1)}
                      </span>
                    )}
                  </div>
                );
              })}
              {groups.length > 10 && (
                <p className="text-center text-sm py-3" style={{ color: "var(--text-muted)" }}>
                  + {groups.length - 10} more drinkers
                </p>
              )}
            </div>
          );
        })() : (
          <Card flat className="text-center py-12">
            <div className="w-12 h-12 rounded-[14px] flex items-center justify-center mx-auto mb-3"
                 style={{ background: "var(--warm-bg, var(--surface-2))" }}>
              <Users size={24} style={{ color: "var(--text-muted)" }} />
            </div>
            <p className="text-[var(--text-secondary)]">Be the first to review this beer!</p>
          </Card>
        )}
      </div>
    </div>
  );
}
