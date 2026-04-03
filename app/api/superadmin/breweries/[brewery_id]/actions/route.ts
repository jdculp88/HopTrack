import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { apiSuccess, apiError, apiBadRequest } from "@/lib/api-response";
import { requireAuth } from "@/lib/api-helpers";

const VALID_TIERS = ["free", "tap", "cask", "barrel"] as const;
const VALID_ACTIONS = ["force_verify", "change_tier"] as const;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ brewery_id: string }> }
) {
  try {
    const { brewery_id } = await params;
    const supabase = await createClient();
    const user = await requireAuth(supabase);
    if (!user) return apiError("Unauthorized", "UNAUTHORIZED", 401);

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_superadmin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_superadmin) {
      return apiError("Forbidden", "FORBIDDEN", 403);
    }

    const body = await request.json();
    const { action, payload } = body;

    if (!VALID_ACTIONS.includes(action)) {
      return apiBadRequest(`Invalid action. Must be one of: ${VALID_ACTIONS.join(", ")}`, "action");
    }

    const service = createServiceClient();

    // Verify brewery exists
    const { data: brewery } = await service
      .from("breweries")
      .select("id, name")
      .eq("id", brewery_id)
      .maybeSingle() as any;

    if (!brewery) {
      return apiError("Brewery not found", "NOT_FOUND", 404);
    }

    if (action === "force_verify") {
      // Set verified = true on all brewery_accounts for this brewery
      const { error } = await service
        .from("brewery_accounts")
        .update({ verified: true } as any)
        .eq("brewery_id", brewery_id) as any;

      if (error) {
        return apiError("Failed to verify brewery", "UPDATE_FAILED", 500);
      }

      // Audit log
      await service.from("admin_actions").insert({
        admin_user_id: user.id,
        action_type: "force_verify",
        target_type: "brewery",
        target_id: brewery_id,
        notes: `Force verified brewery: ${brewery.name}`,
      } as any);

      return apiSuccess({ action: "force_verify", breweryId: brewery_id });
    }

    if (action === "change_tier") {
      const tier = payload?.tier;
      if (!tier || !VALID_TIERS.includes(tier)) {
        return apiBadRequest(`Invalid tier. Must be one of: ${VALID_TIERS.join(", ")}`, "tier");
      }

      // Update brewery subscription_tier
      const { error: breweryError } = await service
        .from("breweries")
        .update({ subscription_tier: tier } as any)
        .eq("id", brewery_id) as any;

      if (breweryError) {
        return apiError("Failed to update brewery tier", "UPDATE_FAILED", 500);
      }

      // Also update brewery_accounts subscription_tier
      await service
        .from("brewery_accounts")
        .update({ subscription_tier: tier } as any)
        .eq("brewery_id", brewery_id) as any;

      // Audit log
      await service.from("admin_actions").insert({
        admin_user_id: user.id,
        action_type: "change_tier",
        target_type: "brewery",
        target_id: brewery_id,
        notes: `Changed tier to ${tier} for: ${brewery.name}`,
      } as any);

      return apiSuccess({ action: "change_tier", tier, breweryId: brewery_id });
    }

    return apiBadRequest("Unknown action", "action");
  } catch (err) {
    console.error("/api/superadmin/breweries/[brewery_id]/actions POST error:", err);
    return apiError("Internal server error", "INTERNAL_ERROR", 500);
  }
}
