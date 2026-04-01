/**
 * Smart Push Notification Triggers (F-019)
 * Sprint 102 — Smart Push
 *
 * Three trigger types:
 * 1. wishlist_on_tap — beer from user's wishlist just tapped
 * 2. friend_session — friend started a session
 * 3. loyalty_nudge — user is close to a loyalty reward
 */

import { sendPushToUser } from "@/lib/push";
import type { SupabaseClient } from "@supabase/supabase-js";

const MAX_SMART_NOTIFICATIONS_PER_DAY = 3;
const DEDUP_WINDOW_HOURS = 24;

type TriggerType = "wishlist_on_tap" | "friend_session" | "loyalty_nudge";

interface TriggerResult {
  sent: number;
  skipped: number;
  reason?: string;
}

/**
 * Check if we can send a smart notification (frequency cap + dedup)
 */
async function canSendTrigger(
  supabase: SupabaseClient,
  userId: string,
  triggerType: TriggerType,
  triggerKey: string
): Promise<boolean> {
  const oneDayAgo = new Date(Date.now() - DEDUP_WINDOW_HOURS * 60 * 60 * 1000).toISOString();

  // Check daily cap
  const { count: dailyCount } = await (supabase
    .from("notification_rate_limits")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("sent_at", oneDayAgo) as any);

  if ((dailyCount ?? 0) >= MAX_SMART_NOTIFICATIONS_PER_DAY) return false;

  // Check dedup (same trigger type + key within window)
  const { count: dupCount } = await (supabase
    .from("notification_rate_limits")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("trigger_type", triggerType)
    .eq("trigger_key", triggerKey)
    .gte("sent_at", oneDayAgo) as any);

  return (dupCount ?? 0) === 0;
}

/**
 * Record that we sent a smart notification
 */
async function recordTrigger(
  supabase: SupabaseClient,
  userId: string,
  triggerType: TriggerType,
  triggerKey: string
): Promise<void> {
  await (supabase
    .from("notification_rate_limits")
    .insert({ user_id: userId, trigger_type: triggerType, trigger_key: triggerKey }) as any);
}

/**
 * Check if a user has a specific smart trigger enabled
 */
function isTriggerEnabled(
  preferences: Record<string, boolean> | null | undefined,
  triggerType: TriggerType
): boolean {
  const prefs = preferences ?? {};
  // Default to true for all smart triggers unless explicitly disabled
  const key = `smart_${triggerType}`;
  return prefs[key] !== false;
}

// ─── Trigger 1: Wishlist Beer On Tap ─────────────────────────────────────────

/**
 * When a beer goes on tap, notify users who have it on their wishlist.
 * Called from the tap list update API.
 */
export async function triggerWishlistOnTap(
  supabase: SupabaseClient,
  beerId: string,
  beerName: string,
  breweryId: string,
  breweryName: string
): Promise<TriggerResult> {
  let sent = 0;
  let skipped = 0;

  // Find users who have this beer on their wishlist
  const { data: wishlistEntries } = await (supabase
    .from("wishlist")
    .select("user_id, user:profiles(id, notification_preferences)")
    .eq("beer_id", beerId) as any);

  if (!wishlistEntries?.length) return { sent: 0, skipped: 0, reason: "no wishlist matches" };

  for (const entry of wishlistEntries as any[]) {
    const userId = entry.user_id;
    const prefs = entry.user?.notification_preferences;

    if (!isTriggerEnabled(prefs, "wishlist_on_tap")) {
      skipped++;
      continue;
    }

    const triggerKey = `${beerId}-${breweryId}`;
    if (!(await canSendTrigger(supabase, userId, "wishlist_on_tap", triggerKey))) {
      skipped++;
      continue;
    }

    // Insert in-app notification
    await (supabase.from("notifications").insert({
      user_id: userId,
      type: "wishlist_on_tap",
      title: `${beerName} is on tap!`,
      body: `Your wishlisted beer is now available at ${breweryName}`,
      data: { beer_id: beerId, brewery_id: breweryId, url: `/brewery/${breweryId}` },
    }) as any);

    // Send push
    await sendPushToUser(supabase, userId, {
      title: `${beerName} is on tap!`,
      body: `Your wishlisted beer is now available at ${breweryName}`,
      tag: `wishlist-on-tap-${beerId}`,
      data: { url: `/brewery/${breweryId}` },
    });

    await recordTrigger(supabase, userId, "wishlist_on_tap", triggerKey);
    sent++;
  }

  return { sent, skipped };
}

// ─── Trigger 2: Friend Started Session ────────────────────────────────────────

/**
 * When a user starts a session, notify friends who have the trigger enabled.
 * Called from the session creation API.
 */
export async function triggerFriendSession(
  supabase: SupabaseClient,
  userId: string,
  displayName: string,
  breweryId: string | null,
  breweryName: string | null
): Promise<TriggerResult> {
  if (!breweryId || !breweryName) return { sent: 0, skipped: 0, reason: "home session" };

  let sent = 0;
  let skipped = 0;

  // Get user's friends
  const { data: friendships } = await supabase
    .from("friendships")
    .select("requester_id, addressee_id")
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
    .eq("status", "accepted");

  const friendIds = (friendships ?? []).map((f: any) =>
    f.requester_id === userId ? f.addressee_id : f.requester_id
  );

  if (friendIds.length === 0) return { sent: 0, skipped: 0, reason: "no friends" };

  // Get friends' notification preferences
  const { data: friendProfiles } = await (supabase
    .from("profiles")
    .select("id, notification_preferences")
    .in("id", friendIds) as any);

  for (const friend of (friendProfiles ?? []) as any[]) {
    if (!isTriggerEnabled(friend.notification_preferences, "friend_session")) {
      skipped++;
      continue;
    }

    const triggerKey = `${userId}-${breweryId}`;
    if (!(await canSendTrigger(supabase, friend.id, "friend_session", triggerKey))) {
      skipped++;
      continue;
    }

    await (supabase.from("notifications").insert({
      user_id: friend.id,
      type: "friend_session",
      title: `${displayName} is drinking!`,
      body: `Your friend just started a session at ${breweryName}`,
      data: { user_id: userId, brewery_id: breweryId, url: `/brewery/${breweryId}` },
    }) as any);

    await sendPushToUser(supabase, friend.id, {
      title: `${displayName} is drinking!`,
      body: `Your friend just started a session at ${breweryName}`,
      tag: `friend-session-${userId}`,
      data: { url: `/brewery/${breweryId}` },
    });

    await recordTrigger(supabase, friend.id, "friend_session", triggerKey);
    sent++;
  }

  return { sent, skipped };
}

// ─── Trigger 3: Loyalty Nudge ─────────────────────────────────────────────────

/**
 * After a session ends, check if user is close to a loyalty reward.
 * Called from the session end API.
 */
export async function triggerLoyaltyNudge(
  supabase: SupabaseClient,
  userId: string,
  breweryId: string,
  breweryName: string
): Promise<TriggerResult> {
  // Get active loyalty programs at this brewery
  const { data: programs } = await (supabase
    .from("loyalty_programs")
    .select("id, name, stamps_required, reward_description")
    .eq("brewery_id", breweryId)
    .eq("is_active", true) as any);

  if (!programs?.length) return { sent: 0, skipped: 0, reason: "no loyalty programs" };

  // Get user's loyalty cards at this brewery
  const { data: cards } = await (supabase
    .from("loyalty_cards")
    .select("program_id, stamps")
    .eq("user_id", userId)
    .eq("brewery_id", breweryId) as any);

  const cardMap: Record<string, number> = {};
  for (const card of (cards ?? []) as any[]) {
    if (card.program_id) cardMap[card.program_id] = card.stamps;
  }

  // Check user preferences
  const { data: profile } = await (supabase
    .from("profiles")
    .select("notification_preferences")
    .eq("id", userId)
    .single() as any);

  if (!isTriggerEnabled(profile?.notification_preferences, "loyalty_nudge")) {
    return { sent: 0, skipped: 0, reason: "disabled" };
  }

  let sent = 0;
  let skipped = 0;

  for (const program of programs as any[]) {
    const stamps = cardMap[program.id] ?? 0;
    const remaining = program.stamps_required - stamps;

    // Only nudge when 1-2 stamps away
    if (remaining > 0 && remaining <= 2) {
      const triggerKey = `${program.id}-${stamps}`;
      if (!(await canSendTrigger(supabase, userId, "loyalty_nudge", triggerKey))) {
        skipped++;
        continue;
      }

      const body = remaining === 1
        ? `Just 1 more visit to earn: ${program.reward_description}`
        : `${remaining} more visits to earn: ${program.reward_description}`;

      await (supabase.from("notifications").insert({
        user_id: userId,
        type: "loyalty_nudge",
        title: `Almost there at ${breweryName}!`,
        body,
        data: { brewery_id: breweryId, program_id: program.id, url: `/brewery/${breweryId}` },
      }) as any);

      await sendPushToUser(supabase, userId, {
        title: `Almost there at ${breweryName}!`,
        body,
        tag: `loyalty-nudge-${program.id}`,
        data: { url: `/brewery/${breweryId}` },
      });

      await recordTrigger(supabase, userId, "loyalty_nudge", triggerKey);
      sent++;
    }
  }

  return { sent, skipped };
}
