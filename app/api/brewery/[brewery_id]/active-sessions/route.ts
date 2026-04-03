import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/api-helpers";
import { apiUnauthorized, apiSuccess, apiServerError } from "@/lib/api-response";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ brewery_id: string }> }
) {
  const { brewery_id } = await params;
  const supabase = await createClient();

  const user = await requireAuth(supabase);
  if (!user) return apiUnauthorized();

  const { count, error } = await supabase
    .from("sessions")
    .select("id", { count: "exact", head: true })
    .eq("brewery_id", brewery_id)
    .eq("is_active", true);

  if (error) return apiServerError(error.message);

  return apiSuccess({ count: count ?? 0 });
}
