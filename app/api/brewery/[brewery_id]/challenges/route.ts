import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAuth, requireBreweryAdmin } from "@/lib/api-helpers";
import { apiUnauthorized, apiForbidden, apiSuccess, apiServerError, apiBadRequest, apiNotFound } from "@/lib/api-response";

// GET /api/brewery/[brewery_id]/challenges — list all challenges (admin view)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ brewery_id: string }> }
) {
  const { brewery_id } = await params;
  const supabase = await createClient();
  const user = await requireAuth(supabase);
  if (!user) return apiUnauthorized();

  const account = await requireBreweryAdmin(supabase, user.id, brewery_id);
  if (!account) return apiForbidden();

  const { data: challenges, error } = await (supabase
    .from("challenges")
    .select(`
      *,
      participant_count:challenge_participants(count),
      completed_count:challenge_participants(count)
    `)
    .eq("brewery_id", brewery_id)
    .order("created_at", { ascending: false }) as any);

  if (error) return apiServerError("Failed to fetch challenges");

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
  const user = await requireAuth(supabase);
  if (!user) return apiUnauthorized();

  const account = await requireBreweryAdmin(supabase, user.id, brewery_id);
  if (!account) return apiForbidden();

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
    return apiBadRequest("Name is required");
  }
  if (!["beer_count", "specific_beers", "visit_streak", "style_variety"].includes(challenge_type)) {
    return apiBadRequest("Invalid challenge type");
  }
  if (!target_value || target_value < 1) {
    return apiBadRequest("Target value must be at least 1");
  }
  if (challenge_type === "specific_beers" && (!target_beer_ids || target_beer_ids.length === 0)) {
    return apiBadRequest("Specific beers challenge requires at least one beer");
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

  if (error) return apiServerError("Failed to create challenge");

  return apiSuccess(challenge, 201);
}

// PATCH /api/brewery/[brewery_id]/challenges — update challenge
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ brewery_id: string }> }
) {
  const { brewery_id } = await params;
  const supabase = await createClient();
  const user = await requireAuth(supabase);
  if (!user) return apiUnauthorized();

  const account = await requireBreweryAdmin(supabase, user.id, brewery_id);
  if (!account) return apiForbidden();

  const { challenge_id, ...updates } = await request.json();
  if (!challenge_id) return apiBadRequest("challenge_id is required");

  // Verify challenge belongs to this brewery
  const { data: existing } = await (supabase
    .from("challenges")
    .select("id")
    .eq("id", challenge_id)
    .eq("brewery_id", brewery_id)
    .single() as any);
  if (!existing) return apiNotFound("Challenge");

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

  if (error) return apiServerError("Failed to update challenge");

  return apiSuccess(challenge);
}

// DELETE /api/brewery/[brewery_id]/challenges — delete challenge
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ brewery_id: string }> }
) {
  const { brewery_id } = await params;
  const supabase = await createClient();
  const user = await requireAuth(supabase);
  if (!user) return apiUnauthorized();

  const account = await requireBreweryAdmin(supabase, user.id, brewery_id);
  if (!account) return apiForbidden();

  const { challenge_id } = await request.json();
  if (!challenge_id) return apiBadRequest("challenge_id is required");

  const { data: existing } = await (supabase
    .from("challenges")
    .select("id")
    .eq("id", challenge_id)
    .eq("brewery_id", brewery_id)
    .single() as any);
  if (!existing) return apiNotFound("Challenge");

  const { error } = await supabase.from("challenges").delete().eq("id", challenge_id);
  if (error) return apiServerError("Failed to delete challenge");

  return apiSuccess({ success: true });
}
