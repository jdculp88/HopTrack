# Sprint 116 Retro — "The Daily Pour" 🍺

**Date:** 2026-04-02
**Facilitator:** Morgan
**Sprint:** 116

---

## What We Shipped

- **Service worker caching fix** — 30-sprint root cause identified and killed. `cache-first` fetch handler for `/_next/static/` stripped entirely. SW now push-notifications only, clears all caches on activate. (`public/sw.js`)
- **WishlistOnTapAlert fix** — Hydration mismatch: server/client render disagreement on dismissed state. Fixed by starting `useState(false)` on both sides, revealing in `useEffect`. Explore + dismiss buttons now respond reliably.
- **Individual notification dismiss** — API was silently marking ALL notifications read regardless of which one was dismissed. Fixed with conditional `body.id` check.
- **You tab spacing** — `!mt-10` on "Your Activity" section. Breathing room restored.
- **Migration 076** — Friday night at Pint & Pixel: 40 test users, 120-150 visitors, 8 active sessions, 400+ drinks, Joshua wired as brewery owner.
- **`scripts/seed-next-day.mjs`** — Day simulator: auto-detects last seeded date, advances one calendar day, applies day-of-week traffic model (Mon 20-35 → Sat 100-140 visitors), inserts sessions/beer_logs/reviews/reactions. Run at every sprint close.
- **Sprint close ceremony** — Codified in CLAUDE.md and memory: retro → CLAUDE.md → agents → memory → seed-next-day → commit.

---

## The Team Speaks

**Morgan 🗂️** — This sprint punched above its weight. Five shipped items, one of them a 30-sprint ghost. The day simulator changes how this product grows going forward. Good sprint.

**Riley ⚙️** — Thirty sprints. Cache-first on `/_next/static/`. I'm humbled. The fix was 58 lines deleted, 7 added. Don't talk to me about it.
*Roast: The infrastructure guy didn't check the one file that's not infrastructure. Classic.*

**Avery 💻** — `seed-next-day.mjs` was clean work. Schema matched perfectly, FK-ordered inserts, graceful upserts. Already on it for every sprint close. Already on it.
*Roast: Zero architectural questions asked before writing 492 lines. Jordan is fine.*

**Jordan 🏛️** — The SW was not in my review scope. The seed script is clean. I have no further comments.
*Roast: Jordan has reviewed every PR in this codebase and somehow the 30-sprint bug was "not in scope." Sure.*

**Sam 📊** — The notification fix was a trust issue masquerading as a UX issue. Fixed. The spacing was polish. Both matter.
*Roast: Sam wrote "from a business continuity standpoint" about a 10px spacing fix.*

**Drew 🍻** — Migration 076 felt right. That's not something I say lightly. Pint & Pixel on a Friday night, peak 8-10pm, Joshua showing up as a customer at his own bar. The day simulator is how you demo to real brewery owners. Show them data that breathes.
*Roast: Drew said "chef's kiss" and Jamie clocked it immediately.*

**Casey 🔍** — Hydration mismatch caught, notification race condition caught, both fixed. Zero P0s open. ZERO. Adding beer_reviews test coverage to the list.
*Roast: Casey said "zero P0s" and immediately created new work for herself.*

**Alex 🎨** — `!mt-10`. Twenty pixels. The breathing room now feels intentional. The WishlistOnTapAlert gold banner works and therefore is beautiful. That's the whole job.
*Roast: Alex has documented opinions about 20 pixels. This is why the app looks good.*

**Jamie 🎨** — The sprint close ceremony is a brand story. "Track Every Pour" made literal. Every sprint, Pint & Pixel grows. Chef's kiss. Yes, I said it first.
*Roast: Jamie turned a seed script into a brand narrative. We love it.*

**Taylor 💰** — The day simulator is a sales tool. Six weeks of real-looking analytics on a demo dashboard. That's not a prototype. We're going to be rich.
*Roast: Taylor monetized the sprint close ceremony. Naturally.*

**Sage 📋** — 5 shipped ✅. Migration 076 live ✅. Sprint close ceremony locked ✅. Zero P0s ✅. Carry forward: beer_reviews test coverage. I've got the notes.
*Roast: Sage's roast is that she has no roast. It's unsettling.*

---

## Numbers

| Metric | Value |
|--------|-------|
| Bugs fixed | 3 (SW cache, WishlistAlert, notifications) |
| QoL fixes | 2 (You tab spacing, sprint close ceremony) |
| New scripts | 1 (seed-next-day.mjs) |
| Migrations | 1 (076 — Friday night seed) |
| Test users seeded | 40 |
| Pint & Pixel Saturday visitors (first run) | 134 |
| Beer logs (Saturday run) | 348 |
| Sprints the SW bug survived | 30 |

---

## Carry Forward

- [ ] `beer_reviews` test coverage — Casey flagged this sprint
- [ ] Run `seed-next-day.mjs` at every sprint close (now part of ceremony)

---

*Sprint 116 — "The Daily Pour" — CLOSED ✅*
