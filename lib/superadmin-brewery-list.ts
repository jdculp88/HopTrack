/**
 * Superadmin Brewery List — data engine
 * Sprint 143 — The Superadmin III
 *
 * Provides enriched brewery list data with business signals:
 * tier, session counts, last activity, followers, brand associations.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

// ── Types ──────────────────────────────────────────────────────────────

export type BreweryListSort = "name" | "sessions" | "last_active" | "created";
export type BreweryListFilter = "all" | "free" | "tap" | "cask" | "barrel" | "unclaimed";

export interface BreweryListItem {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  breweryType: string | null;
  createdAt: string;
  // Enriched fields
  tier: string;
  verified: boolean;
  sessionCount: number;
  lastActive: string | null;
  followerCount: number;
  beerCount: number;
  brandName: string | null;
}

export interface BreweryListSummary {
  total: number;
  claimed: number;
  verified: number;
  paid: number;
  mrrEstimate: number;
}

export interface BreweryListResult {
  breweries: BreweryListItem[];
  summary: BreweryListSummary;
  totalCount: number;
  page: number;
  pageSize: number;
}

// ── Helpers ────────────────────────────────────────────────────────────

const TIER_PRICES: Record<string, number> = { tap: 49, cask: 149, barrel: 299 };

function countByKey(rows: { brewery_id: string }[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (const r of rows) {
    map[r.brewery_id] = (map[r.brewery_id] || 0) + 1;
  }
  return map;
}

// ── Main ───────────────────────────────────────────────────────────────

export async function fetchBreweryList(
  service: SupabaseClient,
  options: {
    page?: number;
    pageSize?: number;
    sort?: BreweryListSort;
    filter?: BreweryListFilter;
    search?: string;
  } = {}
): Promise<BreweryListResult> {
  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? 50;
  const sort = options.sort ?? "name";
  const filter = options.filter ?? "all";
  const search = options.search?.trim() ?? "";
  const offset = (page - 1) * pageSize;

  // ── Step 1: resolve filter to brewery IDs if needed ──────────────

  let filterIds: string[] | null = null;

  if (filter === "unclaimed") {
    const { data: claimed } = await (service as any)
      .from("brewery_accounts")
      .select("brewery_id");
    const claimedSet = new Set((claimed ?? []).map((r: any) => r.brewery_id));

    // We need to fetch breweries NOT in that set — handled below
    filterIds = null; // special case
  } else if (["free", "tap", "cask", "barrel"].includes(filter)) {
    if (filter === "free") {
      // Free = in brewery_accounts but subscription_tier is null or free
      const { data: freeAccounts } = await (service as any)
        .from("brewery_accounts")
        .select("brewery_id")
        .or("subscription_tier.is.null,subscription_tier.eq.free");
      filterIds = (freeAccounts ?? []).map((r: any) => r.brewery_id);
    } else {
      const { data: tierAccounts } = await (service as any)
        .from("brewery_accounts")
        .select("brewery_id")
        .eq("subscription_tier", filter);
      filterIds = (tierAccounts ?? []).map((r: any) => r.brewery_id);
    }
  }

  // ── Step 2: build brewery query ──────────────────────────────────

  let breweryQuery = (service as any)
    .from("breweries")
    .select("id, name, city, state, brewery_type, created_at, brand_id", { count: "exact" });

  if (search) {
    breweryQuery = breweryQuery.ilike("name", `%${search}%`);
  }

  if (filter === "unclaimed") {
    // Fetch claimed IDs to exclude
    const { data: claimed } = await (service as any)
      .from("brewery_accounts")
      .select("brewery_id");
    const claimedIds = (claimed ?? []).map((r: any) => r.brewery_id);
    if (claimedIds.length > 0) {
      breweryQuery = breweryQuery.not("id", "in", `(${claimedIds.join(",")})`);
    }
  } else if (filterIds !== null) {
    if (filterIds.length === 0) {
      return { breweries: [], summary: await fetchSummary(service), totalCount: 0, page, pageSize };
    }
    breweryQuery = breweryQuery.in("id", filterIds);
  }

  // Sort (name and created sort at DB level; sessions/last_active sort after enrichment)
  if (sort === "name") breweryQuery = breweryQuery.order("name", { ascending: true });
  else if (sort === "created") breweryQuery = breweryQuery.order("created_at", { ascending: false });
  else breweryQuery = breweryQuery.order("name", { ascending: true }); // default, re-sorted in JS

  // Pagination (for JS-sorted fields, we fetch a larger window — capped at 500)
  const needsJsSort = sort === "sessions" || sort === "last_active";
  if (!needsJsSort) {
    breweryQuery = breweryQuery.range(offset, offset + pageSize - 1);
  } else {
    breweryQuery = breweryQuery.limit(500);
  }

  // ── Step 3: parallel — breweries + summary ───────────────────────

  const [breweryResult, summary] = await Promise.all([
    breweryQuery,
    fetchSummary(service),
  ]);

  const breweryRows: any[] = breweryResult.data ?? [];
  const totalCount: number = breweryResult.count ?? breweryRows.length;

  if (breweryRows.length === 0) {
    return { breweries: [], summary, totalCount, page, pageSize };
  }

  const ids = breweryRows.map((b: any) => b.id);

  // ── Step 4: enrichment queries in parallel ───────────────────────

  const [accountsRes, sessionsRes, lastSessionRes, followsRes, beersRes, brandsRes] =
    await Promise.all([
      (service as any).from("brewery_accounts").select("brewery_id, subscription_tier, verified").in("brewery_id", ids),
      (service as any).from("sessions").select("brewery_id").in("brewery_id", ids).limit(10000),
      (service as any).from("sessions").select("brewery_id, started_at").in("brewery_id", ids).order("started_at", { ascending: false }).limit(10000),
      (service as any).from("brewery_follows").select("brewery_id").in("brewery_id", ids).limit(10000),
      (service as any).from("beers").select("brewery_id").in("brewery_id", ids).limit(10000),
      (service as any).from("brewery_brands").select("id, name"),
    ]);

  // Build lookup maps
  const accountMap: Record<string, { tier: string; verified: boolean }> = {};
  for (const a of (accountsRes.data ?? []) as any[]) {
    accountMap[a.brewery_id] = {
      tier: a.subscription_tier ?? "free",
      verified: !!a.verified,
    };
  }

  const sessionCounts = countByKey((sessionsRes.data ?? []) as any[]);

  const lastSessionMap: Record<string, string> = {};
  for (const s of (lastSessionRes.data ?? []) as any[]) {
    if (!lastSessionMap[s.brewery_id]) {
      lastSessionMap[s.brewery_id] = s.started_at;
    }
  }

  const followerCounts = countByKey((followsRes.data ?? []) as any[]);
  const beerCounts = countByKey((beersRes.data ?? []) as any[]);

  const brandMap: Record<string, string> = {};
  for (const b of (brandsRes.data ?? []) as any[]) {
    brandMap[b.id] = b.name;
  }

  // ── Step 5: assemble enriched items ──────────────────────────────

  let breweries: BreweryListItem[] = breweryRows.map((b: any) => {
    const account = accountMap[b.id];
    return {
      id: b.id,
      name: b.name,
      city: b.city,
      state: b.state,
      breweryType: b.brewery_type,
      createdAt: b.created_at,
      tier: account ? account.tier : "unclaimed",
      verified: account?.verified ?? false,
      sessionCount: sessionCounts[b.id] ?? 0,
      lastActive: lastSessionMap[b.id] ?? null,
      followerCount: followerCounts[b.id] ?? 0,
      beerCount: beerCounts[b.id] ?? 0,
      brandName: b.brand_id ? (brandMap[b.brand_id] ?? null) : null,
    };
  });

  // ── Step 6: JS sort for enriched fields + paginate ───────────────

  if (sort === "sessions") {
    breweries.sort((a, b) => b.sessionCount - a.sessionCount);
  } else if (sort === "last_active") {
    breweries.sort((a, b) => {
      if (!a.lastActive && !b.lastActive) return 0;
      if (!a.lastActive) return 1;
      if (!b.lastActive) return -1;
      return b.lastActive.localeCompare(a.lastActive);
    });
  }

  if (needsJsSort) {
    breweries = breweries.slice(offset, offset + pageSize);
  }

  return { breweries, summary, totalCount, page, pageSize };
}

// ── Summary (reusable) ─────────────────────────────────────────────────

async function fetchSummary(service: SupabaseClient): Promise<BreweryListSummary> {
  const [totalRes, accountsRes] = await Promise.all([
    (service as any).from("breweries").select("id", { count: "exact", head: true }),
    (service as any).from("brewery_accounts").select("brewery_id, subscription_tier, subscription_status, verified"),
  ]);

  const total = totalRes.count ?? 0;
  const accounts: any[] = accountsRes.data ?? [];
  const uniqueClaimed = new Set(accounts.map((a: any) => a.brewery_id)).size;
  const verified = accounts.filter((a: any) => a.verified).length;
  const paidAccounts = accounts.filter(
    (a: any) =>
      ["tap", "cask", "barrel"].includes(a.subscription_tier) &&
      a.subscription_status === "active"
  );

  const mrrEstimate = paidAccounts.reduce(
    (sum: number, a: any) => sum + (TIER_PRICES[a.subscription_tier] ?? 0),
    0
  );

  return { total, claimed: uniqueClaimed, verified, paid: paidAccounts.length, mrrEstimate };
}
