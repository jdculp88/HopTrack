// API Key utilities for HopTrack Public API v1
// Sprint 85 — The Pipeline

import { createClient as createServerClient } from "@/lib/supabase/server";
import crypto from "crypto";

const API_KEY_PREFIX = "ht_live_";

/**
 * Generate a new API key. Returns the raw key (show once) and its SHA-256 hash (store).
 */
export function generateApiKey(): { rawKey: string; keyHash: string; keyPrefix: string } {
  const randomBytes = crypto.randomBytes(32).toString("hex");
  const rawKey = `${API_KEY_PREFIX}${randomBytes}`;
  const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");
  const keyPrefix = rawKey.slice(0, API_KEY_PREFIX.length + 8); // "ht_live_" + 8 chars
  return { rawKey, keyHash, keyPrefix };
}

/**
 * Hash a raw API key for lookup.
 */
export function hashApiKey(rawKey: string): string {
  return crypto.createHash("sha256").update(rawKey).digest("hex");
}

export interface ValidatedApiKey {
  id: string;
  brewery_id: string;
  name: string;
  rate_limit: number;
}

/**
 * Validate an API key from a request. Returns the key record or null.
 * Updates last_used_at on successful validation.
 */
export async function validateApiKey(req: Request): Promise<ValidatedApiKey | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const rawKey = authHeader.slice(7).trim();
  if (!rawKey.startsWith(API_KEY_PREFIX)) return null;

  const keyHash = hashApiKey(rawKey);
  const supabase = await createServerClient();

  const { data: keyRecord } = await (supabase as any)
    .from("api_keys")
    .select("id, brewery_id, name, rate_limit")
    .eq("key_hash", keyHash)
    .is("revoked_at", null)
    .maybeSingle();

  if (!keyRecord) return null;

  // Update last_used_at (fire-and-forget)
  (supabase as any)
    .from("api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", keyRecord.id)
    .then(() => {});

  return keyRecord;
}

/**
 * Standard API v1 JSON response envelope.
 */
export function apiResponse(data: any, meta?: Record<string, any>, status = 200) {
  return new Response(
    JSON.stringify({ data, meta: meta ?? {}, error: null }),
    {
      status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    }
  );
}

/**
 * Standard API v1 error response.
 */
export function apiError(message: string, status: number, code?: string) {
  return new Response(
    JSON.stringify({ data: null, meta: {}, error: { message, code: code ?? "error", status } }),
    {
      status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    }
  );
}

/**
 * OPTIONS handler for CORS preflight on all v1 routes.
 */
export function apiOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}
