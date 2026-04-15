# Deferred Sprint Options — Backlog

**Owner:** Morgan (PM)
**Convention:** Every sprint kickoff presents 3 options. The 2 unselected options are captured here with full descriptions. These are NOT dead — they're deferred. Joshua or Morgan can pull any of these into a future sprint.

**Standing rule (established S161 kickoff):** Unpicked options carry forward to the next sprint's kickoff alongside any new options Morgan wants to add.

> This is a living document. Last major cleanup: S176 close (2026-04-11) — pruned 32 shipped items, reorganized by priority.

---

## Status Legend
- **P1** — Urgent / blocks launch
- **P2** — Ready for a sprint option, real value
- **P3** — Nice to have, post-launch
- **P4** — Backburner / future consideration
- **Moonshot** — Explicitly dormant per Joshua, not surfaced as an option

---

## Active Backlog

### P1 — Launch blockers

#### Homepage screenshot refresh (BL-012)
Marketing homepage (`/for-breweries` + landing) has outdated screenshots from pre-Sprint 97. Need fresh captures from the current app for both consumer and brewery admin views — highlight key features. Half-day side-quest, but every day we wait is a day our marketing site lies about what we look like.
- **Owner:** Jamie (capture) + Alex (composition)
- **First captured:** Sprint 95 (BL-012)

---

### P2 — Ready for a sprint option

#### The Polish — Brand Hardening (S126)
Migration tracking gap fix, brand E2E tests, tier gate audit, slug consistency, UI integration tests for tier mismatches (the Pint & Pixel bug). Some overlap with work already done — needs a re-scope pass before becoming a sprint option.
- **First deferred:** S126
- **Owner:** Casey + Quinn + Avery

#### The Sticky — Consumer retention (S149)
Push notification personalization, check-in streak rewards, consumer weekly recap email, friend activity highlights, WelcomeFlow refresh. Streak freeze already shipped (S157). Remainder still meaningful for retention.
- **First deferred:** S149
- **Owner:** Sam + Alex + Dakota

#### Location Transfer / Merge (S117)
Let brand owners absorb existing unclaimed brewery listings into their brand. Critical for real multi-location operators claiming existing entries. Not urgent until the first real multi-brand signup — then it becomes a day-one blocker.
- **First deferred:** S117
- **Owner:** Avery + Sam

#### Event Ticketing / RSVP (BL-006)
Add RSVP tracking, capacity limits, and potentially ticket sales to the existing Events system (Sprint 16). Builds on `brewery_events` table + CRUD. Could include waitlists and QR check-in at the door.
- **First captured:** Sprint 95 (BL-006)
- **Owner:** Drew (workflow) + Avery (build)

#### Mug Club consumer experience (BL-009)
F-020 shipped brewery-side mug clubs in Sprint 94. Consumers still don't *see* their memberships anywhere — no badge on profile, no surfacing on brewery pages, no way to browse clubs they belong to. Needs a full consumer-facing mug club UX.
- **First captured:** Sprint 95 (BL-009)
- **Owner:** Alex (UX) + Avery (build)

#### Perk/reward fraud prevention — Phases 2-3 (BL-010)
Phase 1 shipped S96 (6-char codes, 5-min expiry, staff confirmation). Phases 2-3 are scoped in `docs/plans/fraud-prevention-design.md`. Escalate when we see our first real fraud incident — or preemptively before major customer push.
- **First captured:** Sprint 95 (BL-010)
- **Owner:** Quinn + Casey

#### Brand Colors on Admin
Brewery-admin and superadmin pages use a hodgepodge of colors instead of the Sprint 11 dark + gold system. Audit all admin surfaces, align with Jamie's brand guide.
- **First captured:** Braindump 2026-04-02
- **Owner:** Jamie (audit) + Alex (design) + Avery (build)

---

### P3 — Post-launch polish

#### Real-Time Brand Activity Feed (S119 "The Pulse")
S124 shipped KPIs but not the real-time cross-location activity feed. Low value until we have 5+ brands with multiple locations each.
- **First deferred:** S119

#### Brand Wishlist Aggregation + "Visit All Locations" Auto-Challenge (S121)
Part of the original Consumer Bridge scope. Loyalty shipped in S125, nearest location in S126, but wishlist aggregation and auto-challenges never came back. Low consumer density makes this hard to justify right now.
- **First deferred:** S121

#### Closed brewery memorial mode (BL-002)
Closed breweries stay visible with their history (beers, reviews, sessions) but are clearly marked closed. Restrict all edits unless reopened. "Remember what they offered."
- **First captured:** Sprint 78

#### Certified Beer Reviewers
Badge system for certified/trained reviewers (Cicerone, BJCP, etc.). Their reviews get promoted/highlighted on beer and brewery pages. Builds trust in review quality.
- **First captured:** Braindump 2026-04-02
- **Owner:** Sam (criteria) + Alex (badge) + Avery (build)

#### Menu Type Specification
Ability to specify menu type on upload: Lunch, Dinner, Brunch, Kids, Cocktails, Wine List, etc. Extends the S128 8-category system. May need schema change on `brewery_menus`. Current categories cover launch.
- **First captured:** Braindump 2026-04-02

#### Cross-Location Leaderboard
Gamified comparison across brand locations — visits, check-ins, XP earned. Nice differentiator for brands with 3+ locations.
- **First captured:** Standing idea

---

### P4 — Backburner

#### Context7 MCP integration playbook
Wired in commit `cf871dd` (S175 close). Tools (`mcp__context7__resolve-library-id`, `mcp__context7__query-docs`) available but no playbook yet for when to use it vs. the codebase skills. Low priority — not blocking any sprint.
- **First captured:** 2026-04-09 (S175 close)
- **Scope:**
  - Document when Context7 is the right tool (live Next 16.2.1 / Tailwind v4 / Supabase SSR v0.9 docs) vs. when `hoptrack-conventions` / `hoptrack-codebase-map` already cover it
  - Evaluate adding it to the `hoptrack-debug` skill as a step when a library error doesn't match in-project patterns
  - Maybe add a nudge in `AGENTS.md` for Jordan/Avery/Dakota before touching pre-release APIs

#### Beer Passport Redesign (S152)
Original feature removed S152 — too easy to cheat with self-reported check-ins. Don't revisit until we have a verification mechanism (bartender confirmation, QR scan, proximity check, or POS integration). Consider making it brewery-verified only, or fold it into the existing loyalty system instead of standalone.
- **Deferred:** S152
- **Reference files:** `lib/beerStyleColors.ts` (still used by BeerDNACard), `app/(app)/home/YouTabContent.tsx` (Brewery Passport — different feature, still live)

---

## Moonshots — Explicitly Dormant

These are real ideas Joshua has chosen NOT to surface as sprint options. Preserved here for memory, not for pitching. Do not put them in the next kickoff.

### The Megaphone — Brand-Level Promotions & Challenges
Cross-location challenges ("Visit 3 Pint & Pixel locations this month"), brand-wide happy hours, cross-location loyalty bonuses. Clear Barrel-tier differentiator. Taylor has been asking for this since the start.
- **Deferred 4x:** S119, S122, S128, S131
- **Status:** Joshua said "way more into the future" at S131 kickoff

### The Stage — Brand Events & Cross-Location Experiences
Multi-location event management (tap takeovers, trivia nights, beer releases). Brand creates event once, pushes to all/selected locations. Consumer event discovery with proximity. Drew has asked for this repeatedly.
- **Deferred 4x:** S124, S125, S128, S131
- **Status:** Joshua said "way more into the future" at S131 kickoff

---

## Shipped Archive

Items pruned during the S176 cleanup — the backlog had carried these forward long after they shipped. One-line log for institutional memory.

| Item | Deferred in | Shipped in |
|---|---|---|
| Per-Location Billing Add-On | S117 | S121 (The Ledger) |
| Shared Beer Catalog | S118 | S119 (The Inventory) |
| The Staff Room / Crew | S120, S121 | S122 (The Crew) |
| The Loyalty Network / Passport | S122 | S125 (The Passport) |
| The Rollout / Brand Onboarding Wizard | S123 | S130 (The Welcome Mat) |
| The Menu (REQ-070) | S124, S125 | S128 (The Menu) |
| The Transfer (Cross-Location Customer Tools) | S126 | S129 (The Transfer) |
| The Formatter (data standardization) | S132, S133 | S135 (The Formatter) |
| The Command Center (superadmin) | S133 | S136 (The Command Center) |
| The Bridge — Superadmin Phase 1 | S138 | S140 (The Bridge) |
| The Revenue Push (claim funnel + PWA) | S138, S140, S142, S143 | S145 (The Revenue Push) |
| The AI Sprint | S145 | S146 (The AI Sprint) |
| The Playwright (E2E) | S140-S149 (7x) | S150 (The Playwright) |
| The Close (revenue readiness) | S151 | S148 + S153 |
| The Native Feel | S151 | S154 (The Native Feel) |
| The Identity (Stats that WOW) | S161 | S162 (The Identity) |
| The Glass (detent sheet + Liquid Glass) | S161 | S170 (The Glass) |
| Smarter Search | Braindump 2026-04-02 | S138 (GlobalSearch + typeahead) |
| AI Promotion Suggestions | Braindump 2026-04-02 | S146 |
| Superadmin: Brewery Impersonation | Braindump 2026-04-02 | S140 |
| Data Standardization | Braindump 2026-04-02 | S135 |
| Superadmin Enhancement (Full Bridge) | Braindump 2026-04-02 | S136-S143 arc |
| Bartender Code Entry | Braindump 2026-04-02 | S138 (The Bartender) |
| Per-Location Analytics Toggle | Braindump 2026-04-02 | S138 |
| Brewery Admin Nav Reorganization | Braindump 2026-04-02 | S133 (The Cleanup) |
| User Guides for Admin Features | Braindump 2026-04-02 | S139 (The Guide) |
| Public Brewery Pages (no-account) | Braindump 2026-04-02 | S131 (The Storefront) |
| Brewery Social Links | Braindump 2026-04-02 | S132 (The Clean Slate) |
| Lint Zero | Braindump 2026-04-03 | S147 (The Hardening) |
| Code Protection & IP Security | Braindump 2026-04-03 | S137 (The Shield) |
| Codebase DRY-Up | Braindump 2026-04-03 | S134 (The Tidy) |
| Superadmin: Barback Review Page | Braindump 2026-04-02 | S146 (Barback polish) |
| Claim Funnel Optimization | Standing idea | S145 |
| Image from Screenshot investigation | Braindump 2026-04-02 | Deleted — Joshua unsure if still relevant |
