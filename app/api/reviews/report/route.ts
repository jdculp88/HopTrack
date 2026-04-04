/**
 * Review Report API — Sprint 156 (The Triple Shot)
 *
 * POST: Flag a beer or brewery review for moderation.
 */

import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/api-helpers";
import { apiSuccess, apiUnauthorized, apiBadRequest, apiServerError } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const user = await requireAuth(supabase);
  if (!user) return apiUnauthorized();

  const { review_id, review_type, reason } = await request.json();

  if (!review_id || !review_type || !reason) {
    return apiBadRequest("Missing required fields");
  }

  if (!["beer", "brewery"].includes(review_type)) {
    return apiBadRequest("Invalid review type");
  }

  const table = review_type === "beer" ? "beer_reviews" : "brewery_reviews";

  const { error } = await (supabase as any)
    .from(table)
    .update({
      is_flagged: true,
      flag_reason: reason,
      flagged_by: user.id,
      flagged_at: new Date().toISOString(),
      moderation_status: "flagged",
    })
    .eq("id", review_id);

  if (error) return apiServerError("review-report");

  return apiSuccess({ reported: true });
}
