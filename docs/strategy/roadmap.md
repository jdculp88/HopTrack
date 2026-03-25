# HopTrack Product Roadmap
**Owner:** Morgan (Project Owner) · Sam (Business Analyst)
**Last Updated:** 2026-03-24
**Status:** Living document — updated each sprint

---

## Guiding Principles
1. **Consumer first** — build the audience before monetizing
2. **Ship weekly** — small working increments over big bang releases
3. **Bug zero policy** — no new features while P1 bugs are open
4. **QA gates** — Casey signs off before any feature closes

---

## Current Status: Sprint 1 (Week 1)
> Foundation complete. App scaffolded, DB live, build green. Moving into polish + core enhancements.

---

## Sprint Calendar

### 🟢 Sprint 1 — Foundation Polish (Week of 2026-03-24)
**Theme:** "Make it real" — bugs, tech debt, first enhancements
**Goal:** App is usable end-to-end by a real user with no embarrassing rough edges

| # | Item | Type | Owner | Est | Status |
|---|------|------|-------|-----|--------|
| 1 | BUG-002: Star rating final star size | Bug | Jordan | 30min | 🔴 Open |
| 2 | BUG-003: Check-in exit → Home Feed | Bug | Jordan | 30min | 🔴 Open |
| 3 | Tech: SkeletonLoader style prop fix | Tech Debt | Jordan | 15min | 🔴 Open |
| 4 | REQ-001: Light/dark theme toggle | Enhancement | Alex + Jordan | 3hr | 🔴 Open |
| 5 | BUG-001: Migrate hardcoded hex → CSS vars | Bug | Jordan | 2hr | 🔴 Open |
| 6 | Profile: Favorite beer + auto-fallback | Enhancement | Jordan | 1hr | 🔴 Open |
| 7 | Profile: Banner image + Unsplash fallback | Enhancement | Jordan | 1hr | 🔴 Open |
| 8 | QA: Casey checklist template | Process | Casey | 1hr | 🔴 Open |

**Sprint 1 Acceptance Criteria:**
- [ ] All 3 bugs closed and verified by Casey
- [ ] Light/dark toggle works cohesively in all pages and components
- [ ] Profile page shows banner and favorite beer
- [ ] Build stays green throughout

---

### 🟡 Sprint 2 — Brewery Platform (Week of 2026-03-31)
**Theme:** "Open for Business" — brewery accounts, menus, images
**Goal:** A brewery can claim their page and manage their content

| # | Item | Type | Owner | Est |
|---|------|------|-------|-----|
| 1 | REQ-004: Brewery claim + account creation | Feature | Jordan | 4hr |
| 2 | REQ-004: Email domain verification flow | Feature | Jordan + Riley | 3hr |
| 3 | REQ-004: Brewery admin dashboard `/brewery-admin` | Feature | Jordan + Alex | 6hr |
| 4 | REQ-002: Supabase Storage bucket for brewery images | Infra | Riley | 1hr |
| 5 | REQ-002: Brewery image upload in admin dashboard | Feature | Jordan | 2hr |
| 6 | REQ-002: Brewery tap list management (CRUD) | Feature | Jordan | 3hr |
| 7 | REQ-002: Consumer-facing tap list on brewery detail | Feature | Jordan + Alex | 2hr |
| 8 | DB: Add `is_domestic` flag to beers table | DB | Jordan | 30min |
| 9 | QA: Full brewery admin flow test pass | QA | Casey | 2hr |

**Sprint 2 Acceptance Criteria:**
- [ ] Brewery can sign up, claim their page, upload image, and manage tap list
- [ ] Consumers see tap list and brewery photo on brewery detail page
- [ ] Verification flow documented and at least email domain path working
- [ ] Casey signs off after full test pass

---

### 🟡 Sprint 3 — Loyalty & Gamification (Week of 2026-04-07)
**Theme:** "Keep Them Coming Back" — loyalty system + domestic achievement
**Goal:** Breweries can create loyalty programs; consumers earn stamps and redeem rewards

| # | Item | Type | Owner | Est |
|---|------|------|-------|-----|
| 1 | REQ-003: DB schema — loyalty_programs, loyalty_cards, loyalty_rewards | DB | Jordan | 1hr |
| 2 | REQ-003: Brewery loyalty program builder UI | Feature | Jordan + Alex | 4hr |
| 3 | REQ-003: Consumer stamp card UI (skeuomorphic) | Feature | Alex + Jordan | 3hr |
| 4 | REQ-003: QR code generation + redemption flow | Feature | Jordan + Riley | 4hr |
| 5 | REQ-003: Brewery staff scanner PWA | Feature | Jordan | 3hr |
| 6 | "How American Are You" achievement track | Feature | Jordan | 2hr |
| 7 | Domestic beers excluded from explorer/variety goals | Feature | Jordan | 1hr |
| 8 | Slow seller promotions — brewery promo builder | Feature | Jordan + Alex | 3hr |
| 9 | Consumer promo display — explore feed + brewery page | Feature | Jordan | 2hr |
| 10 | QA: Loyalty end-to-end test pass | QA | Casey | 3hr |

**Sprint 3 Acceptance Criteria:**
- [ ] Brewery can create a loyalty program with custom rules
- [ ] Consumer sees stamp card, earns stamps on check-in, redeems via QR
- [ ] "How American Are You" achievement earnable and visually distinct
- [ ] Casey completes end-to-end loyalty redemption test

---

### 🟠 Sprint 4 — Social & Virality (Week of 2026-04-14)
**Theme:** "Share the Love" — Wrapped recaps, social polish
**Goal:** Shareable moments that drive organic installs

| # | Item | Type | Owner | Est |
|---|------|------|-------|-----|
| 1 | REQ-005: Weekly recap digest (email via Resend) | Feature | Jordan + Riley | 3hr |
| 2 | REQ-005: Year in Beer shareable card (satori/html-to-image) | Feature | Alex + Jordan | 4hr |
| 3 | REQ-005: Monthly brewery recap email for brewery admins | Feature | Jordan | 2hr |
| 4 | Supabase Edge Function cron for recap generation | Infra | Riley | 2hr |
| 5 | Push notifications (web push via Supabase) | Feature | Jordan + Riley | 3hr |
| 6 | Friend activity improvements — reactions, comments | Feature | Jordan + Alex | 3hr |
| 7 | QA: Recap generation + email delivery test | QA | Casey | 2hr |

---

### 🔵 Sprint 5 — Brewery Premium Features (Week of 2026-04-21)
**Theme:** "Taproom Tools" — TV display + brewery analytics
**Goal:** Premium B2B features that justify Barrel tier pricing

| # | Item | Type | Owner | Est |
|---|------|------|-------|-----|
| 1 | REQ-006: TV display app `/display/[brewery_id]` | Feature | Alex + Jordan | 6hr |
| 2 | REQ-006: Realtime Supabase subscription for display | Infra | Riley + Jordan | 2hr |
| 3 | REQ-006: Brewery QR enrollment for TV display | Feature | Jordan | 1hr |
| 4 | REQ-007: Brewery location insights (style demand by geo) | Feature | Jordan + Sam | 4hr |
| 5 | REQ-007: Weekly brewery insights email | Feature | Jordan + Riley | 2hr |
| 6 | Brewery subscription + billing (Stripe integration) | Feature | Jordan | 4hr |
| 7 | QA: TV display end-to-end + billing flow | QA | Casey | 3hr |

---

### 🟣 Sprint 6 — App Store & Launch (Week of 2026-04-28)
**Theme:** "Ship It" — polish, performance, App Store
**Goal:** Ready for public launch and App Store submission

| # | Item | Type | Owner | Est |
|---|------|------|-------|-----|
| 1 | Map view in Explore (Mapbox integration) | Feature | Jordan | 3hr |
| 2 | Performance audit (Core Web Vitals) | Tech | Jordan + Riley | 3hr |
| 3 | PWA manifest + service worker | Tech | Jordan | 2hr |
| 4 | App Store screenshots (light + dark) | Design | Alex | 2hr |
| 5 | Marketing site polish — competitive positioning copy | Design | Alex + Taylor | 2hr |
| 6 | Beta user onboarding — invite flow | Feature | Jordan | 2hr |
| 7 | Full regression test pass | QA | Casey | 4hr |
| 8 | Production deployment (Vercel) | Infra | Riley | 2hr |

---

## Milestone Summary

| Milestone | Target Date | Definition of Done |
|-----------|------------|-------------------|
| **M1 — Consumer MVP polished** | 2026-03-27 | Bugs fixed, theme toggle, profile banner, build green |
| **M2 — Brewery Platform live** | 2026-04-03 | Breweries can claim + manage pages, tap lists, images |
| **M3 — Loyalty live** | 2026-04-10 | Full loyalty stamp + QR redemption working |
| **M4 — Social viral loop** | 2026-04-17 | Wrapped recaps, push notifications, social polish |
| **M5 — Premium B2B** | 2026-04-24 | TV display, insights, Stripe billing |
| **M6 — Public Launch** | 2026-05-01 | App Store + marketing site + beta users |

---

## Backlog (Not Yet Scheduled)
- Apple / Facebook OAuth
- Native iOS app (React Native / Expo)
- Distributor analytics data product
- Multi-location brewery support
- Beer rating import from Untappd (migration tool)
- Brewery-to-brewery network (wholesale recommendations)

---

## Team Capacity Notes
- Jordan: full-stack, primary builder
- Alex: UI/UX + front-end polish
- Riley: infrastructure, Supabase, Edge Functions, deployment
- Sam: requirements, analytics, business logic validation
- Taylor: sales collateral, GTM, brewery outreach (non-code)
- Drew: brewery industry validation, user research, introductions
- Casey: QA, test passes, acceptance criteria, bug reporting
- Morgan: priorities, decisions, roadmap

---
*Next roadmap review: 2026-03-31 (Sprint 2 kickoff)*
