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
 */

// Files that contain dashboard/stats queries and use .length on results
const STATS_FILES = [
  "app/(brewery-admin)/brewery-admin/brand/[brand_id]/dashboard/page.tsx",
  "app/(brewery-admin)/brewery-admin/[brewery_id]/page.tsx",
  "app/demo/dashboard/page.tsx",
  "app/(brewery-admin)/brewery-admin/brand/[brand_id]/reports/page.tsx",
  "app/(brewery-admin)/brewery-admin/brand/[brand_id]/customers/page.tsx",
  "app/api/brand/[brand_id]/analytics/route.ts",
  "app/(app)/brewery/[id]/page.tsx",
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
});
