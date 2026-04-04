import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { globSync } from "glob";

/**
 * Regression test: Supabase default PostgREST limit is 1000 rows.
 * Any query that uses `.length` on results to compute stats MUST either:
 *   1. Use `{ count: "exact", head: true }` for pure counts, OR
 *   2. Have an explicit `.limit()` to prevent silent capping
 *
 * Bug discovered Sprint 153: Brand dashboard showed "1000" for all stats
 * because queries hit the default 1000-row limit.
 *
 * Bug rediscovered Sprint 155: PostgREST max-rows setting caps at 1000 even
 * WITH .limit(50000). Count-display stats MUST use { count: "exact", head: true }.
 * Also: "today" queries must have an upper bound (.lt(tomorrowStart)) to avoid
 * counting future-dated seed data.
 */

// Files that contain dashboard/stats queries and use .length on results
const STATS_FILES = [
  "app/(brewery-admin)/brewery-admin/brand/[brand_id]/dashboard/page.tsx",
  "app/(brewery-admin)/brewery-admin/[brewery_id]/page.tsx",
  "app/demo/dashboard/page.tsx",
  "app/(brewery-admin)/brewery-admin/brand/[brand_id]/reports/page.tsx",
  "app/(brewery-admin)/brewery-admin/brand/[brand_id]/customers/page.tsx",
  "app/api/brand/[brand_id]/analytics/route.ts",
  "app/api/brand/[brand_id]/analytics/comparison/route.ts",
  "app/api/brewery/[brewery_id]/digest/route.ts",
  "app/api/brewery/[brewery_id]/user-stats/route.ts",
  "app/api/v1/breweries/[brewery_id]/stats/route.ts",
  "app/(app)/brewery/[id]/page.tsx",
  "app/(brewery-admin)/brewery-admin/[brewery_id]/analytics/page.tsx",
  "app/(brewery-admin)/brewery-admin/[brewery_id]/customers/page.tsx",
  "app/(brewery-admin)/brewery-admin/[brewery_id]/pint-rewind/page.tsx",
];

// Superadmin files with stat queries
const SUPERADMIN_FILES = [
  "lib/superadmin-metrics.ts",
  "lib/superadmin-brewery.ts",
  "lib/superadmin-brewery-list.ts",
  "lib/superadmin-stats.ts",
];

function readFile(relativePath: string): string {
  return readFileSync(join(process.cwd(), relativePath), "utf-8");
}

/**
 * Matches Supabase .from("table").select(...) chains that do NOT end with
 * .limit(), .single(), .maybeSingle(), or use { count: "exact" }.
 *
 * This is a conservative heuristic — it checks for common stat table queries
 * (sessions, beer_logs, brewery_visits, brewery_followers, etc.) that fetch
 * unbounded data used for .length counts.
 */
const STAT_TABLES = [
  "sessions",
  "beer_logs",
  "brewery_visits",
  "brewery_followers",
  "brewery_follows",
  "loyalty_cards",
  "loyalty_redemptions",
  "brand_loyalty_cards",
  "profiles",
];

describe("Stats query limit safety (S153 regression)", () => {
  describe("Dashboard files must not have limitless stat queries", () => {
    for (const filePath of STATS_FILES) {
      it(`${filePath} — all stat table queries have .limit() or count: "exact"`, () => {
        const content = readFile(filePath);
        const lines = content.split("\n");

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          for (const table of STAT_TABLES) {
            // Check if this line starts a query on a stat table
            if (line.includes(`.from("${table}")`) && line.includes(".select(")) {
              // Build the full query chain (may span multiple lines)
              let queryChain = line;
              let j = i + 1;
              // Accumulate continuation lines (lines that start with .)
              while (j < lines.length && (lines[j].trim().startsWith(".") || lines[j].trim() === "")) {
                queryChain += " " + lines[j].trim();
                if (lines[j].includes(" as any") || lines[j].includes("),") || lines[j].includes(";")) break;
                j++;
              }

              // Skip if it's a count query (correct pattern)
              if (queryChain.includes('count: "exact"')) continue;
              // Skip if it's a single-row query
              if (queryChain.includes(".single()") || queryChain.includes(".maybeSingle()")) continue;
              // Skip if it has .limit() (correct pattern)
              if (queryChain.includes(".limit(")) continue;
              // Skip display queries with small limits inherently (recent items)
              if (queryChain.includes(".order(") && queryChain.includes(".limit(")) continue;
              // Skip profile lookups bounded by .in("id", ...) — these are always small arrays
              if (table === "profiles" && queryChain.includes('.in("id"')) continue;

              // This query fetches from a stat table without a limit — flag it
              throw new Error(
                `UNSAFE: Limitless stat query on "${table}" at ${filePath}:${i + 1}.\n` +
                `  Add .limit(50000) or use { count: "exact", head: true }.\n` +
                `  Query: ${queryChain.trim().slice(0, 120)}...`
              );
            }
          }
        }
      });
    }
  });

  describe("Superadmin files must use adequate limits", () => {
    for (const filePath of SUPERADMIN_FILES) {
      it(`${filePath} — no .limit(1000) or lower on stat queries`, () => {
        const content = readFile(filePath);

        // Find all .limit(N) calls where N <= 1000
        const limitPattern = /\.limit\((\d+)\)/g;
        let match;
        while ((match = limitPattern.exec(content)) !== null) {
          const limit = parseInt(match[1], 10);
          // Small display limits (<=500) are fine — those are for "top N" or "recent N"
          if (limit <= 500) continue;
          // Limits between 501-1000 are suspicious — these are likely stat queries
          if (limit > 500 && limit <= 1000) {
            // Find the line number
            const lineNum = content.slice(0, match.index).split("\n").length;
            throw new Error(
              `SUSPICIOUS: .limit(${limit}) at ${filePath}:${lineNum}. ` +
              `Stat queries should use .limit(50000) or { count: "exact" }.`
            );
          }
        }
      });
    }
  });

  describe("Today queries must have upper bound (S155 regression)", () => {
    const TODAY_FILES = [
      "app/(brewery-admin)/brewery-admin/[brewery_id]/page.tsx",
      "app/demo/dashboard/page.tsx",
      "app/(brewery-admin)/brewery-admin/brand/[brand_id]/dashboard/page.tsx",
      "app/api/brand/[brand_id]/analytics/route.ts",
    ];

    for (const filePath of TODAY_FILES) {
      it(`${filePath} — todayStart queries have upper bound`, () => {
        const content = readFile(filePath);
        const lines = content.split("\n");

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          // Look for .gte("started_at", todayStart) or .gte("logged_at", todayStart)
          if (line.includes("todayStart") && (line.includes('.gte("started_at"') || line.includes('.gte("logged_at"'))) {
            // Build the full query chain
            let queryChain = line;
            let j = i + 1;
            while (j < lines.length && (lines[j].trim().startsWith(".") || lines[j].trim() === "")) {
              queryChain += " " + lines[j].trim();
              if (lines[j].includes(" as any") || lines[j].includes("),") || lines[j].includes(";")) break;
              j++;
            }

            // Must have .lt(tomorrowStart) or similar upper bound
            if (!queryChain.includes("tomorrowStart") && !queryChain.includes(".lt(")) {
              throw new Error(
                `UNSAFE: "today" query at ${filePath}:${i + 1} has no upper bound.\n` +
                `  Add .lt("started_at", tomorrowStart) to prevent counting future-dated data.\n` +
                `  Query: ${queryChain.trim().slice(0, 120)}...`
              );
            }
          }
        }
      });
    }
  });

  describe("KPI calculations handle large datasets", () => {
    it("calculateBreweryKPIs works with >1000 sessions", async () => {
      const { calculateBreweryKPIs } = await import("../kpi");

      const now = Date.now();
      // Generate 2000 sessions (more than the old 1000 limit)
      const sessions = Array.from({ length: 2000 }, (_, i) => ({
        id: `session-${i}`,
        user_id: `user-${i % 50}`, // 50 unique users
        started_at: new Date(now - i * 3600000).toISOString(),
        ended_at: new Date(now - i * 3600000 + 1800000).toISOString(),
        is_active: false,
      }));

      const beerLogs = Array.from({ length: 3000 }, (_, i) => ({
        id: `log-${i}`,
        beer_id: `beer-${i % 10}`,
        rating: (i % 5) + 1,
        quantity: 1,
        logged_at: new Date(now - i * 1800000).toISOString(),
      }));

      const result = calculateBreweryKPIs({
        sessions,
        beerLogs,
        periodDays: 30,
      });

      // Should compute real values, not capped at 1000
      expect(result).toBeDefined();
      expect(result.beersPerVisit).not.toBeNull();
    });

    it("calculateBreweryKPIs correctly computes with >1000 unique visitors", async () => {
      const { calculateBreweryKPIs } = await import("../kpi");

      const now = Date.now();
      // 1500 sessions with 1500 unique users — all new visitors
      const sessions = Array.from({ length: 1500 }, (_, i) => ({
        id: `session-${i}`,
        user_id: `user-${i}`, // Each session from a different user
        started_at: new Date(now - i * 3600000).toISOString(),
        ended_at: new Date(now - i * 3600000 + 1800000).toISOString(),
        is_active: false,
      }));

      const result = calculateBreweryKPIs({
        sessions,
        beerLogs: [],
        breweryVisits: sessions.map((s) => ({ user_id: s.user_id, total_visits: 1 })),
        periodDays: 30,
      });

      expect(result).toBeDefined();
      // With 1500 unique single-visit users, new visitor % should be 100%
      expect(result.newVisitorPct).toBe(100);
      expect(result.returningVisitorPct).toBe(0);
    });
  });

  describe("Infrastructure: PostgREST max_rows (S155)", () => {
    it("supabase/config.toml max_rows must be >= 10000", () => {
      const content = readFile("supabase/config.toml");
      const match = content.match(/max_rows\s*=\s*(\d+)/);
      expect(match).not.toBeNull();
      const maxRows = parseInt(match![1], 10);
      expect(maxRows).toBeGreaterThanOrEqual(10000);
    });
  });

  describe("All date-range queries must have upper bounds (S155)", () => {
    const ALL_TRACKED_FILES = [...STATS_FILES, ...SUPERADMIN_FILES];

    for (const filePath of ALL_TRACKED_FILES) {
      it(`${filePath} — .gte() date queries have .lt() upper bound`, () => {
        let content: string;
        try {
          content = readFile(filePath);
        } catch {
          return; // File doesn't exist yet — skip
        }
        const lines = content.split("\n");

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          // Look for .gte("started_at" or .gte("logged_at" or .gte("created_at" or .gte("redeemed_at"
          const gteMatch = line.match(/\.gte\("(started_at|logged_at|created_at|redeemed_at)"/);
          if (!gteMatch) continue;
          const field = gteMatch[1];

          // Build the full query chain
          let queryChain = line;
          let j = i + 1;
          while (j < lines.length && (lines[j].trim().startsWith(".") || lines[j].trim() === "")) {
            queryChain += " " + lines[j].trim();
            if (lines[j].includes(" as any") || lines[j].includes("),") || lines[j].includes(";")) break;
            j++;
          }

          // Skip if the query already has a .lt() on the same field
          if (queryChain.includes(`.lt("${field}"`)) continue;
          // Skip if the query has count: "exact" (head-only, no data returned)
          if (queryChain.includes('count: "exact"')) continue;
          // Skip if this is a "previous period" query that already has an upper bound via another .lt()
          if (queryChain.includes(".lt(")) continue;
          // Skip if bounded by a small limit (display queries like .limit(5), .limit(10), .limit(15))
          const limitMatch = queryChain.match(/\.limit\((\d+)\)/);
          if (limitMatch && parseInt(limitMatch[1], 10) <= 100) continue;

          throw new Error(
            `UNSAFE: .gte("${field}") at ${filePath}:${i + 1} has no .lt() upper bound.\n` +
            `  Future-dated data will be included. Add .lt("${field}", nowISO) or similar.\n` +
            `  Query: ${queryChain.trim().slice(0, 140)}...`
          );
        }
      });
    }
  });
});
