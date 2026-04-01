import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimitResponse } from "@/lib/rate-limit";

// GET /api/brewery/[brewery_id]/ads — list all ads for this brewery
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ brewery_id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { brewery_id } = await params;

  // Verify brewery admin
  const { data: account } = await supabase
    .from("brewery_accounts")
    .select("role")
    .eq("user_id", user.id)
    .eq("brewery_id", brewery_id)
    .maybeSingle() as any;

  if (!account || !["owner", "manager"].includes(account.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: ads, error } = await supabase
    .from("brewery_ads")
    .select("*")
    .eq("brewery_id", brewery_id)
    .order("created_at", { ascending: false }) as any;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ads: ads ?? [] });
}

// POST /api/brewery/[brewery_id]/ads — create a new ad
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ brewery_id: string }> }
) {
  const rl = rateLimitResponse(req, "brewery-ads-create", { limit: 10, windowMs: 60_000 });
  if (rl) return rl;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { brewery_id } = await params;

  // Verify brewery admin
  const { data: account } = await supabase
    .from("brewery_accounts")
    .select("role")
    .eq("user_id", user.id)
    .eq("brewery_id", brewery_id)
    .maybeSingle() as any;

  if (!account || !["owner", "manager"].includes(account.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Verify tier — Cask or Barrel required
  const { data: brewery } = await supabase
    .from("breweries")
    .select("subscription_tier")
    .eq("id", brewery_id)
    .single() as any;

  if (!brewery || !["cask", "barrel"].includes(brewery.subscription_tier)) {
    return NextResponse.json({ error: "Ad campaigns require Cask or Barrel tier" }, { status: 403 });
  }

  const body = await req.json();
  const { title, body: adBody, image_url, cta_url, cta_label, radius_km, budget_cents, starts_at, ends_at } = body;

  if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });

  const { data: ad, error } = await supabase
    .from("brewery_ads")
    .insert({
      brewery_id,
      title,
      body: adBody || null,
      image_url: image_url || null,
      cta_url: cta_url || null,
      cta_label: cta_label || "Visit",
      radius_km: radius_km || 25,
      budget_cents: budget_cents || 0,
      starts_at: starts_at || new Date().toISOString(),
      ends_at: ends_at || null,
    })
    .select()
    .single() as any;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ad }, { status: 201 });
}
