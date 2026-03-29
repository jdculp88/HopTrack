# HopTrack Product Roadmap
**Last updated:** 2026-03-29
**PM:** Morgan
**Current Sprint:** Sprint 30 — Foundation Fix (not started)

> This is a living document -- updated every sprint. For completed sprints 1-12, see `docs/roadmap-archive.md`.

---

## Sprint 13 -- Consumer Delight & Social (COMPLETE)
**Theme:** Make the consumer app sticky and shareable
**Plan:** `docs/sprint-13-plan.md` | **Retro:** `docs/retros/sprint-13-retro.md`

12 features shipped: beer wishlist, passport, friends feed, session share card, push notifications MVP, Beer of the Week, streak system, style badges, Sentry, checkins deprecation plan, REQ backfill, migrations 009-011.

---

## Sprint 14 -- Clean House, Open Doors (COMPLETE)
**Theme:** Kill the legacy, ship real push notifications, close the first deal
**Plan:** `docs/sprint-14-plan.md` | **Retro:** `docs/retros/sprint-14-retro.md`

15 deliverables shipped: checkins reads migrated, writes disabled (410 Gone), Web Push, notification preferences, style badges (50 total), profile empty states, feed polish, share card upgrades, explore filters, Capacitor installed, claim flow trial badge, privacy policy, App Store prep. Migrations 012-013.

---

## Sprint 15 -- Walk the Floor (COMPLETE)
**Theme:** Validation, QA audit, fix what they find
**Plan:** `docs/sprint-15-plan.md` | **Retro:** `docs/retros/sprint-15-retro.md`

Shipped: dead code deletion (CheckinCard + CheckinModal), friend Accept/Decline, friend search + Add Friend, 13 loading.tsx skeletons, error.tsx boundaries (3 route groups), "check-in" copy replaced with session/visit, /session/[id] share page, profile photo upload, FriendButton on profiles, onboarding card, claim trial badge. Migration 015 written.

---

## Sprint 16 -- Turn It Up (COMPLETE)
**Theme:** New consumer features + brewery dashboard polish
**Plan:** `docs/sprint-16-plan.md` | **Retro:** `docs/retros/sprint-16-retro.md`

Shipped: VAPID keys, migrations 014-015 applied, session comments, The Board TV display, drag-to-reorder tap list, analytics upgrades, notification actions, domestic beer achievements (52 total), loyalty dashboard enhancements, brewery events CRUD + consumer views. Migrations 014-021.

---

## Sprint 17 -- Polish & Prove It (COMPLETE)
**Theme:** Fix what's broken, make it beautiful, get it demo-ready
**Plan:** `docs/sprint-17-plan.md`

Shipped: DiceBear avatars, avatar clipping fix, profile hero polish, friends management rebuild (unfriend, cancel sent), "Start Session" nav CTA, Board chalk board redesign, demo seed data (3 Asheville breweries, 20 beers), loyalty_redemptions table. Migration 022-024.

---

## Sprint 18 -- The Board: Cream Menu Redesign (COMPLETE)
**Retro:** `docs/retros/sprint-17-18-retro.md`

Complete typographic redesign of The Board. Instrument Serif italic headers, Playfair Display beer names, gold dotted leaders, BOTW hero section, per-beer stats, auto-scroll. Migrations 025-027.

---

## Sprint 19 -- The Pour (COMPLETE)
**Retro:** `docs/retros/sprint-19-retro.md`

20 glass type SVGs in `lib/glassware.ts`, glass picker in tap list admin, glass SVGs on Board, horizontal size chips, flight support, pour sizes API. Migrations 028-029.

---

## Sprints 20-21 -- Close It / All of It (COMPLETE)
**Plan:** `docs/sprint-21-plan.md`

ActiveSessionBanner live timer, explore URL params, beer-themed empty states, SessionCard tooltips, modal focus trap, Board settings preview, tap list unsaved changes guard, paginated brewery sessions, QR Table Tents (3 formats), brewery welcome bridge page.

---

## Sprint 22 -- The Mark (COMPLETE)

HopMark identity system (4 variants, 5 themes), deployed across app. Friends Live (DrinkingNow) with 60s polling + privacy toggle. Session start notifications. Logo bug fixes.

---

## Sprint 23 -- Bug Bash (COMPLETE)
**Retro:** `docs/retros/sprint-23-retro.md`

16 fixes: brewery reviews system, avatars storage bucket + RLS, hardcoded color sweep, API error handling, accessibility improvements, DarkCardWrapper cleanup. Migrations 030-031.

---

## Sprints 24-26 -- Avatar Fix / Rate & Relate / The Glow-Up (COMPLETE)
**Retro:** `docs/retros/sprint-27-retro.md`

Avatar seed fix, StarRating bug fix, beer reviews system, BreweryRatingHeader, beer log PATCH API, session recap v2 (rate-these split), feed card visual refresh, welcome card slim-down, filter tab redesign, SessionComments redesign, brewery admin 404 fix. Migration 032.

---

## Sprint 27 -- Three-Tab Feed (COMPLETE)
**Retro:** `docs/retros/sprint-27-retro.md`

Complete HomeFeed rewrite: Friends/Discover/You tabs. FeedTabBar with spring animation. AchievementFeedCard, StreakFeedCard. DrinkingNow renamed "Live Now". You tab: profile hero, XP bar, Taste DNA, achievements, wishlist, passport. Discover tab: BOTW, Trending, Events, New Breweries. Migration 033 (CRITICAL: brewery_id text->uuid FK fix).

---

## Sprint 28 -- Feed Spec Implementation (COMPLETE)
**Retro:** `docs/retros/sprint-28-retro.md`

3 new card types: RecommendationCard, NewFavoriteCard, FriendJoinedCard. 2 Discover sections: SeasonalBeersScroll, CuratedCollectionsList. BOTW compact banner on Friends tab. Scroll position memory. Hydration fix (SessionRecapSheet dynamic import).

---

## Sprint 29 -- Your Round (COMPLETE)
**Retro:** `docs/retros/sprint-29-retro.md`

ReactionBar component (cheers toggle + comment count + share). Reaction counts API batch query. Seed 011 "Your Round" demo data. Explicit FK hint on feed queries. Dead checkins references cleaned from seeds.

---

## Sprint 30 -- Foundation Fix (NOT STARTED)
**Theme:** Kill every P0, fix the RLS layer, ship a product that actually works
**Plan:** `docs/sprint-30-plan.md`
**Source:** `docs/sprint-30-testing-audit.md` (12 P0 ship-blockers identified)

---

## Sprint 31 -- Launch Polish (PLANNED)
**Theme:** P1 cleanup, code quality, revenue readiness
**Plan:** `docs/sprint-31-plan.md`

---

## Infrastructure Roadmap (Riley + Quinn)

| Item | Status |
|------|--------|
| Supabase project + migrations + RLS | COMPLETE |
| proxy.ts (replaces middleware.ts) | COMPLETE |
| Superadmin role + audit logging | COMPLETE |
| PWA manifest + service worker | COMPLETE |
| Sentry error monitoring | COMPLETE (S13) |
| Full Web Push (VAPID keys + push) | COMPLETE (S16) |
| Supabase Storage buckets + RLS | COMPLETE (S23) |
| Realtime subscriptions (TV display) | COMPLETE (S16) |
| 33 migrations applied (001-033) | COMPLETE (S29) |
| Staging Supabase project | Planned |
| Supabase Edge Functions | Planned |
| Email (Resend integration) | Planned |

---

## Mobile App Roadmap (Alex)

| Phase | Status |
|-------|--------|
| PWA -- manifest, service worker, icons | COMPLETE |
| iOS safe area + 44pt tap targets | COMPLETE |
| Capacitor installed + configured | COMPLETE (S14) |
| TestFlight submission | Blocked (Apple Developer account) |
| App Store submission | Blocked (depends on TestFlight) |

---

## Revenue Milestones (Taylor)

| Milestone | Status |
|-----------|--------|
| `/for-breweries` pricing page live | COMPLETE |
| Sales docs + playbook | COMPLETE (S17) |
| First paid brewery ($49 Tap tier) | In progress -- warm intros via Drew's Asheville network |
| 50 paid breweries ($2,450 MRR) | 3 months post-launch |
| 500 paid breweries ($75K MRR) | 6 months post-launch |

**Tiers:** Tap $49/mo | Cask $149/mo | Barrel custom

---

## Requirements Index

| REQ | Title | Status | Sprint |
|-----|-------|--------|--------|
| REQ-001 | Check-in Core Flow (now Sessions) | COMPLETE | S1-S10 |
| REQ-002 | XP and Leveling System | COMPLETE | S2 |
| REQ-003 | Achievement System (52 achievements) | COMPLETE | S2-S16 |
| REQ-004 | Brewery Admin Dashboard | COMPLETE | S3-S16 |
| REQ-005 | Pint Rewind (Brewery + Customer) | COMPLETE | S8-S12 |
| REQ-006 | Loyalty Program | COMPLETE | S3-S17 |
| REQ-007 | Brewery Claim Flow | COMPLETE | S4-S14 |
| REQ-008 | Reactions / Cheers | COMPLETE | S9-S29 |
| REQ-009 | Wishlist / Want to Try | COMPLETE | S13 |
| REQ-010 | Flavor Tags / Taste DNA | COMPLETE | S2-S27 |
| REQ-011 | Serving Styles / Glassware | COMPLETE | S19 |
| REQ-012 | Superadmin Panel | COMPLETE | S6 |
| REQ-013 | Beer Passport | COMPLETE | S13 |
| REQ-014 | Beer Permissions | COMPLETE | S6 |
| REQ-015 | Enhanced Brewery Stats | COMPLETE | S6-S16 |
| REQ-016 | Domestic Beer Achievement | COMPLETE | S16 |
| REQ-017 | Photo Uploads | COMPLETE | S12-S23 |
| REQ-018 | TV Display ("The Board") | COMPLETE | S16-S19 |
| REQ-019 | Toast Notifications | COMPLETE | S7 |
| REQ-020 | Skeleton Loaders (~95% coverage) | COMPLETE | S7-S15 |
| REQ-021 | PWA / Mobile App | IN PROGRESS | S8-S14 |
| REQ-022 | Multi-environment Infra | IN PROGRESS | -- |
| REQ-023 | Loyalty Program Editing | COMPLETE | S8 |
| REQ-024 | Sales / Pricing Presence | COMPLETE | S8 |
| REQ-025 | Sessions and Tap Wall | COMPLETE | S10-S11 |
| REQ-026 | Web Push Notifications | COMPLETE | S14-S16 |
| REQ-027 | Social Feed (Three-Tab) | COMPLETE | S13-S29 |
| REQ-028 | Session Comments | COMPLETE | S16-S25 |
| REQ-029 | Brewery Events | COMPLETE | S16 |
| REQ-030 | Brewery Reviews | COMPLETE | S23 |
| REQ-031 | Beer Reviews | COMPLETE | S25 |
| REQ-032 | Session Recap V2 | COMPLETE | S25-S26 |
| REQ-033 | HopMark Identity System | COMPLETE | S22 |
| REQ-034 | QR Table Tents | COMPLETE | S21 |
| REQ-035 | Brewery Welcome Bridge Page | COMPLETE | S21 |
| REQ-036 | Friends Live (Drinking Now) | COMPLETE | S22 |
| REQ-037 | Glassware Illustrations (20 types) | COMPLETE | S19 |
| REQ-038 | Pour Size Pricing | COMPLETE | S19 |
| REQ-039 | Feed Card Types (7 types) | COMPLETE | S27-S28 |
| REQ-040 | Drag-to-Reorder Tap List | COMPLETE | S16 |
| REQ-041 | Friend Management (full lifecycle) | COMPLETE | S15-S17 |
| REQ-042 | Error Boundaries + Sentry | COMPLETE | S15-S23 |
| REQ-043 | Onboarding Card | COMPLETE | S15-S25 |

**Score:** 41 of 43 requirements COMPLETE. 2 IN PROGRESS (PWA TestFlight, staging infra).

---

## Team Roster

| Person | Role | Joined |
|--------|------|--------|
| Morgan | Product Manager | Sprint 1 |
| Sage | PM Assistant | Sprint 30 |
| Sam | Business Analyst / QA Lead | Sprint 1 |
| Alex | UI/UX Designer + Mobile Lead | Sprint 1 |
| Jordan | Architecture Lead (promoted S30) | Sprint 1 |
| Avery | Dev Lead | Sprint 30 |
| Riley | Infrastructure / DevOps | Sprint 2 |
| Quinn | Infrastructure Engineer | Sprint 30 |
| Casey | QA Engineer | Sprint 3 |
| Reese | QA & Test Automation | Sprint 30 |
| Taylor | Sales & Revenue | Sprint 4 |
| Drew | Industry Expert (Brewery Ops) | Sprint 5 |
| Jamie | Marketing & Brand | Sprint 5 |

## Team Expansion Plan

| Priority | Role | Hire Trigger |
|----------|------|-------------|
| 1st | Customer Success / Onboarding Lead | First paid brewery closes |
| 2nd | Growth / SEO Lead | Pre-scale push (500 brewery target) |
| 3rd | Analytics / Data Engineer | ~20-50 active paying breweries |

---

*Roadmap is a living document -- updated each sprint by Morgan + Sam.*
*For sprint history (Sprints 1-12), see `docs/roadmap-archive.md`.*
*Full documentation audit: `docs/documentation-audit.md` (2026-03-29).*
