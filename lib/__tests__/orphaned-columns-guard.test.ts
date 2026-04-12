import { describe, it, expect } from "vitest";
import { readFileSync, existsSync, readdirSync } from "fs";
import { join } from "path";

/**
 * Regression guard: Every stat column or rollup table that's DISPLAYED in the
 * UI must have at least one write path OUTSIDE of seed migrations.
 *
 * Bug discovered Sprint 177 (2026-04-11): Two orphaned stat surfaces shipped to
 * prod, surviving 170+ sprints because seed data made them look correct in dev:
 *
 *   1. profiles.unique_beers — displayed on 8+ consumer surfaces (profile Quick
 *      Stats, You tab, Stats tab, friends leaderboard sort key, superadmin user
 *      detail). The increment_xp RPC (migration 036) handles xp/level/streak/
 *      unique_breweries but NOT unique_beers. Only writers were seed migrations
 *      074, 075, 076. Every real user had unique_beers = 0 forever.
 *
 *   2. public.brewery_visits (whole table) — read by 18 code paths including
 *      the entire Brand CRM (S129 "The Transfer"), lib/kpi.ts New-vs-Returning %,
 *      AI promotion suggestions, consumer brewery visit history. Only INSERT was
 *      seed migration 076. Real breweries would see empty Brand CRM customer lists
 *      on day one.
 *
 * Migration 113 (Sprint 177 "The Plumbing") fixed both via three database triggers
 * plus a backfill pass. This guard asserts migration 113 is still intact and that
 * both stat surfaces retain at least one non-seed write path.
 *
 * If this test fails, DO NOT delete it or weaken it. Either:
 *   (a) Extend migration 113 / write a new migration with the needed write path, OR
 *   (b) Remove the display surface if the column is genuinely no longer meaningful.
 *
 * See also: ~/.claude/projects/-Users-jdculp-Projects-hoptrack/memory/feedback_write_path_audit.md
 */

const MIGRATIONS_DIR = join(process.cwd(), "supabase/migrations");
const MIGRATION_113 = join(MIGRATIONS_DIR, "113_fix_orphaned_stat_columns.sql");

// Seed migrations that insert test data into profiles/brewery_visits.
// Matches in these files do NOT count as real write paths.
const SEED_MIGRATION_PREFIXES = [
  "074_massive_seed_data",
  "075_data_boost",
  "076_friday_night_seed",
  "100_backdate_seed_profiles",
  "104_diverse_seed_data",
  "105_diverse_activity_seed",
];

function isSeedMigration(filename: string): boolean {
  return SEED_MIGRATION_PREFIXES.some((prefix) => filename.startsWith(prefix));
}

function readMigrationFiles(): Array<{ name: string; content: string }> {
  return readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .map((f) => ({
      name: f,
      content: readFileSync(join(MIGRATIONS_DIR, f), "utf-8"),
    }));
}

describe("Orphaned stat columns regression guard (S177 The Plumbing)", () => {
  // ──────────────────────────────────────────────────────────────────────────
  describe("Migration 113 must exist and keep its shape", () => {
    it("migration file exists on disk", () => {
      expect(existsSync(MIGRATION_113)).toBe(true);
    });

    it("declares sync_profile_unique_beers_on_beer_log trigger function", () => {
      const sql = readFileSync(MIGRATION_113, "utf-8");
      expect(sql).toMatch(/CREATE OR REPLACE FUNCTION public\.sync_profile_unique_beers_on_beer_log/);
      expect(sql).toMatch(/profiles[\s\S]*?SET unique_beers = unique_beers \+ 1/);
    });

    it("declares sync_brewery_visits_on_session trigger function", () => {
      const sql = readFileSync(MIGRATION_113, "utf-8");
      expect(sql).toMatch(/CREATE OR REPLACE FUNCTION public\.sync_brewery_visits_on_session/);
      expect(sql).toMatch(/INSERT INTO public\.brewery_visits/);
      expect(sql).toMatch(/ON CONFLICT \(user_id, brewery_id\) DO UPDATE/);
    });

    it("declares sync_brewery_visits_unique_beers_on_beer_log trigger function", () => {
      const sql = readFileSync(MIGRATION_113, "utf-8");
      expect(sql).toMatch(/CREATE OR REPLACE FUNCTION public\.sync_brewery_visits_unique_beers_on_beer_log/);
      expect(sql).toMatch(/unique_beers_tried/);
    });

    it("creates trigger on beer_logs for profile sync", () => {
      const sql = readFileSync(MIGRATION_113, "utf-8");
      expect(sql).toMatch(/CREATE TRIGGER trg_sync_profile_unique_beers[\s\S]*?AFTER INSERT ON public\.beer_logs/);
    });

    it("creates trigger on sessions for brewery_visits upsert", () => {
      const sql = readFileSync(MIGRATION_113, "utf-8");
      expect(sql).toMatch(/CREATE TRIGGER trg_sync_brewery_visits_on_session[\s\S]*?AFTER INSERT ON public\.sessions/);
    });

    it("creates trigger on beer_logs for brewery_visits.unique_beers_tried sync", () => {
      const sql = readFileSync(MIGRATION_113, "utf-8");
      expect(sql).toMatch(/CREATE TRIGGER trg_sync_brewery_visits_unique_beers[\s\S]*?AFTER INSERT ON public\.beer_logs/);
    });

    it("skips home sessions (brewery_id IS NULL) in the session trigger", () => {
      const sql = readFileSync(MIGRATION_113, "utf-8");
      // The home-session skip logic — home sessions have NULL brewery_id
      expect(sql).toMatch(/IF NEW\.brewery_id IS NULL THEN[\s\S]*?RETURN NEW/);
    });

    it("skips free-form beer entries (beer_id IS NULL) in the unique_beers sync", () => {
      const sql = readFileSync(MIGRATION_113, "utf-8");
      expect(sql).toMatch(/IF NEW\.beer_id IS NULL THEN[\s\S]*?RETURN NEW/);
    });

    it("backfills profiles.unique_beers from ground truth beer_logs", () => {
      const sql = readFileSync(MIGRATION_113, "utf-8");
      expect(sql).toMatch(/UPDATE public\.profiles[\s\S]*?SET unique_beers = COALESCE\(\(/);
      expect(sql).toMatch(/SELECT COUNT\(DISTINCT bl\.beer_id\)[\s\S]*?FROM public\.beer_logs bl/);
    });

    it("backfills brewery_visits from ground truth sessions + beer_logs", () => {
      const sql = readFileSync(MIGRATION_113, "utf-8");
      // Must disable triggers during backfill to avoid double-fire
      expect(sql).toMatch(/ALTER TABLE public\.brewery_visits DISABLE TRIGGER USER/);
      expect(sql).toMatch(/TRUNCATE TABLE public\.brewery_visits/);
      expect(sql).toMatch(/INSERT INTO public\.brewery_visits[\s\S]*?FROM public\.sessions s/);
      expect(sql).toMatch(/ALTER TABLE public\.brewery_visits ENABLE TRIGGER USER/);
    });

    it("reloads PostgREST schema after trigger changes", () => {
      const sql = readFileSync(MIGRATION_113, "utf-8");
      expect(sql).toMatch(/NOTIFY pgrst, 'reload schema'/);
    });

    it("has a documented rollback plan", () => {
      const sql = readFileSync(MIGRATION_113, "utf-8");
      expect(sql).toMatch(/ROLLBACK PLAN/i);
      expect(sql).toMatch(/DROP TRIGGER IF EXISTS trg_sync_profile_unique_beers/);
      expect(sql).toMatch(/DROP TRIGGER IF EXISTS trg_sync_brewery_visits_on_session/);
      expect(sql).toMatch(/DROP TRIGGER IF EXISTS trg_sync_brewery_visits_unique_beers/);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  describe("profiles.unique_beers must have a non-seed write path", () => {
    it("at least one non-seed migration writes to profiles.unique_beers", () => {
      const migrations = readMigrationFiles();
      const nonSeedWriters = migrations.filter((m) => {
        if (isSeedMigration(m.name)) return false;

        // Look for DML or trigger function body that updates unique_beers
        const updatesColumn =
          /UPDATE\s+(public\.)?profiles[\s\S]{0,400}?unique_beers\s*=/i.test(m.content) ||
          /SET\s+unique_beers\s*=\s*unique_beers\s*\+\s*1/i.test(m.content);
        return updatesColumn;
      });

      if (nonSeedWriters.length === 0) {
        throw new Error(
          "ORPHAN: profiles.unique_beers has no non-seed write path. " +
            "The only writes are in seed migrations, which means real users will " +
            "always show unique_beers = 0 in production. See feedback_write_path_audit.md."
        );
      }

      expect(nonSeedWriters.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  describe("public.brewery_visits must have a non-seed write path", () => {
    it("at least one non-seed migration writes to brewery_visits", () => {
      const migrations = readMigrationFiles();
      const nonSeedWriters = migrations.filter((m) => {
        if (isSeedMigration(m.name)) return false;

        // Look for DML or trigger function body that inserts or updates brewery_visits
        const writesTable =
          /INSERT\s+INTO\s+(public\.)?brewery_visits/i.test(m.content) ||
          /UPDATE\s+(public\.)?brewery_visits/i.test(m.content);
        return writesTable;
      });

      if (nonSeedWriters.length === 0) {
        throw new Error(
          "ORPHAN: public.brewery_visits has no non-seed write path. " +
            "The only writes are in seed migrations, which means the Brand CRM, " +
            "brewery New-vs-Returning %, and consumer visit history will be empty " +
            "for real users. See feedback_write_path_audit.md."
        );
      }

      expect(nonSeedWriters.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  describe("Known-good write paths for other profile stat columns (S036 + S161)", () => {
    // Baseline check: the columns we KNOW have write paths should still have them.
    // If this fails, someone probably refactored the increment_xp RPC and broke
    // the atomic update chain — which is a different bug, but also a P0.

    const RPC_COLUMNS = ["xp", "level", "unique_breweries", "current_streak", "longest_streak"];

    for (const column of RPC_COLUMNS) {
      it(`profiles.${column} is updated by the increment_xp RPC (migration 036)`, () => {
        const rpcPath = join(MIGRATIONS_DIR, "036_xp_atomic_increment.sql");
        expect(existsSync(rpcPath)).toBe(true);
        const sql = readFileSync(rpcPath, "utf-8");
        // The RPC updates profiles and touches this column
        expect(sql).toMatch(new RegExp(`UPDATE profiles[\\s\\S]*?${column}`, "i"));
      });
    }
  });
});
