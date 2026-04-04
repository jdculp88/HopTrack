# Sprint 147 Retro — "The Hardening" 🔧

**Facilitated by:** Sage 🗂️
**Sprint theme:** Bug fixes, infrastructure hardening, lint zero, cron validation
**Team vote:** 12-3-2 (B won in landslide over C and A)

## The Numbers
- **27 → 0** lint errors (React compiler errors — retros had undercounted at "16" for months)
- **1,186 → 1,218** tests (+32 new cron tests across 4 files)
- **1 migration** (096 — Brand Team RLS hardening)
- **14-sprint P0 bug** addressed (Brand Team 0 members — self-read RLS policy)
- **~20 files** modified, **5 new files** created
- **Turbopack/Leaflet panic** killed (CSS import moved from BreweryMap.tsx to globals.css)
- **POS encryption key** added to .env.production.example
- **KNOWN section: EMPTY** for the first time in 14+ sprints

## What Shipped
1. **Migration 096** — Defensive RLS policy recreation for brand_accounts: self-read (auth.uid() = user_id), owner-read-all (via brewery_brands), manager-read-all (via SECURITY DEFINER function). Ensures all 3 brand roles can access the Brand Team page.
2. **Lint Zero** — 27 errors across 15+ files: hoisting reorders, queueMicrotask for setState-in-effect, SortHeader extraction to module scope, useMemo for Date.now() in render, eslint-disable for server component false positives. Zero errors remain.
3. **Leaflet CSS Fix** — Moved `leaflet/dist/leaflet.css` import from BreweryMap.tsx component to app/globals.css. Eliminates Turbopack CSS module factory panic in dev. Production unaffected.
4. **Cron Test Suite** — 4 new test files (32 tests): cron-trial-lifecycle, cron-onboarding-drip, cron-weekly-digest, cron-ai-suggestions. Each tests CRON_SECRET auth, core logic, error isolation, response shape.
5. **Env Config** — POS_TOKEN_ENCRYPTION_KEY added to .env.production.example (gap since Sprint 86).

## Team Credits
- **Casey + Quinn**: Brand Team RLS investigation and migration 096
- **Avery + Dakota**: Lint zero — hoisting fixes, setState patterns, component extraction
- **Jordan**: Turbopack/Leaflet assessment, CSP evaluation (stays Report-Only), Date.now() render fixes
- **Reese**: 32 cron tests with Proxy-based Supabase mock pattern
- **Riley + Quinn**: Env config gaps, cron validation
- **Sam**: QA validation on all fixes

## What We Learned
- The retro count of "16 pre-existing errors" was wrong — it was 27. We were undercounting for months. Now that lint errors are 0, any new error is a regression, not noise.
- The `queueMicrotask(() => setState(...))` pattern defers synchronous setState calls inside useEffect, satisfying the React compiler. But for async fetch functions called from effects, the better pattern is `void fetchData()` with loading starting as `true` (initial state) so the first call doesn't need to set it.
- Server components can trigger React compiler lint rules for `Date.now()` usage even though it's fine at server render time — eslint-disable with a comment is appropriate.
- Migration 081 (Sprint 123) created the SECURITY DEFINER function but the self-read policy from migration 072 may not have been present. Migration 096 defensively recreates all three SELECT policies.

## Roasts
- **Sage → Casey**: "14 sprints. Reese made a birthday card, I made a backlog item, and you made... a migration. Finally."
- **Casey → The Retros**: "We've been saying '16 pre-existing errors' for MONTHS. It was 27. Who was counting? Nobody. I'm watching it now."
- **Jordan → Turbopack**: "20 sprints of 'known dev-only issue.' It was one CSS import. ONE. I had to take a walk."
- **Drew → Joshua**: "LLC formation still pending. Sprint 77 deadline. It's Sprint 147 now. That's 70 sprints. I'm counting."
- **Reese → Dakota**: "`queueMicrotask(() => setLoading(true))` — you learned a new word. Now use it responsibly."
- **Taylor → Morgan**: "You promised Sprint 148 is mine. I'm framing this retro as a receipt."
- **Morgan → Jordan**: "You 'had to take a walk' twice this sprint. At this rate you should just get a standing desk."

## Action Items
- [ ] Apply migration 096 via `supabase db push` and run `NOTIFY pgrst, 'reload schema';`
- [ ] Sprint 148: The Closer (Taylor + Parker — promised, documented)
- [ ] Sprint 149: The Playwright (Casey + Reese — three-peat deferral ends)
- [ ] Alex + Finley: Mobile device spot-check (carried from Sprint 146, Sprint 148)
- [ ] Joshua: LLC formation (Drew is counting sprints)

## Promises Made
- Taylor gets Sprint 148 (The Closer) — demo mode, pricing polish, Drew's intro toolkit
- Casey + Reese get Sprint 149 (The Playwright) — E2E test coverage
- These are promises, not backlog items.

---

*"This is a living document." — Morgan 📐*
*"Covered." — Reese 🧪*
*"ZERO." — Casey 🔍*
