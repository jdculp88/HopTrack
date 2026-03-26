# HopTrack Roadmap Archive — Sprints 1–12

> Archived from `docs/roadmap.md` to keep the active roadmap lean.
> For the current roadmap, see `docs/roadmap.md`.

---

## Sprint 1 — Foundation (Complete)
**Theme:** Core infrastructure, design system, auth, landing page
**Completed:** 2026-03-24

- [x] Next.js 16 + Tailwind v4 + Supabase SSR setup
- [x] Design system — dark theme, gold accent, Playfair Display, DM Sans, JetBrains Mono
- [x] CSS variable token system with light/dark mode support
- [x] Auth — Google OAuth + email/password, signup + login flows
- [x] Database schema — 11 core tables + RLS policies
- [x] Landing page — hero, feature highlights, CTA
- [x] App shell + navigation — desktop sidebar + mobile bottom nav FAB
- [x] Check-in modal — 5-step wizard flow
- [x] Core components: StarRating, BeerCard, BreweryCard, CheckinCard, AchievementBadge, SkeletonLoader

---

## Sprint 2 — Consumer App (Complete)
**Theme:** All consumer-facing pages live
**Completed:** 2026-03-24

- [x] Home feed — activity stream, XP progress bar, weekly stats
- [x] Brewery detail page — hero, info, beer menu, top visitors leaderboard
- [x] Beer detail page — details, ratings, check-in history
- [x] Explore page — brewery grid with visit tracking
- [x] Profile page — stats, XP level, achievement badges, recent check-ins
- [x] Friends & leaderboards page
- [x] Achievements page — 35 achievements across 6 categories
- [x] Notifications page, Settings page
- [x] API routes: check-ins, breweries, beers, profiles, friends
- [x] Hooks: useAuth, useCheckin, useBreweries
- [x] XP/leveling system — 20 levels
- [x] Achievement definitions — 35 unlockable achievements

---

## Sprint 3 — Brewery Platform (Complete)
**Theme:** B2B brewery admin dashboard
**Completed:** 2026-03-24

- [x] Brewery admin route group + role-gated layout
- [x] Brewery dashboard — stats cards, recent check-ins, top 3 beers with medals
- [x] Analytics page — 30-day trend, busiest days, top styles, rating distribution
- [x] Loyalty program display (consumer + admin views)
- [x] Promotions display
- [x] Database migrations: brewery_accounts, loyalty_programs, loyalty_cards, promotions
- [x] Test brewery: Pint & Pixel Brewing Co. with 10 developer-themed beers
- [x] 12 test users + 69+ realistic check-ins over 30 days
- [x] RLS policy: brewery admins can read all check-ins for their brewery
- [x] QA process established (Casey joined team)

---

## Sprint 4 — Polish & Consumer Loop (Complete)
**Theme:** Fix known bugs, wire real auth, close the consumer loop
**Completed:** 2026-03-24

- [x] BUG-004–009 fixed (hydration, images, star rating hitbox, light mode text)
- [x] Real Supabase auth wired throughout app
- [x] AppNav connected to real username + notification count
- [x] CheckinModal wired to real API
- [x] `proxy.ts` — merged `x-pathname` header injection (replaced deleted `middleware.ts`)
- [x] Loyalty stamp card component — 323-line skeuomorphic Framer Motion card

---

## Sprint 5 — Brewery Branding & Test Data (Complete)
**Theme:** Make the test data feel real; polish brewery experience
**Completed:** 2026-03-24

- [x] Seed 004–006: Brewery branding, beer images, user avatars, February check-ins
- [x] Brand identity locked — "HopTrack", "Track Every Pour", The Hop Pin, "Pint Rewind", "The Board"

---

## Sprint 6 — Platform Hardening & Superadmin (Complete)
**Theme:** Fix the foundation before we build higher
**Completed:** 2026-03-24

- [x] REQ-015: Enhanced brewery stats bar
- [x] REQ-012: Superadmin panel — `/superadmin` overview, users table, claims queue
- [x] REQ-014: Beer permissions — only brewery accounts can add beers
- [x] Claims queue UI, `admin_actions` audit table, `is_superadmin` flag
- [x] Fixed recursive RLS bug, `brewery_id` type mismatch

---

## Sprint 7 — The Feel-Good Sprint (Complete)
**Theme:** Every critical path works end-to-end
**Completed:** 2026-03-24
**Sprint lead:** Sam (QoL Audit)

- [x] S7-001–010: Geolocation handling, empty states, root redirect, dead button gating, toast system, skeleton loaders, pending claim page, explore search, brewery settings form
- [x] S7-013–014: Full check-in regression suite, bug severity matrix
- [x] Additional: brewery admin mobile tabs, achievement "see all" toggle, superadmin clickable stat cards, claims queue search, `alert()` → mailto
- UX-001 through UX-021 triaged (most resolved)

---

## Sprint 8 — Hardening & Mobile (Complete)
**Theme:** Brewery owner trust, data integrity, PWA foundation
**Start:** 2026-03-24

- [x] S8-001–004: TapList `is_on_tap` bug fix, `confirm()` removal, loyalty editing
- [x] S8-007: PWA manifest + service worker
- [x] S8-012–015: RLS review, loading skeletons, analytics audit
- [x] S8-017: Pint Rewind recap page (brewery admin)
- [x] S8-020: `/for-breweries` pricing page

---

## Sprint 9 — Polish, Reactions & Flow (Complete)
**Theme:** Make the social loop addictive
**Completed:** 2026-03-25

- [x] Loyalty QR code modal, iOS safe area + touch targets
- [x] Pint Rewind shareable card, reactions on check-ins
- [x] `lib/dates.ts` timezone utils, superadmin user list
- [x] REQ-013: Decouple check-in from beer

---

## Sprint 10 — Sessions & Tap Wall (Complete)
**Theme:** Rebuild the core check-in and beer rating experience
**Completed:** 2026-03-26
**Retro:** `docs/retros/sprint-10-retro.md`

- [x] Migration 006: `sessions` + `beer_logs` tables + RLS
- [x] Full sessions API (POST, GET active, log beer, end, update log) + `useSession`
- [x] `CheckinEntryDrawer`, `TapWallSheet`, `ActiveSessionBanner`, `QuickRatingSheet`, `SessionRecapSheet`
- [x] AppNav wired to session state, HomeFeed unified feed, `SessionCard`
- [x] BreweryPage "Check In Here" CTA, XP remap verified, date utils sweep
- [x] Global check-in flow moved to AppShell

---

## Sprint 11 — Redesign Pivot + Launch Prep (Complete)
**Theme:** Full "Gold on Cream" redesign pivot
**Completed:** 2026-03-26
**Retro:** `docs/retros/sprint-11-retro.md`

- [x] Full "Gold on Cream" site redesign (LandingContent + BreweriesContent + Auth)
- [x] Beer quantity increment in sessions (`beer_logs.quantity`)
- [x] Re-review skip (smart rating skip)
- [x] "Drinking at home" session path (`sessions.context`, nullable brewery_id)
- [x] Seed 007: Josh's test universe
- [x] Fix `rpc('increment')` no-op

---

## Sprint 12 — Dashboard Migration & Consumer Delight (Complete)
**Theme:** Brewery dashboard on real sessions, photo uploads, Customer Pint Rewind
**Completed:** 2026-03-26
**Retro:** `docs/retros/sprint-12-retro.md`

- [x] Brewery dashboard → `sessions`/`beer_logs`
- [x] Analytics → `sessions`/`beer_logs`
- [x] Pint Rewind → session data
- [x] Photo upload component + brewery cover upload (`ImageUpload`)
- [x] Customer Pint Rewind — animated card stack with personality archetypes
- [x] Mobile responsive polish (landing pages)
- [x] Migration 008 written (brewery admin RLS)

---

## Bug Log (All Resolved)

| Bug | Severity | Fixed Sprint |
|-----|----------|-------------|
| BUG-001: AppNav left bar contrast | Medium | S4 |
| BUG-002: Star rating final star small | Medium | S4 |
| BUG-003: Check-in button no destination | High | S4 |
| BUG-004: Hydration mismatch (Grammarly) | Medium | S4 |
| BUG-005: pravatar.cc not in remotePatterns | High | S4 |
| BUG-006: Banner text invisible light mode | High | S5 |
| BUG-007: Kernel Panic Porter wrong image | Low | S5 |
| BUG-008: Stack Overflow Sour 404 | Low | S5 |
| BUG-009: Star rating hitbox corruption | High | S4 |
| BUG-010: Recursive RLS on profiles | Critical | S6 |
| BUG-011: middleware.ts + proxy.ts conflict | Critical | S6 |
| BUG-012: brewery_id type mismatch | High | S6 |
| BUG-013: TapList `is_on_tap` overwrite on edit | Critical | S8 |

---

## Customer Pint Rewind — Design Brief

**The vibe:** Spotify Wrapped meets your drinking diary. Funny. Brutally honest. Shareable.

| Card | Content | Tone |
|------|---------|------|
| **Your Beer Personality** | Most common style → fun archetype ("The IPA Evangelist") | Playful |
| **Your Signature Beer** | Most logged beer, how many times | Affectionate roast |
| **Your Brewery Loyalty** | Most visited brewery + visit count | Warm |
| **Legendary Session** | Longest session by time or most beers | Impressed / chaotic |
| **Rating Habits** | Avg rating — harsh critic vs. easy grader | Teasing |
| **Home Couch Researcher** | Home sessions count (if any) | Approving nod |
| **The Scroll** | Total beers, total pours, total XP | Big number energy |
| **Your Level** | Current level + what that says about you | Hype |

**Delivery:** Full-screen animated card stack (Framer Motion). Dark theme, gold accents, big Playfair Display numbers.

---

*Archive maintained by Morgan. For the active roadmap, see `docs/roadmap.md`.*
