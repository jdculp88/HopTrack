# HopTrack Documentation Audit

**Author:** Sam (Business Analyst / QA Lead)
**Date:** 2026-03-29
**Scope:** Full audit of `docs/` directory through Sprint 29

---

## 1. Current State of docs/

### Root-Level Files

| File | Last Updated | Status | Notes |
|------|-------------|--------|-------|
| `roadmap.md` | 2026-03-26 | **STALE** | Says "Sprint 15 — CURRENT" but we are at Sprint 29/30. Requirements index is incomplete. Infrastructure and Mobile roadmaps outdated. Updated as part of this audit. |
| `roadmap-archive.md` | 2026-03-26 | Current | Sprints 1-12 archive. Accurate. |
| `URL-REFERENCE.md` | 2026-03-24 | **STALE** | Written Sprint 6. Missing ~30+ routes added since then (board, events, QR, brewery-welcome, session share, beer reviews, etc.). |
| `app-store-metadata.md` | 2026-03-26 | Current | App Store copy. Still valid for eventual submission. |
| `checkins-deprecation-plan.md` | 2026-03-26 | **STALE/COMPLETE** | Checkins table was dropped in Sprint 16. This plan is fully executed. Should be archived. |
| `sprint-12-plan.md` | 2026-03-26 | Complete | Historical. Could be archived. |
| `sprint-13-plan.md` | 2026-03-26 | Complete | Historical. Could be archived. |
| `sprint-14-plan.md` | 2026-03-26 | Complete | Historical. Could be archived. |
| `sprint-15-plan.md` | 2026-03-26 | Complete | Historical. Could be archived. |
| `sprint-16-plan.md` | 2026-03-27 | Complete | Historical. Could be archived. |
| `sprint-17-plan.md` | 2026-03-27 | Complete | Historical. Could be archived. |
| `sprint-17-bugs.md` | 2026-03-27 | Complete | Sprint 17 bug log. Could be archived. |
| `sprint-18-bugs.md` | 2026-03-27 | Complete | Sprint 18 bug log. Could be archived. |
| `sprint-21-plan.md` | 2026-03-27 | Complete | Historical. Could be archived. |
| `sprint-25-plan.md` | 2026-03-28 | Complete | Historical. Could be archived. |
| `sprint-26-plan.md` | 2026-03-28 | Complete | Historical. Could be archived. |
| `sprint-29-testing-weekend.md` | 2026-03-29 | Current | Weekend testing playbook. Active. |
| `sprint-30-plan.md` | 2026-03-29 | Current | Next sprint plan. Active. |
| `sprint-30-testing-audit.md` | 2026-03-29 | Current | Full team audit findings. Active reference for Sprint 30. |
| `sprint-31-plan.md` | 2026-03-29 | Current | Future sprint plan. Active. |

### Subdirectories

#### `docs/retros/` (15 files) -- HEALTHY
All retro files are historical records and should be preserved as-is. Coverage:
- Sprint 7 (roast), 9, 10, 11, 12, 13, 14, 15, 16, 17-18 (combined), 19, 23, 27, 28, 29
- Missing retros: 20, 21, 22, 24, 25, 26 (some sprints were short or combined)
- Status: **No action needed.** These are canonical team records.

#### `docs/sales/` (8 files) -- CURRENT
Taylor's domain. All written Sprint 17 timeframe. Includes:
- `README.md` -- index
- `go-to-market.md`, `ideal-customer-profile.md`, `pitch-deck-outline.md`
- `pitch-guide.md`, `pricing-and-tiers.md`, `target-breweries.md`
- `sales-playbook-v1.md` (slightly older, 2026-03-23)
- Status: **Current. Taylor owns updates.**

#### `docs/requirements/` (15 files) -- PARTIALLY STALE
Individual REQ spec files from early sprints. Most features have evolved significantly since these were written.
- `REQ-001` through `REQ-013` -- written Sprints 1-9, specs are accurate for what was originally planned but do not reflect final implementation
- `REQ-025-sessions-tap-wall.md` -- comprehensive sessions spec, still relevant
- `QA-checklist-template.md` -- reusable template, still valid
- Status: **Individual REQ files are historical specs. The source of truth for what shipped is CLAUDE.md sprint summaries.** No need to update individual files -- the requirements index in `roadmap.md` is the living tracker.

#### `docs/bugs/` (4 files) -- STALE/COMPLETE
- `BUG-001` through `BUG-003` -- all fixed in Sprint 4
- `BUG-LOG.md` -- bugs 004-013, all fixed by Sprint 8
- Status: **All bugs resolved. Could be archived.** Active bug tracking now happens in sprint plans and the testing audit.

#### `docs/agendas/` (2 files) -- STALE
- Sprint 1 review and Sprint 4 kickoff agendas from 2026-03-24
- Status: **Stale. Not updated since Sprint 4.** Meeting agendas are now embedded in sprint plans.

#### `docs/meetings/` (5 files) -- STALE
- Product kickoff, competitive strategy, sprint kickoff/retro, Sprint 10 planning
- Last updated 2026-03-25
- Status: **Historical. Not updated since Sprint 10.** Meeting notes now go to retros or sprint plans.

#### `docs/ops/` (2 files) -- MIXED
- `DREW-BREWERY-OPS-REVIEW.md` -- Drew's operational review. Valuable reference.
- `STAGING-ENV-SETUP.md` -- Staging environment setup guide. May need update.
- Status: **Drew's review is evergreen reference. Staging doc needs verification.**

#### `docs/strategy/` (6 files) -- MOSTLY STALE
- `roadmap.md` -- **DUPLICATE.** An older roadmap from Sprint 1. Superseded by `docs/roadmap.md`.
- `BRAND-IDENTITY-V1.md` -- Comprehensive brand guide. Still valid as reference, though HopMark shipped in Sprint 22.
- `brand-guide.md` -- Shorter brand guide. Overlaps with BRAND-IDENTITY-V1.
- `competitive-differentiation.md` -- Sprint 1 competitive analysis. Historical.
- `APPLE-APP-PLAN-V1.md` -- Mobile app plan. Capacitor was installed Sprint 14, TestFlight still pending.
- `SALES-PREP-SPRINT-BRIEF.md` -- Pre-Sprint 17 sales prep. Superseded by `docs/sales/`.
- Status: **Most files are historical. Two brand docs overlap. Strategy roadmap is a duplicate.**

#### `docs/screenshots/` (1 file) -- EMPTY
- Only contains a README placeholder
- Status: **Empty directory. No screenshots stored here.**

#### `docs/validation/` (1 file) -- STALE
- `SAM-REQ-VALIDATION-2026-03-24.md` -- My validation audit from Sprint 6
- Status: **Historical. Superseded by this audit and the Sprint 30 testing audit.**

---

## 2. Recommended Directory Structure

```
docs/
  roadmap.md                    -- SOURCE OF TRUTH (keep updated every sprint)
  roadmap-archive.md            -- Sprints 1-12 history (keep as-is)
  app-store-metadata.md         -- App Store submission copy (keep)

  retros/                       -- Sprint retros (keep all, no changes)
    sprint-07-roast.md
    sprint-09-retro.md
    ...
    sprint-29-retro.md

  sales/                        -- Taylor's domain (keep all, Taylor updates)
    README.md
    go-to-market.md
    ...

  plans/                        -- NEW: Move all sprint plans here
    sprint-12-plan.md
    sprint-13-plan.md
    ...
    sprint-30-plan.md
    sprint-31-plan.md
    sprint-29-testing-weekend.md
    sprint-30-testing-audit.md

  archive/                      -- NEW: Historical docs that are complete/superseded
    checkins-deprecation-plan.md
    URL-REFERENCE.md
    sprint-17-bugs.md
    sprint-18-bugs.md
    bugs/                       -- All resolved bugs
      BUG-001-light-theme-contrast.md
      BUG-002-star-rating-final-star.md
      BUG-003-checkin-post-submit-navigation.md
      BUG-LOG.md
    agendas/                    -- Early sprint agendas
    meetings/                   -- Early sprint meetings
    validation/                 -- Old validation audit
    strategy/                   -- Early strategy docs (except brand identity)
      roadmap.md                -- Old duplicate roadmap
      competitive-differentiation.md
      SALES-PREP-SPRINT-BRIEF.md

  brand/                        -- NEW: Consolidated brand docs
    BRAND-IDENTITY-V1.md        -- Move from strategy/
    brand-guide.md              -- Move from strategy/
    APPLE-APP-PLAN-V1.md        -- Move from strategy/

  ops/                          -- Keep as-is
    DREW-BREWERY-OPS-REVIEW.md
    STAGING-ENV-SETUP.md

  requirements/                 -- Keep as historical specs (not updated)
    REQ-001-theme-toggle.md
    ...
    QA-checklist-template.md
```

**Key changes:**
1. Create `docs/plans/` -- consolidate all sprint plans and testing docs
2. Create `docs/archive/` -- move completed/superseded docs out of root
3. Create `docs/brand/` -- consolidate brand identity docs from `strategy/`
4. Delete `docs/screenshots/` -- empty, unused
5. Keep `docs/requirements/` as historical specs (source of truth is `roadmap.md` index)

---

## 3. Updated Requirements Matrix

This is the corrected requirements index reflecting what was actually built through Sprint 29. See `docs/roadmap.md` for the updated version.

| REQ | Title | Status | Sprint | Notes |
|-----|-------|--------|--------|-------|
| REQ-001 | Check-in Core Flow | COMPLETE | S1-S10 | Original check-in modal (S1-S9) replaced by Sessions + Tap Wall (S10). Checkins table dropped S16. |
| REQ-002 | XP and Leveling System | COMPLETE | S2 | 20 levels, XP bar, level-up notifications |
| REQ-003 | Achievement System | COMPLETE | S2-S16 | 52 achievements across 8+ categories. Style badges (S13), domestic (S16). |
| REQ-004 | Brewery Admin Dashboard | COMPLETE | S3-S16 | Dashboard, analytics, tap list, loyalty, events, sessions view. Migrated to sessions data S12. |
| REQ-005 | Pint Rewind (Brewery Recap) | COMPLETE | S8-S12 | Brewery admin recap + Customer Pint Rewind animated card stack. |
| REQ-006 | Loyalty Program | COMPLETE | S3-S16 | Stamp cards, QR codes, loyalty dashboard with stats. `loyalty_redemptions` table added S17. |
| REQ-007 | Brewery Claim Flow | COMPLETE | S4-S14 | Claim queue, admin approval, 14-day trial badge. |
| REQ-008 | Reactions (Cheers) | COMPLETE | S9-S29 | Reactions on sessions. ReactionBar component with cheers toggle, comment count, share. |
| REQ-009 | Wishlist / Want to Try | COMPLETE | S13 | WishlistButton, wishlist on You tab feed. |
| REQ-010 | Flavor Tags | COMPLETE | S2 | Beer style tags, Taste DNA on You tab. |
| REQ-011 | Serving Styles | COMPLETE | S19 | 20 glass types with SVG illustrations, pour sizes, multi-tier pricing. |
| REQ-012 | Superadmin Panel | COMPLETE | S6 | User management, claims queue, audit logging. |
| REQ-013 | Beer Passport | COMPLETE | S13 | Profile sub-page with brewery passport grid. |
| REQ-014 | Beer Permissions | COMPLETE | S6 | Only brewery accounts can add/edit beers. |
| REQ-015 | Enhanced Brewery Stats | COMPLETE | S6-S16 | Stats bar, analytics charts, Top Beers, Peak Times, Repeat Visitors. |
| REQ-016 | Domestic Beer Achievement | COMPLETE | S16 | `domestic_drinker` (bronze) + `domestic_devotee` (silver). |
| REQ-017 | Photo Uploads | COMPLETE | S12-S23 | ImageUpload component, brewery covers, profile avatars. Avatars bucket + RLS (S23). |
| REQ-018 | TV Display ("The Board") | COMPLETE | S16-S19 | Full-screen realtime tap list. Chalk board (S17), cream typography redesign (S18), glass SVGs + pour sizes (S19). |
| REQ-019 | Toast Notifications | COMPLETE | S7 | Toast system for all mutations. |
| REQ-020 | Skeleton Loaders | COMPLETE | S7-S15 | ~95% route coverage. 13 loading.tsx files added S15. |
| REQ-021 | PWA / Mobile App | IN PROGRESS | S8-S14 | PWA manifest + service worker complete. Capacitor installed S14. TestFlight submission pending (Apple Developer account). |
| REQ-022 | Multi-environment Infra | IN PROGRESS | S8 | Staging Supabase project planned. Not fully deployed. |
| REQ-023 | Loyalty Program Editing | COMPLETE | S8 | Edit loyalty programs from brewery admin. |
| REQ-024 | Sales / Pricing Presence | COMPLETE | S8 | `/for-breweries` pricing page live. |
| REQ-025 | Sessions and Tap Wall | COMPLETE | S10-S11 | Session-based check-in, TapWallSheet, ActiveSessionBanner, SessionRecapSheet, at-home sessions. |
| REQ-026 | Web Push Notifications | COMPLETE | S14-S16 | VAPID keys, PushOptIn, friend session notifications. |
| REQ-027 | Social Feed (Three-Tab) | COMPLETE | S13-S29 | Friends/Discover/You tabs. FeedTabBar, DrinkingNow, achievement/streak cards. Reaction counts. |
| REQ-028 | Session Comments | COMPLETE | S16 | Comment on sessions. Always-visible input, 2-comment preview. Redesigned S25. |
| REQ-029 | Brewery Events | COMPLETE | S16 | CRUD admin, consumer event view on brewery pages, event badges on explore. |
| REQ-030 | Brewery Reviews | COMPLETE | S23 | Star rating + text review. One review per user per brewery. Inline on brewery page. |
| REQ-031 | Beer Reviews | COMPLETE | S25 | Dedicated beer review system (separate from beer_logs ratings). BeerReviewSection on beer pages. |
| REQ-032 | Session Recap V2 | COMPLETE | S25-S26 | Split beers into Rate These/Already Rated, brewery quick review, compact hero. |
| REQ-033 | HopMark Identity System | COMPLETE | S22 | SVG component, 4 variants, 5 themes. Deployed across app (nav, auth, board, QR, share card). |
| REQ-034 | QR Table Tents | COMPLETE | S21 | 3 formats (Table Tent/Coaster/Poster), PNG download + print. Links to brewery-welcome bridge page. |
| REQ-035 | Brewery Welcome Bridge Page | COMPLETE | S21 | `/brewery-welcome/[id]` -- cream/gold landing matching The Board aesthetic. |
| REQ-036 | Friends Live (Drinking Now) | COMPLETE | S22 | Horizontal scroll strip, pulse ring avatars, 60s polling. Privacy toggle (`share_live`). |
| REQ-037 | Glassware Illustrations | COMPLETE | S19 | 20 glass type SVGs in `lib/glassware.ts`. Glass picker in tap list admin. SVGs on Board. |
| REQ-038 | Pour Size Pricing | COMPLETE | S19 | Multi-tier pricing per beer. Taster/Half Pint/Pint/Flight chips on Board. API for CRUD. |
| REQ-039 | Feed Card Types | COMPLETE | S27-S28 | AchievementFeedCard, StreakFeedCard, RecommendationCard, NewFavoriteCard, FriendJoinedCard, SeasonalBeersScroll, CuratedCollectionsList. |
| REQ-040 | Drag-to-Reorder Tap List | COMPLETE | S16 | @dnd-kit, display_order column, 86'd toggle. |
| REQ-041 | Friend Management | COMPLETE | S15-S17 | Accept/Decline, search + add, unfriend with inline confirmation, cancel sent requests, FriendButton on profiles. |
| REQ-042 | Error Boundaries | COMPLETE | S15-S23 | error.tsx in all 3 route groups + auth. Sentry reporting. |
| REQ-043 | Onboarding Card | COMPLETE | S15-S25 | Post-signup welcome card. First-visit-of-day detection, slim bar on repeat visits. |

---

## 4. Shipped Features Not Previously in Requirements

The following features shipped in Sprints 13-29 but were not captured in the original REQ-001 through REQ-025 index:

| Feature | Sprint | Now Tracked As |
|---------|--------|---------------|
| Web Push Notifications (VAPID, PushOptIn, friend alerts) | S14, S16 | REQ-026 |
| Social Feed (Three-Tab: Friends/Discover/You) | S13-S29 | REQ-027 |
| Session Comments | S16 | REQ-028 |
| Brewery Events (admin CRUD + consumer views) | S16 | REQ-029 |
| Brewery Reviews (star + text) | S23 | REQ-030 |
| Beer Reviews (dedicated review system) | S25 | REQ-031 |
| Session Recap V2 (rate-these split, brewery review) | S25-S26 | REQ-032 |
| HopMark Identity System (SVG, 4 variants, 5 themes) | S22 | REQ-033 |
| QR Table Tents (3 formats, print-ready) | S21 | REQ-034 |
| Brewery Welcome Bridge Page | S21 | REQ-035 |
| Friends Live / Drinking Now strip | S22 | REQ-036 |
| Glassware Illustrations (20 glass SVGs) | S19 | REQ-037 |
| Pour Size Pricing (multi-tier per beer) | S19 | REQ-038 |
| Feed Card Types (7 new card components) | S27-S28 | REQ-039 |
| Drag-to-Reorder Tap List (@dnd-kit) | S16 | REQ-040 |
| Friend Management (full lifecycle) | S15-S17 | REQ-041 |
| Error Boundaries (all route groups + Sentry) | S15-S23 | REQ-042 |
| Onboarding Card (post-signup welcome) | S15-S25 | REQ-043 |

**Additional shipped items not elevated to REQ level** (quality/infra improvements, not standalone features):
- Sentry error monitoring (S13)
- Capacitor iOS configuration (S14)
- Privacy policy page (S14)
- Profile photo upload via Supabase Storage (S15)
- Accessibility improvements: focus traps, aria-labels, aria-pressed (S21-S23)
- Hardcoded color sweep to CSS vars (S23)
- Session share card with save-as-image + QR (S14)
- Board settings preview (draft/apply pattern) (S21)
- Tap list unsaved changes guard (S21)
- Paginated brewery admin sessions view (S21)
- Checkins table full deprecation and drop (S14-S16)

---

## 5. Action Items

### Immediate (this sprint)
1. **DONE:** Updated `docs/roadmap.md` requirements index (REQ-001 through REQ-043)
2. **DONE:** Updated sprint status in `roadmap.md` (was stuck on "Sprint 15 CURRENT")
3. **DONE:** Updated infrastructure and mobile roadmaps in `roadmap.md`
4. **DONE:** Updated team roster (Jordan promoted, Avery/Quinn/Sage/Reese added)

### Next Sprint
5. Move completed sprint plans to `docs/plans/` subdirectory
6. Create `docs/archive/` for completed/superseded docs
7. Archive `checkins-deprecation-plan.md` (fully executed S16)
8. Update or archive `URL-REFERENCE.md` (stale since Sprint 6)
9. Consolidate brand docs into `docs/brand/`
10. Delete empty `docs/screenshots/` directory

### Ongoing
11. Keep `roadmap.md` requirements index updated every sprint (Morgan + Sam)
12. Taylor: review `docs/sales/` for accuracy before first brewery demo
13. Consider `STAGING-ENV-SETUP.md` update when staging environment is deployed

---

*This audit was conducted by Sam (Business Analyst / QA Lead) on 2026-03-29.*
*"From a business continuity standpoint, our docs were 14 sprints behind. Now they are current."*
