# Sprint 135 Retro — "The Formatter"
**Facilitated by:** Morgan
**Date:** 2026-04-03
**Theme:** Data Standardization & Input Validation

---

## What Shipped
- 3 new utility functions in `lib/brewery-utils.ts`: `formatCity()`, `formatState()`, `normalizeAddress()`
- `US_STATES` constant (50 states + DC, dropdown-ready)
- Settings API (`PATCH /api/brewery/{id}/settings`): normalizes city/state/address/postal_code on write, validates state + zip
- Claims API (`POST /api/brewery-claims`): normalizes all brewery data on upsert (was raw passthrough)
- Brewery Settings UI: state text input replaced with `<select>` dropdown, zip code field added
- Migration 089: batch normalize city (Title Case), state (2-letter uppercase), street (whitespace). Dedup logic for duplicate brewery entries. 58 rows normalized across 19 states.
- 29 new tests (996 → 1025), clean build, zero errors

## What Went Well
- **Jordan**: Architecture extended naturally from Sprint 132 patterns. Pure functions, null-safe, no new abstractions needed.
- **Avery**: Linear flow — utilities → tests → API → UI → migration. No backtracking.
- **Quinn**: Migration 089's dedup logic handled unique constraint collisions cleanly. RAISE NOTICE audit trail was invaluable.
- **Riley**: Most defensive migration yet. FK-safe deletes, collision guards, zero data loss.
- **Casey**: 29 new tests covering every edge case. formatCity handles McAllen, O'Fallon, Winston-Salem, St. Louis.
- **Taylor**: 7,177 brewery pages now display professional, consistent data. Credibility matters for sales.
- **Drew**: State dropdown prevents future data garbage. "Force the format" — real operator thinking.

## What Could Be Better
- **Casey**: No integration tests for API normalization-on-write. Tech debt to track.
- **Taylor**: Two code quality sprints in a row. Wants revenue-impacting features next.
- **Jordan**: Claims route had raw state passthrough for 57 sprints. Should have caught it sooner.

## The Roast
- Jordan had to take a walk when he saw `state: brewery.state_province ?? null` — raw passthrough since Sprint 78
- Drew pointed out the zip code field was missing from Settings for 57 sprints despite everything else being normalized
- Casey discovered "Modern Times Beer" existed twice in San Diego — once with "CA" and once with "california"
- Quinn called the Postgres error message "poetry"
- Taylor is begging for a revenue sprint. Two code quality sprints in a row is testing his patience.
- Morgan smiled at Jordan's commit. This is documented.

## Stats
| Metric | Value |
|--------|-------|
| Files created | 2 (migration + retro) |
| Files modified | 4 |
| New functions | 3 |
| New exports | 4 |
| New tests | 29 |
| Total tests | 1025 |
| Brewery rows normalized | 58 (across 19 states) |
| Orphan duplicates cleaned | unknown (auto-deleted) |
| Migration | 089 |
| Lint errors | 0 |
| P0 bugs | 0 |

## Action Items
- [ ] Track integration test gap for API normalization (Casey)
- [ ] Consider revenue-impacting sprint next (Morgan/Taylor)
- [ ] Monitor for any remaining full-state-name rows that couldn't be normalized (Quinn)
