// POS Sync Engine — Shared Types
// Sprint 87 — The Sync Engine
// Provider-agnostic types for menu reconciliation

import type { PosProvider, PosMappingType } from "@/types/database";

/** Normalized menu item — provider-agnostic shape */
export interface PosMenuItem {
  pos_item_id: string;
  name: string;
  category: string | null;
  price_cents: number | null;
  is_available: boolean;
  description: string | null;
  /** Item type mapped from POS category: beer, cider, wine, cocktail, non_alcoholic */
  item_type: string;
  /** Provider-specific raw data for debugging */
  raw?: unknown;
}

/** A matched POS item to a HopTrack beer */
export interface MappingResult {
  pos_item_id: string;
  pos_item_name: string;
  beer_id: string | null;
  beer_name: string | null;
  mapping_type: PosMappingType;
  confidence: "high" | "medium" | "low" | "none";
  /** For conflicts: what the POS says vs what HopTrack says */
  conflict?: { pos_name: string; hoptrack_name: string };
}

/** Result of a sync operation */
export interface SyncResult {
  items_added: number;
  items_updated: number;
  items_removed: number;
  items_unmapped: number;
  status: "success" | "partial" | "failed";
  error?: string;
  duration_ms: number;
  mappings: MappingResult[];
}

/** Beer record shape for matching (minimal fields) */
export interface BeerForMatching {
  id: string;
  name: string;
  style: string | null;
  abv: number | null;
  brewery_id: string;
  pos_item_id: string | null;
  is_on_tap: boolean;
  item_type: string | null;
}

/** Provider adapter interface */
export interface PosProviderAdapter {
  name: PosProvider;
  /** Normalize raw API response into PosMenuItems */
  normalizeMenuItems(raw: unknown): PosMenuItem[];
  /** Normalize webhook payload into PosMenuItems */
  normalizeWebhookPayload(raw: unknown): PosMenuItem[];
}

/** Sync context — everything the engine needs */
export interface SyncContext {
  brewery_id: string;
  pos_connection_id: string;
  provider: PosProvider;
  sync_type: "webhook" | "manual" | "scheduled";
}
