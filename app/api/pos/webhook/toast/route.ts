// Toast Webhook Receiver — menus.updated events
// Sprint 86 — The Connector | Sprint 87 — The Sync Engine
// POST /api/pos/webhook/toast

import { NextRequest } from "next/server";
import crypto from "crypto";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { runSync } from "@/lib/pos-sync/engine";
import { createLogger } from "@/lib/logger";

const logger = createLogger("POS Webhook / Toast");

const MAX_WEBHOOK_AGE_MS = 5 * 60 * 1000; // 5 minutes — replay protection

export async function POST(req: NextRequest) {
  // Verify HMAC-SHA256 signature
  const signature = req.headers.get("toast-signature") || req.headers.get("x-toast-signature");
  const webhookSecret = process.env.TOAST_WEBHOOK_SECRET;

  if (!webhookSecret) {
    logger.error("TOAST_WEBHOOK_SECRET not configured");
    return Response.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const rawBody = await req.text();

  if (!signature) {
    logger.warn("Missing signature header from Toast");
    return Response.json({ error: "Missing signature" }, { status: 401 });
  }

  // Verify HMAC
  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    logger.warn("Invalid Toast signature");
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }

  // Parse payload
  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Replay protection — check timestamp
  const webhookTimestamp = payload.timestamp || payload.createdAt;
  if (webhookTimestamp) {
    const age = Date.now() - new Date(webhookTimestamp).getTime();
    if (age > MAX_WEBHOOK_AGE_MS) {
      logger.warn("Stale webhook rejected", { ageMs: age });
      return Response.json({ error: "Webhook too old" }, { status: 400 });
    }
  }

  logger.info("Event received", { type: payload.eventType || "unknown" });

  // ACK immediately — process async to stay within webhook timeout
  // Toast sends the full menu payload in menus.updated events
  const eventType = payload.eventType || payload.type;
  if (eventType === "menus.updated" || eventType === "menus.published") {
    // Fire and forget — don't block webhook response
    processToastWebhook(payload).catch(err => {
      logger.error("Async processing error", { error: String(err) });
    });
  }

  return Response.json({ received: true });
}

async function processToastWebhook(payload: any) {
  const restaurantGuid = payload.restaurantGuid || payload.restaurantExternalId;
  if (!restaurantGuid) {
    logger.warn("Payload missing restaurantGuid");
    return;
  }

  // Look up connection by provider_location_id
  const supabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: connection } = await supabase
    .from("pos_connections")
    .select("id, brewery_id, status")
    .eq("provider", "toast")
    .eq("provider_location_id", restaurantGuid)
    .eq("status", "active")
    .single();

  if (!connection) {
    logger.warn("No active connection for restaurant", { restaurantGuid });
    return;
  }

  // Run sync engine with webhook payload
  const result = await runSync(
    {
      brewery_id: connection.brewery_id,
      pos_connection_id: connection.id,
      provider: "toast",
      sync_type: "webhook",
    },
    payload
  );

  // Update connection status
  await supabase
    .from("pos_connections")
    .update({
      last_sync_at: new Date().toISOString(),
      last_sync_status: result.status,
      last_sync_item_count: result.items_added + result.items_updated,
    })
    .eq("id", connection.id);

  // Update brewery summary
  await supabase
    .from("breweries")
    .update({ pos_last_sync_at: new Date().toISOString() })
    .eq("id", connection.brewery_id);

  // Log sync
  await supabase
    .from("pos_sync_logs")
    .insert({
      pos_connection_id: connection.id,
      brewery_id: connection.brewery_id,
      sync_type: "webhook",
      provider: "toast",
      items_added: result.items_added,
      items_updated: result.items_updated,
      items_removed: result.items_removed,
      items_unmapped: result.items_unmapped,
      status: result.status,
      error: result.error || null,
      duration_ms: result.duration_ms,
    });

  logger.info("Sync complete", {
    breweryId: connection.brewery_id,
    added: result.items_added,
    updated: result.items_updated,
    removed: result.items_removed,
  });
}
