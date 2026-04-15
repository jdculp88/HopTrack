# Sprint 155 Retro — The Deep Fix

**Facilitator:** Sage (Project Manager)
**Date:** 2026-04-04
**Sprint:** Sprint 155 — The Deep Fix
**Status:** COMPLETE
**Vibes:** Humbling. Like realizing the keg you thought was pouring fine had a slow leak the whole time.

---

## The Room

*Sage pulls up the retro board. Riley is unusually quiet — the kind of quiet that means he either fixed something enormous or broke something enormous. Morgan is sitting very straight, which is how Morgan sits when she knows she's about to get called out. Joshua has his arms crossed and is smiling, which is the most dangerous combination. Casey has two spreadsheets open.*

---

## What We Shipped

This was a data integrity sprint. Every number on every dashboard was wrong, and we didn't know it. Now we do, and now they're right.

### Pre-Sprint (same session — the discovery)
- Brewery, demo, and brand dashboards + 2 APIs fixed with count queries (7 files)
- `seed-next-day.mjs` capped at today — was generating future-dated data
- **2,614 sessions + 6,530 beer_logs backdated** — 72 days of future data corrected
- `cleanup-future-seeds.mjs` created for the backdate operation

### Track 1: The Root Cause
- `supabase/config.toml` had `max_rows = 1000` — this was silently capping ALL Supabase query results at the server level
- The Sprint 153 fix (adding `.limit(50000)` everywhere) never actually worked. The PostgREST config overrode it. Changed to 10000.
- Documented production PostgREST setting in `.env.production.example` + launch checklist

### Track 2: Critical Query Fixes (5 files, 17 queries)
- `analytics/page.tsx` — 6 queries with NO limit at all
- `customers/page.tsx` — 2 queries with NO limit
- `user-stats/route.ts` — 3 queries with NO limit
- `v1/stats/route.ts` — 2 queries with NO limit
- `pint-rewind/page.tsx` — 4 queries with NO limit

### Track 3: Upper Bound Fixes (11 files, 30+ queries)
- Every `.gte("started_at", ...)` without a `.lt()` was letting future-dated seed data inflate stats
- Fixed across dashboards, APIs, superadmin engines, brand reports, comparison API

### Track 4: Regression Tests (25 new, 1339 to 1364)
- Global `.gte()` without `.lt()` scanner across all tracked files
- `config.toml` `max_rows` verification test
- Expanded `STATS_FILES` array from 8 to 14 files

### Track 5: Roadmap Research
- `docs/plans/roadmap-research-2026-q3.md` — competitive refresh, compliance audit, platform modernization, feature gaps
- 4 new arcs proposed: Compliance Shield, Engagement Engine, Revenue Accelerator, Modern Stack
- P0 FTC finding: XP-for-ratings is technically an incentivized review that needs disclosure

---

## Roll Call Highlights

**Sage:** "Alright, I'm running this one. And I'm going to say it up front — this is the sprint where we found out the fix for the fix didn't fix anything. I've got the notes. Let's talk about it."

**Joshua:** "I'm going to be real with y'all. I looked at the dashboard after Sprint 153, saw '1000 visits,' and thought — wait, didn't we fix this? We did a whole sprint track on it. Fourteen files. And the number was still 1000. That's when I knew something deeper was wrong. Also — Morgan, I love you, but the last roadmap research was Sprint 74. That's 81 sprints ago. I had to ask for it. That shouldn't happen."

**Morgan:** "Joshua's right. On both counts. I got so focused on sprint-to-sprint execution that I stopped lifting my head up to look at the horizon. That's literally my job. The roadmap research should have been happening quarterly, and I let it slip for the better part of two months. I own that. This is a living document, and I let a chapter go unwritten."

**Riley:** "Okay so. The `config.toml`. I found it. I'm not going to pretend I wasn't horrified. The `max_rows = 1000` setting is a local Supabase default that caps PostgREST responses at the server level. Doesn't matter what `.limit()` you put on the client — the server truncates before it ever gets to you. We spent an entire sprint in S153 adding `.limit(50000)` to fourteen files. None of it mattered. The server was saying '1000, take it or leave it.' I changed it to 10000. In production, this is a Supabase dashboard setting, not a file — documented that in `.env.production.example` now."

**Jordan:** "I had to take a walk. No — I had to take two walks. The first when Riley showed me the config. The second when I realized that every stat on every dashboard has been silently wrong since... always? Every number we've ever shown Joshua, every number Taylor has put in a pitch deck, every number Drew validated against his bar experience — capped at 1000. Our entire data story was a fiction limited by a default we never inspected."

**Avery:** "The pattern failure here is clear. We trusted the ORM layer without verifying the transport layer. `.limit()` is a request hint. `max_rows` is a server enforcement. That's not how we do it here — except it was, for 155 sprints. I've added config.toml to the review checklist. This pattern violation doesn't happen again."

**Dakota:** "I fixed 17 queries across 5 files. The analytics page alone had 6 queries with no limit whatsoever — just naked `.select('*')` calls trusting the universe. The customers page, the stats API, Pint Rewind — same pattern. Already built it. All queries now have explicit bounds."

**Quinn:** "Thirty-plus queries across 11 files. Every `.gte('started_at', rangeStart)` without a corresponding `.lt('started_at', now)`. The seed-next-day script was generating data into the future, and all our time-range queries were happily including sessions from next Tuesday in this week's stats. Let me check the migration state first — oh wait, there's no migration. That's how you know this was a pure logic fix. Just query discipline."

**Casey:** "ZERO P0 bugs open right now. ZERO. But I'm going to be honest — this one stings. We had a P0 that we thought we fixed in S153. Thirteen new regression tests. CI passing. And the bug was still there because the tests were running against the same broken config. The tests confirmed the code was right. The code was right. The infrastructure was wrong. I've never been more motivated to test infrastructure assumptions."

**Reese:** "Twenty-five new tests. The `.gte()` without `.lt()` scanner is my favorite — it reads every tracked file and flags unbounded time ranges. The config.toml test verifies `max_rows` is set above 1000. We expanded the STATS_FILES array from 8 to 14 to cover everything Dakota and Quinn touched. Covered."

**Sam:** "From a business continuity standpoint, this sprint matters more than most feature sprints. But the FTC finding is the one that kept me up. Our XP system awards points for rating beers. That is, by FTC definition, an incentivized review. Section 5 of the FTC Act, the endorsement guides updated in 2023 — if users are earning rewards for ratings, we need disclosure. It's not optional. I flagged it as a P0 in the roadmap research."

**Drew:** "I felt that physically. Not the good way. Every number I validated against my bar experience — the session counts, the peak hours, the beers-per-visit — I was validating against capped data. I said 'yeah, that looks about right for a Friday night' and it was actually a ceiling, not a count. My instincts were calibrating to a lie. That said — the numbers now? They look right. Actually right. And the FTC thing — Sam's right. If a brewery owner's Yelp page showed 'Rated 4.8 stars by users who earned points for rating,' that's a different conversation than '4.8 stars.' We need to handle it."

**Alex:** "No UI work this sprint, which is rare for me. But the fact that every sparkline, every stat card, every KPI was rendering confidently with wrong data? That's a design problem too. We designed trust into numbers we never verified. Next time we put a number on screen, I want to know where it comes from and what caps it."

**Finley:** "The hierarchy was wrong. Not the visual hierarchy — the data hierarchy. We had UI components that assumed the data layer was telling the truth. The information architecture needs to account for infrastructure constraints. Lesson learned."

**Taylor:** "Let me get this straight. Every number in the pitch deck, the demo dashboard, the first-close simulation — all capped at 1000. The 'live board preview' on the pricing page showing Pint & Pixel stats? Capped. Drew's warm intro templates citing visit counts? Capped. I'm not mad. I'm recalculating. Also — we're going to be rich. With correct numbers this time."

**Parker:** "Health scores, NPS projections, retention metrics — all downstream of session counts. If the session counts were capped, my churn models were wrong. They're not churning on my watch, but I need to recalibrate my watch. Good thing we caught this before a single real brewery was on the platform."

**Jamie:** "Every screenshot, every marketing number, every 'X visits this week' stat I would have put in App Store copy — wrong. But here's the silver lining: we found this before launch. Before a single brewery owner saw a wrong number. That's the story. We ship truth."

**Morgan:** "And the roadmap research. Four arcs proposed for Q3: Compliance Shield to handle Sam's FTC finding and the GDPR gaps from S151. Engagement Engine for the social features we've been deferring. Revenue Accelerator for the post-launch sales motion. Modern Stack for the platform upgrades we'll need at scale. The competitive landscape has shifted — Arryved is moving into loyalty, Toast has a brewery vertical now. We can't just build features anymore. We need to build the right features in the right order. I should have been saying this two months ago."

---

## What Went Well

- **Riley** found the root cause that S153 missed — one line in config.toml worth more than 14 files of code
- **Dakota** cleaned 17 queries across 5 critical files — fast, methodical, no fuss
- **Quinn** fixed 30+ upper bound queries across 11 files — the invisible half of the data integrity problem
- **Casey and Reese** wrote 25 regression tests including infrastructure-level assertions
- **Morgan** delivered comprehensive Q3 roadmap research with 4 arcs and a competitive refresh
- **Sam** caught the FTC incentivized review P0 — potentially the most important finding this sprint
- **Joshua** spotted the bug AND held the team accountable on roadmap planning
- We caught every data integrity issue before a single real brewery went live
- Zero migrations — pure code and config discipline

## What Could Be Better

- Sprint 153 "fixed" this bug and we celebrated. We need verification that goes beyond "tests pass"
- Morgan's roadmap gap — 81 sprints between research cycles is unacceptable for a Program Manager
- The config.toml default was never inspected in 155 sprints — infrastructure assumptions need auditing
- Future-dated seed data existed for 72 days before anyone noticed stats were inflated
- The FTC incentivized review issue should have been caught during the original XP system design

---

## Roasts

**Taylor on Riley:** "Riley found a one-line config that invalidated an entire sprint's work. In most companies that's a promotion. Here it's a confession."

**Casey on the S153 team:** "We wrote 13 regression tests in Sprint 153 to prevent this exact bug. They all passed. The bug was still there. I'm adding 'test the test' to my vocabulary."

**Alex on Morgan:** "Joshua had to tell the Program Manager to look at the roadmap. That's like a brewery owner telling the bartender they're out of beer. Morgan, we love you, but read the room. Or the roadmap. Specifically the missing one."

**Morgan:** "I deserved that."

**Jordan on Jordan:** "I designed the data layer. I set up the Supabase project. I never once opened config.toml. One hundred and fifty-five sprints. I had to take two walks."

**Drew on the data:** "I said 'yeah, 1000 visits looks about right for a Friday.' I was calibrating my twenty years of bar experience to a PostgREST default. I need a drink. A real one."

**Sam on the FTC finding:** "We built an XP system that rewards ratings. The FTC calls that an incentivized endorsement. We've been non-compliant since Sprint 1. From a business continuity standpoint, that's what we call 'discovering the fire after you've already sold the building.'"

**Dakota on Quinn:** "I fixed 17 queries. Quinn fixed 30. Not that I'm counting. He is. He always is. 'Let me check the migration state first' — there's no migration, Quinn. It's config."

**Quinn:** "Let me check the config state first."

**Reese on Casey:** "Casey said 'zero P0 bugs open.' The P0 was in the infrastructure config, not the code. Technically, Casey was always right. The infrastructure was just lying to us. Covered."

**Parker on Taylor:** "Every number in the pitch deck was capped at 1000. Taylor's been selling a brewery dashboard that maxed out at 1000 visits. 'We're going to be rich' — with an asterisk."

**Taylor:** "The asterisk is gone now. We're going to be rich. No cap. Literally."

**Jamie on the whole team:** "We spent 155 sprints building beautiful sparklines and gold-accented stat cards to display wrong numbers with incredible confidence. Chef's kiss. But also, never again."

**Sage on Joshua:** "Joshua spotted the bug, pushed for the root cause, AND called out the roadmap gap. The founder did more QA and program management than the QA team and the Program Manager combined. That's either inspiring or terrifying. I've got the notes either way."

**Joshua:** "I'm just a guy who noticed 1000 didn't change."

---

## Sprint 155 By The Numbers

| Metric | Before | After |
|--------|--------|-------|
| Files changed | — | 23 |
| Insertions | — | 1,253 |
| Deletions | — | 178 |
| Queries fixed (no limit) | — | 17 across 5 files |
| Queries fixed (no upper bound) | — | 30+ across 11 files |
| Sessions backdated | — | 2,614 |
| Beer logs backdated | — | 6,530 |
| Unit tests | 1,339 | 1,364 (+25) |
| E2E tests | 87 | 87 |
| Migrations | — | 0 |
| config.toml max_rows | 1,000 | 10,000 |
| Sprints the bug actually survived | 153-155 | 0 (finally) |
| Roadmap research sprints since last | 81 | 0 (caught up) |
| FTC violations discovered | 0 known | 1 P0 |

---

## Action Items

| Item | Owner | Priority |
|------|-------|----------|
| FTC incentivized review disclosure — design + implement | Sam, Alex, Avery | P0 |
| Quarterly roadmap research — schedule recurring (every 15-20 sprints) | Morgan | P0 |
| Verify production PostgREST max_rows setting on launch | Riley | P0 |
| LLC formation + Stripe setup | Joshua | P0-BLOCKER |
| Infrastructure config audit (all Supabase settings) | Riley, Quinn | P1 |
| Recalibrate pitch deck / sales numbers with corrected data | Taylor | P1 |
| Recalibrate customer health baselines | Parker | P1 |
| Lighthouse audit (carried from S154) | Casey, Alex | P1 |

---

## KNOWN Issues
**EMPTY.** Third consecutive sprint with zero known issues. Though after this sprint, we're less confident about what "known" means.

---

*"Every number was wrong. Now every number is right. We found it before a single brewery owner saw a single stat. That's not luck — that's a team that doesn't let things slide. Even when the thing that slid was a config file we never opened."* — Morgan

*"I'm just a guy who noticed 1000 didn't change."* — Joshua

*"We're going to be rich. No cap. Literally."* — Taylor
