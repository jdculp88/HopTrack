import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { rateLimitResponse } from "@/lib/rate-limit";
import { requireAuth } from "@/lib/api-helpers";
import { apiUnauthorized, apiSuccess, apiServerError } from "@/lib/api-response";

// GET — check if current user follows this brewery + get follow count
// NOTE: This serves anonymous users — auth is optional for the GET handler
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ brewery_id: string }> }
) {
  const { brewery_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Follow count (public)
  const { count } = await supabase
    .from("brewery_follows")
    .select("id", { count: "exact", head: true })
    .eq("brewery_id", brewery_id);

  // User's follow status
  let isFollowing = false;
  if (user) {
    const { data } = await supabase
      .from("brewery_follows")
      .select("id")
      .eq("user_id", user.id)
      .eq("brewery_id", brewery_id)
      .single();
    isFollowing = !!data;
  }

  return NextResponse.json({ isFollowing, count: count ?? 0 });
}

// POST — follow a brewery
export async function POST(
  req: Request,
  { params }: { params: Promise<{ brewery_id: string }> }
) {
  const rl = rateLimitResponse(req, 'brewery/follow', { limit: 30, windowMs: 60_000 })
  if (rl) return rl

  const { brewery_id } = await params;
  const supabase = await createClient();
  const user = await requireAuth(supabase);
  if (!user) return apiUnauthorized();

  const { error } = await supabase
    .from("brewery_follows")
    .insert({ user_id: user.id, brewery_id });

  if (error) {
    if (error.code === "23505") {
      return apiSuccess({ message: "Already following" });
    }
    return apiServerError(error.message);
  }

  return apiSuccess({ success: true }, 201);
}

// DELETE — unfollow a brewery
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ brewery_id: string }> }
) {
  const { brewery_id } = await params;
  const supabase = await createClient();
  const user = await requireAuth(supabase);
  if (!user) return apiUnauthorized();

  await supabase
    .from("brewery_follows")
    .delete()
    .eq("user_id", user.id)
    .eq("brewery_id", brewery_id);

  return apiSuccess({ success: true });
}
