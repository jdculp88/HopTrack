/**
 * HopTrack — Kaggle Beer Study Seed Generator
 *
 * Downloads beer + brewery CSVs from the Kaggle Beer Study dataset,
 * matches beers to our Open Brewery DB breweries (by name + city + state),
 * and generates a SQL migration file.
 *
 * Source: https://github.com/davestroud/BeerStudy
 * Dataset: https://www.kaggle.com/datasets/mexwell/beer-study
 *
 * Usage:  node scripts/fetch-beers.mjs
 * Output: supabase/migrations/049_kaggle_beer_seed.sql
 *
 * Drew 🍻: "2,410 real beers. Users can actually find what they're drinking."
 * Quinn ⚙️: "Matching by name+city+state. It's fuzzy but it works."
 */

import { writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = resolve(
  __dirname,
  "../supabase/migrations/049_kaggle_beer_seed.sql"
);

const BREWERIES_CSV_URL =
  "https://raw.githubusercontent.com/davestroud/BeerStudy/master/Breweries.csv";
const BEERS_CSV_URL =
  "https://raw.githubusercontent.com/davestroud/BeerStudy/master/Beers.csv";

// ─── Kaggle style → HopTrack style mapping ─────────────────────────────────
// Kaggle uses verbose styles like "American IPA", "American Pale Ale (APA)"
// We map to our 26 canonical styles from beerStyleColors.ts

const STYLE_MAP = {
  // IPA family
  "American IPA": "IPA",
  "American Double / Imperial IPA": "Double IPA",
  "English India Pale Ale (IPA)": "IPA",
  "Belgian IPA": "IPA",
  "Imperial / Double IPA": "Double IPA",

  // Pale Ale family
  "American Pale Ale (APA)": "Pale Ale",
  "English Pale Ale": "Pale Ale",
  "American Pale Wheat Ale": "Wheat",
  "Extra Pale Ale": "Pale Ale",

  // Stout family
  "American Stout": "Stout",
  "Oatmeal Stout": "Oatmeal Stout",
  "Milk / Sweet Stout": "Milk Stout",
  "American Double / Imperial Stout": "Imperial Stout",
  "English Stout": "Stout",
  "Irish Dry Stout": "Dry Stout",
  "Foreign / Export Stout": "Stout",
  "Russian Imperial Stout": "Imperial Stout",

  // Porter family
  "American Porter": "Porter",
  "English Porter": "Porter",
  "Baltic Porter": "Baltic Porter",
  "Robust Porter": "Robust Porter",
  "American Brown Ale": "Brown Ale",
  "English Brown Ale": "Brown Ale",
  "American Barleywine": "Barleywine",
  "English Barleywine": "English Barleywine",

  // Lager family
  "American Pale Lager": "Lager",
  "American Adjunct Lager": "Lager",
  "American Amber / Red Lager": "Lager",
  "American Dark Wheat Ale": "Lager",
  "Munich Helles Lager": "Helles",
  "Czech Pilsener": "Pilsner",
  "German Pilsener": "Pilsner",
  "American Pilsner": "Pilsner",
  "Vienna Lager": "Lager",
  "Dortmunder / Export Lager": "Lager",
  "Euro Pale Lager": "Lager",
  "Schwarzbier": "Lager",
  "Euro Dark Lager": "Lager",
  "Cream Ale": "Cream Ale",
  "American Blonde Ale": "Blonde Ale",
  Kölsch: "Kölsch",
  "Light Lager": "Lager",
  Märzen: "Märzen",
  "Märzen / Oktoberfest": "Oktoberfest",

  // Sour family
  "Berliner Weissbier": "Berliner Weisse",
  "American Wild Ale": "Wild Ale",
  "Flanders Red Ale": "Flanders Red",
  "Flanders Oud Bruin": "Sour",
  Gose: "Gose",

  // Saison family
  "Saison / Farmhouse Ale": "Saison",
  "Belgian Pale Ale": "Belgian",
  "Belgian Dark Ale": "Belgian",
  "Belgian Strong Pale Ale": "Belgian",
  "Belgian Strong Dark Ale": "Belgian Dubbel",
  Witbier: "Witbier",
  "American Hefeweizen": "Hefeweizen",
  "Hefeweizen": "Hefeweizen",
  Dunkelweizen: "Dunkel",
  Tripel: "Belgian Tripel",
  Dubbel: "Belgian Dubbel",
  Quadrupel: "Belgian",

  // Wheat
  "American Wheat or Rye Beer": "Wheat",
  "Wheat Ale": "Wheat",
  "Rye Beer": "Wheat",

  // Amber/Red
  "American Amber / Red Ale": "Amber",
  "Irish Red Ale": "Red Ale",
  "English Pale Mild Ale": "Amber",
  "Scottish Ale": "Amber",
  "Scotch Ale / Wee Heavy": "Red Ale",

  // Misc → best match
  "Fruit / Vegetable Beer": "Sour",
  "Pumpkin Ale": "Amber",
  "Winter Warmer": "Amber",
  "Herbed / Spiced Beer": "Saison",
  "Chile Beer": "Amber",
  "Smoked Beer": "Porter",
  Rauchbier: "Porter",
  "Bock": "Lager",
  Maibock: "Lager",
  Doppelbock: "Lager",
  Eisbock: "Lager",
  "Old Ale": "Brown Ale",
  "English Strong Ale": "Red Ale",
  "Strong Ale": "Red Ale",
  "Other": null,
  "Low Alcohol Beer": "Lager",
  "Cider": null,
  "Mead": null,
  "Braggot": null,
  "Radler": "Lager",
  "Shandy": "Lager",
  "Altbier": "Amber",
  "Bière de Garde": "Saison",
  "English Bitter": "Amber",
  "Extra Special / Strong Bitter (ESB)": "Amber",
  "English Dark Mild Ale": "Brown Ale",
  "Euro Strong Lager": "Lager",
  "California Common / Steam Beer": "Lager",
  "Kristalweizen": "Hefeweizen",
  "American Strong Ale": "Red Ale",
  "Smoke Beer": "Porter",
};

// ─── CSV parser (simple, handles quoted fields) ──────────────────────────────

function parseCSV(text) {
  const lines = text.split("\n").filter((l) => l.trim() !== "");
  if (lines.length === 0) return [];

  const headers = parseCSVLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseCSVLine(line);
    const obj = {};
    headers.forEach((h, i) => {
      obj[h.trim()] = values[i]?.trim() || "";
    });
    return obj;
  });
}

function parseCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

// ─── SQL escaping ────────────────────────────────────────────────────────────

function esc(val) {
  if (val === null || val === undefined || val === "") return "NULL";
  const s = String(val).replace(/'/g, "''").trim();
  return `'${s}'`;
}

function escNum(val) {
  if (val === null || val === undefined || val === "") return "NULL";
  const n = parseFloat(val);
  return isNaN(n) ? "NULL" : String(n);
}

// ─── Normalize for matching ──────────────────────────────────────────────────

function normalize(s) {
  return (s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

// State abbreviation map
const STATE_ABBR = {
  AL: "AL", AK: "AK", AZ: "AZ", AR: "AR", CA: "CA", CO: "CO",
  CT: "CT", DE: "DE", FL: "FL", GA: "GA", HI: "HI", ID: "ID",
  IL: "IL", IN: "IN", IA: "IA", KS: "KS", KY: "KY", LA: "LA",
  ME: "ME", MD: "MD", MA: "MA", MI: "MI", MN: "MN", MS: "MS",
  MO: "MO", MT: "MT", NE: "NE", NV: "NV", NH: "NH", NJ: "NJ",
  NM: "NM", NY: "NY", NC: "NC", ND: "ND", OH: "OH", OK: "OK",
  OR: "OR", PA: "PA", RI: "RI", SC: "SC", SD: "SD", TN: "TN",
  TX: "TX", UT: "UT", VT: "VT", VA: "VA", WA: "WA", WV: "WV",
  WI: "WI", WY: "WY", DC: "DC",
};

function normalizeState(state) {
  const trimmed = (state || "").trim();
  // Already abbreviation
  if (STATE_ABBR[trimmed]) return trimmed;
  // Try matching abbreviation
  const upper = trimmed.toUpperCase();
  if (STATE_ABBR[upper]) return upper;
  return trimmed;
}

// ─── Map Kaggle style → HopTrack style ───────────────────────────────────────

function mapStyle(kaggleStyle) {
  if (!kaggleStyle || kaggleStyle.trim() === "") return null;
  const mapped = STYLE_MAP[kaggleStyle.trim()];
  if (mapped !== undefined) return mapped; // null = intentionally unmapped (cider etc)
  // Fallback: try partial match
  const lower = kaggleStyle.toLowerCase();
  if (lower.includes("ipa")) return "IPA";
  if (lower.includes("stout")) return "Stout";
  if (lower.includes("porter")) return "Porter";
  if (lower.includes("lager")) return "Lager";
  if (lower.includes("pilsner") || lower.includes("pilsener")) return "Pilsner";
  if (lower.includes("wheat")) return "Wheat";
  if (lower.includes("saison")) return "Saison";
  if (lower.includes("sour")) return "Sour";
  if (lower.includes("amber")) return "Amber";
  if (lower.includes("brown")) return "Brown Ale";
  if (lower.includes("blonde")) return "Blonde Ale";
  if (lower.includes("pale ale")) return "Pale Ale";
  if (lower.includes("hefeweizen")) return "Hefeweizen";
  if (lower.includes("belgian")) return "Belgian";
  if (lower.includes("red")) return "Red Ale";
  // Unknown — return as-is, it'll just get "default" color family
  return kaggleStyle.trim();
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🍺 Fetching Kaggle Beer Study data...\n");

  // Fetch both CSVs
  const [breweriesRes, beersRes] = await Promise.all([
    fetch(BREWERIES_CSV_URL),
    fetch(BEERS_CSV_URL),
  ]);

  const breweriesText = await breweriesRes.text();
  const beersText = await beersRes.text();

  const kaggleBreweries = parseCSV(breweriesText);
  const kaggleBeers = parseCSV(beersText);

  console.log(`📊 Kaggle breweries: ${kaggleBreweries.length}`);
  console.log(`📊 Kaggle beers: ${kaggleBeers.length}`);

  // Build Kaggle brewery lookup by Brew_ID
  const kaggleBreweryMap = new Map();
  kaggleBreweries.forEach((b) => {
    kaggleBreweryMap.set(b.Brew_ID, b);
  });

  // For each beer, resolve its Kaggle brewery, then build a lookup key
  // The SQL will do a subselect to find the matching brewery in our DB
  const beersWithBrewery = [];
  const unmatchedStyles = new Set();
  let skippedNoBrewery = 0;
  let skippedNoStyle = 0;

  for (const beer of kaggleBeers) {
    const brewery = kaggleBreweryMap.get(beer.Brewery_id);
    if (!brewery) {
      skippedNoBrewery++;
      continue;
    }

    const style = mapStyle(beer.Style);
    if (style === null) {
      skippedNoStyle++;
      continue; // Skip cider, mead, etc.
    }

    if (!STYLE_MAP[beer.Style?.trim()] && beer.Style?.trim()) {
      unmatchedStyles.add(beer.Style.trim());
    }

    beersWithBrewery.push({
      name: beer.Name,
      abv: beer.ABV ? parseFloat(beer.ABV) : null,
      ibu: beer.IBU ? parseInt(beer.IBU, 10) : null,
      style,
      ounces: beer.Ounces ? parseFloat(beer.Ounces) : null,
      breweryName: brewery.Name,
      breweryCity: brewery.City,
      breweryState: normalizeState(brewery.State),
    });
  }

  console.log(`\n✅ Beers with matched breweries: ${beersWithBrewery.length}`);
  console.log(`⏭️  Skipped (no brewery): ${skippedNoBrewery}`);
  console.log(`⏭️  Skipped (non-beer — cider/mead): ${skippedNoStyle}`);

  if (unmatchedStyles.size > 0) {
    console.log(`\n⚠️  Styles using fallback mapping (${unmatchedStyles.size}):`);
    [...unmatchedStyles].sort().forEach((s) => console.log(`   - ${s}`));
  }

  // Collect style stats
  const styleCounts = {};
  beersWithBrewery.forEach((b) => {
    styleCounts[b.style] = (styleCounts[b.style] || 0) + 1;
  });

  // Generate SQL
  const sql = generateSQL(beersWithBrewery, styleCounts);
  writeFileSync(OUTPUT_PATH, sql, "utf-8");

  const sizeMB = (Buffer.byteLength(sql) / (1024 * 1024)).toFixed(2);
  console.log(`\n✅ Migration written: ${OUTPUT_PATH}`);
  console.log(`   Size: ${sizeMB} MB`);
  console.log(`   Beers: ${beersWithBrewery.length}`);
  console.log(
    `\n🍺 Drew says: "Real beers, real styles. Users will find what they're drinking."`
  );
}

// ─── Generate SQL ────────────────────────────────────────────────────────────

function generateSQL(beers, styleCounts) {
  const lines = [];

  lines.push(`-- ${"─".repeat(77)}`);
  lines.push(`-- Migration 049: Kaggle Beer Study — US Craft Beer Seeds`);
  lines.push(`-- ${beers.length} beers matched to breweries from Open Brewery DB (migration 048)`);
  lines.push(`-- Source: https://github.com/davestroud/BeerStudy`);
  lines.push(`-- Styles mapped to HopTrack's 26 canonical styles (beerStyleColors.ts)`);
  lines.push(`-- Generated: ${new Date().toISOString().split("T")[0]}`);
  lines.push(`--`);
  lines.push(`-- Drew 🍻: "Real beers at real breweries. Now we're talking."`);
  lines.push(`-- Quinn ⚙️: "Matching by name+city+state. Existing beers stay safe."`);
  lines.push(`-- ${"─".repeat(77)}`);
  lines.push(``);

  // Style stats
  lines.push(`-- ── Beers by style ──`);
  Object.entries(styleCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([style, count]) => {
      lines.push(`-- ${style}: ${count}`);
    });
  lines.push(``);

  // Strategy: For each beer, INSERT with a subselect to find the brewery_id
  // from our breweries table by matching name + city + state.
  // This means beers will only be inserted if their brewery exists in our DB.

  lines.push(`-- Each beer is matched to its brewery via name + city + state lookup.`);
  lines.push(`-- Beers whose brewery isn't found in our DB are silently skipped.`);
  lines.push(`-- Existing beers (from migration 043) are preserved via name+brewery uniqueness.`);
  lines.push(``);

  // Group beers by brewery for efficiency, deduplicating by beer name
  const byBrewery = new Map();
  let dupeCount = 0;
  beers.forEach((beer) => {
    const key = `${beer.breweryName}|${beer.breweryCity}|${beer.breweryState}`;
    if (!byBrewery.has(key)) {
      byBrewery.set(key, {
        name: beer.breweryName,
        city: beer.breweryCity,
        state: beer.breweryState,
        beers: [],
        _seen: new Set(),
      });
    }
    const group = byBrewery.get(key);
    const beerKey = beer.name.toLowerCase().trim();
    if (group._seen.has(beerKey)) {
      dupeCount++;
      return; // Skip duplicate beer at same brewery
    }
    group._seen.add(beerKey);
    group.beers.push(beer);
  });

  console.log(`🔄 Duplicates removed: ${dupeCount}`);

  lines.push(`-- ${byBrewery.size} unique breweries with beer data`);
  lines.push(``);

  // Use a DO block with a brewery_id variable for each group
  lines.push(`DO $$`);
  lines.push(`DECLARE`);
  lines.push(`  v_brewery_id uuid;`);
  lines.push(`BEGIN`);

  let beerCount = 0;
  let breweryIdx = 0;

  for (const [key, group] of byBrewery) {
    breweryIdx++;

    // Find brewery by name + city + state
    // Use ILIKE for case-insensitive match
    lines.push(``);
    lines.push(
      `  -- ── ${group.name} (${group.city}, ${group.state}) — ${group.beers.length} beers ──`
    );
    lines.push(`  SELECT id INTO v_brewery_id FROM breweries`);
    lines.push(
      `    WHERE LOWER(name) = LOWER(${esc(group.name)}) AND LOWER(city) = LOWER(${esc(group.city)}) AND state = ${esc(group.state)}`
    );
    lines.push(`    LIMIT 1;`);
    lines.push(``);
    lines.push(`  IF v_brewery_id IS NOT NULL THEN`);
    lines.push(`    INSERT INTO beers (id, brewery_id, name, style, abv, ibu, is_active, is_on_tap)`);
    lines.push(`    VALUES`);

    const beerValues = group.beers.map((beer, i) => {
      beerCount++;
      const comma = i < group.beers.length - 1 ? "," : "";
      const abv = beer.abv !== null && !isNaN(beer.abv) ? beer.abv : "NULL";
      const ibu =
        beer.ibu !== null && !isNaN(beer.ibu) ? beer.ibu : "NULL";
      return `      (gen_random_uuid(), v_brewery_id, ${esc(beer.name)}, ${esc(beer.style)}, ${abv}, ${ibu}, true, true)${comma}`;
    });

    lines.push(beerValues.join("\n"));
    lines.push(
      `    ON CONFLICT DO NOTHING;`
    );
    lines.push(`  END IF;`);
  }

  lines.push(``);
  lines.push(`END $$;`);
  lines.push(``);
  lines.push(`-- ── Summary ──`);
  lines.push(`-- Breweries with beer data: ${byBrewery.size}`);
  lines.push(`-- Total beers: ${beerCount}`);
  lines.push(
    `-- Note: Only beers whose brewery exists in our DB (migration 048) will be inserted.`
  );
  lines.push(
    `-- Brewery owners can always add/update their own beers after claiming.`
  );

  return lines.join("\n");
}

main().catch(console.error);
