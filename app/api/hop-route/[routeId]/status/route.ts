import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// PATCH /api/hop-route/[routeId]/status — transition route status
// body: { action: "start" | "complete" | "checkin", stop_id?: string }
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ routeId: string }> }
) {
  const { routeId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { action, stop_id } = await request.json();

  // Verify ownership
  const { data: route } = await (supabase as any)
    .from("hop_routes")
    .select("id, status, user_id")
    .eq("id", routeId)
    .single();

  if (!route) return NextResponse.json({ error: "Route not found" }, { status: 404 });
  if (route.user_id !== user.id) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

  if (action === "start") {
    if (route.status !== "draft") {
      return NextResponse.json({ error: "Route is not in draft status" }, { status: 409 });
    }
    await (supabase as any)
      .from("hop_routes")
      .update({ status: "active", started_at: new Date().toISOString() })
      .eq("id", routeId);
    return NextResponse.json({ status: "active" });
  }

  if (action === "checkin") {
    if (!stop_id) return NextResponse.json({ error: "stop_id is required" }, { status: 400 });
    const { error } = await (supabase as any)
      .from("hop_route_stops")
      .update({ checked_in: true, checked_in_at: new Date().toISOString() })
      .eq("id", stop_id)
      .eq("route_id", routeId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ checked_in: true });
  }

  if (action === "complete") {
    if (route.status !== "active") {
      return NextResponse.json({ error: "Route is not active" }, { status: 409 });
    }
    await (supabase as any)
      .from("hop_routes")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("id", routeId);

    // Check and award achievements
    const { data: completedRoutes } = await (supabase as any)
      .from("hop_routes")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "completed");

    const completedCount = (completedRoutes ?? []).length;

    const achievementsToCheck: string[] = [];
    if (completedCount === 1) achievementsToCheck.push("first_hop_route");
    if (completedCount === 5) achievementsToCheck.push("route_master");

    for (const key of achievementsToCheck) {
      const { data: achievement } = await (supabase as any)
        .from("achievements")
        .select("id, key, xp_reward")
        .eq("key", key)
        .single();

      if (!achievement) continue;

      // Check not already unlocked
      const { data: existing } = await (supabase as any)
        .from("user_achievements")
        .select("id")
        .eq("user_id", user.id)
        .eq("achievement_id", achievement.id)
        .single();

      if (existing) continue;

      await (supabase as any)
        .from("user_achievements")
        .insert({ user_id: user.id, achievement_id: achievement.id });

      await (supabase as any).rpc("increment_xp", {
        p_user_id: user.id,
        p_xp_amount: achievement.xp_reward ?? 0,
      });

      await (supabase as any).from("notifications").insert({
        user_id: user.id,
        type: "achievement_unlocked",
        title: "Achievement Unlocked! 🏆",
        body: `You earned the ${key.replace(/_/g, " ")} achievement`,
        data: { achievement_key: key },
      });
    }

    // Post to friends feed (hop_route_completed event)
    // Store completion event on the route — feed will pick it up
    return NextResponse.json({ status: "completed", completed_count: completedCount });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
