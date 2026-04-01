// API Key Management — GET (list), POST (create), PATCH (revoke)
// Sprint 85 — The Pipeline (Avery)
// Brewery owners/managers generate and revoke API keys from Settings

import { createClient } from "@/lib/supabase/server";
import { generateApiKey } from "@/lib/api-keys";
import { NextRequest, NextResponse } from "next/server";
import { rateLimitResponse } from "@/lib/rate-limit";

async function getBreweryAccount(supabase: any, userId: string, breweryId: string) {
  const { data } = await supabase
    .from("brewery_accounts")
    .select("role")
    .eq("user_id", userId)
    .eq("brewery_id", breweryId)
    .in("role", ["owner", "manager"])
    .single();
  return data;
}

// GET — List active API keys for this brewery (hashes NOT returned, only prefix)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ brewery_id: string }> }
) {
  const { brewery_id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const account = await getBreweryAccount(supabase as any, user.id, brewery_id);
  if (!account) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data: keys, error } = await (supabase as any)
    .from("api_keys")
    .select("id, name, key_prefix, created_at, last_used_at, revoked_at, rate_limit")
    .eq("brewery_id", brewery_id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: keys ?? [] });
}

// POST — Create a new API key
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ brewery_id: string }> }
) {
  const rl = rateLimitResponse(req, "api-keys:create", { limit: 10, windowMs: 60_000 });
  if (rl) return rl;

  const { brewery_id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const account = await getBreweryAccount(supabase as any, user.id, brewery_id);
  if (!account) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const name = (body.name ?? "Default").slice(0, 50).trim();

  const { rawKey, keyHash, keyPrefix } = generateApiKey();

  const { error } = await (supabase as any)
    .from("api_keys")
    .insert({
      brewery_id,
      created_by: user.id,
      name,
      key_hash: keyHash,
      key_prefix: keyPrefix,
    });

  if (error) {
    if (error.message?.includes("Maximum of 5")) {
      return NextResponse.json({ error: "Maximum of 5 active API keys per brewery. Revoke one first." }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Return the raw key ONCE — it's not stored
  return NextResponse.json({
    data: {
      key: rawKey,
      key_prefix: keyPrefix,
      name,
      message: "Store this key securely. It will not be shown again.",
    },
  }, { status: 201 });
}

// PATCH — Revoke an API key
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ brewery_id: string }> }
) {
  const { brewery_id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const account = await getBreweryAccount(supabase as any, user.id, brewery_id);
  if (!account) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const keyId = body.key_id;
  if (!keyId) return NextResponse.json({ error: "key_id required" }, { status: 400 });

  const { error } = await (supabase as any)
    .from("api_keys")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", keyId)
    .eq("brewery_id", brewery_id)
    .is("revoked_at", null);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
