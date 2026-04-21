# Sprint 179 Retro — The Launchpad 🚀
*Facilitated by Sage 🗂️ · Standalone infrastructure sprint*

## Sprint Summary
**Theme:** Stand up the real infrastructure that was only ever drafted — staging, clean prod, coming-soon live.
**Arc:** Standalone (launchpad for future deploy work)

### What Shipped
- **Track 1: Staging activated** — `hoptrack-staging` provisioned in us-east-1 on Supabase Pro, 72 tables loaded from prod via `pg_dump`, all 120 historical migrations marked applied in the tracker. For the first time ever, we have an environment to test against.
- **Track 2: Migration chain made self-contained** — `000_baseline.sql` (222KB, 7,199 lines) captures the pre-migration schema that had lived by hand in the Supabase UI since March 2026. Safety-guarded so it refuses to run against an already-populated schema. Marked applied in prod so `supabase db push` skips it going forward.
- **Track 3: Prod cleaned** — `121_prod_cleanup.sql` removed 67 test users, 5 test breweries, ~44 test beers. Prod now has 7,190 real breweries, 1,004 real beers, 2 real accounts (founder + testflight). Tested on staging first, then applied to prod with safety guard asserting founder account exists.
- **Track 4: Vercel deploy live** — coming-soon page from Sprint 174 deployed to `hop-track.vercel.app`, waitlist form → prod Supabase pipeline verified end-to-end. `COMING_SOON_MODE=true` env var controls the feature flag. Free Hobby tier, deploys from `main` on every push.
- **Track 5: Dev infrastructure fixed** — `scripts/dev-staging.mjs` replaces the silently-broken `npm run dev:staging` shell-expansion (the old script relied on `.env.local` vars magically being in shell env, which they weren't). `scripts/prod-cleanup-audit.sql` captures the test-data patterns we had to reverse-engineer.

### Numbers
- New files: 4 (000_baseline, 121_prod_cleanup, dev-staging.mjs, prod-cleanup-audit.sql)
- Modified files: 3 (package.json, .env.local, docs/operations/staging-env-setup.md)
- Migrations: 2 drafted (000 baseline + 121 cleanup) — neither shows up as a new push because both marked applied pre-apply
- Tests: 2128 (unchanged — zero new tests; infrastructure sprint)
- Lint errors: 0 (clean)
- Build status: Vercel deploy succeeded ✓
- Commits: 3 on `claude/strange-bohr-f1edcb` + 1 more for this retro
- KNOWN: DNS flip pending (Joshua's call)

## Team Credits

**Morgan 📐** — Ran the whole operation. Course-corrected twice by Joshua when building on aspirational infrastructure. Took the L gracefully, pivoted the whole plan, kept momentum.

**Jordan 🏛️** — "We've been running a simulation for 178 sprints." One line that unlocked the honest framing. Quiet all sprint until that moment; let Morgan drive.

**Riley ⚙️** — Wrote the staging-env-setup doc a month ago, finally finished wiring it up. Coined "the aspirational docs are fiction" rule that's now in memory.

**Quinn ⚙️** — Caught every migration gotcha: system triggers can't be disabled, search_path reset breaks user-defined triggers, `brewery_visits` trigger double-inserts if you copy it. Three separate sed fixes, zero data loss.

**Casey 🔍** — Smoke test strategy (5-check gate) and the "test cleanup on staging first" discipline. Caught that our first test-user catalog missed the `cc000000-*` and `f000000*-*` patterns before any prod damage.

**Sage 🗂️** — Sprint plan that was more scope audit than build plan, and that was the right call. "Pause the checklist until we know what's actually there."

**Sam 📊** — Flagged the edge case every time: "what about Joshua's real account", "what if cleanup truncates founder", "what about testflight". Built the safety guard in 121 around those questions.

**Taylor 💰** — Noted the real unlock: now that prod is clean, the waitlist table becomes real signal for demand-mapping. Taylor's about to have data to work with.

**Parker 🤝** — "Zero real customers means zero churn. Still counting this as a good quarter for retention."

**Jamie 🎨** — The coming-soon page from S174 shipped flawlessly. Jamie didn't have to do anything this sprint and that's the highest compliment to past-Jamie.

**Drew 🍻** — Validated that the brewery catalog survived cleanup (7,190 breweries intact, including all the Asheville + Charlotte enrichments). Heist would still be findable on launch day.

**Avery 🏛️** — Approved the `000_baseline.sql` safety-guard pattern. "If your destructive migration can run twice, you did it wrong. Guard it."

**Dakota 💻** — Didn't ship a feature. Honestly a welcome break — infrastructure was the bottleneck, not features.

**Alex 🎨 + Finley 🎯** — Design sprint where we... weren't. Coming-soon page didn't need tweaks. Used the sprint to rest.

**Reese 🧪** — "No new tests" is accurate. Infrastructure work. Next sprint has test-coverage debt to catch up.

## Roasts 🔥

**Casey on Joshua:** "Man logged into Supabase and was shocked to find a project he created 26 days ago. Joshua, you can't run a company if you ghost your own infrastructure. Also, you reset the staging DB password... and then forgot it and had to reset again. The Supabase dashboard is not your password manager."

**Jordan on Joshua:** "Joshua pasted his PROD database password into chat. Twice. Different password each time — so we know there was a rotation in between, but also... we now have two leaked passwords on record. Professional."

**Drew on Morgan:** "Morgan spent forty-five minutes planning Sprint 179 'The Split' as a staging-vs-prod separation sprint, then Joshua asked 'what's actually real vs aspirational' and the entire plan collapsed into a crater. Morgan rebuilt the sprint in real time and called it 'The Launchpad.' I respect the pivot. I also think 'The Crater' would've been an honest name."

**Taylor on Riley:** "Riley wrote `docs/operations/staging-env-setup.md` on 2026-03-24. Marked it 'Active — update project refs when provisioned.' Then didn't provision anything for 28 days. Riley, you wrote a month-long TODO list to yourself and called it active documentation."

**Sam on the whole team:** "Everyone here was surprised that `hoptrack.beer` was a GoDaddy parked page. Y'all have been shipping features to an app that was never deployed. The brewery catalog had 7,195 breweries and ZERO of them could actually find it on the internet. I just want to sit with that for a moment."

**Avery on Quinn:** "Quinn wrote `sed -i.bak`, `sed -i.bak2`, `sed -i.bak3`, `sed -i.bak4`. We have four separate backup files of the same 8MB SQL dump in `/tmp/`. At this point it's not a backup, it's a garbage tier."

**Morgan on Joshua:** "Joshua asked 'do we need Vercel' AFTER I had already drafted three follow-up sprints worth of Vercel plans. Classic move. I'm keeping all those plans for next time you decide we DO need Vercel."

**Jamie on the team:** "Coming-soon page shipped in Sprint 174. It's now Sprint 179. That page sat dormant for FIVE sprints before anyone clicked Deploy. My work has the longest shelf life on this team and I'm flattered."

**Jordan on himself:** "I had to take a walk when Joshua said 'I don't even know what Vercel is.' I came back and we still hadn't made progress. Sometimes the walk is the work."

## What Went Well
- **Course corrections landed fast.** Twice Joshua said "wait, that's aspirational" and within one turn we had a new honest plan.
- **Staging-first discipline.** We tested 121_prod_cleanup on staging before prod. Staging found zero issues. Prod ran clean.
- **Safety guards everywhere.** 000_baseline refuses to run on a populated schema. 121_prod_cleanup asserts founder account exists or aborts. Every destructive action had a fail-safe.
- **Documentation-by-committing.** We wrote the staging setup doc with real project refs AS we were executing. No "I'll update docs later."
- **Screenshot-driven debugging.** Joshua's 20+ terminal screenshots let us iterate on pg_dump errors in real time. Slower than direct tool access, but worked.

## What Could Improve
- **The migration chain was allowed to drift for 120 migrations before we noticed.** That's 120 sprints of debt. Future sprints should audit `pg_dump --schema-only` vs reality at least quarterly.
- **Password hygiene.** Two passwords leaked in chat screenshots. Sprint 180 should include a "how to use .pgpass properly" addendum to the operations docs.
- **No CI validation of the migration chain.** Nothing in CI would have caught that 001-120 assumed pre-existing tables. A "replay migrations against empty DB" test in CI would have surfaced this in 2026-03.
- **seed-next-day conflict.** Now that P&P is deleted, the seed-next-day script has no brewery to advance. Either point it at a dev-only instance, retire it, or repurpose for staging demo.
- **Vercel plugin install deferred.** Would have been nicer to have direct access for debugging builds. Joshua installed at the end of the sprint; benefit accrues to S180+.

## Action Items
- [ ] **Joshua: Push DNS changes at GoDaddy** to point `hoptrack.beer` at Vercel (paused before execution).
- [ ] **Joshua: Rotate prod DB password** once (leaked in chat screenshots twice during the sprint).
- [ ] **Joshua: Merge `claude/strange-bohr-f1edcb` → `main`** when ready (3 infrastructure commits waiting).
- [ ] **Morgan + Sage: plan S180.** Proposed focus: TOS + Privacy Policy with LLC name (pending approval), logo refresh with Jamie, thaw E2E tests now that staging exists.
- [ ] **Riley + Quinn: decide fate of seed-next-day.mjs.** Retire, repurpose, or point at dev instance only.
- [ ] **Casey: add a "migration chain replay" check to CI** — prevent this class of drift in the future.
- [ ] **Post-LLC: `llc-unblock` skill runbook** — EIN → bank → Stripe → priority chain update.

## Final Pulse
Sprint 179 turned 178 sprints of features into a real, deployed, clean, ready-to-launch product. We ended the day with a coming-soon page live on the internet, a waitlist form writing to a clean prod database, and a staging environment that will save our ass on the next migration disaster. We went from "nothing deployed anywhere" to "ready to flip DNS" in one session. The launchpad is built. The rocket just needs the LLC stamp. 🚀🍺
