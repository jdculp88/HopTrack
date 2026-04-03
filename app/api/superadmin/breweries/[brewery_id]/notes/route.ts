import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { apiSuccess, apiError, apiBadRequest } from "@/lib/api-response";
import { requireAuth } from "@/lib/api-helpers";

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
    const { data: brewery } = await service
      .from("breweries")
      .select("admin_notes")
      .eq("id", brewery_id)
      .maybeSingle() as any;

    if (!brewery) {
      return apiError("Brewery not found", "NOT_FOUND", 404);
    }

    return apiSuccess({ notes: brewery.admin_notes ?? "" });
  } catch (err) {
    console.error("/api/superadmin/breweries/[brewery_id]/notes GET error:", err);
    return apiError("Internal server error", "INTERNAL_ERROR", 500);
  }
}

export async function PATCH(
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
    if (typeof body.notes !== "string") {
      return apiBadRequest("notes must be a string", "notes");
    }

    const service = createServiceClient();

    // Update notes
    const { error: updateError } = await service
      .from("breweries")
      .update({ admin_notes: body.notes })
      .eq("id", brewery_id) as any;

    if (updateError) {
      return apiError("Failed to update notes", "UPDATE_FAILED", 500);
    }

    // Audit log
    await service.from("admin_actions").insert({
      admin_user_id: user.id,
      action_type: "update_admin_notes",
      target_type: "brewery",
      target_id: brewery_id,
      notes: body.notes.length > 200 ? body.notes.slice(0, 200) + "..." : body.notes,
    } as any);

    return apiSuccess({ notes: body.notes });
  } catch (err) {
    console.error("/api/superadmin/breweries/[brewery_id]/notes PATCH error:", err);
    return apiError("Internal server error", "INTERNAL_ERROR", 500);
  }
}
