import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimitResponse } from "@/lib/rate-limit";

// GET /api/brewery/[brewery_id]/mug-clubs — list brewery's mug clubs (public read)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ brewery_id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { brewery_id } = await params;

  const { data: clubs, error } = await supabase
    .from("mug_clubs")
    .select("*, member_count:mug_club_members(count)")
    .eq("brewery_id", brewery_id)
    .order("created_at", { ascending: false }) as any;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Flatten count from [{count: N}] to N
  const formatted = (clubs ?? []).map((c: any) => ({
    ...c,
    member_count: c.member_count?.[0]?.count ?? 0,
  }));

  return NextResponse.json({ clubs: formatted });
}

// POST /api/brewery/[brewery_id]/mug-clubs — create a new mug club
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ brewery_id: string }> }
) {
  const rl = rateLimitResponse(req, "mug-clubs-create", { limit: 10, windowMs: 60_000 });
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
    return NextResponse.json({ error: "Mug clubs require Cask or Barrel tier" }, { status: 403 });
  }

  const body = await req.json();
  const { name, description, annual_fee, max_members, perks } = body;

  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
  if (annual_fee == null || annual_fee < 0) {
    return NextResponse.json({ error: "Annual fee is required" }, { status: 400 });
  }

  const { data: club, error } = await supabase
    .from("mug_clubs")
    .insert({
      brewery_id,
      name,
      description: description || null,
      annual_fee,
      max_members: max_members || null,
      perks: perks || [],
    })
    .select()
    .single() as any;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ club }, { status: 201 });
}
