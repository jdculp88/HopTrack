# Sprint 78 — The Database 🗄️

**Arc:** Launch or Bust (Sprints 75-78)
**Date:** 2026-03-31
**Goal:** Seed the database with real US brewery and beer data for launch

---

## Why This Sprint

You can't launch a beer app where users search for their local brewery and get nothing. That's a one-star uninstall. We had 63 test breweries and 90 test beers — a ghost town. This sprint fixes that with real data from two public sources.

---

## Data Sources

| Source | What | Records | Coverage |
|--------|------|---------|----------|
| [Open Brewery DB](https://openbrewerydb.org) | US breweries (name, type, address, GPS, phone, website) | 7,177 active | All 50 states + DC |
| [Kaggle Beer Study](https://www.kaggle.com/datasets/mexwell/beer-study) | US craft beers (name, style, ABV, IBU) | 2,361 matched | 541 breweries |

### Why These Sources
- **Open Brewery DB** — Free, open-source, maintained. Fields map 1:1 to our schema. GPS coordinates mean HopRoute works nationwide on day one.
- **Kaggle Beer Study** — 2,410 real craft beers with styles and ABV/IBU. Styles mapped to our 26 canonical values (beerStyleColors.ts). Some beers may be discontinued — that's fine. Brewery owners will update their own tap lists after claiming.

### What About More Beer Data?
Joshua is looking for a more up-to-date beer catalog. The Kaggle data gives us ~2,361 beers across 541 breweries — solid for launch but not comprehensive. Additional beer data can be layered in as migration 050+ when found.

---

## Deliverables

### Migration 048: Open Brewery DB Seed
- **7,177 active US breweries** across all 50 states + DC
- Types: micro (4,156), brewpub (2,428), regional (213), contract (184), large (73), proprietor (68), taproom (34), nano (19), bar (2)
- **5,513 with GPS coordinates** (HopRoute eligible)
- Top 5 states: CA (804), CO (401), WA (388), NY (382), MI (354)
- `ON CONFLICT (external_id) DO NOTHING` — preserves existing curated data
- All seeded as `verified = false` — becomes `true` when owner claims
- Script: `scripts/fetch-breweries.mjs`

### Migration 049: Kaggle Beer Seed
- **2,361 beers** matched to 541 breweries
- Styles mapped to HopTrack canonical styles (IPA: 466, Pale Ale: 257, Amber: 232, Lager: 181, etc.)
- Matched via brewery name + city + state (case-insensitive)
- Only inserts beers whose brewery exists in our DB (safe join)
- `ON CONFLICT DO NOTHING` — existing beers preserved
- Script: `scripts/fetch-beers.mjs`

---

## What This Enables

1. **Search works at launch** — Users find their local brewery
2. **HopRoute works nationwide** — 5,513 GPS-enabled breweries for pub crawl suggestions
3. **Claim funnel is live** — 7,177 brewery listings → owners search for themselves → "Claim This Brewery" → paid tier
4. **Beer check-ins are real** — 2,361 beers users can actually find and log
5. **More beer data welcome** — Joshua is sourcing additional catalogs; migration 050+ ready

---

## Team Credits

| Who | What |
|-----|------|
| **Drew** 🍻 | Data source research, brewery/beer data strategy, quality validation |
| **Quinn** ⚙️ | Fetch scripts, data normalization, state/style mapping, migration generation |
| **Riley** ⚙️ | Migration architecture, conflict handling strategy |
| **Jordan** 🏛️ | Schema compatibility review, architectural guardrails |
| **Taylor** 💰 | Revenue funnel analysis (7,177 potential customers) |
| **Morgan** 🗂️ | Sprint planning, coordination |

---

## Notes

- The Kaggle beer data is from a study (~2017 vintage) — some beers may be retired. This is fine for launch. Real brewery owners will curate their own tap lists after claiming.
- Open Brewery DB is actively maintained and updated. The fetch script can be re-run to pull fresh data anytime.
- Existing test/demo breweries (migrations 024, 042, 043) are fully preserved via conflict handling.
- 12 Kaggle beer styles used fallback mapping (e.g., "American Black Ale", "Quadrupel (Quad)") — these still display correctly, just with default color family.
