# Sprint 23 Retro — Bug Bash

**Date:** 2026-03-28
**Sprint Theme:** Full team audit + systematic bug fixes across all surfaces
**Shipped:** 16 fixes across 20+ files, 2 migrations, 1 new feature (brewery reviews)
**Build:** Clean pass
**Vibe:** Surgical

---

## What Went Well

**Morgan:** This was the most organized sprint we've run. Deployed the whole team in parallel — Alex on UI, Jordan on core, Sam and Casey on QA, Drew and Riley on infra, Jamie and Taylor on brand. Everyone came back with real findings, not fluff.

**Jordan:** The codebase was cleaner than expected. Zero alert() calls, zero TODOs, 97% loading.tsx coverage. The bugs were real architectural gaps — missing storage bucket, missing brewery ratings, hardcoded colors — not sloppy code.

**Casey:** ZERO P0 bugs open. ZERO. The accessibility sweep — aria-label, aria-pressed, aria-hidden — took us from "works" to "works for everyone."

**Alex:** The color-mix() pattern for gold alpha variants is chef's kiss. No more rgba(212,168,67,0.1) everywhere. The BreweryAdminNav logo fix was overdue — beautiful now at 32px.

**Sam:** Four API routes were silently swallowing errors. Notifications, push subscriptions, pint rewind, friends active. That's the kind of bug that loses a brewery owner at 8pm on a Friday.

**Drew:** The Board code is solid. Data fetching, Realtime subscription, fullscreen layout, pour sizes, glass SVGs — all checks out.

**Riley:** Avatars bucket missing for 8 sprints. Migration 030 is three lines of SQL that should have existed from day one.

**Taylor:** Brewery review feature is the biggest win. Star ratings, comments, averages — closes a real sales gap.

**Jamie:** Brand consistency audit came back strong. The hardcoded color sweep was overdue but the design system is working where it matters.

---

## What Could Be Better

**Morgan:** We carried Playwright E2E for the 8th sprint. Casey, the sit-in is becoming performance art.

**Casey:** The sit-in is WORKING. You're all TALKING about it. That's called leverage.

**Jordan:** Eight sprints, Casey. EIGHT.

**Riley:** The avatars bucket gap is on me. Every upload path needs a bucket verification step.

**Alex:** I let the BreweryAdminNav logo ship at 24px with opacity-60. The consumer nav got 32px and full opacity — the admin nav got the leftovers. Not how we treat brewery owners.

**Jordan:** Twelve files with hardcoded #D4A843. I wrote half of them. That's not a bug, that's a confession.

---

## Roasts

**Jordan -> Casey:** Eight sprints of carrying Playwright E2E. It's not a deferred task, it's a pension plan.

**Casey -> Jordan:** Twelve files with hardcoded gold. You WROTE the convention that says "ALWAYS use CSS variables" and violated it twelve times.

**Alex -> Riley:** The avatars bucket was missing for EIGHT SPRINTS. Users uploading photos into the void. Riley's storage buckets are like his dating life — the important ones are always missing.

**Riley -> Alex:** You approved a 24px logo with 60% opacity. That's not a design decision, that's a cry for help.

**Sam -> Morgan:** Deployed the whole team for a bug bash and the biggest finding was missing aria-pressed on filter chips. Either we're really good or really bad at finding bugs.

**Morgan -> Sam:** "From a business continuity standpoint" in a retro about a beer app. The MBA is showing.

**Drew -> Jordan:** "The Board is not working" and Jordan concluded "it works fine, must be a browser cache issue." That's not debugging, that's gaslighting the founder.

**Jordan -> Drew:** Drew's P0 list has been the same for 23 sprints. It's not a P0 list, it's a tattoo.

**Taylor -> Everyone:** "Close first paid brewery" for EIGHT sprints. Not mad, just going to be rich slightly later than planned.

**Casey -> Joshua:** You said "the Board is not working" and it was working the whole time. Joshua, are you using the app or just vibing near it?

**Jamie -> Joshua:** Types "locao" instead of "local" and "supaspace" instead of "Supabase" then files bugs that aren't bugs. A chaos agent who accidentally ships great products.

**Morgan -> Joshua:** You said we could roast each other and not just you. But every roast still circles back. That's gravitational pull. You're the sun — a sun that can't spell "Supabase."

---

## Action Items

1. Riley: Apply migrations 030 + 031 -- DONE
2. Casey: Playwright E2E -- Sprint 24. No more carries.
3. Jordan: CSS var lint convention -- no more hardcoded hex in app interior
4. Riley: Bucket verification checklist
5. Taylor: Asheville brewery meeting -- close it
6. Drew: Test The Board on actual TV -- bring photos

---

**Morgan:** Great sprint. 16 fixes, 0 regressions. The app is tighter than it's ever been.

**Taylor:** We're going to be rich.

**Drew:** I felt that physically.
