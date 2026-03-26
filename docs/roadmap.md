# HopTrack Product Roadmap
**Last updated:** 2026-03-26
**PM:** Morgan
**Current Sprint:** Sprint 14 — Clean House, Open Doors

> This is a living document — updated every sprint. For completed sprints 1–12, see `docs/roadmap-archive.md`.

---

## Sprint 13 — Consumer Delight & Social (COMPLETE)
**Theme:** Make the consumer app sticky and shareable
**Plan:** `docs/sprint-13-plan.md`
**Retro:** `docs/retros/sprint-13-retro.md`

12 features shipped: beer wishlist, passport, friends feed, session share card, push notifications MVP, Beer of the Week, streak system, style badges, Sentry, checkins deprecation plan, REQ backfill, migrations 009-011.

---

## Sprint 14 — Clean House, Open Doors (CURRENT)
**Theme:** Kill the legacy, ship real push notifications, close the first deal
**Plan:** `docs/sprint-14-plan.md`

### P0

| ID | Title | Owner | Status |
|----|-------|-------|--------|
| S14-D01 | Capacitor → TestFlight (SHIPPING) | Alex | 🔲 |
| S14-001 | Migrate all `checkins` reads to `sessions`/`beer_logs` | Jordan | 🔲 |
| S14-002 | Disable `checkins` writes + remove legacy components | Jordan | 🔲 |
| S14-004 | Full Web Push with VAPID keys | Riley + Jordan | 🔲 |
| S14-010 | First paid brewery close | Taylor | 🔲 |

### P1

| ID | Title | Owner | Status |
|----|-------|-------|--------|
| S14-003 | Plan reactions FK migration (prep for S15) | Jordan + Riley | 🔲 |
| S14-005 | Notification preferences — wire up settings toggles | Jordan | 🔲 |
| S14-006 | Lower-tier style badges (ipa_lover, sour_head, stout_season) | Jordan | 🔲 |
| S14-007 | Profile empty states + polish | Jordan + Alex | 🔲 |
| S14-008 | Feed polish — session duration + context badges | Jordan | 🔲 |
| S14-009a | Share card improvements — OG tags, save-as-image | Jamie + Jordan | 🔲 |
| S14-011 | App Store prep — screenshots, description, icon | Jamie + Alex | 🔲 |

### P2

| ID | Title | Owner | Status |
|----|-------|-------|--------|
| S14-009b | Explore page filters | Jordan + Alex | 🔲 |

---

## Infrastructure Roadmap (Riley)

| Item | Status |
|------|--------|
| Supabase project + migrations + RLS | ✅ Complete |
| proxy.ts (replaces middleware.ts) | ✅ Complete |
| Superadmin role + audit logging | ✅ Complete |
| PWA manifest + service worker | ✅ Complete |
| Sentry error monitoring | ✅ Complete (S13) |
| Staging Supabase project | 🔄 In Progress |
| Supabase Storage buckets + RLS | 🔲 Blocked on staging |
| Full Web Push (VAPID keys) | 🔄 In Progress (S14) |
| Supabase Edge Functions | 🔲 Planned |
| Email (Resend integration) | 🔲 Planned |
| Realtime subscriptions (TV display) | 🔲 Planned |

---

## Mobile App Roadmap (Alex)

| Phase | Status |
|-------|--------|
| PWA — manifest, service worker, icons | ✅ Complete |
| iOS safe area + 44pt tap targets | ✅ Complete |
| Capacitor → TestFlight | 🔄 In Progress (S14) |
| App Store submission | 🔄 In Progress (S14) |

---

## Revenue Milestones (Taylor)

| Milestone | Status |
|-----------|--------|
| `/for-breweries` pricing page live | ✅ Complete |
| First paid brewery ($49 Tap tier) | 🔲 In progress — Taylor in final talks |
| 50 paid breweries ($2,450 MRR) | 🔲 3 months post-launch |
| 500 paid breweries ($75K MRR) | 🔲 6 months post-launch |

**Tiers:** Tap $49/mo · Cask $149/mo · Barrel custom

---

## Requirements Index

| REQ | Title | Status |
|-----|-------|--------|
| REQ-001 | Check-in Core Flow | ✅ |
| REQ-002 | XP & Leveling System | ✅ |
| REQ-003 | Achievement System | ✅ |
| REQ-004 | Brewery Admin Dashboard | ✅ |
| REQ-005 | Pint Rewind (Brewery Recap) | ✅ |
| REQ-006 | Loyalty Program | ✅ |
| REQ-007 | Brewery Claim Flow | ✅ |
| REQ-008 | Reactions on Check-ins | ✅ |
| REQ-009 | Wishlist / Want to Try | ✅ (S13) |
| REQ-010 | Flavor Tags | ✅ |
| REQ-011 | Serving Styles | ✅ |
| REQ-012 | Superadmin Panel | ✅ |
| REQ-013 | Beer Passport | ✅ (S13) |
| REQ-014 | Beer Permissions | ✅ |
| REQ-015 | Enhanced Brewery Stats | ✅ |
| REQ-016 | Domestic Beer Achievement | 🔲 Planned |
| REQ-017 | Photo Uploads | ✅ (S12) |
| REQ-018 | TV Display ("The Board") | 🔲 Planned |
| REQ-019 | Toast Notifications | ✅ |
| REQ-020 | Skeleton Loaders | ✅ |
| REQ-021 | PWA / Mobile App | 🔄 In Progress |
| REQ-022 | Multi-environment Infra | 🔄 In Progress |
| REQ-023 | Loyalty Program Editing | ✅ |
| REQ-024 | Sales / Pricing Presence | ✅ |
| REQ-025 | Sessions & Tap Wall | ✅ |

---

## Team Roster

| Person | Role | Joined |
|--------|------|--------|
| Morgan | Product Manager | Sprint 1 |
| Sam | Business Analyst / QA Lead | Sprint 1 |
| Alex | UI/UX Designer + Mobile Lead | Sprint 1 |
| Jordan | Dev Lead (Full Stack) | Sprint 1 |
| Riley | Infrastructure / DevOps | Sprint 2 |
| Casey | QA Engineer | Sprint 3 |
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

*Roadmap is a living document — updated each sprint by Morgan + Sam.*
*For sprint history (Sprints 1–12), see `docs/roadmap-archive.md`.*
