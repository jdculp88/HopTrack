/**
 * Location Consent API — Sprint 156 (The Triple Shot)
 *
 * POST: Record that the user has granted location consent.
 */

import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/api-helpers";
import { apiSuccess, apiUnauthorized, apiServerError } from "@/lib/api-response";

export async function POST() {
  const supabase = await createClient();
  const user = await requireAuth(supabase);
  if (!user) return apiUnauthorized();

  const { error } = await (supabase as any)
    .from("profiles")
    .update({
      location_consent: true,
      location_consent_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) return apiServerError("location-consent");

  return apiSuccess({ consented: true });
}
