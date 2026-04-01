import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimitResponse } from "@/lib/rate-limit";

// PATCH /api/brewery/[brewery_id]/ads/[ad_id] — update an ad
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ brewery_id: string; ad_id: string }> }
) {
  const rl = rateLimitResponse(req, "brewery-ads-update", { limit: 10, windowMs: 60_000 });
  if (rl) return rl;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { brewery_id, ad_id } = await params;

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

  const body = await req.json();
  const allowedFields = ["title", "body", "image_url", "cta_url", "cta_label", "radius_km", "budget_cents", "starts_at", "ends_at", "is_active"];
  const updates: Record<string, any> = {};
  for (const key of allowedFields) {
    if (key in body) updates[key] = body[key];
  }
  updates.updated_at = new Date().toISOString();

  const { data: ad, error } = await supabase
    .from("brewery_ads")
    .update(updates)
    .eq("id", ad_id)
    .eq("brewery_id", brewery_id)
    .select()
    .single() as any;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ad });
}

// DELETE /api/brewery/[brewery_id]/ads/[ad_id] — delete an ad
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ brewery_id: string; ad_id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { brewery_id, ad_id } = await params;

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

  const { error } = await supabase
    .from("brewery_ads")
    .delete()
    .eq("id", ad_id)
    .eq("brewery_id", brewery_id) as any;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ deleted: true });
}
