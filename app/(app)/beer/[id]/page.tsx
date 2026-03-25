import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Bookmark, BookmarkCheck } from "lucide-react";
import { BeerStyleBadge } from "@/components/ui/BeerStyleBadge";
import { StarRating, RatingDisplay } from "@/components/ui/StarRating";
import { CheckinCard } from "@/components/social/CheckinCard";
import { generateGradientFromString, formatABV } from "@/lib/utils";

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

  // Recent check-ins for this beer
  const { data: checkins } = await supabase
    .from("checkins")
    .select("*, profile:profiles(*), brewery:breweries(*), beer:beers(*)")
    .eq("beer_id", id)
    .order("created_at", { ascending: false })
    .limit(20);

  // On wishlist?
  const { data: wishlistItem } = await supabase
    .from("wishlist")
    .select("id")
    .eq("user_id", user.id)
    .eq("beer_id", id)
    .single();

  // Flavor tag frequencies
  const allTags = (checkins ?? []).flatMap((c: any) => c.flavor_tags ?? []);
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
                <p className="text-[#D4A843] hover:underline text-sm mt-1">{brewery?.name}</p>
              </Link>
            </div>
            <button className="p-2 rounded-xl bg-[var(--surface-2)] text-[var(--text-secondary)] hover:text-[#D4A843] transition-colors flex-shrink-0">
              {wishlistItem ? <BookmarkCheck size={18} className="text-[#D4A843]" /> : <Bookmark size={18} />}
            </button>
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

      {/* Recent Check-ins */}
      <div>
        <h2 className="font-display text-xl font-bold text-[var(--text-primary)] mb-4">
          Recent Reviews <span className="text-[var(--text-muted)] font-sans text-sm font-normal">({checkins?.length ?? 0})</span>
        </h2>
        {checkins && checkins.length > 0 ? (
          <div className="space-y-4">
            {(checkins as any[]).map((c) => (
              <CheckinCard key={c.id} checkin={c} />
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
