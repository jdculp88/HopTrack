import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { calculateCheckinXP } from "@/lib/xp";
import { ACHIEVEMENTS, type AchievementDef } from "@/lib/achievements/definitions";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const {
    brewery_id,
    beer_id,
    rating,
    comment,
    flavor_tags,
    serving_style,
    photo_url,
    checked_in_with,
    share_to_feed,
  } = body;

  if (!brewery_id) return NextResponse.json({ error: "brewery_id required" }, { status: 400 });

  // Check if first time at this beer
  let is_first_time = false;
  if (beer_id) {
    const { count } = await supabase
      .from("checkins")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("beer_id", beer_id);
    is_first_time = (count ?? 0) === 0;
  }

  // Check if first time at this brewery
  const { data: existingVisit } = await supabase
    .from("brewery_visits")
    .select("id")
    .eq("user_id", user.id)
    .eq("brewery_id", brewery_id)
    .single();
  const is_new_brewery = !existingVisit;

  // Create check-in
  const { data: checkin, error } = await supabase
    .from("checkins")
    .insert({
      user_id: user.id,
      brewery_id,
      beer_id,
      rating: rating || null,
      comment: comment?.trim() || null,
      flavor_tags: flavor_tags?.length ? flavor_tags : null,
      serving_style: serving_style || null,
      photo_url: photo_url || null,
      is_first_time,
      checked_in_with: checked_in_with?.length ? checked_in_with : null,
      location_verified: false,
      share_to_feed: share_to_feed ?? true,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // XP calculation
  const xpGained = calculateCheckinXP({
    hasRating: !!rating,
    hasComment: !!comment?.trim(),
    hasPhoto: !!photo_url,
    isNewBeer: is_first_time,
    isNewBrewery: is_new_brewery,
  });

  // Update profile stats
  try {
    await (supabase as any).rpc("increment_profile_stats", {
      p_user_id: user.id, p_xp: xpGained, p_checkins: 1,
      p_unique_beers: is_first_time ? 1 : 0,
      p_unique_breweries: is_new_brewery ? 1 : 0,
    });
  } catch { /* RPC may not exist yet — using manual update below */ }

  // Fallback: manual update if RPC doesn't exist yet
  const { data: profile } = await supabase
    .from("profiles")
    .select("xp, total_checkins, unique_beers, unique_breweries, level")
    .eq("id", user.id)
    .single();

  if (profile) {
    const newXp = (profile.xp ?? 0) + xpGained;
    const newLevel = computeLevel(newXp);
    await supabase
      .from("profiles")
      .update({
        xp: newXp,
        level: newLevel,
        total_checkins: (profile.total_checkins ?? 0) + 1,
        unique_beers: is_first_time ? (profile.unique_beers ?? 0) + 1 : profile.unique_beers,
        unique_breweries: is_new_brewery ? (profile.unique_breweries ?? 0) + 1 : profile.unique_breweries,
      })
      .eq("id", user.id);
  }

  // Upsert brewery visit
  if (existingVisit) {
    const { data: currentVisit } = await supabase
      .from("brewery_visits")
      .select("total_visits, unique_beers_tried")
      .eq("user_id", user.id)
      .eq("brewery_id", brewery_id)
      .single();
    const cv = currentVisit as any;
    if (cv) {
      await supabase.from("brewery_visits").update({
        total_visits: cv.total_visits + 1,
        last_visit_at: new Date().toISOString(),
        unique_beers_tried: is_first_time ? cv.unique_beers_tried + 1 : cv.unique_beers_tried,
      }).eq("user_id", user.id).eq("brewery_id", brewery_id);
    }
  } else {
    await supabase.from("brewery_visits").insert({
      user_id: user.id,
      brewery_id,
      total_visits: 1,
      unique_beers_tried: beer_id ? 1 : 0,
      first_visit_at: new Date().toISOString(),
      last_visit_at: new Date().toISOString(),
    });
  }

  // Update beer rating average
  if (beer_id && rating) {
    const { data: beerRatings } = await supabase
      .from("checkins")
      .select("rating")
      .eq("beer_id", beer_id)
      .not("rating", "is", null);

    if (beerRatings && beerRatings.length > 0) {
      const avg = beerRatings.reduce((s, c) => s + (c.rating ?? 0), 0) / beerRatings.length;
      await supabase.from("beers").update({
        avg_rating: Math.round(avg * 10) / 10,
        total_ratings: beerRatings.length,
      }).eq("id", beer_id);
    }
  }

  // Check achievements
  const newAchievements = await checkAchievements(supabase, user.id, checkin.id);

  return NextResponse.json({ checkin, xpGained, newAchievements }, { status: 201 });
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor");
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const userId = searchParams.get("user_id") ?? user.id;

  let query = supabase
    .from("checkins")
    .select("*, profile:profiles(*), brewery:breweries(*), beer:beers(*), reactions(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (cursor) {
    query = query.lt("created_at", cursor);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ checkins: data, nextCursor: data?.[data.length - 1]?.created_at ?? null });
}

function computeLevel(xp: number): number {
  const thresholds = [0, 100, 250, 500, 1000, 1750, 2750, 4000, 5500, 7500, 10000, 13000, 16500, 20500, 25000, 30500, 37000, 44500, 53000, 62500];
  let level = 1;
  for (let i = 0; i < thresholds.length; i++) {
    if (xp >= thresholds[i]) level = i + 1;
  }
  return Math.min(level, 20);
}

async function checkAchievements(supabase: any, userId: string, checkinId: string): Promise<AchievementDef[]> {
  try {
    const newlyEarned: AchievementDef[] = [];

    // Get already-earned achievement keys
    const { data: earned } = await supabase
      .from("user_achievements")
      .select("achievement_id")
      .eq("user_id", userId);

    const { data: allAchievements } = await supabase
      .from("achievements")
      .select("id, key");

    if (!allAchievements) return [];

    const earnedIds = new Set((earned ?? []).map((e: any) => e.achievement_id));
    const achievementKeyMap = new Map(allAchievements.map((a: any) => [a.key, a.id]));

    // Get profile stats
    const { data: profile } = await supabase
      .from("profiles")
      .select("total_checkins, unique_beers, unique_breweries")
      .eq("id", userId)
      .single();

    const total = profile?.total_checkins ?? 0;
    const uniqueBeers = profile?.unique_beers ?? 0;
    const uniqueBreweries = profile?.unique_breweries ?? 0;

    // Simple quantity checks
    const quantityChecks: [string, number, number][] = [
      ["first_step",    total, 1],
      ["getting_started", total, 5],
      ["regular",       total, 25],
      ["enthusiast",    total, 100],
      ["veteran",       total, 250],
      ["legend",        total, 500],
      ["brewery_tourist_10", uniqueBreweries, 10],
      ["craft_pilgrim_25",   uniqueBreweries, 25],
      ["craft_pilgrim_50",   uniqueBreweries, 50],
      ["craft_pilgrim_100",  uniqueBreweries, 100],
      ["style_student", uniqueBeers, 5],
    ];

    for (const [key, value, threshold] of quantityChecks) {
      const achievementId = achievementKeyMap.get(key);
      if (!achievementId || earnedIds.has(achievementId)) continue;
      if (value >= threshold) {
        await supabase.from("user_achievements").insert({
          user_id: userId,
          achievement_id: achievementId,
          checkin_id: checkinId,
        });
        const def = ACHIEVEMENTS.find((a) => a.key === key);
        if (def) newlyEarned.push(def);
      }
    }

    return newlyEarned;
  } catch {
    return [];
  }
}
