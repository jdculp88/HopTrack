// POS Sync Engine — Menu Reconciliation
// Sprint 87 — The Sync Engine
// Takes POS menu items → diffs against brewery's tap list → applies changes
// Provider-agnostic. Never deletes beers — only toggles is_on_tap.

import { createClient as createServiceClient } from "@supabase/supabase-js";
import type { PosMenuItem, BeerForMatching, SyncResult, SyncContext, MappingResult } from "./types";
import { getAdapter } from "./normalizer";
import { autoMap } from "./mapper";
import { isMockMode, generateMockMenuItems, generateMockSquareCatalog } from "./mock-provider";

/**
 * Run a full POS sync for a brewery.
 *
 * Flow: Normalize → Match → Diff → Apply → Log
 *
 * Uses service role client for write operations (webhook context has no user session).
 */
export async function runSync(
  ctx: SyncContext,
  rawMenuData: unknown
): Promise<SyncResult> {
  const startTime = Date.now();

  try {
    // 1. Normalize POS data to common shape
    const adapter = getAdapter(ctx.provider);
    const posItems = ctx.sync_type === "webhook"
      ? adapter.normalizeWebhookPayload(rawMenuData)
      : adapter.normalizeMenuItems(rawMenuData);

    // Square webhooks are notification-only — need to fetch catalog
    // If no items returned from webhook, we'd need to fetch. For now, return early.
    if (posItems.length === 0 && ctx.sync_type === "webhook") {
      // Square webhook: notification only, actual data comes from manual/scheduled sync
      return {
        items_added: 0,
        items_updated: 0,
        items_removed: 0,
        items_unmapped: 0,
        status: "success",
        duration_ms: Date.now() - startTime,
        mappings: [],
      };
    }

    // 2. Get service role client for DB writes
    const supabase = getServiceClient();

    // 3. Fetch current beers for this brewery
    const { data: currentBeers, error: beersError } = await supabase
      .from("beers")
      .select("id, name, style, abv, brewery_id, pos_item_id, is_on_tap, item_type")
      .eq("brewery_id", ctx.brewery_id);

    if (beersError) {
      throw new Error(`Failed to fetch beers: ${beersError.message}`);
    }

    const beers: BeerForMatching[] = (currentBeers || []).map((b: any) => ({
      id: b.id,
      name: b.name,
      style: b.style,
      abv: b.abv,
      brewery_id: b.brewery_id,
      pos_item_id: b.pos_item_id,
      is_on_tap: b.is_on_tap ?? true,
      item_type: b.item_type,
    }));

    // 4. Auto-map POS items to beers
    const mappings = autoMap(posItems, beers);

    // 5. Apply changes
    const result = await applySync(supabase, ctx, posItems, mappings, beers);

    return {
      ...result,
      duration_ms: Date.now() - startTime,
      mappings,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown sync error";
    console.error(`[POS Sync] Error for brewery ${ctx.brewery_id}:`, message);
    return {
      items_added: 0,
      items_updated: 0,
      items_removed: 0,
      items_unmapped: 0,
      status: "failed",
      error: message,
      duration_ms: Date.now() - startTime,
      mappings: [],
    };
  }
}

/**
 * Apply the sync results to the database.
 * - New mapped items: insert beer + mapping
 * - Updated items: update price/availability
 * - Removed items: set is_on_tap = false (never delete)
 * - Unmapped items: create mapping with mapping_type = 'unmapped'
 */
async function applySync(
  supabase: any,
  ctx: SyncContext,
  posItems: PosMenuItem[],
  mappings: MappingResult[],
  currentBeers: BeerForMatching[]
): Promise<Omit<SyncResult, "duration_ms" | "mappings">> {
  let itemsAdded = 0;
  let itemsUpdated = 0;
  let itemsRemoved = 0;
  let itemsUnmapped = 0;
  let hasErrors = false;

  const posItemIds = new Set(posItems.map(p => p.pos_item_id));
  const posItemMap = new Map(posItems.map(p => [p.pos_item_id, p]));

  // Process each mapping
  for (const mapping of mappings) {
    const posItem = posItemMap.get(mapping.pos_item_id);
    if (!posItem) continue;

    if (mapping.beer_id) {
      // Matched to existing beer — update POS fields
      const { error } = await supabase
        .from("beers")
        .update({
          pos_item_id: mapping.pos_item_id,
          pos_price_cents: posItem.price_cents,
          pos_last_seen_at: new Date().toISOString(),
          is_on_tap: posItem.is_available,
        })
        .eq("id", mapping.beer_id);

      if (error) {
        console.error(`[POS Sync] Failed to update beer ${mapping.beer_id}:`, error.message);
        hasErrors = true;
      } else {
        itemsUpdated++;
      }
    } else {
      // Unmapped — create a new beer entry for the brewery
      const { data: newBeer, error: insertError } = await supabase
        .from("beers")
        .insert({
          brewery_id: ctx.brewery_id,
          name: posItem.name,
          style: inferStyleFromCategory(posItem.category),
          is_on_tap: posItem.is_available,
          pos_item_id: posItem.pos_item_id,
          pos_price_cents: posItem.price_cents,
          pos_last_seen_at: new Date().toISOString(),
          item_type: posItem.item_type,
          source: "pos",
        })
        .select("id")
        .single();

      if (insertError) {
        console.error(`[POS Sync] Failed to insert beer "${posItem.name}":`, insertError.message);
        hasErrors = true;
        itemsUnmapped++;
      } else {
        itemsAdded++;
        // Update the mapping with the new beer ID
        mapping.beer_id = newBeer.id;
        mapping.beer_name = posItem.name;
        mapping.mapping_type = "auto";
      }
    }

    // Upsert pos_item_mapping
    const { error: mappingError } = await supabase
      .from("pos_item_mappings")
      .upsert({
        pos_connection_id: ctx.pos_connection_id,
        brewery_id: ctx.brewery_id,
        pos_item_id: mapping.pos_item_id,
        pos_item_name: mapping.pos_item_name,
        beer_id: mapping.beer_id,
        mapping_type: mapping.mapping_type,
      }, {
        onConflict: "pos_connection_id,pos_item_id",
        ignoreDuplicates: false,
      });

    if (mappingError) {
      // Fallback: try insert if upsert fails (constraint might not exist yet)
      await supabase
        .from("pos_item_mappings")
        .insert({
          pos_connection_id: ctx.pos_connection_id,
          brewery_id: ctx.brewery_id,
          pos_item_id: mapping.pos_item_id,
          pos_item_name: mapping.pos_item_name,
          beer_id: mapping.beer_id,
          mapping_type: mapping.mapping_type,
        });
    }
  }

  // Deactivate beers that are in our DB with a pos_item_id but NOT in the POS menu anymore
  const beersWithPosId = currentBeers.filter(b => b.pos_item_id && b.is_on_tap);
  for (const beer of beersWithPosId) {
    if (!posItemIds.has(beer.pos_item_id!)) {
      const { error } = await supabase
        .from("beers")
        .update({ is_on_tap: false })
        .eq("id", beer.id);

      if (!error) {
        itemsRemoved++;
      } else {
        hasErrors = true;
      }
    }
  }

  return {
    items_added: itemsAdded,
    items_updated: itemsUpdated,
    items_removed: itemsRemoved,
    items_unmapped: itemsUnmapped,
    status: hasErrors ? "partial" : "success",
  };
}

/**
 * Get mock or real POS menu data.
 * In mock mode, returns generated data. In real mode, would call POS API.
 */
export async function fetchPosMenuData(
  provider: string,
  _accessToken: string,
  _locationId: string | null
): Promise<unknown> {
  if (isMockMode()) {
    if (provider === "toast") {
      const { generateMockToastWebhook } = await import("./mock-provider");
      return generateMockToastWebhook(20);
    }
    if (provider === "square") {
      return generateMockSquareCatalog(20);
    }
  }

  // Real API calls — stubbed until partner access
  // Toast: GET https://ws-api.toasttab.com/restaurants/{restaurantGuid}/menus
  // Square: GET https://connect.squareup.com/v2/catalog/list?types=ITEM
  console.warn(`[POS Sync] Real ${provider} API not yet connected. Enable POS_MOCK_MODE=true for testing.`);
  return null;
}

/** Best-effort style inference from POS category name */
function inferStyleFromCategory(category: string | null): string | null {
  if (!category) return null;
  const lower = category.toLowerCase();
  if (lower.includes("ipa")) return "IPA";
  if (lower.includes("stout")) return "Stout";
  if (lower.includes("porter")) return "Porter";
  if (lower.includes("lager")) return "Lager";
  if (lower.includes("pilsner")) return "Pilsner";
  if (lower.includes("wheat")) return "Wheat";
  if (lower.includes("sour")) return "Sour";
  if (lower.includes("amber")) return "Amber";
  if (lower.includes("pale ale")) return "Pale Ale";
  if (lower.includes("blonde")) return "Blonde Ale";
  if (lower.includes("saison")) return "Saison";
  if (lower.includes("cider")) return "Cider";
  return null;
}

/** Service role client for sync operations (bypasses RLS) */
function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase service role not configured for POS sync");
  }
  return createServiceClient(url, key);
}
