import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

/**
 * Single source of truth for every stat column in HopTrack that MUST have a
 * non-seed write path. Any displayed stat that lives in a column (not computed
 * on-the-fly) gets a row in the table below.
 *
 * Each row declares:
 *   - column        — table.column that's displayed somewhere in the UI
 *   - writerType    — "rpc" | "trigger" | "api_route"
 *   - writerPath    — file path to where the writer lives
 *   - writerMatch   — regex or literal string the writer file must contain
 *
 * The test iterates the table and asserts every writerPath exists on disk AND
 * contains the expected match. If any row fails, we have a broken write path —
 * which means the display is about to silently return 0/null in prod.
 *
 * When you add a new stat column to the UI, ADD A ROW HERE. The orphaned-columns
 * guard will catch columns that are never added, but this test gives us the
 * positive assertion: "we know this column is wired, and here's where."
 *
 * Related: lib/__tests__/orphaned-columns-guard.test.ts (negative guard),
 *          ~/.claude/projects/.../memory/feedback_write_path_audit.md
 */

interface StatWritePathRow {
  column: string;
  writerType: "rpc" | "trigger" | "api_route";
  writerPath: string;
  writerMatch: RegExp;
  addedInSprint: string;
  notes?: string;
}

const STAT_WRITE_PATHS: StatWritePathRow[] = [
  // ── profiles — xp, level, streaks, unique_breweries ────────────────────
  // All updated atomically by the increment_xp RPC at session end.
  {
    column: "profiles.xp",
    writerType: "rpc",
    writerPath: "supabase/migrations/036_xp_atomic_increment.sql",
    writerMatch: /xp\s*=\s*xp\s*\+\s*p_xp_amount/,
    addedInSprint: "S30 (atomic fix S31)",
  },
  {
    column: "profiles.level",
    writerType: "rpc",
    writerPath: "supabase/migrations/036_xp_atomic_increment.sql",
    writerMatch: /level\s*=\s*GREATEST\(level,\s*p_new_level\)/,
    addedInSprint: "S30",
  },
  {
    column: "profiles.unique_breweries",
    writerType: "rpc",
    writerPath: "supabase/migrations/036_xp_atomic_increment.sql",
    writerMatch: /unique_breweries\s*=\s*CASE[\s\S]*?unique_breweries\s*\+\s*1/,
    addedInSprint: "S30",
  },
  {
    column: "profiles.current_streak",
    writerType: "rpc",
    writerPath: "supabase/migrations/036_xp_atomic_increment.sql",
    writerMatch: /current_streak\s*=\s*CASE[\s\S]*?p_streak_updates/,
    addedInSprint: "S30",
  },
  {
    column: "profiles.longest_streak",
    writerType: "rpc",
    writerPath: "supabase/migrations/036_xp_atomic_increment.sql",
    writerMatch: /longest_streak\s*=\s*CASE[\s\S]*?GREATEST\(longest_streak/,
    addedInSprint: "S30",
  },

  // ── profiles — unique_beers ────────────────────────────────────────────
  // Shipped S177 The Plumbing — trigger on beer_logs insert.
  // Orphaned for 170+ sprints before this fix.
  {
    column: "profiles.unique_beers",
    writerType: "trigger",
    writerPath: "supabase/migrations/113_fix_orphaned_stat_columns.sql",
    writerMatch: /CREATE OR REPLACE FUNCTION public\.sync_profile_unique_beers_on_beer_log[\s\S]*?unique_beers\s*=\s*unique_beers\s*\+\s*1/,
    addedInSprint: "S177 The Plumbing",
    notes: "Fired by trg_sync_profile_unique_beers on beer_logs AFTER INSERT",
  },

  // ── profiles — total_checkins ──────────────────────────────────────────
  // Non-atomic read-modify-write in the sessions POST route. Has a race
  // condition window but is functional. A follow-up should migrate it to a
  // proper RPC or trigger for consistency with the other stat columns.
  {
    column: "profiles.total_checkins",
    writerType: "api_route",
    writerPath: "app/api/sessions/route.ts",
    writerMatch: /total_checkins:\s*\(profile\.total_checkins\s*\|\|\s*0\)\s*\+\s*1/,
    addedInSprint: "pre-S30",
    notes: "Non-atomic read-modify-write — ships with race condition, worth migrating to RPC",
  },

  // ── brewery_visits — total_visits + first_visit_at + last_visit_at ─────
  // Shipped S177 The Plumbing — trigger on sessions insert upserts the row.
  // brewery_visits table was orphaned entirely before this fix.
  {
    column: "brewery_visits.total_visits",
    writerType: "trigger",
    writerPath: "supabase/migrations/113_fix_orphaned_stat_columns.sql",
    writerMatch: /CREATE OR REPLACE FUNCTION public\.sync_brewery_visits_on_session[\s\S]*?total_visits\s*=\s*public\.brewery_visits\.total_visits\s*\+\s*1/,
    addedInSprint: "S177 The Plumbing",
    notes: "Fired by trg_sync_brewery_visits_on_session on sessions AFTER INSERT. UPSERT pattern.",
  },
  {
    column: "brewery_visits.last_visit_at",
    writerType: "trigger",
    writerPath: "supabase/migrations/113_fix_orphaned_stat_columns.sql",
    writerMatch: /last_visit_at\s*=\s*GREATEST\(public\.brewery_visits\.last_visit_at/,
    addedInSprint: "S177 The Plumbing",
  },
  {
    column: "brewery_visits.first_visit_at",
    writerType: "trigger",
    // first_visit_at is set on INSERT and preserved on UPDATE (UPSERT doesn't overwrite)
    writerPath: "supabase/migrations/113_fix_orphaned_stat_columns.sql",
    writerMatch: /first_visit_at[\s\S]*?NEW\.started_at/,
    addedInSprint: "S177 The Plumbing",
  },

  // ── brewery_visits — unique_beers_tried ────────────────────────────────
  // Shipped S177 — separate trigger on beer_logs since it fires on beer
  // inserts, not session inserts.
  {
    column: "brewery_visits.unique_beers_tried",
    writerType: "trigger",
    writerPath: "supabase/migrations/113_fix_orphaned_stat_columns.sql",
    writerMatch: /CREATE OR REPLACE FUNCTION public\.sync_brewery_visits_unique_beers_on_beer_log[\s\S]*?unique_beers_tried\s*=\s*public\.brewery_visits\.unique_beers_tried\s*\+\s*1/,
    addedInSprint: "S177 The Plumbing",
    notes: "Fired by trg_sync_brewery_visits_unique_beers on beer_logs AFTER INSERT",
  },
];

describe("Stat column write paths — single source of truth (S177)", () => {
  describe("Every tracked stat column must have a verified writer", () => {
    for (const row of STAT_WRITE_PATHS) {
      it(`${row.column} is written by ${row.writerType} at ${row.writerPath}`, () => {
        const absPath = join(process.cwd(), row.writerPath);

        if (!existsSync(absPath)) {
          throw new Error(
            `BROKEN WRITE PATH: ${row.column} claims to be written at ${row.writerPath}, ` +
              `but that file does not exist on disk. ` +
              `If the writer moved, update STAT_WRITE_PATHS in this test. ` +
              `If the writer was deleted, fix the orphan before shipping. ` +
              `(Added in ${row.addedInSprint})`
          );
        }

        const content = readFileSync(absPath, "utf-8");

        if (!row.writerMatch.test(content)) {
          throw new Error(
            `BROKEN WRITE PATH: ${row.column} writer file exists at ${row.writerPath} ` +
              `but does not match the expected pattern. ` +
              `Expected to find: ${row.writerMatch} ` +
              `This likely means a migration/API route was refactored and the ` +
              `write logic was accidentally removed or renamed. ` +
              `(Added in ${row.addedInSprint}${row.notes ? " — " + row.notes : ""})`
          );
        }

        expect(content).toMatch(row.writerMatch);
      });
    }
  });

  describe("Write path audit coverage", () => {
    it("tracks at least 10 stat columns (expected baseline after S177)", () => {
      expect(STAT_WRITE_PATHS.length).toBeGreaterThanOrEqual(10);
    });

    it("every row declares a known writer type", () => {
      const validTypes = new Set(["rpc", "trigger", "api_route"]);
      for (const row of STAT_WRITE_PATHS) {
        expect(validTypes.has(row.writerType)).toBe(true);
      }
    });

    it("every row references a supabase migration or app file", () => {
      for (const row of STAT_WRITE_PATHS) {
        expect(
          row.writerPath.startsWith("supabase/migrations/") ||
            row.writerPath.startsWith("app/")
        ).toBe(true);
      }
    });
  });
});
