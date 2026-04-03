import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { apiSuccess, apiError } from "@/lib/api-response";
import { requireAuth } from "@/lib/api-helpers";
import { calculateUserFunnel } from "@/lib/superadmin-metrics";

export async function GET() {
  try {
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

    const service = createServiceClient();
    const data = await calculateUserFunnel(service);

    return apiSuccess(data, 200, {}, {
      "Cache-Control": "private, max-age=60",
    });
  } catch (err) {
    console.error("/api/superadmin/metrics/funnel GET error:", err);
    return apiError("Internal server error", "INTERNAL_ERROR", 500);
  }
}
