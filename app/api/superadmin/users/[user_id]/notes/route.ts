import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { apiSuccess, apiError, apiBadRequest } from "@/lib/api-response";
import { requireAuth } from "@/lib/api-helpers";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ user_id: string }> }
) {
  try {
    const { user_id } = await params;
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
    const { data: note } = await service
      .from("admin_user_notes")
      .select("id, content, updated_at")
      .eq("user_id", user_id)
      .eq("admin_user_id", user.id)
      .maybeSingle() as any;

    return apiSuccess({ notes: note?.content ?? "", updatedAt: note?.updated_at ?? null });
  } catch (err) {
    console.error("/api/superadmin/users/[user_id]/notes GET error:", err);
    return apiError("Internal server error", "INTERNAL_ERROR", 500);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ user_id: string }> }
) {
  try {
    const { user_id } = await params;
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

    // Upsert: check if note exists for this admin + user combo
    const { data: existing } = await service
      .from("admin_user_notes")
      .select("id")
      .eq("user_id", user_id)
      .eq("admin_user_id", user.id)
      .maybeSingle() as any;

    if (existing) {
      await service
        .from("admin_user_notes")
        .update({ content: body.notes, updated_at: new Date().toISOString() })
        .eq("id", existing.id) as any;
    } else {
      await service
        .from("admin_user_notes")
        .insert({
          user_id: user_id,
          admin_user_id: user.id,
          content: body.notes,
        } as any);
    }

    // Audit log
    await service.from("admin_actions").insert({
      admin_user_id: user.id,
      action_type: "update_user_notes",
      target_type: "user",
      target_id: user_id,
      notes: body.notes.length > 200 ? body.notes.slice(0, 200) + "..." : body.notes,
    } as any);

    return apiSuccess({ notes: body.notes });
  } catch (err) {
    console.error("/api/superadmin/users/[user_id]/notes PATCH error:", err);
    return apiError("Internal server error", "INTERNAL_ERROR", 500);
  }
}
