/**
 * HopTrack — Open Brewery DB Seed Generator
 *
 * Fetches ALL US breweries from Open Brewery DB (https://openbrewerydb.org)
 * and generates a SQL migration file for seeding the breweries table.
 *
 * Usage:  node scripts/fetch-breweries.mjs
 * Output: supabase/migrations/048_open_brewery_db_seed.sql
 *
 * Drew 🍻: "9,459 breweries. That's our launch funnel."
 * Quinn ⚙️: "ON CONFLICT DO NOTHING — existing data stays safe."
 */

import { writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = resolve(
  __dirname,
  "../supabase/migrations/048_open_brewery_db_seed.sql"
);

const API_BASE = "https://api.openbrewerydb.org/v1/breweries";
const PER_PAGE = 200; // max allowed

// Brewery types we want (exclude closed, planning)
const ACTIVE_TYPES = new Set([
  "micro",
  "nano",
  "regional",
  "brewpub",
  "large",
  "bar",
  "contract",
  "proprietor",
  "taproom",
]);

// ─── Fetch all pages ────────────────────────────────────────────────────────

async function fetchAllBreweries() {
  const all = [];
  let page = 1;
  let hasMore = true;

  console.log("🍺 Fetching breweries from Open Brewery DB...\n");

  while (hasMore) {
    const url = `${API_BASE}?by_country=united_states&per_page=${PER_PAGE}&page=${page}`;
    const res = await fetch(url);

    if (!res.ok) {
      console.error(`❌ API error on page ${page}: ${res.status}`);
      break;
    }

    const data = await res.json();

    if (data.length === 0) {
      hasMore = false;
    } else {
      all.push(...data);
      process.stdout.write(`  Page ${page}: +${data.length} (total: ${all.length})\r`);
      page++;

      // Small delay to be respectful to the API
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  console.log(`\n✅ Fetched ${all.length} total breweries`);
  return all;
}

// ─── Filter & transform ─────────────────────────────────────────────────────

function filterBreweries(breweries) {
  return breweries.filter((b) => {
    // Must be active type
    if (!ACTIVE_TYPES.has(b.brewery_type)) return false;
    // Must be US
    if (b.country !== "United States") return false;
    // Must have a name
    if (!b.name || b.name.trim() === "") return false;
    // Must have city + state
    if (!b.city || !b.state_province) return false;
    return true;
  });
}

// ─── SQL escaping ────────────────────────────────────────────────────────────

function esc(val) {
  if (val === null || val === undefined || val === "") return "NULL";
  // Escape single quotes by doubling them
  const s = String(val).replace(/'/g, "''").trim();
  return `'${s}'`;
}

function escNum(val) {
  if (val === null || val === undefined || val === "") return "NULL";
  const n = parseFloat(val);
  return isNaN(n) ? "NULL" : String(n);
}

// Map Open Brewery DB type to our schema types
function mapType(type) {
  // Our schema values match Open Brewery DB exactly
  return ACTIVE_TYPES.has(type) ? type : "micro";
}

// Normalize state to 2-letter abbreviation
const STATE_MAP = {
  Alabama: "AL", Alaska: "AK", Arizona: "AZ", Arkansas: "AR",
  California: "CA", Colorado: "CO", Connecticut: "CT", Delaware: "DE",
  Florida: "FL", Georgia: "GA", Hawaii: "HI", Idaho: "ID",
  Illinois: "IL", Indiana: "IN", Iowa: "IA", Kansas: "KS",
  Kentucky: "KY", Louisiana: "LA", Maine: "ME", Maryland: "MD",
  Massachusetts: "MA", Michigan: "MI", Minnesota: "MN", Mississippi: "MS",
  Missouri: "MO", Montana: "MT", Nebraska: "NE", Nevada: "NV",
  "New Hampshire": "NH", "New Jersey": "NJ", "New Mexico": "NM",
  "New York": "NY", "North Carolina": "NC", "North Dakota": "ND",
  Ohio: "OH", Oklahoma: "OK", Oregon: "OR", Pennsylvania: "PA",
  "Rhode Island": "RI", "South Carolina": "SC", "South Dakota": "SD",
  Tennessee: "TN", Texas: "TX", Utah: "UT", Vermont: "VT",
  Virginia: "VA", Washington: "WA", "West Virginia": "WV",
  Wisconsin: "WI", Wyoming: "WY", "District of Columbia": "DC",
};

function stateAbbr(state) {
  if (!state) return null;
  // Exact match first
  if (STATE_MAP[state]) return STATE_MAP[state];
  // Case-insensitive match (handles "MIssouri" etc.)
  const lower = state.toLowerCase();
  for (const [name, abbr] of Object.entries(STATE_MAP)) {
    if (name.toLowerCase() === lower) return abbr;
  }
  // Already an abbreviation?
  if (state.length === 2 && state === state.toUpperCase()) return state;
  return state;
}

// ─── Generate SQL ────────────────────────────────────────────────────────────

function generateSQL(breweries) {
  const lines = [];

  lines.push(`-- ${"─".repeat(77)}`);
  lines.push(`-- Migration 048: Open Brewery DB — US Craft Brewery Seeds`);
  lines.push(`-- ${breweries.length} active US breweries from https://openbrewerydb.org`);
  lines.push(`-- Types: micro, nano, regional, brewpub, large, bar, contract, proprietor, taproom`);
  lines.push(`-- Excludes: closed, planning`);
  lines.push(`-- Generated: ${new Date().toISOString().split("T")[0]}`);
  lines.push(`--`);
  lines.push(`-- Drew 🍻: "Every one of these is a potential customer."`);
  lines.push(`-- Quinn ⚙️: "ON CONFLICT DO NOTHING — existing curated data stays safe."`);
  lines.push(`-- ${"─".repeat(77)}`);
  lines.push(``);
  lines.push(`-- Use external_id to deduplicate against existing and future runs`);
  lines.push(`-- Existing breweries (migrations 024, 042) are preserved via DO NOTHING`);
  lines.push(``);

  // Batch inserts for performance (500 per batch)
  const BATCH_SIZE = 500;
  const batches = [];
  for (let i = 0; i < breweries.length; i += BATCH_SIZE) {
    batches.push(breweries.slice(i, i + BATCH_SIZE));
  }

  // Stats by state
  const stateCounts = {};
  breweries.forEach((b) => {
    const st = stateAbbr(b.state_province);
    stateCounts[st] = (stateCounts[st] || 0) + 1;
  });

  lines.push(`-- ── Stats by state ──`);
  const sortedStates = Object.entries(stateCounts).sort((a, b) => b[1] - a[1]);
  sortedStates.forEach(([st, count]) => {
    lines.push(`-- ${st}: ${count}`);
  });
  lines.push(``);

  // Stats by type
  const typeCounts = {};
  breweries.forEach((b) => {
    typeCounts[b.brewery_type] = (typeCounts[b.brewery_type] || 0) + 1;
  });
  lines.push(`-- ── Stats by type ──`);
  Object.entries(typeCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([type, count]) => {
      lines.push(`-- ${type}: ${count}`);
    });
  lines.push(``);

  batches.forEach((batch, batchIdx) => {
    lines.push(
      `-- ── Batch ${batchIdx + 1}/${batches.length} (${batch.length} breweries) ──`
    );
    lines.push(`INSERT INTO breweries (`);
    lines.push(`  id, external_id, name, brewery_type,`);
    lines.push(`  street, city, state, postal_code, country,`);
    lines.push(`  phone, website_url, latitude, longitude,`);
    lines.push(`  verified, hop_route_eligible`);
    lines.push(`) VALUES`);

    const values = batch.map((b, i) => {
      const street = b.address_1 || b.street || null;
      const state = stateAbbr(b.state_province);
      const comma = i < batch.length - 1 ? "," : "";

      return [
        `  (`,
        `    gen_random_uuid(),`,
        `    ${esc(b.id)},`,
        `    ${esc(b.name)},`,
        `    ${esc(mapType(b.brewery_type))},`,
        `    ${esc(street)},`,
        `    ${esc(b.city)},`,
        `    ${esc(state)},`,
        `    ${esc(b.postal_code)},`,
        `    'US',`,
        `    ${esc(b.phone)},`,
        `    ${esc(b.website_url)},`,
        `    ${escNum(b.latitude)},`,
        `    ${escNum(b.longitude)},`,
        `    false,`,
        `    ${b.latitude && b.longitude ? "true" : "false"}`,
        `  )${comma}`,
      ].join("\n");
    });

    lines.push(values.join("\n"));
    lines.push(`ON CONFLICT (external_id) DO NOTHING;`);
    lines.push(``);
  });

  lines.push(`-- ── Summary ──`);
  lines.push(
    `-- Total: ${breweries.length} breweries across ${Object.keys(stateCounts).length} states`
  );
  lines.push(
    `-- Top 5: ${sortedStates
      .slice(0, 5)
      .map(([st, c]) => `${st}(${c})`)
      .join(", ")}`
  );
  lines.push(`-- HopRoute eligible (has GPS): ${breweries.filter((b) => b.latitude && b.longitude).length}`);

  return lines.join("\n");
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const raw = await fetchAllBreweries();
  const active = filterBreweries(raw);

  console.log(`\n📊 Filtered: ${raw.length} → ${active.length} active US breweries`);
  console.log(
    `📍 With GPS: ${active.filter((b) => b.latitude && b.longitude).length}`
  );

  const sql = generateSQL(active);
  writeFileSync(OUTPUT_PATH, sql, "utf-8");

  const sizeMB = (Buffer.byteLength(sql) / (1024 * 1024)).toFixed(2);
  console.log(`\n✅ Migration written: ${OUTPUT_PATH}`);
  console.log(`   Size: ${sizeMB} MB`);
  console.log(`\n🍺 Drew says: "That's a lot of breweries. We're going to be rich."`);
}

main().catch(console.error);
