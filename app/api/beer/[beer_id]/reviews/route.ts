import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimitResponse } from "@/lib/rate-limit";

// GET /api/beer/[beer_id]/reviews — fetch reviews + user's own review
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ beer_id: string }> },
) {
  const { beer_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: reviews, error } = await supabase
    .from("beer_reviews")
    .select("id, rating, comment, created_at, updated_at, user_id, profile:profiles!user_id(username, display_name, avatar_url)")
    .eq("beer_id", beer_id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const userReview = (reviews ?? []).find((r: any) => r.user_id === user.id) ?? null;

  const allRatings = (reviews ?? []).map((r: any) => Number(r.rating));
  const avg = allRatings.length > 0
    ? allRatings.reduce((a: number, b: number) => a + b, 0) / allRatings.length
    : null;

  return NextResponse.json({
    reviews: reviews ?? [],
    userReview,
    avgRating: avg,
    totalReviews: allRatings.length,
  }, { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } });
}

// POST /api/beer/[beer_id]/reviews — create or update user's review
export async function POST(
  req: Request,
  { params }: { params: Promise<{ beer_id: string }> },
) {
  const rl = rateLimitResponse(req, 'beer/reviews', { limit: 20, windowMs: 60_000 })
  if (rl) return rl

  const { beer_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { rating, comment } = await req.json();
  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("beer_reviews")
    .upsert(
      {
        user_id: user.id,
        beer_id,
        rating,
        comment: comment?.trim() || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,beer_id" },
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ review: data }, { status: 201 });
}

// DELETE /api/beer/[beer_id]/reviews — delete user's review
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ beer_id: string }> },
) {
  const { beer_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await supabase
    .from("beer_reviews")
    .delete()
    .eq("user_id", user.id)
    .eq("beer_id", beer_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
