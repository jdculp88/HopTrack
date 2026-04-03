import { createClient } from "@/lib/supabase/server";
import { requireAuth, requireBreweryAdmin } from "@/lib/api-helpers";
import { apiUnauthorized, apiForbidden, apiSuccess, apiServerError, apiBadRequest, apiNotFound } from "@/lib/api-response";

// PATCH /api/brewery/[brewery_id]/reviews/[review_id]/respond — brewery admin responds to review
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ brewery_id: string; review_id: string }> },
) {
  const { brewery_id, review_id } = await params;
  const supabase = await createClient();
  const user = await requireAuth(supabase);
  if (!user) return apiUnauthorized();

  const account = await requireBreweryAdmin(supabase, user.id, brewery_id);
  if (!account) return apiForbidden();

  const { owner_response } = await req.json();

  if (!owner_response?.trim()) {
    return apiBadRequest("Response text is required");
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

  if (error) return apiServerError(error.message);
  if (!data) return apiNotFound("Review");

  return apiSuccess({ review: data });
}

// DELETE /api/brewery/[brewery_id]/reviews/[review_id]/respond — remove owner response
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ brewery_id: string; review_id: string }> },
) {
  const { brewery_id, review_id } = await params;
  const supabase = await createClient();
  const user = await requireAuth(supabase);
  if (!user) return apiUnauthorized();

  const account = await requireBreweryAdmin(supabase, user.id, brewery_id);
  if (!account) return apiForbidden();

  const { error } = await supabase
    .from("brewery_reviews")
    .update({ owner_response: null, responded_at: null })
    .eq("id", review_id)
    .eq("brewery_id", brewery_id);

  if (error) return apiServerError(error.message);

  return apiSuccess({ success: true });
}
