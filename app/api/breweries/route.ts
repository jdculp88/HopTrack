import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  searchBreweries,
  getBreweriesByLocation,
  mapOpenBreweryToDb,
} from "@/lib/openbrewerydb";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);

  const q = searchParams.get("q");
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const limit = parseInt(searchParams.get("limit") ?? "10");

  if (lat && lng) {
    // Nearby breweries: first check DB, then Open Brewery DB
    const { data: dbBreweries } = await supabase
      .from("breweries")
      .select("*")
      .not("latitude", "is", null)
      .limit(50);

    // Simple distance filter (rough)
    const latN = parseFloat(lat);
    const lngN = parseFloat(lng);
    const nearby = (dbBreweries ?? []).filter((b) => {
      if (!b.latitude || !b.longitude) return false;
      const dLat = Math.abs(b.latitude - latN);
      const dLng = Math.abs(b.longitude - lngN);
      return dLat < 0.1 && dLng < 0.15; // ~10km
    }).slice(0, limit);

    if (nearby.length > 0) {
      return NextResponse.json({ breweries: nearby }, { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=120' } });
    }

    // Fallback to Open Brewery DB
    const raw = await getBreweriesByLocation(latN, lngN, limit);
    const mapped = raw.map(mapOpenBreweryToDb);

    // Upsert into DB for future use
    for (const brewery of mapped) {
      await supabase
        .from("breweries")
        .upsert(brewery, { onConflict: "external_id", ignoreDuplicates: true });
    }

    return NextResponse.json({ breweries: mapped }, { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=120' } });
  }

  if (q) {
    // Search: check DB first
    const { data: dbResults } = await supabase
      .from("breweries")
      .select("*")
      .ilike("name", `%${q}%`)
      .limit(limit);

    if (dbResults && dbResults.length >= 5) {
      return NextResponse.json({ breweries: dbResults }, { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=120' } });
    }

    // Supplement with Open Brewery DB
    const raw = await searchBreweries(q, limit);
    const mapped = raw.map(mapOpenBreweryToDb);

    for (const brewery of mapped) {
      await supabase
        .from("breweries")
        .upsert(brewery, { onConflict: "external_id", ignoreDuplicates: true });
    }

    // Re-fetch from DB (includes both existing and newly upserted)
    const { data: merged } = await supabase
      .from("breweries")
      .select("*")
      .ilike("name", `%${q}%`)
      .limit(limit);

    return NextResponse.json({ breweries: merged ?? [] }, { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=120' } });
  }

  // Default: return recently added / trending breweries
  const { data } = await supabase
    .from("breweries")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  return NextResponse.json({ breweries: data ?? [] }, { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=120' } });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { name, brewery_type, street, city, state, postal_code, country, latitude, longitude, website_url, phone } = body;

  if (!name?.trim()) return NextResponse.json({ error: "name required" }, { status: 400 });

  const { data, error } = await supabase
    .from("breweries")
    .insert({
      name: name.trim(),
      brewery_type,
      street,
      city,
      state,
      postal_code,
      country,
      latitude,
      longitude,
      website_url,
      phone,
      created_by: user.id,
      verified: false,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ brewery: data }, { status: 201 });
}
