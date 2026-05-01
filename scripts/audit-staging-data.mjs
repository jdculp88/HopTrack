#!/usr/bin/env node
// Copyright 2026 HopTrack. All rights reserved.
/**
 * audit-staging-data.mjs — read-only check of what's currently in staging.
 *
 * Uses the staging service role key (no postgres password needed). Fetches
 * row counts for the tables that drive every UI surface so we can see at a
 * glance whether staging has enough data to test against.
 *
 * Usage: node scripts/audit-staging-data.mjs
 */

import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env.local");

const STAGING_REF = "qhznhxyhwqmqfdaqebla";

const TABLES = [
  "profiles",
  "breweries",
  "beers",
  "sessions",
  "beer_logs",
  "beer_reviews",
  "brewery_reviews",
  "friendships",
  "brewery_follows",
  "tap_list_items",
  "achievements",
  "loyalty_stamps",
  "wishlist",
  "notifications",
  "waitlist",
];

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
        return idx === -1
          ? [line, ""]
          : [line.slice(0, idx).trim(), line.slice(idx + 1).trim()];
      })
  );
}

async function countRows(baseUrl, key, table) {
  const r = await fetch(`${baseUrl}/rest/v1/${table}?select=count`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Prefer: "count=exact",
      "Range-Unit": "items",
      Range: "0-0",
    },
  });
  if (!r.ok) return { error: `${r.status} ${r.statusText}` };
  const cr = r.headers.get("content-range");
  const n = cr ? parseInt(cr.split("/")[1], 10) : null;
  return { count: n };
}

async function main() {
  const env = loadEnv(envPath);
  const url = env.STAGING_SUPABASE_URL;
  const key = env.STAGING_SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("❌  STAGING_SUPABASE_URL / STAGING_SUPABASE_SERVICE_ROLE_KEY missing in .env.local");
    process.exit(1);
  }
  if (!url.includes(STAGING_REF)) {
    console.error(`❌  STAGING_SUPABASE_URL does not contain staging ref ${STAGING_REF}`);
    process.exit(1);
  }

  console.log(`🍺  HopTrack staging data audit`);
  console.log(`    target: ${url}\n`);
  console.log(`  ${"table".padEnd(28)} ${"rows".padStart(10)}`);
  console.log(`  ${"-".repeat(28)} ${"-".repeat(10)}`);

  for (const t of TABLES) {
    const { count, error } = await countRows(url, key, t);
    const display = error ? `err: ${error}` : count?.toLocaleString() ?? "?";
    console.log(`  ${t.padEnd(28)} ${display.padStart(10)}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
