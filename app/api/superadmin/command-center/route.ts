import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { apiSuccess, apiError } from "@/lib/api-response";
import { requireAuth } from "@/lib/api-helpers";
import { calculateCommandCenterMetrics, type TimeRange } from "@/lib/superadmin-metrics";

const VALID_RANGES = new Set<TimeRange>(["7d", "30d", "90d"]);

export async function GET(request: NextRequest) {
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

    const rangeParam = request.nextUrl.searchParams.get("range") as TimeRange | null;
    const range: TimeRange = rangeParam && VALID_RANGES.has(rangeParam) ? rangeParam : "30d";

    const service = createServiceClient();
    const data = await calculateCommandCenterMetrics(service, range);

    return apiSuccess(data, 200, {}, {
      "Cache-Control": "private, max-age=30",
    });
  } catch (err) {
    console.error("/api/superadmin/command-center GET error:", err);
    return apiError("Internal server error", "INTERNAL_ERROR", 500);
  }
}
