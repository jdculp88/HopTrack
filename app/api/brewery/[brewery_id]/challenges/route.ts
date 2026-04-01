import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/brewery/[brewery_id]/challenges — list all challenges (admin view)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ brewery_id: string }> }
) {
  const { brewery_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: account } = await (supabase
    .from("brewery_accounts")
    .select("role")
    .eq("user_id", user.id)
    .eq("brewery_id", brewery_id)
    .in("role", ["owner", "manager"])
    .single() as any);
  if (!account) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data: challenges, error } = await (supabase
    .from("challenges")
    .select(`
      *,
      participant_count:challenge_participants(count),
      completed_count:challenge_participants(count)
    `)
    .eq("brewery_id", brewery_id)
    .order("created_at", { ascending: false }) as any);

  if (error) return NextResponse.json({ error: "Failed to fetch challenges" }, { status: 500 });

  // Flatten counts
  const formatted = (challenges ?? []).map((c: any) => ({
    ...c,
    participant_count: c.participant_count?.[0]?.count ?? 0,
    completed_count: c.completed_count?.[0]?.count ?? 0,
  }));

  return NextResponse.json(formatted, {
    headers: { "Cache-Control": "no-store" },
  });
}

// POST /api/brewery/[brewery_id]/challenges — create challenge
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ brewery_id: string }> }
) {
  const { brewery_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: account } = await (supabase
    .from("brewery_accounts")
    .select("role")
    .eq("user_id", user.id)
    .eq("brewery_id", brewery_id)
    .in("role", ["owner", "manager"])
    .single() as any);
  if (!account) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const {
    name,
    description,
    icon = "🍺",
    challenge_type,
    target_value,
    target_beer_ids = [],
    reward_description,
    reward_xp = 100,
    reward_loyalty_stamps = 0,
    starts_at,
    ends_at,
    max_participants,
    is_sponsored = false,
    cover_image_url,
    geo_radius_km = 50,
  } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (!["beer_count", "specific_beers", "visit_streak", "style_variety"].includes(challenge_type)) {
    return NextResponse.json({ error: "Invalid challenge type" }, { status: 400 });
  }
  if (!target_value || target_value < 1) {
    return NextResponse.json({ error: "Target value must be at least 1" }, { status: 400 });
  }
  if (challenge_type === "specific_beers" && (!target_beer_ids || target_beer_ids.length === 0)) {
    return NextResponse.json({ error: "Specific beers challenge requires at least one beer" }, { status: 400 });
  }

  const { data: challenge, error } = await (supabase
    .from("challenges")
    .insert({
      brewery_id,
      name: name.trim(),
      description: description?.trim() || null,
      icon,
      challenge_type,
      target_value,
      target_beer_ids: challenge_type === "specific_beers" ? target_beer_ids : [],
      reward_description: reward_description?.trim() || null,
      reward_xp,
      reward_loyalty_stamps,
      starts_at: starts_at || null,
      ends_at: ends_at || null,
      max_participants: max_participants || null,
      is_sponsored: !!is_sponsored,
      cover_image_url: cover_image_url?.trim() || null,
      geo_radius_km: is_sponsored ? (geo_radius_km || 50) : null,
    })
    .select()
    .single() as any);

  if (error) return NextResponse.json({ error: "Failed to create challenge" }, { status: 500 });

  return NextResponse.json(challenge, { status: 201 });
}

// PATCH /api/brewery/[brewery_id]/challenges — update challenge
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ brewery_id: string }> }
) {
  const { brewery_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: account } = await (supabase
    .from("brewery_accounts")
    .select("role")
    .eq("user_id", user.id)
    .eq("brewery_id", brewery_id)
    .in("role", ["owner", "manager"])
    .single() as any);
  if (!account) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { challenge_id, ...updates } = await request.json();
  if (!challenge_id) return NextResponse.json({ error: "challenge_id is required" }, { status: 400 });

  // Verify challenge belongs to this brewery
  const { data: existing } = await (supabase
    .from("challenges")
    .select("id")
    .eq("id", challenge_id)
    .eq("brewery_id", brewery_id)
    .single() as any);
  if (!existing) return NextResponse.json({ error: "Challenge not found" }, { status: 404 });

  // Whitelist updatable fields
  const allowed = ["name", "description", "icon", "reward_description", "reward_xp", "reward_loyalty_stamps", "ends_at", "is_active", "max_participants", "is_sponsored", "cover_image_url", "geo_radius_km"];
  const safeUpdates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in updates) safeUpdates[key] = updates[key];
  }

  const { data: challenge, error } = await (supabase
    .from("challenges")
    .update(safeUpdates)
    .eq("id", challenge_id)
    .select()
    .single() as any);

  if (error) return NextResponse.json({ error: "Failed to update challenge" }, { status: 500 });

  return NextResponse.json(challenge);
}

// DELETE /api/brewery/[brewery_id]/challenges — delete challenge
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ brewery_id: string }> }
) {
  const { brewery_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: account } = await (supabase
    .from("brewery_accounts")
    .select("role")
    .eq("user_id", user.id)
    .eq("brewery_id", brewery_id)
    .in("role", ["owner", "manager"])
    .single() as any);
  if (!account) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { challenge_id } = await request.json();
  if (!challenge_id) return NextResponse.json({ error: "challenge_id is required" }, { status: 400 });

  const { data: existing } = await (supabase
    .from("challenges")
    .select("id")
    .eq("id", challenge_id)
    .eq("brewery_id", brewery_id)
    .single() as any);
  if (!existing) return NextResponse.json({ error: "Challenge not found" }, { status: 404 });

  const { error } = await supabase.from("challenges").delete().eq("id", challenge_id);
  if (error) return NextResponse.json({ error: "Failed to delete challenge" }, { status: 500 });

  return NextResponse.json({ success: true });
}
