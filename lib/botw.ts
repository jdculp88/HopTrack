// Copyright 2026 HopTrack. All rights reserved.
// Personalized "Beer of the Week" — scores active beers by style fit,
// sensory overlap, location, quality, novelty, and the brewery's own
// is_featured boost. Picks one per user per ISO week, caches the result
// in public.botw_picks so it stays stable Mon→Sun and rotates next week.

import type { SupabaseClient } from "@supabase/supabase-js";
import type { FeaturedBeer } from "@/components/social/BeerOfTheWeekCard";

interface BotwCandidate {
  id: string;
  name: string;
  style: string | null;
  abv: number | null;
  glass_type: string | null;
  description: string | null;
  avg_rating: number | null;
  total_ratings: number;
  aroma_notes: string[];
  taste_notes: string[];
  finish_notes: string[];
  is_featured: boolean;
  brewery: {
    id: string;
    name: string;
    city: string | null;
    state: string | null;
  } | null;
}

export interface ScoringContext {
  topStyles: string[];
  preferredAromas: Set<string>;
  preferredTastes: Set<string>;
  preferredFinishes: Set<string>;
  triedBeerIds: Set<string>;
  homeCity: string | null;
  recentCities: Set<string>;
}

export interface BotwScored {
  beer: FeaturedBeer;
  score: number;
  reasons: string[];
}

const FEATURED_BOOST = 15;
const MAX_CANDIDATES = 500;

export function isoWeek(d: Date = new Date()): string {
  const target = new Date(d.valueOf());
  const dayNr = (target.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setUTCMonth(0, 1);
  if (target.getUTCDay() !== 4) {
    target.setUTCMonth(0, 1 + ((4 - target.getUTCDay() + 7) % 7));
  }
  const week = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

function lower(s: string): string {
  return s.toLowerCase();
}

export function scoreBeer(
  beer: BotwCandidate,
  ctx: ScoringContext,
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  // Style fit (0-30)
  if (beer.style && ctx.topStyles.length > 0) {
    const idx = ctx.topStyles.indexOf(beer.style);
    if (idx === 0) {
      score += 30;
      reasons.push(`your top style (${beer.style})`);
    } else if (idx > 0) {
      const pts = Math.max(10, 30 - idx * 5);
      score += pts;
      reasons.push(`one of your styles (${beer.style})`);
    }
  }

  // Sensory fit (0-25)
  let sensoryHits = 0;
  let sensoryTotal = 0;
  for (const n of beer.aroma_notes) {
    sensoryTotal++;
    if (ctx.preferredAromas.has(lower(n))) sensoryHits++;
  }
  for (const n of beer.taste_notes) {
    sensoryTotal++;
    if (ctx.preferredTastes.has(lower(n))) sensoryHits++;
  }
  for (const n of beer.finish_notes) {
    sensoryTotal++;
    if (ctx.preferredFinishes.has(lower(n))) sensoryHits++;
  }
  if (sensoryTotal > 0 && sensoryHits > 0) {
    const overlap = sensoryHits / sensoryTotal;
    const pts = Math.round(overlap * 25);
    score += pts;
    if (pts >= 10) reasons.push("flavor profile match");
  }

  // Location (0-25)
  const breweryCity = beer.brewery?.city ? lower(beer.brewery.city) : null;
  if (breweryCity) {
    if (ctx.homeCity && lower(ctx.homeCity) === breweryCity) {
      score += 25;
      reasons.push(`brewed in ${beer.brewery!.city}`);
    } else if (ctx.recentCities.has(breweryCity)) {
      score += 15;
      reasons.push(`from a brewery near you`);
    }
  }

  // Quality (0-10)
  if (beer.avg_rating != null && beer.total_ratings > 0) {
    const rating = Math.max(0, Math.min(2, beer.avg_rating - 3));
    const popularity = Math.log10(beer.total_ratings + 1);
    score += Math.min(10, Math.round(rating * 3 + popularity * 2));
  }

  // Novelty (0-10)
  if (!ctx.triedBeerIds.has(beer.id)) {
    score += 10;
    reasons.push("new to you");
  }

  // is_featured boost — brewery's voice
  if (beer.is_featured) {
    score += FEATURED_BOOST;
    reasons.push("brewery pick");
  }

  return { score, reasons };
}

async function buildScoringContext(
  supabase: SupabaseClient,
  userId: string,
): Promise<ScoringContext> {
  const [profileRes, logsRes, sessionsRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("home_city")
      .eq("id", userId)
      .maybeSingle(),
    supabase
      .from("beer_logs")
      .select(
        "beer_id, rating, beer:beers(style, aroma_notes, taste_notes, finish_notes)",
      )
      .eq("user_id", userId)
      .limit(500),
    supabase
      .from("sessions")
      .select("brewery:breweries(city)")
      .eq("user_id", userId)
      .not("brewery_id", "is", null)
      .order("started_at", { ascending: false })
      .limit(20),
  ]);

  const profile = (profileRes.data ?? {}) as { home_city: string | null };
  const logs = (logsRes.data ?? []) as unknown as Array<{
    beer_id: string | null;
    rating: number | null;
    beer: {
      style: string | null;
      aroma_notes: string[] | null;
      taste_notes: string[] | null;
      finish_notes: string[] | null;
    } | null;
  }>;
  const sessions = (sessionsRes.data ?? []) as unknown as Array<{
    brewery: { city: string | null } | null;
  }>;

  const styleCounts = new Map<string, number>();
  const aromas = new Set<string>();
  const tastes = new Set<string>();
  const finishes = new Set<string>();
  const tried = new Set<string>();

  for (const log of logs) {
    if (log.beer_id) tried.add(log.beer_id);
    const liked = typeof log.rating === "number" && log.rating >= 3.5;
    const style = log.beer?.style;
    if (style) styleCounts.set(style, (styleCounts.get(style) ?? 0) + 1);
    if (liked && log.beer) {
      for (const n of log.beer.aroma_notes ?? []) aromas.add(lower(n));
      for (const n of log.beer.taste_notes ?? []) tastes.add(lower(n));
      for (const n of log.beer.finish_notes ?? []) finishes.add(lower(n));
    }
  }

  const topStyles = [...styleCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([s]) => s);

  const recentCities = new Set<string>();
  for (const s of sessions) {
    const c = s.brewery?.city;
    if (c) recentCities.add(lower(c));
  }

  return {
    topStyles,
    preferredAromas: aromas,
    preferredTastes: tastes,
    preferredFinishes: finishes,
    triedBeerIds: tried,
    homeCity: profile.home_city ?? null,
    recentCities,
  };
}

async function fetchCandidates(
  supabase: SupabaseClient,
): Promise<BotwCandidate[]> {
  const { data } = await supabase
    .from("beers")
    .select(
      "id, name, style, abv, glass_type, description, avg_rating, total_ratings, aroma_notes, taste_notes, finish_notes, is_featured, brewery:breweries(id, name, city, state)",
    )
    .eq("is_active", true)
    .gte("total_ratings", 1)
    .order("avg_rating", { ascending: false, nullsFirst: false })
    .limit(MAX_CANDIDATES);

  return (data ?? []) as unknown as BotwCandidate[];
}

function toFeaturedBeer(c: BotwCandidate): FeaturedBeer {
  return {
    id: c.id,
    name: c.name,
    style: c.style,
    abv: c.abv,
    glass_type: c.glass_type,
    description: c.description,
    brewery: c.brewery ? { id: c.brewery.id, name: c.brewery.name } : null,
    avg_rating: c.avg_rating,
  };
}

export async function getBeerOfTheWeek(
  supabase: SupabaseClient,
  userId: string,
): Promise<BotwScored | null> {
  const week = isoWeek();

  const { data: cached } = await supabase
    .from("botw_picks")
    .select(
      "score, reasons, beer:beers(id, name, style, abv, glass_type, description, avg_rating, brewery:breweries(id, name))",
    )
    .eq("user_id", userId)
    .eq("iso_week", week)
    .maybeSingle();

  if (cached?.beer) {
    const beer = cached.beer as unknown as FeaturedBeer;
    return {
      beer,
      score: (cached.score as number) ?? 0,
      reasons: (cached.reasons as string[] | null) ?? [],
    };
  }

  const ctx = await buildScoringContext(supabase, userId);
  const candidates = await fetchCandidates(supabase);
  if (candidates.length === 0) return null;

  let best: BotwCandidate | null = null;
  let bestScore = -Infinity;
  let bestReasons: string[] = [];

  for (const c of candidates) {
    const { score, reasons } = scoreBeer(c, ctx);
    if (score > bestScore) {
      best = c;
      bestScore = score;
      bestReasons = reasons;
    }
  }

  if (!best) return null;

  await supabase.from("botw_picks").upsert(
    {
      user_id: userId,
      iso_week: week,
      beer_id: best.id,
      score: bestScore,
      reasons: bestReasons,
    },
    { onConflict: "user_id,iso_week" },
  );

  return {
    beer: toFeaturedBeer(best),
    score: bestScore,
    reasons: bestReasons,
  };
}
