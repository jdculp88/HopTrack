#!/usr/bin/env node
/**
 * seed-live-drinkers.mjs — create currently-active drinker sessions at P&P
 *
 * For staging testing. Picks N random test users, creates open sessions
 * (is_active=true, ended_at=null) with start times within the last 1-3
 * hours, adds 1-3 in-progress beer_logs per session.
 *
 * Rerun safely — closes any existing active sessions at P&P first so we
 * don't accumulate zombie "live" sessions from prior runs.
 *
 * Usage: node scripts/seed-live-drinkers.mjs [count]
 *   default count = 6 drinkers
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env.local");

if (!existsSync(envPath)) {
  console.error(`❌  .env.local not found at ${envPath}`);
  process.exit(1);
}

const env = Object.fromEntries(
  readFileSync(envPath, "utf8")
    .split("\n")
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const idx = line.indexOf("=");
      if (idx === -1) return [line, ""];
      return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()];
    })
);

const SUPABASE_URL = env.STAGING_SUPABASE_URL;
const SERVICE_ROLE_KEY = env.STAGING_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("❌  Missing STAGING_SUPABASE_URL or STAGING_SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

console.log("🍺  seed-live-drinkers — pointing at STAGING");
console.log(`    ${SUPABASE_URL}\n`);

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// ─── Constants ───────────────────────────────────────────────────────────────
const PP_BREWERY_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const JOSHUA_ID = "90a1a802-8a79-4816-bf10-a900b91f2c5c";

function makeUserUUID(n) {
  const padded7 = String(n).padStart(7, "0");
  const padded3 = String(n).padStart(3, "0");
  return `f${padded7}-0000-4000-8000-000000000${padded3}`;
}
const TEST_USER_IDS = Array.from({ length: 40 }, (_, i) => makeUserUUID(i + 1));
const ALL_DRINKERS = [...TEST_USER_IDS, JOSHUA_ID];

// Pint & Pixel beers (same list seed-next-day uses)
const PP_BEERS = [
  "cccccccc-0001-4000-8000-000000000001",
  "cccccccc-0002-4000-8000-000000000002",
  "cccccccc-0003-4000-8000-000000000003",
  "cccccccc-0004-4000-8000-000000000004",
  "cccccccc-0005-4000-8000-000000000005",
  "cccccccc-0006-4000-8000-000000000006",
  "cccccccc-0007-4000-8000-000000000007",
  "cccccccc-0008-4000-8000-000000000008",
  "cccccccc-0009-4000-8000-000000000009",
  "cccccccc-0010-4000-8000-000000000010",
];

const POUR_SIZES_OZ = [4, 8, 12, 16];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickN(arr, n) {
  const copy = [...arr];
  const out = [];
  while (out.length < n && copy.length) {
    const idx = randomInt(0, copy.length - 1);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
}

function iso(d) {
  return d.toISOString();
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function run() {
  const count = parseInt(process.argv[2] || "6", 10);

  // 1. Verify P&P exists
  const { data: pp, error: ppErr } = await supabase
    .from("breweries")
    .select("id, name")
    .eq("id", PP_BREWERY_ID)
    .maybeSingle();

  if (ppErr) {
    console.error("Error querying breweries:", ppErr.message);
    process.exit(1);
  }
  if (!pp) {
    console.error("❌  Pint & Pixel brewery not found. Re-run data load + seed-next-day first.");
    process.exit(1);
  }
  console.log(`✅  Found ${pp.name} (${pp.id})`);

  // 2. Close any existing active sessions at P&P (don't accumulate)
  const now = new Date();
  const { data: existing, error: existingErr } = await supabase
    .from("sessions")
    .update({ ended_at: iso(now), is_active: false })
    .eq("brewery_id", PP_BREWERY_ID)
    .is("ended_at", null)
    .select("id");

  if (existingErr) {
    console.error("Error closing existing sessions:", existingErr.message);
    process.exit(1);
  }
  console.log(`   Closed ${existing?.length ?? 0} existing active sessions`);

  // 3. Pick N random drinkers
  const drinkers = pickN(ALL_DRINKERS, count);
  console.log(`\n🍻  Creating ${count} live drinker sessions...`);

  // 4. For each drinker, create a session started in last 15-180 minutes
  const sessionRows = [];
  const beerLogRows = [];

  for (const userId of drinkers) {
    const minutesAgo = randomInt(15, 180);
    const startedAt = new Date(now.getTime() - minutesAgo * 60 * 1000);
    const sessionId = crypto.randomUUID();

    sessionRows.push({
      id: sessionId,
      user_id: userId,
      brewery_id: PP_BREWERY_ID,
      started_at: iso(startedAt),
      ended_at: null,
      is_active: true,
      share_to_feed: true,
      context: "brewery",
      xp_awarded: 0,
      xp_tier: "normal",
    });

    // Add 1-3 beer logs for this session (beers ordered so far)
    const beerCount = randomInt(1, 3);
    for (let i = 0; i < beerCount; i++) {
      const beerOrderedAt = new Date(
        startedAt.getTime() + i * randomInt(15, 40) * 60 * 1000
      );
      // Only include beer logs if the order time is in the past (not future)
      if (beerOrderedAt > now) continue;

      beerLogRows.push({
        id: crypto.randomUUID(),
        session_id: sessionId,
        user_id: userId,
        beer_id: PP_BEERS[randomInt(0, PP_BEERS.length - 1)],
        pour_size_oz: POUR_SIZES_OZ[randomInt(0, POUR_SIZES_OZ.length - 1)],
        logged_at: iso(beerOrderedAt),
      });
    }
  }

  // 5. Insert sessions
  const { error: sessErr } = await supabase.from("sessions").insert(sessionRows);
  if (sessErr) {
    console.error("Error inserting sessions:", sessErr.message);
    process.exit(1);
  }
  console.log(`   ✅  Inserted ${sessionRows.length} live sessions`);

  // 6. Insert beer logs
  if (beerLogRows.length) {
    const { error: logErr } = await supabase.from("beer_logs").insert(beerLogRows);
    if (logErr) {
      console.error("Error inserting beer_logs:", logErr.message);
      process.exit(1);
    }
  }
  console.log(`   ✅  Inserted ${beerLogRows.length} in-progress beer logs`);

  // 7. Report
  console.log(`\n🎉  Done. ${count} drinkers are currently "at" Pint & Pixel.`);
  console.log(`    Check the app — they'll show up in Drinking Now / live presence surfaces.`);
}

run().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
