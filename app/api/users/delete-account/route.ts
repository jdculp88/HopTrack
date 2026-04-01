import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { NextRequest, NextResponse } from "next/server";
import { rateLimitResponse } from "@/lib/rate-limit";

export async function DELETE(request: NextRequest) {
  const limited = rateLimitResponse(request, 'delete-account', { limit: 3, windowMs: 60 * 60 * 1000 });
  if (limited) return limited;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = user.id;
  const service = createServiceClient();

  try {
    // Step 1: Get session IDs first
    const { data: sessions } = await service.from("sessions").select("id").eq("user_id", userId);
    const sessionIds = (sessions ?? []).map((s: { id: string }) => s.id);

    // Step 2: Delete session children (parallel)
    await Promise.all([
      sessionIds.length > 0
        ? service.from("session_photos").delete().in("session_id", sessionIds)
        : Promise.resolve(),
      sessionIds.length > 0
        ? service.from("session_comments").delete().in("session_id", sessionIds)
        : Promise.resolve(),
      sessionIds.length > 0
        ? service.from("reactions").delete().in("session_id", sessionIds)
        : Promise.resolve(),
      sessionIds.length > 0
        ? service.from("beer_logs").delete().in("session_id", sessionIds)
        : Promise.resolve(),
    ]);

    // Step 3: Delete sessions
    if (sessionIds.length > 0) {
      await service.from("sessions").delete().in("id", sessionIds);
    }

    // Step 4: Delete other user data (parallel)
    await Promise.all([
      service.from("beer_reviews").delete().eq("user_id", userId),
      service.from("brewery_reviews").delete().eq("user_id", userId),
      service.from("wishlist").delete().eq("user_id", userId),
      service.from("user_achievements").delete().eq("user_id", userId),
      service.from("brewery_follows").delete().eq("user_id", userId),
      service.from("push_subscriptions").delete().eq("user_id", userId),
      service.from("referral_uses").delete().eq("referred_user_id", userId),
    ]);

    // Step 5: Delete notifications (sent or received)
    await service.from("notifications").delete().or(`user_id.eq.${userId},actor_id.eq.${userId}`);

    // Step 6: Delete friendships
    await service.from("friendships").delete().or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);

    // Step 7: Delete beer lists
    const { data: lists } = await service.from("beer_lists").select("id").eq("user_id", userId);
    const listIds = (lists ?? []).map((l: { id: string }) => l.id);
    if (listIds.length > 0) {
      await service.from("beer_list_items").delete().in("list_id", listIds);
      await service.from("beer_lists").delete().in("id", listIds);
    }

    // Step 8: Delete profile
    await service.from("profiles").delete().eq("id", userId);

    // Step 9: Delete Supabase auth user (service role admin)
    const { error: authError } = await service.auth.admin.deleteUser(userId);
    if (authError) throw authError;

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete account";
    console.error("[delete-account]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
