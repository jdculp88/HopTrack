import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimitResponse } from "@/lib/rate-limit";

type Params = { params: Promise<{ brewery_id: string; clubId: string }> };

// GET /api/brewery/[brewery_id]/mug-clubs/[clubId]/members — list members
export async function GET(req: NextRequest, { params }: Params) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { brewery_id, clubId } = await params;

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

  const { data: members, error } = await supabase
    .from("mug_club_members")
    .select("*, profile:profiles(id, username, display_name, avatar_url)")
    .eq("mug_club_id", clubId)
    .order("joined_at", { ascending: false }) as any;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ members: members ?? [] });
}

// POST /api/brewery/[brewery_id]/mug-clubs/[clubId]/members — add a member
export async function POST(req: NextRequest, { params }: Params) {
  const rl = rateLimitResponse(req, "mug-club-members-add", { limit: 20, windowMs: 60_000 });
  if (rl) return rl;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { brewery_id, clubId } = await params;

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

  // Check max_members limit
  const { data: club } = await supabase
    .from("mug_clubs")
    .select("max_members")
    .eq("id", clubId)
    .eq("brewery_id", brewery_id)
    .single() as any;

  if (!club) return NextResponse.json({ error: "Club not found" }, { status: 404 });

  if (club.max_members) {
    const { count } = await supabase
      .from("mug_club_members")
      .select("*", { count: "exact", head: true })
      .eq("mug_club_id", clubId)
      .eq("status", "active") as any;

    if (count >= club.max_members) {
      return NextResponse.json({ error: "Club is full" }, { status: 400 });
    }
  }

  const body = await req.json();
  const { user_id, expires_at, notes } = body;

  if (!user_id) return NextResponse.json({ error: "user_id is required" }, { status: 400 });

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
      return NextResponse.json({ error: "User is already a member" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ member }, { status: 201 });
}

// DELETE /api/brewery/[brewery_id]/mug-clubs/[clubId]/members — remove a member
export async function DELETE(req: NextRequest, { params }: Params) {
  const rl = rateLimitResponse(req, "mug-club-members-remove", { limit: 20, windowMs: 60_000 });
  if (rl) return rl;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { brewery_id, clubId } = await params;

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

  const { member_id } = await req.json();
  if (!member_id) return NextResponse.json({ error: "member_id is required" }, { status: 400 });

  const { error } = await supabase
    .from("mug_club_members")
    .delete()
    .eq("id", member_id)
    .eq("mug_club_id", clubId) as any;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
