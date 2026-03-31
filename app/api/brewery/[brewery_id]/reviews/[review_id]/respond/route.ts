import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// PATCH /api/brewery/[brewery_id]/reviews/[review_id]/respond — brewery admin responds to review
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ brewery_id: string; review_id: string }> },
) {
  const { brewery_id, review_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify the user is an owner or manager of this brewery
  const { data: account } = await supabase
    .from("brewery_accounts")
    .select("role")
    .eq("user_id", user.id)
    .eq("brewery_id", brewery_id)
    .in("role", ["owner", "manager"])
    .single();

  if (!account) {
    return NextResponse.json({ error: "Forbidden — brewery admin access required" }, { status: 403 });
  }

  const { owner_response } = await req.json();

  if (!owner_response?.trim()) {
    return NextResponse.json({ error: "Response text is required" }, { status: 400 });
  }

  // Update the review with owner response
  const { data, error } = await supabase
    .from("brewery_reviews")
    .update({
      owner_response: owner_response.trim(),
      responded_at: new Date().toISOString(),
    })
    .eq("id", review_id)
    .eq("brewery_id", brewery_id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Review not found" }, { status: 404 });

  return NextResponse.json({ review: data });
}

// DELETE /api/brewery/[brewery_id]/reviews/[review_id]/respond — remove owner response
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ brewery_id: string; review_id: string }> },
) {
  const { brewery_id, review_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify brewery admin
  const { data: account } = await supabase
    .from("brewery_accounts")
    .select("role")
    .eq("user_id", user.id)
    .eq("brewery_id", brewery_id)
    .in("role", ["owner", "manager"])
    .single();

  if (!account) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error } = await supabase
    .from("brewery_reviews")
    .update({ owner_response: null, responded_at: null })
    .eq("id", review_id)
    .eq("brewery_id", brewery_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
