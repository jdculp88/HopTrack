# Sprint 135 — The Formatter
**Theme:** Data standardization & input validation
**Status:** COMPLETE
**Date:** 2026-04-02 (retroactive)

---

## Goals
- Build pure formatting functions for city, state, and address normalization
- Harden Settings and Claims APIs with server-side normalization
- Replace state text input with dropdown, add zip code field
- Batch-normalize existing brewery data and deduplicate entries

## Key Deliverables
- 3 new utility functions in `lib/brewery-utils.ts`: `formatCity` (Title Case with Mc/apostrophe/hyphen handling), `formatState` (full name -> 2-letter abbreviation), `normalizeAddress` (trim + whitespace collapse)
- `US_STATES` constant (50 states + DC, sorted, dropdown-ready)
- Settings API hardened: normalizes city/state/address/postal_code on every write, validates state + zip code
- Claims API hardened: normalizes all brewery data on upsert (was raw passthrough since Sprint 78)
- Brewery Settings UI: state text input -> `<select>` dropdown with all 51 options, zip code field added
- Migration 089: batch normalize city (Title Case via initcap), state (2-letter uppercase), street (whitespace)
- Dedup logic for duplicate brewery entries (same name+city with both full state name and abbreviation)
- 58 brewery rows normalized across 19 states, orphan duplicates cleaned

## Results
- 1 new file, 4 modified, 1 migration (089)
- 29 new tests (996 -> 1025 total)
- KNOWN: Brand Team page shows 0 members (pre-existing RLS query issue)
