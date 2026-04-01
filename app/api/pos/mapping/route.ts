// POS Field Mapping — View and update POS item → HopTrack beer mappings
// Sprint 86 — The Connector
// GET /api/pos/mapping?brewery_id=xxx
// PUT /api/pos/mapping { brewery_id, mappings: [{ id, beer_id, mapping_type }] }

import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ data: null, meta: {}, error: { message: "Unauthorized", code: "unauthorized", status: 401 } }, { status: 401 });
  }

  const breweryId = req.nextUrl.searchParams.get("brewery_id");
  if (!breweryId) {
    return Response.json({ data: null, meta: {}, error: { message: "brewery_id is required", code: "bad_request", status: 400 } }, { status: 400 });
  }

  // Verify brewery access
  const { data: account } = await (supabase as any)
    .from("brewery_accounts")
    .select("role")
    .eq("user_id", user.id)
    .eq("brewery_id", breweryId)
    .single();

  if (!account || !["owner", "manager"].includes(account.role)) {
    return Response.json({ data: null, meta: {}, error: { message: "Not authorized", code: "forbidden", status: 403 } }, { status: 403 });
  }

  // Get all mappings with joined beer data
  const { data: mappings } = await (supabase as any)
    .from("pos_item_mappings")
    .select("id, pos_item_id, pos_item_name, beer_id, mapping_type, created_at, updated_at, beer:beers(id, name, style, abv)")
    .eq("brewery_id", breweryId)
    .order("pos_item_name");

  // Get all brewery beers for the mapping dropdown
  const { data: beers } = await (supabase as any)
    .from("beers")
    .select("id, name, style, abv, item_type")
    .eq("brewery_id", breweryId)
    .eq("is_active", true)
    .order("name");

  const unmappedCount = (mappings || []).filter((m: any) => m.mapping_type === "unmapped").length;

  return Response.json({
    data: {
      mappings: mappings || [],
      available_beers: beers || [],
      total: (mappings || []).length,
      unmapped_count: unmappedCount,
    },
    meta: {},
    error: null,
  });
}

export async function PUT(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ data: null, meta: {}, error: { message: "Unauthorized", code: "unauthorized", status: 401 } }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { brewery_id, mappings } = body;

  if (!brewery_id || !Array.isArray(mappings)) {
    return Response.json({ data: null, meta: {}, error: { message: "brewery_id and mappings array required", code: "bad_request", status: 400 } }, { status: 400 });
  }

  // Verify brewery access
  const { data: account } = await (supabase as any)
    .from("brewery_accounts")
    .select("role")
    .eq("user_id", user.id)
    .eq("brewery_id", brewery_id)
    .single();

  if (!account || !["owner", "manager"].includes(account.role)) {
    return Response.json({ data: null, meta: {}, error: { message: "Not authorized", code: "forbidden", status: 403 } }, { status: 403 });
  }

  // Update each mapping
  let updated = 0;
  const errors: string[] = [];

  for (const mapping of mappings) {
    if (!mapping.id) {
      errors.push("Missing mapping id");
      continue;
    }

    const updateData: any = { updated_at: new Date().toISOString() };
    if (mapping.beer_id !== undefined) {
      updateData.beer_id = mapping.beer_id;
      updateData.mapping_type = mapping.beer_id ? "manual" : "unmapped";
    }
    if (mapping.mapping_type) {
      updateData.mapping_type = mapping.mapping_type;
    }

    const { error } = await (supabase as any)
      .from("pos_item_mappings")
      .update(updateData)
      .eq("id", mapping.id)
      .eq("brewery_id", brewery_id);

    if (error) {
      errors.push(`Failed to update mapping ${mapping.id}: ${error.message}`);
    } else {
      updated++;
    }
  }

  return Response.json({
    data: { updated, errors: errors.length > 0 ? errors : null },
    meta: {},
    error: null,
  });
}
