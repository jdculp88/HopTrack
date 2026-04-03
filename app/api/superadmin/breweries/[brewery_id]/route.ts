import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { apiSuccess, apiError } from "@/lib/api-response";
import { requireAuth } from "@/lib/api-helpers";
import { fetchBreweryDetail } from "@/lib/superadmin-brewery";

export async function GET(
  _request: Request,
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

    const service = createServiceClient();
    const data = await fetchBreweryDetail(service, brewery_id);

    if (!data) {
      return apiError("Brewery not found", "NOT_FOUND", 404);
    }

    return apiSuccess(data, 200, {}, {
      "Cache-Control": "private, max-age=15",
    });
  } catch (err) {
    console.error("/api/superadmin/breweries/[brewery_id] GET error:", err);
    return apiError("Internal server error", "INTERNAL_ERROR", 500);
  }
}
