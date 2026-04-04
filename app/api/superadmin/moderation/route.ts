/**
 * Superadmin Moderation API — Sprint 156 (The Triple Shot)
 *
 * GET: Fetch all flagged reviews from both tables.
 * PATCH: Update moderation status (clear or remove).
 */

import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/api-helpers";
import { apiSuccess, apiUnauthorized, apiBadRequest, apiServerError } from "@/lib/api-response";

async function verifySuperadmin(supabase: any, userId: string) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_superadmin")
    .eq("id", userId)
    .single();
  return profile?.is_superadmin === true;
}

export async function GET() {
  const supabase = await createClient();
  const user = await requireAuth(supabase);
  if (!user) return apiUnauthorized();
  if (!(await verifySuperadmin(supabase, user.id))) return apiUnauthorized();

  const [{ data: beerReviews }, { data: breweryReviews }] = await Promise.all([
    (supabase as any)
      .from("beer_reviews")
      .select(`
        id, rating, comment, created_at, user_id,
        is_flagged, flag_reason, flagged_by, flagged_at,
        moderation_status, moderated_at, moderated_by
      `)
      .eq("is_flagged", true)
      .order("flagged_at", { ascending: false })
      .limit(200),
    (supabase as any)
      .from("brewery_reviews")
      .select(`
        id, rating, comment, created_at, user_id,
        is_flagged, flag_reason, flagged_by, flagged_at,
        moderation_status, moderated_at, moderated_by
      `)
      .eq("is_flagged", true)
      .order("flagged_at", { ascending: false })
      .limit(200),
  ]);

  const flagged = [
    ...(beerReviews ?? []).map((r: any) => ({ ...r, review_type: "beer" })),
    ...(breweryReviews ?? []).map((r: any) => ({ ...r, review_type: "brewery" })),
  ].sort((a, b) => {
    const aDate = a.flagged_at ?? a.created_at;
    const bDate = b.flagged_at ?? b.created_at;
    return new Date(bDate).getTime() - new Date(aDate).getTime();
  });

  return apiSuccess(flagged);
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const user = await requireAuth(supabase);
  if (!user) return apiUnauthorized();
  if (!(await verifySuperadmin(supabase, user.id))) return apiUnauthorized();

  const { review_id, review_type, action, note } = await request.json();

  if (!review_id || !review_type || !action) {
    return apiBadRequest("Missing required fields");
  }

  if (!["beer", "brewery"].includes(review_type)) {
    return apiBadRequest("Invalid review type");
  }

  if (!["clear", "remove"].includes(action)) {
    return apiBadRequest("Invalid action — must be 'clear' or 'remove'");
  }

  const table = review_type === "beer" ? "beer_reviews" : "brewery_reviews";
  const status = action === "clear" ? "cleared" : "removed";

  const updateData: Record<string, unknown> = {
    moderation_status: status,
    moderated_at: new Date().toISOString(),
    moderated_by: user.id,
  };

  // If clearing, un-flag the review so it shows normally again
  if (action === "clear") {
    updateData.is_flagged = false;
  }

  if (note) {
    updateData.moderation_note = note;
  }

  const { error } = await (supabase as any)
    .from(table)
    .update(updateData)
    .eq("id", review_id);

  if (error) return apiServerError("moderation-action");

  return apiSuccess({ review_id, status });
}
