/**
 * Cached data-fetching functions for "use cache" migration.
 * Sprint 158 — The Cache
 *
 * Each function uses createServiceClient (no cookies) so it's safe
 * inside "use cache" scopes. Pages read auth/cookies first, then
 * call these functions with explicit IDs.
 */

import { cacheLife, cacheTag } from "next/cache";
import { createServiceClient } from "@/lib/supabase/service";

// ─── Brewery Welcome Page ────────────────────────────────────────────────────

export async function getCachedBreweryWelcomeData(breweryId: string) {
  "use cache";
  cacheLife("hop-static");
  cacheTag(`brewery-${breweryId}`);

  const service = createServiceClient();

  const [breweryRes, beersRes, eventsRes] = await Promise.all([
    (service as any)
      .from("breweries")
      .select("id, name, city, state, brewery_type, description, cover_image_url, website_url, phone")
      .eq("id", breweryId)
      .maybeSingle(),
    (service as any)
      .from("beers")
      .select("id, name, style, abv, ibu, description, is_featured, avg_rating, total_ratings, price_per_pint, glass_type")
      .eq("brewery_id", breweryId)
      .eq("is_on_tap", true)
      .order("display_order", { ascending: true })
      .order("name"),
    (service as any)
      .from("brewery_events")
      .select("id, title, event_date, start_time")
      .eq("brewery_id", breweryId)
      .gte("event_date", new Date().toISOString().split("T")[0])
      .order("event_date", { ascending: true })
      .limit(5),
  ]);

  const brewery = breweryRes.data;
  const allBeers = beersRes.data ?? [];
  const events = eventsRes.data ?? [];

  // Fetch pour sizes
  const beerIds = allBeers.map((b: any) => b.id);
  const pourSizesMap: Record<string, any[]> = {};

  if (beerIds.length > 0) {
    const { data: pourSizes } = await (service as any)
      .from("beer_pour_sizes")
      .select("beer_id, label, oz, price, display_order")
      .in("beer_id", beerIds)
      .order("display_order", { ascending: true });

    if (pourSizes) {
      for (const ps of pourSizes) {
        if (!pourSizesMap[ps.beer_id]) pourSizesMap[ps.beer_id] = [];
        pourSizesMap[ps.beer_id].push({ label: ps.label, oz: ps.oz, price: ps.price });
      }
    }
  }

  const beers = allBeers.map((beer: any) => ({
    ...beer,
    pour_sizes: pourSizesMap[beer.id] ?? [],
  }));

  return { brewery, beers, events };
}

// ─── Brewery Welcome Metadata ────────────────────────────────────────────────

export async function getCachedBreweryWelcomeMetadata(breweryId: string) {
  "use cache";
  cacheLife("hop-static");
  cacheTag(`brewery-${breweryId}`);

  const service = createServiceClient();

  const { data: brewery } = await (service as any)
    .from("breweries")
    .select("name, city, state, description")
    .eq("id", breweryId)
    .maybeSingle();

  if (!brewery) return null;

  const { count } = await (service as any)
    .from("beers")
    .select("id", { count: "exact", head: true })
    .eq("brewery_id", breweryId)
    .eq("is_on_tap", true);

  return { brewery, beerCount: count ?? 0 };
}

// ─── Embed Menu Page ─────────────────────────────────────────────────────────

export async function getCachedEmbedMenuData(breweryId: string) {
  "use cache";
  cacheLife("hop-standard");
  cacheTag(`brewery-${breweryId}`);

  const service = createServiceClient();

  const [breweryRes, beersRes, eventsRes] = await Promise.all([
    (service as any)
      .from("breweries")
      .select("id, name, city, state, brewery_type, description, cover_image_url")
      .eq("id", breweryId)
      .maybeSingle(),
    (service as any)
      .from("beers")
      .select("id, name, style, abv, ibu, description, is_featured, avg_rating, total_ratings, price_per_pint, glass_type")
      .eq("brewery_id", breweryId)
      .eq("is_on_tap", true)
      .order("display_order", { ascending: true })
      .order("name"),
    (service as any)
      .from("brewery_events")
      .select("id, title, event_date, start_time")
      .eq("brewery_id", breweryId)
      .gte("event_date", new Date().toISOString().split("T")[0])
      .order("event_date", { ascending: true })
      .limit(5),
  ]);

  // Fetch pour sizes
  const beerIds = (beersRes.data ?? []).map((b: any) => b.id);
  const pourSizesMap: Record<string, any[]> = {};

  if (beerIds.length > 0) {
    const { data: pourSizes } = await (service as any)
      .from("beer_pour_sizes")
      .select("beer_id, label, oz, price, display_order")
      .in("beer_id", beerIds)
      .order("display_order", { ascending: true });

    if (pourSizes) {
      for (const ps of pourSizes) {
        if (!pourSizesMap[ps.beer_id]) pourSizesMap[ps.beer_id] = [];
        pourSizesMap[ps.beer_id].push({ label: ps.label, oz: ps.oz, price: ps.price });
      }
    }
  }

  const beers = (beersRes.data ?? []).map((beer: any) => ({
    ...beer,
    pour_sizes: pourSizesMap[beer.id] ?? [],
  }));

  return { brewery: breweryRes.data, beers, events: eventsRes.data ?? [] };
}

// ─── Brand Public Page ───────────────────────────────────────────────────────

export async function getCachedBrandPublicData(slug: string) {
  "use cache";
  cacheLife("hop-standard");
  cacheTag(`brand-${slug}`);

  const service = createServiceClient();

  const { data: brand } = await (service as any)
    .from("brewery_brands")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!brand) return { brand: null, locations: [], hasBrandLoyalty: false };

  const [{ data: locations }, { data: brandLoyaltyPrograms }] = await Promise.all([
    (service as any)
      .from("breweries")
      .select("id, name, city, state, logo_url, cover_image_url, latitude, longitude, description")
      .eq("brand_id", brand.id)
      .order("name"),
    (service as any)
      .from("brand_loyalty_programs")
      .select("id")
      .eq("brand_id", brand.id)
      .eq("is_active", true)
      .limit(1),
  ]);

  return {
    brand,
    locations: locations ?? [],
    hasBrandLoyalty: (brandLoyaltyPrograms?.length ?? 0) > 0,
  };
}

export async function getCachedBrandMetadata(slug: string) {
  "use cache";
  cacheLife("hop-standard");
  cacheTag(`brand-${slug}`);

  const service = createServiceClient();
  const { data: brand } = await (service as any)
    .from("brewery_brands")
    .select("name, description")
    .eq("slug", slug)
    .single();

  return brand;
}

// ─── Brewery Detail Public Data ──────────────────────────────────────────────

export async function getCachedBreweryDetailMetadata(breweryId: string) {
  "use cache";
  cacheLife("hop-standard");
  cacheTag(`brewery-${breweryId}`);

  const service = createServiceClient();
  const { data } = await service
    .from("breweries")
    .select(
      "name, city, state, street, postal_code, country, phone, website_url, description, latitude, longitude, brewery_type",
    )
    .eq("id", breweryId)
    .single();

  return data;
}

export async function getCachedBreweryPublicData(breweryId: string) {
  "use cache";
  cacheLife("hop-standard");
  cacheTag(`brewery-${breweryId}`);

  const service = createServiceClient();

  const [{ data: brewery }, { data: beers }] = await Promise.all([
    service.from("breweries").select("*").eq("id", breweryId).single(),
    service
      .from("beers")
      .select("*, brewery:breweries(id, name)")
      .eq("brewery_id", breweryId)
      .eq("is_active", true)
      .order("total_ratings", { ascending: false }),
  ]);

  return { brewery, beers: beers ?? [] };
}

// ─── Brand Admin Record (used by tap-list + catalog pages) ───────────────────

export async function getCachedBrandRecord(brandId: string) {
  "use cache";
  cacheLife("hop-realtime");
  cacheTag(`brand-${brandId}`);

  const service = createServiceClient();
  const { data: brand } = await (service as any)
    .from("brewery_brands")
    .select("*")
    .eq("id", brandId)
    .single();

  return brand;
}

// ─── Command Center Data ─────────────────────────────────────────────────────

export async function getCachedCommandCenterData(range: "7d" | "30d" | "90d") {
  "use cache";
  cacheLife("hop-realtime");
  cacheTag("command-center");

  // Import dynamically to avoid circular deps
  const { calculateCommandCenterMetrics } = await import("@/lib/superadmin-metrics");
  const service = createServiceClient();
  return calculateCommandCenterMetrics(service, range);
}
