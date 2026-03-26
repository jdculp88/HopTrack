import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Globe, Phone, Star, Users, ArrowLeft, TrendingUp, Beer, CheckCheck, Award } from "lucide-react";
import type { Brewery } from "@/types/database";
import { BeerCard } from "@/components/beer/BeerCard";
import { BeerStyleBadge } from "@/components/ui/BeerStyleBadge";
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

  // REQ-015: Enhanced brewery stats from sessions + beer_logs
  // 1. Total sessions + unique visitors
  const { data: brewerySessionsRaw } = await (supabase as any)
    .from("sessions")
    .select("user_id")
    .eq("brewery_id", id)
    .eq("is_active", false) as any;
  const brewerySessions = (brewerySessionsRaw ?? []) as any[];
  const totalCheckins = brewerySessions.length;
  const uniqueVisitors = new Set(brewerySessions.map((s: any) => s.user_id)).size;

  // Avg rating from beer_logs
  const { data: breweryLogsRaw } = await (supabase as any)
    .from("beer_logs")
    .select("beer_id, rating, quantity, beer:beers(name)")
    .eq("brewery_id", id) as any;
  const breweryLogs = (breweryLogsRaw ?? []) as any[];
  const ratingsWithValue = breweryLogs.filter((l: any) => l.rating != null && l.rating > 0);
  const avgRating =
    ratingsWithValue.length > 0
      ? ratingsWithValue.reduce((sum: number, l: any) => sum + Number(l.rating), 0) /
        ratingsWithValue.length
      : null;

  // 2. Most popular beer (beer with most logged quantity)
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

  // 3. Beers on tap (active beers)
  const beersOnTap = beers?.length ?? 0;

  // Beer of the Week
  const featuredBeer = (beers as any[] ?? []).find((b: any) => b.is_featured) ?? null;

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

        {/* Beer of the Week */}
        {featuredBeer && (
          <Link href={`/beer/${featuredBeer.id}`}>
            <div className="flex items-center gap-4 p-4 bg-[var(--surface)] border border-[#D4A843]/30 rounded-2xl transition-all hover:border-[#D4A843]/60 group">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #D4A843 0%, #E8841A 100%)" }}>
                <Award size={22} className="text-[#0F0E0C]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-mono uppercase tracking-wider text-[#D4A843] mb-0.5">Beer of the Week</p>
                <p className="font-display font-bold text-[var(--text-primary)] group-hover:text-[#D4A843] transition-colors truncate">
                  {featuredBeer.name}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <BeerStyleBadge style={featuredBeer.style} size="xs" />
                  {featuredBeer.abv && <span className="text-xs font-mono text-[var(--text-muted)]">{featuredBeer.abv}% ABV</span>}
                </div>
              </div>
              {featuredBeer.avg_rating && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Star size={14} className="text-[#D4A843] fill-[#D4A843]" />
                  <span className="font-mono font-bold text-[#D4A843]">{featuredBeer.avg_rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </Link>
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
