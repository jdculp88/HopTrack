import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimitResponse } from "@/lib/rate-limit";
import { parseSearchParams } from "@/lib/schemas";
import { beerSearchSchema } from "@/lib/schemas/beers";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = parseSearchParams(request, beerSearchSchema);
  if (parsed.error) return parsed.error;

  const { q, brewery_id, style, limit } = parsed.data;

  let query = supabase
    .from("beers")
    .select("*, brewery:breweries(id, name, city, state)")
    .eq("is_active", true)
    .limit(limit);

  if (brewery_id) query = query.eq("brewery_id", brewery_id);
  if (q) query = query.ilike("name", `%${q}%`);
  if (style) query = query.eq("style", style);

  const { data, error } = await query.order("total_ratings", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ beers: data ?? [] }, { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=120' } });
}

export async function POST(request: NextRequest) {
  const limited = rateLimitResponse(request, 'beers-post', { limit: 20, windowMs: 60 * 60 * 1000 });
  if (limited) return limited;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { brewery_id, name, style, abv, ibu, description, seasonal } = body;

  if (!brewery_id) return NextResponse.json({ error: "brewery_id required" }, { status: 400 });
  if (!name?.trim()) return NextResponse.json({ error: "name required" }, { status: 400 });

  // REQ-014: Verify the calling user has a brewery_account for this brewery
  const { data: breweryAccount } = await supabase
    .from("brewery_accounts")
    .select("id")
    .eq("user_id", user.id)
    .eq("brewery_id", brewery_id)
    .single();

  if (!breweryAccount) {
    return NextResponse.json(
      { error: "Only verified brewery accounts can add beers." },
      { status: 403 }
    );
  }

  const { data, error } = await supabase
    .from("beers")
    .insert({
      brewery_id,
      name: name.trim(),
      style: style || null,
      abv: abv ? parseFloat(abv) : null,
      ibu: ibu ? parseInt(ibu) : null,
      description: description?.trim() || null,
      seasonal: seasonal ?? false,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ beer: data }, { status: 201 });
}
