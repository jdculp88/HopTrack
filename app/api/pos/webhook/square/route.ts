// Square Webhook Receiver — catalog.version.updated events
// Sprint 86 — The Connector
// POST /api/pos/webhook/square

import { NextRequest } from "next/server";
import crypto from "crypto";

const MAX_WEBHOOK_AGE_MS = 5 * 60 * 1000; // 5 minutes — replay protection

export async function POST(req: NextRequest) {
  // Verify Square signature
  const signature = req.headers.get("x-square-hmacsha256-signature");
  const webhookSecret = process.env.SQUARE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("[POS Webhook] SQUARE_WEBHOOK_SECRET not configured");
    return Response.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const rawBody = await req.text();

  if (!signature) {
    console.warn("[POS Webhook] Missing signature header from Square");
    return Response.json({ error: "Missing signature" }, { status: 401 });
  }

  // Square uses the notification URL + body for HMAC
  const notificationUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://app.hoptrack.beer"}/api/pos/webhook/square`;
  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(notificationUrl + rawBody)
    .digest("base64");

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    console.warn("[POS Webhook] Invalid Square signature");
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }

  // Parse payload
  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Replay protection
  const webhookTimestamp = payload.created_at;
  if (webhookTimestamp) {
    const age = Date.now() - new Date(webhookTimestamp).getTime();
    if (age > MAX_WEBHOOK_AGE_MS) {
      console.warn("[POS Webhook] Stale Square webhook rejected:", age, "ms old");
      return Response.json({ error: "Webhook too old" }, { status: 400 });
    }
  }

  // TODO (Sprint 87): Process catalog changes
  // 1. Look up pos_connections by provider_merchant_id (Square merchant ID from payload)
  // 2. Decrypt access token
  // 3. Fetch updated catalog from Square API
  // 4. Diff against current HopTrack tap list
  // 5. Apply changes
  // 6. Log to pos_sync_logs
  // 7. Notify brewery owner of unmapped items

  console.log("[POS Webhook] Square event received:", payload.type || "unknown");

  // ACK the webhook
  return Response.json({ received: true });
}
