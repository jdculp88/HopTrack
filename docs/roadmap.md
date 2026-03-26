# HopTrack Product Roadmap
**Last updated:** 2026-03-26
**PM:** Morgan
**Current Sprint:** Sprint 15 — Walk the Floor

> This is a living document — updated every sprint. For completed sprints 1–12, see `docs/roadmap-archive.md`.

---

## Sprint 13 — Consumer Delight & Social (COMPLETE)
**Theme:** Make the consumer app sticky and shareable
**Plan:** `docs/sprint-13-plan.md`
**Retro:** `docs/retros/sprint-13-retro.md`

12 features shipped: beer wishlist, passport, friends feed, session share card, push notifications MVP, Beer of the Week, streak system, style badges, Sentry, checkins deprecation plan, REQ backfill, migrations 009-011.

---

## Sprint 14 — Clean House, Open Doors (COMPLETE)
**Theme:** Kill the legacy, ship real push notifications, close the first deal
**Plan:** `docs/sprint-14-plan.md`
**Retro:** `docs/retros/sprint-14-retro.md`

15 deliverables shipped: checkins table reads migrated (9 files), writes disabled (410 Gone), CheckinModal removed, Web Push notifications, notification preferences, lower-tier style badges (50 total), profile empty states, feed polish, share card upgrades (save-as-image, QR, OG tags), explore filters, Capacitor installed, claim flow trial badge, privacy policy, App Store prep, migrations 012-013. TestFlight deferred to S15.

---

## Sprint 15 — Walk the Floor (CURRENT)
**Theme:** Validation — design, QA, and BA audit every flow, then fix what they find
**Plan:** `docs/sprint-15-plan.md`

### P0

| ID | Title | Owner | Status |
|----|-------|-------|--------|
| S15-001 | Generate VAPID keys | Riley | 🔲 |
| S15-002 | Apply migration 014 (reactions FK) | Riley + Jordan | 🔲 |
| S15-003 | Design audit — every page, every state | Alex | 🔲 |
| S15-004 | BA/UX audit — every user journey | Sam | 🔲 |
| S15-005 | QA regression — full pass | Casey | 🔲 |
| S15-006 | Wire friend Accept/Decline buttons | Jordan | 🔲 |
| S15-007 | Wire friend search + Add Friend | Jordan | 🔲 |
| S15-008 | Delete dead code (CheckinCard + CheckinModal) | Jordan | 🔲 |
| S15-021 | Close first brewery | Taylor | 🔲 |

### P1

| ID | Title | Owner | Status |
|----|-------|-------|--------|
| S15-009 | Loading.tsx — auth routes (2) | Jordan | 🔲 |
| S15-010 | Loading.tsx — superadmin routes (6) | Jordan | 🔲 |
| S15-011 | Loading.tsx — remaining routes (5) | Jordan | 🔲 |
| S15-012 | Error.tsx — 3 route groups | Jordan | 🔲 |
| S15-013 | Replace "check-in" copy → session/visit (14 locations) | Jordan | 🔲 |
| S15-014 | Fix /session/[id] share page for social crawlers | Jordan | 🔲 |
| S15-015 | Wire profile photo change | Jordan | 🔲 |
| S15-016 | Add Friend button on profiles | Jordan | 🔲 |
| S15-019 | Write migration 015 (checkins drop) — WRITE ONLY | Jordan + Riley | 🔲 |
| S15-020 | TestFlight submission (5th carry) | Alex | 🔲 |

### P2

| ID | Title | Owner | Status |
|----|-------|-------|--------|
| S15-017 | Post-signup onboarding card | Jordan + Alex | 🔲 |
| S15-018 | Claim flow trial badge on pending view | Jordan | 🔲 |

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
