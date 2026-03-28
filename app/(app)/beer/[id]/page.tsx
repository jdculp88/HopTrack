import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { WishlistButton } from "@/components/ui/WishlistButton";
import { BeerStyleBadge } from "@/components/ui/BeerStyleBadge";
import { StarRating, RatingDisplay } from "@/components/ui/StarRating";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { generateGradientFromString, formatABV } from "@/lib/utils";
import { BeerReviewSection } from "@/components/beer/BeerReviewSection";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("beers").select("name, style").eq("id", id).single();
  const beer = data as any;
  return { title: beer ? `${beer.name}` : "Beer" };
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
  const beer = beerRaw as any;

  // Recent beer logs for this beer
  const { data: beerLogs } = await (supabase as any)
    .from("beer_logs")
    .select("id, rating, quantity, flavor_tags, serving_style, comment, logged_at, user_id, profile:profiles(id, username, display_name, avatar_url)")
    .eq("beer_id", id)
    .order("logged_at", { ascending: false })
    .limit(20) as any;

  // On wishlist?
  const { data: wishlistItem } = await supabase
    .from("wishlist")
    .select("id")
    .eq("user_id", user.id)
    .eq("beer_id", id)
    .single();

  // Flavor tag frequencies from beer_logs
  const allTags = ((beerLogs as any[]) ?? []).flatMap((l: any) => l.flavor_tags ?? []);
  const tagFreq: Record<string, number> = {};
  allTags.forEach((t: string) => { tagFreq[t] = (tagFreq[t] ?? 0) + 1; });
  const sortedTags = Object.entries(tagFreq).sort((a, b) => b[1] - a[1]).slice(0, 10);

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
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl overflow-hidden">
        <div className="h-40 relative" style={!beer.cover_image_url ? { background: gradient } : undefined}>
          {beer.cover_image_url && (
            <Image src={beer.cover_image_url} alt={beer.name} fill className="object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1C1A16] to-transparent" />
        </div>
        <div className="p-6 -mt-8 relative">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <h1 className="font-display text-3xl font-bold text-[var(--text-primary)] leading-tight">{(beer as any).name}</h1>
              <Link href={`/brewery/${beer.brewery_id}`}>
                <p className="hover:underline text-sm mt-1" style={{ color: "var(--accent-gold)" }}>{brewery?.name}</p>
              </Link>
            </div>
            <WishlistButton beerId={id} initialWishlisted={!!wishlistItem} />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <BeerStyleBadge style={(beer as any).style} size="md" />
            {beer.abv && (
              <span className="font-mono text-sm text-[var(--text-secondary)]">{formatABV(beer.abv)}</span>
            )}
            {beer.ibu && (
              <span className="font-mono text-sm text-[var(--text-muted)]">{beer.ibu} IBU</span>
            )}
          </div>

          {beer.avg_rating && (
            <div className="mt-4">
              <RatingDisplay rating={beer.avg_rating} count={beer.total_ratings} size="md" />
            </div>
          )}

          {beer.description && (
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed mt-4">{beer.description}</p>
          )}
        </div>
      </div>

      {/* Flavor Tag Cloud */}
      {sortedTags.length > 0 && (
        <div>
          <h2 className="font-display text-xl font-bold text-[var(--text-primary)] mb-3">Flavor Profile</h2>
          <div className="flex flex-wrap gap-2">
            {sortedTags.map(([tag, count]) => (
              <span
                key={tag}
                className="px-3 py-1.5 rounded-full text-sm border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)]"
                style={{ fontSize: `${Math.max(11, Math.min(16, 11 + count * 1.5))}px` }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Beer Reviews — dedicated reviews from beer_reviews table */}
      <BeerReviewSection beerId={id} currentUserId={user.id} />

      {/* Activity Log — from beer_logs (session-based) */}
      <div>
        <h2 className="font-display text-xl font-bold text-[var(--text-primary)] mb-4">
          Activity <span className="text-[var(--text-muted)] font-sans text-sm font-normal">({beerLogs?.length ?? 0} pours)</span>
        </h2>
        {beerLogs && beerLogs.length > 0 ? (
          <div className="space-y-3">
            {((beerLogs as any[]) ?? []).map((log: any) => (
              <div key={log.id} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <UserAvatar profile={log.profile} size="sm" />
                  <div className="flex-1 min-w-0">
                    <Link href={`/profile/${log.profile?.username}`} className="font-display font-semibold text-sm text-[var(--text-primary)] hover:text-[#D4A843] transition-colors">
                      {log.profile?.display_name ?? log.profile?.username}
                    </Link>
                    <p className="text-xs text-[var(--text-muted)]">
                      {new Date(log.logged_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                  {log.rating > 0 && (
                    <RatingDisplay rating={log.rating} size="sm" />
                  )}
                </div>
                {log.comment && (
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{log.comment}</p>
                )}
                {log.flavor_tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {log.flavor_tags.map((tag: string) => (
                      <span key={tag} className="px-2 py-0.5 rounded-full text-xs border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-muted)]">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-[var(--surface)] rounded-2xl border border-[var(--border)]">
            <p className="text-3xl mb-2">👋</p>
            <p className="text-[var(--text-secondary)]">Be the first to review this beer!</p>
          </div>
        )}
      </div>
    </div>
  );
}
