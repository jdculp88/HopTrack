import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimitResponse } from "@/lib/rate-limit";
import { requireAuth } from "@/lib/api-helpers";
import { apiUnauthorized, apiSuccess, apiServerError, apiBadRequest } from "@/lib/api-response";

// GET /api/brewery/[brewery_id]/reviews — fetch reviews + user's own review
// NOTE: This serves anonymous users — auth is optional for the GET handler
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ brewery_id: string }> },
) {
  const { brewery_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: reviews, error } = await supabase
    .from("brewery_reviews")
    .select("id, rating, comment, created_at, updated_at, user_id, owner_response, responded_at, profile:profiles!user_id(username, display_name, avatar_url)")
    .eq("brewery_id", brewery_id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return apiServerError(error.message);

  const userReview = user
    ? (reviews ?? []).find((r: any) => r.user_id === user.id) ?? null
    : null;

  // Compute average
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

// POST /api/brewery/[brewery_id]/reviews — create or update user's review
export async function POST(
  req: Request,
  { params }: { params: Promise<{ brewery_id: string }> },
) {
  const rl = rateLimitResponse(req, "brewery-reviews", { limit: 20, windowMs: 60_000 });
  if (rl) return rl;
  const { brewery_id } = await params;
  const supabase = await createClient();
  const user = await requireAuth(supabase);
  if (!user) return apiUnauthorized();

  const { rating: rawRating, comment } = await req.json();
  // Half-star support (Sprint 162): snap to nearest 0.5, require 0.5-5.0.
  const rating = typeof rawRating === "number" ? Math.round(rawRating * 2) / 2 : 0;
  if (!rating || rating < 0.5 || rating > 5.0) {
    return apiBadRequest("Rating must be between 0.5 and 5.0");
  }

  // Upsert — one review per user per brewery
  const { data, error } = await supabase
    .from("brewery_reviews")
    .upsert(
      {
        user_id: user.id,
        brewery_id,
        rating,
        comment: comment?.trim() || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,brewery_id" },
    )
    .select()
    .single();

  if (error) return apiServerError(error.message);

  return apiSuccess({ review: data }, 201);
}

// DELETE /api/brewery/[brewery_id]/reviews — delete user's review
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ brewery_id: string }> },
) {
  const { brewery_id } = await params;
  const supabase = await createClient();
  const user = await requireAuth(supabase);
  if (!user) return apiUnauthorized();

  const { error } = await supabase
    .from("brewery_reviews")
    .delete()
    .eq("user_id", user.id)
    .eq("brewery_id", brewery_id);

  if (error) return apiServerError(error.message);

  return apiSuccess({ success: true });
}
