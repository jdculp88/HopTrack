/**
 * HopTrack — Achievement Evaluation Edge Function
 *
 * Triggered after a new check-in is created.
 * Evaluates which achievements the user has just unlocked and inserts them
 * into user_achievements with earned_at timestamp.
 *
 * Invoke via Supabase Database Webhook on checkins INSERT, or call directly:
 *   POST /functions/v1/achievement-eval
 *   Body: { user_id: string }
 */

import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { user_id } = await req.json();
    if (!user_id) {
      return new Response(JSON.stringify({ error: "user_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Load user profile stats
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("total_checkins, unique_beers, unique_breweries, level")
      .eq("id", user_id)
      .single();

    if (profileError || !profile) {
      return new Response(JSON.stringify({ error: "Profile not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Load existing earned achievement IDs to avoid duplicates
    const { data: existing } = await supabase
      .from("user_achievements")
      .select("achievement_id")
      .eq("user_id", user_id);

    const earnedIds = new Set((existing ?? []).map((r: any) => r.achievement_id));

    // Load all achievements
    const { data: allAchievements } = await supabase
      .from("achievements")
      .select("*");

    if (!allAchievements) {
      return new Response(JSON.stringify({ unlocked: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Evaluate each achievement against current profile stats
    const newlyUnlocked: string[] = [];

    for (const achievement of allAchievements) {
      if (earnedIds.has(achievement.id)) continue;

      let unlocked = false;

      switch (achievement.trigger_type) {
        case "checkin_count":
          unlocked = profile.total_checkins >= achievement.trigger_value;
          break;
        case "unique_beers":
          unlocked = profile.unique_beers >= achievement.trigger_value;
          break;
        case "unique_breweries":
          unlocked = profile.unique_breweries >= achievement.trigger_value;
          break;
        case "level_reached":
          unlocked = profile.level >= achievement.trigger_value;
          break;
        // Additional trigger types evaluated server-side as needed
        default:
          break;
      }

      if (unlocked) {
        newlyUnlocked.push(achievement.id);
      }
    }

    // Insert newly unlocked achievements
    if (newlyUnlocked.length > 0) {
      await supabase.from("user_achievements").insert(
        newlyUnlocked.map((achievement_id) => ({
          user_id,
          achievement_id,
          earned_at: new Date().toISOString(),
        }))
      );

      // Award XP for each achievement
      const { data: unlockedDetails } = await supabase
        .from("achievements")
        .select("xp_reward")
        .in("id", newlyUnlocked);

      const totalXp = (unlockedDetails ?? []).reduce(
        (sum: number, a: any) => sum + (a.xp_reward ?? 0),
        0
      );

      if (totalXp > 0) {
        await supabase.rpc("increment_xp", { user_id_input: user_id, xp_amount: totalXp });
      }
    }

    return new Response(
      JSON.stringify({ unlocked: newlyUnlocked, count: newlyUnlocked.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
