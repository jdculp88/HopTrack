import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// PATCH /api/brewery/[brewery_id]/promotions — update HopRoute eligibility and offer
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ brewery_id: string }> }
) {
  const { brewery_id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify admin access
  const { data: account } = await supabase
    .from("brewery_accounts")
    .select("role")
    .eq("user_id", user.id)
    .eq("brewery_id", brewery_id)
    .in("role", ["owner", "manager"])
    .single();

  if (!account) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { hop_route_eligible, hop_route_offer, vibe_tags } = await request.json();

  const updates: Record<string, unknown> = {};
  if (typeof hop_route_eligible === "boolean") updates.hop_route_eligible = hop_route_eligible;
  if (typeof hop_route_offer === "string") updates.hop_route_offer = hop_route_offer.trim() || null;
  if (Array.isArray(vibe_tags)) updates.vibe_tags = vibe_tags;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("breweries")
    .update(updates)
    .eq("id", brewery_id)
    .select("hop_route_eligible, hop_route_offer, vibe_tags")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
