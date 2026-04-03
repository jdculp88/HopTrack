import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimitResponse } from "@/lib/rate-limit";
import { requireAuth, requireBreweryAdmin } from "@/lib/api-helpers";
import { apiUnauthorized, apiForbidden, apiSuccess, apiServerError, apiBadRequest, apiNotFound, apiConflict } from "@/lib/api-response";

type Params = { params: Promise<{ brewery_id: string; clubId: string }> };

// GET /api/brewery/[brewery_id]/mug-clubs/[clubId]/members — list members
export async function GET(req: NextRequest, { params }: Params) {
  const supabase = await createClient();
  const user = await requireAuth(supabase);
  if (!user) return apiUnauthorized();

  const { brewery_id, clubId } = await params;

  const account = await requireBreweryAdmin(supabase, user.id, brewery_id);
  if (!account) return apiForbidden();

  const { data: members, error } = await supabase
    .from("mug_club_members")
    .select("*, profile:profiles(id, username, display_name, avatar_url)")
    .eq("mug_club_id", clubId)
    .order("joined_at", { ascending: false }) as any;

  if (error) return apiServerError(error.message);

  return apiSuccess({ members: members ?? [] });
}

// POST /api/brewery/[brewery_id]/mug-clubs/[clubId]/members — add a member
export async function POST(req: NextRequest, { params }: Params) {
  const rl = rateLimitResponse(req, "mug-club-members-add", { limit: 20, windowMs: 60_000 });
  if (rl) return rl;

  const supabase = await createClient();
  const user = await requireAuth(supabase);
  if (!user) return apiUnauthorized();

  const { brewery_id, clubId } = await params;

  const account = await requireBreweryAdmin(supabase, user.id, brewery_id);
  if (!account) return apiForbidden();

  // Check max_members limit
  const { data: club } = await supabase
    .from("mug_clubs")
    .select("max_members")
    .eq("id", clubId)
    .eq("brewery_id", brewery_id)
    .single() as any;

  if (!club) return apiNotFound("Club");

  if (club.max_members) {
    const { count } = await supabase
      .from("mug_club_members")
      .select("*", { count: "exact", head: true })
      .eq("mug_club_id", clubId)
      .eq("status", "active") as any;

    if (count >= club.max_members) {
      return apiBadRequest("Club is full");
    }
  }

  const body = await req.json();
  const { user_id, expires_at, notes } = body;

  if (!user_id) return apiBadRequest("user_id is required");

  const { data: member, error } = await supabase
    .from("mug_club_members")
    .insert({
      mug_club_id: clubId,
      user_id,
      expires_at: expires_at || null,
      notes: notes || null,
    })
    .select("*, profile:profiles(id, username, display_name, avatar_url)")
    .single() as any;

  if (error) {
    if (error.code === "23505") {
      return apiConflict("User is already a member");
    }
    return apiServerError(error.message);
  }

  return apiSuccess({ member }, 201);
}

// DELETE /api/brewery/[brewery_id]/mug-clubs/[clubId]/members — remove a member
export async function DELETE(req: NextRequest, { params }: Params) {
  const rl = rateLimitResponse(req, "mug-club-members-remove", { limit: 20, windowMs: 60_000 });
  if (rl) return rl;

  const supabase = await createClient();
  const user = await requireAuth(supabase);
  if (!user) return apiUnauthorized();

  const { brewery_id, clubId } = await params;

  const account = await requireBreweryAdmin(supabase, user.id, brewery_id);
  if (!account) return apiForbidden();

  const { member_id } = await req.json();
  if (!member_id) return apiBadRequest("member_id is required");

  const { error } = await supabase
    .from("mug_club_members")
    .delete()
    .eq("id", member_id)
    .eq("mug_club_id", clubId) as any;

  if (error) return apiServerError(error.message);

  return apiSuccess({ success: true });
}
