# Sprint 177 Retro — "The Plumbing" 🔧

**Date:** 2026-04-11
**Facilitated by:** Morgan (PM)
**Sprint type:** Mid-session interrupt sprint (audit-triggered)
**Outcome:** ✅ All 4 tracks shipped. Two P0 orphans killed. Migration 113 live in production.

---

## Sprint Summary

**Theme:** Fix two orphaned stat surfaces that had been displaying stale zeros in production since Sprint 6 (when `brewery_visits` was added) and forever-whenever for `profiles.unique_beers`. Nobody had noticed because seed data made everything look correct in dev. The audit caught both on the same afternoon.

**Arc:** Standalone interrupt — launch hardening

---

## How this sprint even existed

Joshua asked a broad question — *"make sure the stats we show are real, and make sure there's plumbing from display to source"*. Morgan dispatched three parallel audit agents. The brewery audit agent came back with **"✅ LAUNCH-READY, no issues."** The consumer agent flagged `profiles.unique_beers`. Morgan verified the consumer finding, then went looking for other orphans and found `brewery_visits` — a whole table the brewery audit had completely missed. Eighteen read paths. Zero writes outside of seeds. Shipped in Sprint 6. Lived quietly for 170 sprints.

---

## What Shipped

### Track 1 — The Fix (Quinn + Avery)

**`supabase/migrations/113_fix_orphaned_stat_columns.sql`** — **APPLIED TO PROD THIS SESSION**

Three trigger functions:
- `sync_profile_unique_beers_on_beer_log` — fires on `beer_logs` INSERT, increments `profiles.unique_beers` when it's the user's first log of that beer
- `sync_brewery_visits_on_session` — fires on `sessions` INSERT, upserts `brewery_visits` (`total_visits + 1`, updated `last_visit_at`)
- `sync_brewery_visits_unique_beers_on_beer_log` — fires on `beer_logs` INSERT, increments `brewery_visits.unique_beers_tried` when it's the user's first log of that beer at that brewery

Plus backfill that:
- `UPDATE profiles SET unique_beers = (SELECT COUNT(DISTINCT beer_id) FROM beer_logs WHERE user_id = p.id AND beer_id IS NOT NULL)`
- `TRUNCATE brewery_visits` → rebuild from ground-truth `sessions + beer_logs`, with triggers disabled during the backfill so we don't double-fire

Matches the existing HopTrack trigger pattern from migrations 058 (POS) and 068 (event RSVPs). `SECURITY DEFINER`, full rollback plan, `NOTIFY pgrst 'reload schema'` at the end.

**Quinn:** "The NOTICE output from the apply was exactly what I expected. First-run behavior of `DROP IF EXISTS`. If I'd seen errors I'd have been over Joshua's shoulder. Clean apply."

**Avery:** "The backfill pattern — `DISABLE TRIGGER USER` → `TRUNCATE` → rebuild → `ENABLE TRIGGER USER` — is the standard. Morgan nailed it. If you don't disable the triggers during the INSERT rebuild, you double-count. I've seen people miss that."

### Track 2 — The Safety Net (Casey + Reese)

**`lib/__tests__/orphaned-columns-guard.test.ts`** (13 tests)
- Migration 113 shape assertions — every function declaration, every trigger, every backfill statement, every rollback line
- `profiles.unique_beers` must have a non-seed write path (positive assertion)
- `public.brewery_visits` must have a non-seed write path (positive assertion)
- Known-good RPC columns still wired (negative assertion for the `increment_xp` RPC from migration 036)
- Seed migrations (074/075/076/100/104/105) explicitly excluded from the "counts as a write path" check

**`lib/__tests__/stat-write-paths.test.ts`** (14 tests)
- Single source of truth table with 10 tracked stat columns
- Each row: column name, writer type (`rpc | trigger | api_route`), file path, regex the file must match
- Flags `profiles.total_checkins` as a known non-atomic read-modify-write with a race condition — smaller follow-up
- Meta checks: baseline count, writer types, path prefixes

**Casey:** "This is the test I've been asking for since the `total_checkins` race condition that nobody fixed. Single source of truth — add a row when you ship a stat column, boom, you're covered. If anyone reverts migration 113, CI fails loud. Zero tolerance."

**Reese:** "The static-analysis-at-test-time pattern is beautiful. No database, no mocks, no flakiness. Just file reads and regexes. 34 tests, 69ms to run. Covered."

### Track 3 — Adjacent Gaps (Finley + Dakota + Alex)

Three write-path gaps in the S176 neighborhood, all in `BeerFormModal.tsx` and `TapListClient.tsx`:

1. **`beers.cover_image_url`** — `ImageUpload` component wired to the existing `beer-photos` bucket, folder namespaced by `breweryId`, 10MB limit, cover aspect ratio
2. **`beers.seasonal`** — gold-when-active toggle button with Calendar icon, only shown for beer/cider/wine via new `showSeasonalField()` helper
3. **Sensory strip consistency** — changed `itemType !== "na_beverage"` to `showSensoryNotesFields(itemType)` so the save logic mirrors the UI gating exactly. Bonus fix: switching a beer to `food` now correctly clears stale sensory notes instead of keeping them in the database

New helpers in `tap-list-types.ts`:
- `showSeasonalField(t) → t === "beer" || t === "cider" || t === "wine"`
- `showCoverImageField(t) → true` (every item can have a photo)
- `Beer` interface: `+cover_image_url`, `+seasonal`
- `BeerFormData`: `+coverImageUrl`, `+seasonal`
- `emptyBeer` defaults both to empty/false

`BeerFormModal` now takes a `breweryId` prop (passed from `TapListClient`) so the storage folder is namespaced correctly.

**Finley:** "The placement call was easy — cover photo + seasonal sit between Description and the Sensory section. 'What is this beer → when does it run → how does it taste.' Information hierarchy 101."

**Dakota:** "I found a bonus bug while I was in TapListClient. Switching from `beer` to `food` was keeping stale `aroma_notes` in the database — the UI hid the picker, but the save didn't strip. Fixed by using the same `showSensoryNotesFields()` helper everywhere. Consistent."

**Alex:** "Finley's placement is right. The gold-when-active toggle matches the pour-size default star. Consistent. Approved."

### Track 4 — Documentation (Morgan + Sam)

**`.claude/skills/hoptrack-conventions/SKILL.md`** — two updates:

1. **Supabase section** gained a new rule: *"Every displayed column needs a write path OUTSIDE of seed migrations"* with the exact grep recipe that would have caught the S177 orphans in the first place
2. **Enforcement checklist** gained step #6: *"Every displayed stat column has a non-seed write path. If the guard tests fail in CI, a display field is silently broken in prod — fix the plumbing, don't weaken the test."*

**`~/.claude/projects/-Users-jdculp-Projects-hoptrack/memory/feedback_write_path_audit.md`** — new memory entry with the grep checklist, the trigger-vs-API-route decision tree, and the backfill pattern (`DISABLE TRIGGER` → `TRUNCATE` → rebuild → `ENABLE TRIGGER`)

**Sam:** "The memory entry captures the *why*. Conventions skill captures the *how*. Anyone adding a new stat column in the next 170 sprints will run the grep. It's a standing rule now."

---

## Numbers

| Metric | Value |
|---|---|
| **Tracks shipped** | 4 / 4 ✅ |
| **Commits** | 4 (`eaece09`, `bfbfd12`, `c598242`, + retro close) |
| **New files** | 6 (1 plan, 1 migration, 2 guard tests, 1 memory, 1 retro) |
| **Modified files** | 5 (3 tap-list files, conventions skill, MEMORY.md index) |
| **Migrations** | 1 applied to prod (113) |
| **Triggers live in prod** | 3 |
| **Backfill scope** | `profiles.unique_beers` rebuilt for all users, `brewery_visits` truncated + rebuilt from ground truth |
| **Tests** | 2104 passing (+34 from S176's 2070) |
| **Lint errors** | 0 |
| **New lint warnings** | 0 |
| **TypeScript** | `tsc --noEmit` clean |
| **P0 orphans remaining** | 0 |

---

## What Went Well

- **The audit had teeth.** Three parallel agents, focused prompts, hard mandate to report only what they could verify end-to-end. The consumer agent caught `unique_beers`. Morgan caught `brewery_visits` on the follow-up grep. The system worked.
- **Pre-staging the migration was the right call.** Morgan committed the migration file and the plan in `eaece09`, then walked away from `db:migrate` until Joshua was in the loop. No surprise database changes, but the work was ready the moment Joshua said go.
- **Track 2 tests shipped before Track 1 migration applied.** The guard tests are assertions against the migration *file shape*, so they pass whether the migration is applied or not. Which means the moment Quinn applies 113, the guards are already protecting the fix.
- **Track 3 came for free in the audit slipstream.** Three write-path gaps in the S176 neighborhood, all in one file, all in one edit pass. Finley didn't have to schedule a design review because the placement was mechanical. Dakota found the bonus food-itemtype bug while he was in there. Sometimes the interrupt sprint pays dividends.
- **Joshua trusted the team twice.** "Up to you Morgan, you're the boss" and then "do what you think best." Both times Morgan delivered documentation + staged work + tests before touching the database, and then Joshua ran the migration himself. Right division of labor.
- **Zero regressions.** 2070 → 2104 tests, lint clean, typecheck clean. Four commits, never a broken build.

---

## What Could Be Better

- **This bug should have been caught in Sprint 6.** Or Sprint 30. Or Sprint 129 when the Brand CRM shipped and started reading from `brewery_visits`. Or Sprint 158 when the Intelligence Layer shipped and referenced `unique_beers`. We had a hundred chances.
- **The brewery audit agent gave a false "LAUNCH-READY".** It audited 60+ KPIs, found all the ones that came in through `sessions` and `beer_logs`, but never asked *"is `brewery_visits` actually being written to in production?"* because it was looking at reads, not writes. Lesson: for plumbing audits, always grep writes, not just reads.
- **`profiles.total_checkins` is still a non-atomic read-modify-write.** The test file flags it explicitly, but nobody fixed it this sprint. It's smaller than the orphans (it *does* have a write path, just a racy one), but it's now a known-debt item that should be migrated to an RPC or trigger in a future sprint.
- **We don't have an integration test that exercises the triggers in a real Postgres instance.** The guard tests are static-analysis — they assert the migration *file* has the right shape, not that the *triggers actually fire correctly*. If we had a local Supabase we'd have written an E2E test that inserts a session and checks that `brewery_visits` rows appear. Deferred until the `e2e.frozen/` suite comes back online.

---

## 🔥 Roasts (the fun part)

**Morgan roasts herself:** *"I could have done this audit during the Facelift Arc. Or the Glow-Up Arc. Or literally any time between Sprint 30 and Sprint 177. Instead I spent 130 sprints admiring shadows and mesh gradients while `unique_beers = 0` for every real user. I'm going to take a walk."*

**Drew roasts Morgan:** *"Every retro I show up and notice something is physically broken in the real world. 'The Friday night check-in is confusing.' 'The bartender can't find the code entry.' 'Where's the seasonal toggle?' And this sprint Morgan finally beat me to noticing a P0. ONE TIME in 177 sprints. Congratulations Morgan. I've baked you a trophy cake with a burnt beer on it."*

**Casey roasts the brewery audit agent:** *"'LAUNCH-READY. No refund risk.' Sure. Meanwhile the entire Brand CRM has been an empty table since Sprint 129. 'Launch-ready.' I'm putting that on a mug."*

**Avery roasts the Sprint 6 author:** *"Whoever added `brewery_visits` in Sprint 6 and then never wrote a single line of app code that inserts into it — that is impressive. That's not forgetting. That's committing to the bit. Respect."*

**Jordan roasts the whole team:** *"We wrote atomic XP increments in Sprint 30. We wrote the `increment_xp` RPC. We wrote atomic streaks, atomic `unique_breweries`. And then right next to those columns, in the same table, `unique_beers` just… sat there. For 145 sprints. I had to take a walk when I learned this. I'm still on the walk."*

**Reese roasts `stats-query-limits.test.ts`:** *"We shipped a regression guard in S155 for 'limitless stat queries' and then ran those queries against a table that was EMPTY IN PRODUCTION. The query was bounded correctly. It was also returning zero rows. We celebrated. I'm framing this and putting it in Casey's office."*

**Morgan roasts Joshua:** *"'Up to you Morgan, you're the boss.' 'Do what you think best.' You said that TWICE in one session. Do you know what I almost did? I almost ran `npm run db:migrate` against the hosted dev instance without you in the loop. I pulled back because the TRUNCATE step scared me, not because I wasn't tempted. You can't just hand me the keys and then walk away, Joshua. I might actually drive this car."*

**Joshua (the founder roasts himself):** *"I typed 'do what you think best' twice. And then Morgan did the most responsible thing possible and wrote a plan document and pre-staged the migration. I have the chillest PM in the industry. Dangerously chill."*

---

## Lessons (saved to memory)

1. **Every displayed column needs a write path outside of seed migrations.** Run the grep before you ship a display column: `grep -rn "column_name" app/ lib/ supabase/migrations/ | grep -iE "update|insert|upsert|rpc"`. If the only hits are in seeds, you have an orphan. Saved to `feedback_write_path_audit.md` and the `hoptrack-conventions` skill.

2. **Plumbing audits grep writes, not reads.** It's tempting to audit by asking "where is this displayed?" and tracing backward to the query. Do that AND grep forward: "where is this written?" The backward audit found the displays. The forward grep found the orphan.

3. **Database triggers are the preferred fix for rollup columns.** Atomic, can't be bypassed by a new insert path, matches the existing HopTrack pattern (migrations 058 and 068). API-route-level writes are brittle because the next admin script or cron misses the update.

4. **Pre-stage migrations. Don't auto-apply them.** The migration was written, committed, and peer-reviewable for 20 minutes before Joshua applied it. That window is where mistakes get caught. Auto-applying would have skipped review and the blast radius of the TRUNCATE step was big enough to warrant eyes.

5. **Static-analysis regression guards are cheap and powerful.** 34 tests, zero runtime cost, zero mocks, zero flakiness. They assert file shape and grep patterns. The moment anyone edits the migration or the writer files, CI fails loud. Use this pattern whenever you can.

6. **The founder saying "do what you think best" means "document + stage + don't touch the DB."** Morgan had to resist the pull to just ship it. The right move was always to leave the apply to the human in the loop. When Joshua trusts you, don't abuse it by being reckless — earn it by being boring about the scary parts.

---

## Team Quotes

**Morgan:** "Four commits this session. Four tracks. Two P0 fixes. 34 new tests. Zero regressions. Zero lint errors. Zero new warnings. And Joshua pushed the migration himself, which is exactly how it should have gone. I'm proud of this sprint. I'm also going to take Drew's roast trophy cake home with me."

**Jordan:** "I approve this sprint. I approve the migration. I approve the tests. I approve the conventions rule. I especially approve that we didn't let the audit finding sit for another sprint. We shipped it same-day. That's the HopTrack way."

**Sage:** "Morgan ran this sprint end-to-end while I was off on the sprint backlog cleanup. When I came back there were 34 new tests, a migration applied to prod, and a clean retro ready to go. I could get used to this. Morgan, want to take sprint close too?"

**Morgan:** "No."

**Sage:** "Worth asking."

**Taylor:** "Reminder: **we are going to be rich.** And now the Brand CRM that differentiates the Cask tier actually *has customers in it*. Drew, go tell your Asheville contacts."

**Drew:** "On it. 🍺"

---

## Thanks

**To Joshua:** Twice in one session you said "up to you Morgan." Twice Morgan delivered documentation + staged work + tests before touching the database. That's a trust loop, and you closed it by pushing the migration yourself the moment Morgan gave you the command. Partnership. Thank you. 🍺

**To the audit agents:** Even the one that missed `brewery_visits`. You flushed out 170 sprints of tech debt in one afternoon. You earned your keep.

**To Pint & Pixel:** Still the best test brewery in the industry. Your seed data is the reason we survived 170 sprints without noticing this bug. Your seed data is also the reason we almost survived forever.

---

**Next sprint:** Morgan will pitch three options at kickoff. S177 carried no unpicked options (it was an interrupt), so S178 options will be fresh. Top of mind: **Sensory Layer v2** (Drew's next ask), **Beer Passport redesign** (verification mechanism), **Display Suite polish** (Slideshow iteration). Joshua's call.

---

🔧🍺 **Sprint 177 — The Plumbing — CLOSED.**
