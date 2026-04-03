import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { apiSuccess, apiError, apiBadRequest } from "@/lib/api-response";
import { requireAuth } from "@/lib/api-helpers";

const COOKIE_NAME = "ht-impersonate";
const COOKIE_MAX_AGE = 3600; // 1 hour

export async function POST(request: Request) {
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

    const body = await request.json();
    const { brewery_id } = body;

    if (!brewery_id || typeof brewery_id !== "string") {
      return apiBadRequest("brewery_id is required", "brewery_id");
    }

    // Verify brewery exists
    const service = createServiceClient();
    const { data: brewery } = await service
      .from("breweries")
      .select("id, name")
      .eq("id", brewery_id)
      .maybeSingle() as any;

    if (!brewery) {
      return apiError("Brewery not found", "NOT_FOUND", 404);
    }

    // Set impersonation cookie
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, brewery_id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/brewery-admin",
      maxAge: COOKIE_MAX_AGE,
    });

    // Audit log
    await service.from("admin_actions").insert({
      admin_user_id: user.id,
      action_type: "impersonation_start",
      target_type: "brewery",
      target_id: brewery_id,
      notes: `Started impersonation of: ${brewery.name}`,
    } as any);

    return apiSuccess({
      breweryId: brewery_id,
      breweryName: brewery.name,
      expiresIn: COOKIE_MAX_AGE,
    });
  } catch (err) {
    console.error("/api/superadmin/impersonate POST error:", err);
    return apiError("Internal server error", "INTERNAL_ERROR", 500);
  }
}

export async function DELETE() {
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

    const cookieStore = await cookies();
    const breweryId = cookieStore.get(COOKIE_NAME)?.value;

    // Clear the cookie
    cookieStore.set(COOKIE_NAME, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/brewery-admin",
      maxAge: 0,
    });

    // Audit log
    if (breweryId) {
      const service = createServiceClient();
      await service.from("admin_actions").insert({
        admin_user_id: user.id,
        action_type: "impersonation_end",
        target_type: "brewery",
        target_id: breweryId,
        notes: "Ended impersonation session",
      } as any);
    }

    return apiSuccess({ cleared: true });
  } catch (err) {
    console.error("/api/superadmin/impersonate DELETE error:", err);
    return apiError("Internal server error", "INTERNAL_ERROR", 500);
  }
}
