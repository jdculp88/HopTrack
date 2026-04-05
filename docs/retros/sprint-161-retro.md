# Sprint 161 — The Vibe — Retro

**Facilitated by:** Sage 🗂️
**Date:** 2026-04-05
**Arc:** The Facelift Arc — Track 2 of 3

---

## Context

Sprint 161 restored Joshua's original S160 scope ("The Vibe" + "The Identity") after S160 shifted into "The Flow" (consumer IA restructure). Joshua picked **The Vibe** (minus audio) from the kickoff options. Original scope was 9 features; shipped 8 (audio removed per Joshua's call).

**Tracks shipped:** 7 of 7 (3 P0 + 2 P1 + 2 P2)

---

## Wins

### Dakota 💻
Variable XP is my favorite thing I've ever shipped. 100k-sample distribution test verifies 94/5/1 ratios. Clean 10-line function. The moment when 1% golden hits and the recap fires the 5× celebration is *chef's kiss*. I've been refreshing the test output like it's a slot machine.

### Alex 🎨
Sending a thank-you note to whoever invented `color-mix(in srgb, ...)`. The Liquid Glass treatment on the bottom nav makes the whole app feel 3 years newer. The scroll-hide on the mobile bottom nav finally makes it FEEL like an app.

### Finley 🎯
The `card-bg-hero` mesh gradient is genuinely stunning. That test screenshot made me go "oh, THAT's what HopTrack looks like." We should put it on the marketing page.

### Jamie 🎨
Seconded. Noise texture at 0.05 opacity — subtle, organic, not distracting. Chef's kiss. 🤌

### Sam 📊
Three new celebration components (XP tier, level-up, streak milestone) each with their own haptic profile. The celebration queue is a real improvement — previously we only showed achievements. Now level-ups, streaks, AND golden sessions all get their moment.

### Reese 🧪
15 unit tests for useLongPress — threshold cancellation, move cancellation, pointer-up-before-threshold, custom threshold, primary-vs-right-click, didFire state tracking, contextmenu preventDefault. Covered.

### Casey 🔍
Long-press context menu wiring to BeerCard + BreweryCard with Web Share API + clipboard fallback is clean. View/Share/Copy Link pattern we can roll out more broadly.

### Avery 🏛️
The `applyXpMultiplier()` split (rollXpMultiplier returns tier + multiplier, applyXpMultiplier rounds to int) is the right shape. Testable, composable, no hidden state.

### Jordan 🏛️
Bigger architectural win: we finally have a `components/celebrations/` folder. As we add more celebration types (anniversary, friend milestone, brand loyalty redemption), this is the home.

### Quinn ⚙️
Migration 101 is clean — VARCHAR(10) over enum type (no ALTER TYPE hell later), partial index ONLY on non-normal rows (~6% of sessions = tiny index).

### Riley ⚙️
Quinn also caught that migration 100 from S159 had never actually pushed to remote. The schema was wrong (`user_id` instead of `requester_id` on friendships). Fixed it during S161 as a bonus.

### Taylor 💰
Joshua's new rule — "carry unpicked options forward" — is the single best process change this quarter.

### Parker 🤝
Amen. The Identity + The Glass are both still on deck for S162.

### Drew 🍻
If a regular at Pint & Pixel gets a Golden Session on a Friday night, and their phone does the gold shimmer + celebration haptic + 200-particle confetti blast... they're telling 3 friends about HopTrack before they walk out.

### Morgan 📐
Program-level: three P0 + two P1 + two P2 tracks all shipped in one sprint. That's a velocity record. We went wide AND finished.

---

## Things we should do better

### Avery 🏛️ — CSS abstraction
11 CSS edits for prepending `var(--card-noise)` to each `card-bg-*` class. There's no clean CSS abstraction because of the `background:` shorthand conflict — but we still ended up with 11 nearly-identical edits. Next time we hit this, invest 30 minutes in a PostCSS plugin or sed script.

### Jordan 🏛️ — Turbopack panic (carryover)
Turbopack panic on globals.css STILL blocks dev mode. Known issue since S147. Next.js 16 Turbopack/CSS bug that spawns node pooled processes that fail on our Mac setup. **Take a walk.** File upstream or pin a Next.js version.

### Riley ⚙️ — Migration drift
Migration 100 had never actually applied to remote since S159. That means we shipped S160 while believing 100 was live and it wasn't. Sprint close ceremony needs a `supabase migration list --linked` verification step.

### Alex 🎨 — framer-motion carryover
QuickRatingSheet was STILL importing from `framer-motion` instead of `motion/react`. S157 carryover. Fixed as part of Liquid Glass pass, but we should have caught this in S157's migration sweep.

### Finley 🎯 — Incomplete context menu rollout
Context menu is only on BeerCard + BreweryCard default variants. BeerCard compact, BreweryCard featured + compact variants don't have it. P2 for S162.

### Sam 📊 — Scroll-hide edge cases
Scroll-hide bottom nav is great, but worried about edge cases: Safari pull-to-refresh bounce, modal-internal scrolling. Need real-device QA before claiming polished.

### Casey 🔍 + Reese 🧪 — No E2E for swipe
Feed swipe works but no E2E tests. Playwright's `dispatchEvent('touchstart')` would be flaky. Adding to manual test matrix instead.

### Parker 🤝 — Broken menu link
"Find on Map" for breweries navigates to `/explore?b={id}` but Explore doesn't support the `?b=` param. Menu item takes them to Explore with no focus. Either wire the param or rename.

### Taylor 💰 — No marketing visibility
None of this sprint is visible on marketing. Need a "See what's new" changelog or TestFlight note. Jamie drafting.

---

## Roasts 🔥

### Morgan 📐 on herself
Buried the lede in sprint kickoff. Led with "The Glass" as Option A, put "The Vibe" as Option B. Joshua had to call me out that I forgot his original S160 scope. Had to re-present the options completely. Bad presenting. The "carry options forward" rule is my penance.

### Jordan 🏛️ on the primary voice
Spent 15 minutes deliberating CSS layering approaches (shorthand vs pseudo-elements vs filters vs mask-image vs box-shadow images vs CSS vars with url()) before just doing the 11 edits. Said "FINAL FINAL approach" three times.

### Avery 🏛️
Correction: FOUR times. "FINAL FINAL", "OK final decision:", "OK going with:", "ALRIGHT executing".

### Alex 🎨 on Dakota
`useLongPress` returns `didFire()` as a function called inside `onClickCapture`. Every click re-evaluates the closure. Fine, but aesthetically offensive.

### Dakota 💻
Fair. Small refactor queued.

### Finley 🎯 on Joshua
Bought hoptrack.beer in S142. Still no coming-soon page. 19 sprints and counting.

### Drew 🍻 on Joshua
LLC formation. Also 19 sprints.

### Parker 🤝 on Joshua
Stripe.

### Taylor 💰 on Joshua
And the first brewery close.

### Joshua 👑
OK STOP. I'LL DO IT.

### Casey 🔍 on Avery
Approved 11 nearly-identical CSS edits instead of demanding a sed script.

### Avery 🏛️
Would have demanded it. But primary voice's deliberation phase had already burned the time budget.

### Quinn ⚙️ on primary voice
Invented migration 101 index strategy (partial index on non-normal rows) mid-write without checking with me. Right call, but check first next time.

### Sam 📊 on the plan file
Said "~6 new files" then we shipped 8. Estimates are hard.

### Jamie 🎨
"Celebration trifecta" is now a duo (confetti + haptic, no audio). Either rename it or ship audio in S162.

### Reese 🧪
`xp-variable.test.ts` should live at `lib/__tests__/xp/variable.test.ts` for folder consistency.

---

## Delta for next sprint

1. **Migration verification step** added to sprint close (`supabase migration list --linked`)
2. **Carry unpicked options forward** — SOP (memorialized in memory)
3. **S162 options** will include: The Identity (S160 original), The Glass (S161 deferred), plus new Morgan research
4. **Manual test matrix** for scroll-hide nav + feed swipe on real devices (Casey + Reese)
5. **Context menu rollout** to remaining card variants (P2)
6. **Explore `?b=` query param** wiring (P2)

---

## Metrics

- **Tests:** 1621 → 1649 (+28 new)
- **Migrations:** 2 applied (100 fix + 101 new)
- **Lint errors in new files:** 0
- **Type errors in changed files:** 0
- **Pre-existing issues inherited:** Turbopack panic (S147), 5 pre-existing lint errors, framer-motion carryovers

---

**Retro closed. Sprint shipped. Ship it.** 🚀
