// Brewery Submissions API — Sprint 145 (The Revenue Push)
// Owner: Dakota (Dev Lead)
// Handles "Can't find your brewery?" submissions from the claim flow

import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/api-helpers";
import { apiSuccess, apiError, apiUnauthorized } from "@/lib/api-response";
import { rateLimitResponse } from "@/lib/rate-limit";
import { formatCity, formatState } from "@/lib/brewery-utils";

export async function POST(request: NextRequest) {
  const rl = rateLimitResponse(request, "brewery-submissions", { limit: 5, windowMs: 60_000 });
  if (rl) return rl;

  try {
    const supabase = await createClient();
    const user = await requireAuth(supabase);
    if (!user) return apiUnauthorized();

    const body = await request.json();
    const { name, city, state, website_url, notes } = body as {
      name?: string;
      city?: string;
      state?: string;
      website_url?: string;
      notes?: string;
    };

    if (!name?.trim() || !city?.trim() || !state?.trim()) {
      return apiError("Name, city, and state are required", "VALIDATION_ERROR", 400);
    }

    // Check for duplicate submission from same user
    const { data: existing } = await supabase
      .from("brewery_submissions")
      .select("id")
      .eq("user_id", user.id)
      .ilike("name", name.trim())
      .eq("status", "pending")
      .limit(1) as any;

    if ((existing as any[])?.length > 0) {
      return apiSuccess({ id: (existing as any[])[0].id, duplicate: true }, 200);
    }

    const { data: submission, error: insertError } = await supabase
      .from("brewery_submissions")
      .insert({
        user_id: user.id,
        name: name.trim(),
        city: formatCity(city.trim()),
        state: formatState(state.trim()),
        website_url: website_url?.trim() || null,
        notes: notes?.trim() || null,
      })
      .select("id")
      .single() as any;

    if (insertError) {
      console.error("[brewery-submissions] Insert error:", insertError);
      return apiError("Failed to submit. Please try again.", "INSERT_ERROR", 500);
    }

    return apiSuccess({ id: (submission as any).id }, 201);
  } catch (err) {
    console.error("[brewery-submissions] Unexpected error:", err);
    return apiError("An unexpected error occurred.", "INTERNAL_ERROR", 500);
  }
}
