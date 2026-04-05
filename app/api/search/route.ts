// GET /api/search?q=query&limit=8 — Unified typeahead search across beers and breweries
// Sprint 114 — Multi-Location (Avery)

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimitResponse } from "@/lib/rate-limit";
import { parseSearchParams } from "@/lib/schemas";
import { searchQuerySchema } from "@/lib/schemas/search";

export async function GET(req: Request) {
  const rl = rateLimitResponse(req, "search-typeahead", { limit: 60, windowMs: 60_000 });
  if (rl) return rl;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = parseSearchParams(req, searchQuerySchema);
  if (parsed.error) return parsed.error;

  const { q, limit } = parsed.data;

  if (q.trim().length < 2) {
    return NextResponse.json(
      { error: "Query must be at least 2 characters" },
      { status: 400 }
    );
  }

  // Try RPC first (search_all), fall back to direct queries
  const { data: rpcData, error: rpcError } = await (supabase as any).rpc("search_all", {
    query: q,
    result_limit: limit,
  });

  if (!rpcError && rpcData) {
    return NextResponse.json(
      { beers: rpcData.beers ?? [], breweries: rpcData.breweries ?? [] },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  // Fallback: direct ILIKE queries
  const beerLimit = Math.min(limit, 5);
  const breweryLimit = Math.min(limit, 5);

  const [beerResult, breweryResult] = await Promise.all([
    (supabase as any)
      .from("beers")
      .select("id, name, style, abv, brewery:breweries!brewery_id(id, name)")
      .ilike("name", `%${q}%`)
      .eq("is_active", true)
      .order("name", { ascending: true })
      .limit(5),
    (supabase as any)
      .from("breweries")
      .select("id, name, city, state, brewery_type")
      .or(`name.ilike.%${q}%,city.ilike.%${q}%`)
      .order("name", { ascending: true })
      .limit(5),
  ]);

  const beers = (beerResult.data ?? []).map((b: any) => ({
    id: b.id,
    name: b.name,
    style: b.style,
    abv: b.abv,
    brewery: b.brewery ?? null,
  }));

  const breweries = (breweryResult.data ?? []).map((br: any) => ({
    id: br.id,
    name: br.name,
    city: br.city,
    state: br.state,
    brewery_type: br.brewery_type,
  }));

  return NextResponse.json(
    { beers, breweries },
    { headers: { "Cache-Control": "no-store" } }
  );
}
