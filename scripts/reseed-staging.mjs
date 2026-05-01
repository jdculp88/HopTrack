#!/usr/bin/env node
// Copyright 2026 HopTrack. All rights reserved.
/**
 * reseed-staging.mjs — restore demo/test data to staging Supabase.
 *
 * Why this exists: migration 121 stripped all test data (Pint & Pixel users,
 * demo breweries, sessions, feed activity) from prod AND staging. Staging
 * needs that data back so we can use every UI feature end-to-end.
 *
 * What it does (transactional, idempotent):
 *   1. Refuses unless STAGING_DB_URL is set and points at the staging project.
 *   2. Re-runs migration 121 against staging (clean slate — no half-seed).
 *   3. Re-executes the seed migrations in order: 074, 075, 076, 078, 083,
 *      100, 104, 105, 112. Each runs inside its own SAVEPOINT so a single
 *      bad statement doesn't poison the rest.
 *   4. Reports BEFORE/AFTER row counts for the key tables.
 *
 * Usage:
 *   node scripts/reseed-staging.mjs          # do the reseed
 *   node scripts/reseed-staging.mjs --check  # print plan + counts, do nothing
 *
 * Required in .env.local:
 *   STAGING_DB_URL=postgresql://postgres.qhznhxyhwqmqfdaqebla:<password>@aws-1-us-east-1.pooler.supabase.com:5432/postgres
 *
 * The script will REFUSE to run if STAGING_DB_URL contains the prod project ref.
 */

import { spawnSync } from "child_process";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");
const envPath = resolve(repoRoot, ".env.local");
const migrationsDir = resolve(repoRoot, "supabase/migrations");

const PROD_PROJECT_REF = "uadjtanoyvalnmlbnzxk";
const STAGING_PROJECT_REF = "qhznhxyhwqmqfdaqebla";

// Order matters: 074 creates the test users + Pint & Pixel; later seeds depend on them.
const SEED_MIGRATIONS = [
  "074_massive_seed_data.sql",
  "075_data_boost.sql",
  "076_friday_night_seed.sql",
  "078_brand_reports_seed.sql",
  "083_fix_brand_tier_and_loyalty_seed.sql",
  "100_backdate_seed_profiles.sql",
  "104_diverse_seed_data.sql",
  "105_diverse_activity_seed.sql",
  "112_pint_pixel_sensory_seed.sql",
];

const COUNT_TABLES = [
  "auth.users",
  "public.profiles",
  "public.breweries",
  "public.beers",
  "public.sessions",
  "public.beer_logs",
  "public.beer_reviews",
  "public.brewery_reviews",
  "public.friendships",
  "public.brewery_follows",
];

const isCheck = process.argv.includes("--check");

function loadEnv(path) {
  if (!existsSync(path)) {
    console.error(`❌  .env.local not found at ${path}`);
    process.exit(1);
  }
  return Object.fromEntries(
    readFileSync(path, "utf8")
      .split("\n")
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => {
        const idx = line.indexOf("=");
        if (idx === -1) return [line, ""];
        return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()];
      })
  );
}

function runPsql(dbUrl, sql, label) {
  const result = spawnSync(
    "psql",
    [dbUrl, "-v", "ON_ERROR_STOP=0", "-X", "-q", "-A", "-t"],
    { input: sql, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }
  );
  if (result.status !== 0 && label) {
    console.error(`⚠️  psql exited ${result.status} during ${label}`);
    if (result.stderr) console.error(result.stderr.slice(0, 800));
  }
  return result;
}

function countRows(dbUrl) {
  const sql = COUNT_TABLES.map(
    (t) => `SELECT '${t}' AS tbl, count(*) AS n FROM ${t}`
  ).join("\nUNION ALL\n");
  const r = runPsql(dbUrl, sql, "row counts");
  const counts = {};
  for (const line of r.stdout.split("\n")) {
    const [tbl, n] = line.split("|");
    if (tbl && n) counts[tbl.trim()] = parseInt(n.trim(), 10);
  }
  return counts;
}

function printCounts(label, counts) {
  console.log(`\n${label}`);
  for (const t of COUNT_TABLES) {
    const v = counts[t] ?? "?";
    console.log(`  ${t.padEnd(28)} ${String(v).padStart(8)}`);
  }
}

function main() {
  const env = loadEnv(envPath);
  const dbUrl = env.STAGING_DB_URL;

  if (!dbUrl) {
    console.error("❌  STAGING_DB_URL not set in .env.local");
    console.error("");
    console.error("   Add this line to .env.local:");
    console.error(
      `   STAGING_DB_URL=postgresql://postgres.${STAGING_PROJECT_REF}:<staging-postgres-password>@aws-1-us-east-1.pooler.supabase.com:5432/postgres`
    );
    console.error("");
    console.error(
      "   Get the password from Supabase Dashboard → staging project → Project Settings → Database"
    );
    process.exit(1);
  }

  if (dbUrl.includes(PROD_PROJECT_REF)) {
    console.error(
      `❌  REFUSING — STAGING_DB_URL contains prod project ref ${PROD_PROJECT_REF}.`
    );
    process.exit(1);
  }

  if (!dbUrl.includes(STAGING_PROJECT_REF)) {
    console.error(
      `❌  REFUSING — STAGING_DB_URL does not contain staging ref ${STAGING_PROJECT_REF}.`
    );
    console.error("    Verify the URL is pointing at the right project.");
    process.exit(1);
  }

  console.log("🍺  HopTrack staging reseed");
  console.log(`    target : staging (${STAGING_PROJECT_REF})`);
  console.log(`    mode   : ${isCheck ? "CHECK (dry-run)" : "EXECUTE"}`);

  const before = countRows(dbUrl);
  printCounts("BEFORE", before);

  if (isCheck) {
    console.log("\nWould execute, in order:");
    console.log("  1. supabase/migrations/121_prod_cleanup.sql  (clean slate)");
    SEED_MIGRATIONS.forEach((m, i) =>
      console.log(`  ${i + 2}. supabase/migrations/${m}`)
    );
    console.log("\n(no changes made — pass without --check to actually run)");
    return;
  }

  console.log("\nStep 1/2 — clean slate (re-run 121)");
  const cleanup = readFileSync(
    join(migrationsDir, "121_prod_cleanup.sql"),
    "utf8"
  );
  runPsql(dbUrl, cleanup, "cleanup");

  console.log("\nStep 2/2 — re-run seed migrations");
  for (const file of SEED_MIGRATIONS) {
    const path = join(migrationsDir, file);
    if (!existsSync(path)) {
      console.warn(`   ⏭  skipped (not found): ${file}`);
      continue;
    }
    const sql = readFileSync(path, "utf8");
    const wrapped = `BEGIN;\nSAVEPOINT s_${file.slice(0, 3)};\n${sql}\nRELEASE SAVEPOINT s_${file.slice(0, 3)};\nCOMMIT;`;
    process.stdout.write(`   ▶  ${file} ... `);
    const r = runPsql(dbUrl, wrapped, file);
    console.log(r.status === 0 ? "ok" : `exit ${r.status}`);
  }

  const after = countRows(dbUrl);
  printCounts("AFTER", after);

  console.log("\nDelta:");
  for (const t of COUNT_TABLES) {
    const b = before[t] ?? 0;
    const a = after[t] ?? 0;
    const d = a - b;
    const sign = d > 0 ? "+" : d < 0 ? "" : " ";
    console.log(`  ${t.padEnd(28)} ${sign}${d}`);
  }
  console.log("\n✅  Done. Verify staging UI: npm run dev:staging");
}

main();
