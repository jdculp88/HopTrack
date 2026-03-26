import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Globe, Phone, Star, Users, ArrowLeft, TrendingUp, Beer, CheckCheck } from "lucide-react";
import type { Brewery } from "@/types/database";
import { BeerCard } from "@/components/beer/BeerCard";
import { LeaderboardRow } from "@/components/social/LeaderboardRow";
import { generateGradientFromString } from "@/lib/utils";
import BreweryCheckinButton from "@/components/checkin/BreweryCheckinButton";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("breweries").select("name, city, state").eq("id", id).single();
  const d = data as any;
  return { title: d ? `${d.name} · ${d.city}, ${d.state}` : "Brewery" };
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
  const brewery = breweryRaw as any;

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
  const userVisit = userVisitRaw as any;

  // Top visitors leaderboard
  const { data: topVisitorsRaw } = await supabase
    .from("brewery_visits")
    .select("*, profile:profiles(*)")
    .eq("brewery_id", id)
    .order("total_visits", { ascending: false })
    .limit(10);
  const topVisitors = topVisitorsRaw as any[];

  // REQ-015: Enhanced brewery stats
  // 1. Total check-ins + unique visitors + avg rating (single query with aggregates)
  const { data: checkinStatsRaw } = await supabase
    .from("checkins")
    .select("user_id, rating")
    .eq("brewery_id", id) as any;
  const checkinStats = (checkinStatsRaw ?? []) as any[];

  const totalCheckins = checkinStats.length;
  const uniqueVisitors = new Set(checkinStats.map((c: any) => c.user_id)).size;
  const ratingsWithValue = checkinStats.filter((c: any) => c.rating != null && c.rating > 0);
  const avgRating =
    ratingsWithValue.length > 0
      ? ratingsWithValue.reduce((sum: number, c: any) => sum + Number(c.rating), 0) /
        ratingsWithValue.length
      : null;

  // 2. Most popular beer (beer with most check-ins)
  const { data: popularBeerRaw } = await supabase
    .from("checkins")
    .select("beer_id, beer:beers(name)")
    .eq("brewery_id", id) as any;
  const popularBeerCheckins = (popularBeerRaw ?? []) as any[];
  const beerCountMap: Record<string, { name: string; count: number }> = {};
  for (const c of popularBeerCheckins) {
    if (!c.beer_id) continue;
    if (!beerCountMap[c.beer_id]) {
      beerCountMap[c.beer_id] = { name: c.beer?.name ?? "Unknown", count: 0 };
    }
    beerCountMap[c.beer_id].count++;
  }
  const mostPopularBeer =
    Object.values(beerCountMap).sort((a, b) => b.count - a.count)[0] ?? null;

  // 3. Beers on tap (active beers)
  const beersOnTap = beers?.length ?? 0;

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
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F0E0C] via-[#0F0E0C]/60 to-[#0F0E0C]/20" />

        <div className="absolute top-4 left-4">
          <Link href="/explore" className="flex items-center gap-1.5 text-white/70 hover:text-white bg-black/30 backdrop-blur-sm px-3 py-2 rounded-xl text-sm transition-colors">
            <ArrowLeft size={14} />
            Back
          </Link>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6">
          {brewery.brewery_type && (
            <span className="text-xs font-mono text-[#D4A843] uppercase tracking-wider block mb-1">
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
              <span className="flex items-center gap-1 text-[#3D7A52]">
                ✓ {userVisit.total_visits} visit{userVisit.total_visits > 1 ? "s" : ""}
              </span>
            )}
          </div>
          <div className="mt-4">
            <BreweryCheckinButton brewery={brewery as Brewery} />
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-6 space-y-8">
        {/* Info */}
        <div className="flex flex-wrap gap-4 text-sm">
          {brewery.website_url && (
            <a href={brewery.website_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[#D4A843] hover:underline">
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

        {/* REQ-015: Brewery Stats Bar */}
        <div
          className="grid grid-cols-2 sm:grid-cols-5 gap-3"
          role="region"
          aria-label="Brewery statistics"
        >
          {/* Total Check-ins */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
              <CheckCheck size={13} />
              <span className="text-xs font-mono uppercase tracking-wider">Check-ins</span>
            </div>
            <p className="font-display text-2xl font-bold text-[var(--text-primary)] leading-none">
              {totalCheckins.toLocaleString()}
            </p>
          </div>

          {/* Unique Visitors */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
              <Users size={13} />
              <span className="text-xs font-mono uppercase tracking-wider">Visitors</span>
            </div>
            <p className="font-display text-2xl font-bold text-[var(--text-primary)] leading-none">
              {uniqueVisitors.toLocaleString()}
            </p>
          </div>

          {/* Avg Rating */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 flex flex-col gap-1">
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

          {/* Most Popular Beer */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 flex flex-col gap-1 col-span-2 sm:col-span-1">
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

          {/* Beers on Tap */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
              <Beer size={13} />
              <span className="text-xs font-mono uppercase tracking-wider">On Tap</span>
            </div>
            <p className="font-display text-2xl font-bold text-[var(--text-primary)] leading-none">
              {beersOnTap}
            </p>
          </div>
        </div>

        {/* Beer Menu */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-2xl font-bold text-[var(--text-primary)]">Beer Menu</h2>
            <span className="text-sm text-[var(--text-muted)]">{beers?.length ?? 0} beers</span>
          </div>

          {beers && beers.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {(beers as any[]).map((beer) => (
                <BeerCard key={beer.id} beer={beer} variant="grid" />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-[var(--surface)] rounded-2xl border border-[var(--border)]">
              <p className="text-4xl mb-3">🍺</p>
              <p className="font-display text-lg text-[var(--text-primary)]">No beers yet</p>
              <p className="text-sm text-[var(--text-secondary)] mt-1">No beers on the menu yet.</p>
            </div>
          )}
        </div>

        {/* Leaderboard */}
        {topVisitors && topVisitors.length > 0 && (
          <div>
            <h2 className="font-display text-2xl font-bold text-[var(--text-primary)] mb-4">
              Top Visitors
            </h2>
            <div className="space-y-1">
              {(topVisitors as any[]).map((visit, i) => (
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
          </div>
        )}
      </div>
    </div>
  );
}
