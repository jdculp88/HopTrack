# Requirements & Traceability Matrix 📋

*The REQ library and the RTM — every REQ traceable to its tests, code, and retro.* Owned by [Sam](../../.claude/agents/sam.md) and [Sage](../../.claude/agents/sage.md).

**Back to [wiki home](../README.md).**

---

## How to read this page

Every row below is a shipped (or queued) REQ. Click the **REQ ID** for the full specification. The **Tests**, **Code**, and **Retro** columns are inline links to the real files and historical records — that's the traceability.

If a cell shows `⚠️ gap`, it means that feature shipped without covering test or its test file hasn't been mapped here yet. That's honest signal, not a finished state — [Casey](../../.claude/agents/casey.md) and Sam close these in Wave 4.

If the Tests column links to [e2e.frozen/](../../e2e.frozen/), those are Playwright specs that were frozen in [Sprint 173](../history/retros/sprint-173-ci-unblock.md) and do not currently run in CI.

## The RTM

| REQ | Feature | Sprint | Status | Code | Tests | Retro |
|---|---|---|---|---|---|---|
| [REQ-001](REQ-001-theme-toggle.md) | Light/Dark Theme Toggle | 11 | ✅ Complete | [ThemeToggle component](../../components/) | [theme-toggle.test.tsx](../../components/__tests__/theme-toggle.test.tsx) | [retro](../history/retros/sprint-11-retro.md) |
| [REQ-002](REQ-002-brewery-images-beer-menus.md) | Brewery Images & Beer Menus | 12 | ✅ Complete | [lib/menus](../../lib/), [supabase/migrations](../../supabase/migrations/) | [menus.test.ts](../../lib/__tests__/menus.test.ts) | [retro](../history/retros/sprint-12-retro.md) |
| [REQ-003](REQ-003-loyalty-system.md) | Loyalty System | 16 | ✅ Complete | [lib/brand-loyalty](../../lib/), [lib/mug-club-perks](../../lib/) | [brand-loyalty.test.ts](../../lib/__tests__/brand-loyalty.test.ts), [mug-club-perks.test.ts](../../lib/__tests__/mug-club-perks.test.ts) | — |
| [REQ-004](REQ-004-brewery-accounts.md) | Brewery Accounts & Claims | 14 | ✅ Complete | [lib/brand-auth](../../lib/), [app/(brewery)/](../../app/) | [brand-auth.test.ts](../../lib/__tests__/brand-auth.test.ts) | — |
| [REQ-005](REQ-005-wrapped-recaps.md) | Wrapped Recaps (Pint Rewind) | 33 | ✅ Complete | [lib/wrapped](../../lib/), [lib/pint-rewind](../../lib/) | [wrapped.test.ts](../../lib/__tests__/wrapped.test.ts), [pint-rewind.test.ts](../../lib/__tests__/pint-rewind.test.ts) | — |
| [REQ-006](REQ-006-tv-display.md) | TV Display (The Board) | 16 | ✅ Complete | [app/(brewery)/board](../../app/) | [board-settings.test.ts](../../lib/__tests__/board-settings.test.ts), [board-themes.test.ts](../../lib/__tests__/board-themes.test.ts), [board-display-scale.test.ts](../../lib/__tests__/board-display-scale.test.ts) | [retro](../history/retros/sprint-167-retro.md) *(last major iteration)* |
| [REQ-007](REQ-007-brewery-insights.md) | Brewery Insights & Analytics | 43 | ✅ Complete | [lib/kpi](../../lib/), [lib/brewery-health](../../lib/) | [kpi.test.ts](../../lib/__tests__/kpi.test.ts), [brewery-health.test.ts](../../lib/__tests__/brewery-health.test.ts), [brewery-benchmarks.test.ts](../../lib/__tests__/brewery-benchmarks.test.ts) | — |
| [REQ-008](REQ-008-xp-leveling-system.md) | XP & Leveling System | 13 | ✅ Complete | [lib/xp](../../lib/) | [xp.test.ts](../../lib/__tests__/xp.test.ts), [xp-variable.test.ts](../../lib/__tests__/xp-variable.test.ts) | — |
| [REQ-009](REQ-009-reactions-wishlist.md) | Reactions & Wishlist | 13 | ✅ Complete | [components/](../../components/), [lib/share](../../lib/) | [share.test.ts](../../lib/__tests__/share.test.ts) ⚠️ partial | — |
| [REQ-010](REQ-010-flavor-tags-serving-styles.md) | Flavor Tags & Serving Styles | 13 | ✅ Complete | [lib/beer-sensory](../../lib/) | [beer-sensory.test.ts](../../lib/__tests__/beer-sensory.test.ts), [srm-colors.test.ts](../../lib/__tests__/srm-colors.test.ts) | — |
| [REQ-011](REQ-011-checkin-flow.md) | Check-in Flow | 14 | 🪦 Deprecated (see REQ-025) | [archive/checkins-deprecation-plan.md](../archive/checkins-deprecation-plan.md) | — | — |
| [REQ-012](REQ-012-beer-wishlist.md) | Beer Wishlist | 13 | ✅ Complete | [components/WishlistAlert](../../components/) | ⚠️ gap | — |
| REQ-013 | Beer Passport (revamped) | 63 | ✅ Complete | [app/(consumer)/passport](../../app/) | ⚠️ gap | — |
| [REQ-025](REQ-025-sessions-tap-wall.md) | Sessions & Tap Wall | 16 | ✅ Complete | [lib/session-flow](../../lib/), [lib/tap-list-types](../../lib/) | [session-flow.test.ts](../../lib/__tests__/session-flow.test.ts), [session-og.test.ts](../../lib/__tests__/session-og.test.ts), [tap-list-types.test.ts](../../lib/__tests__/tap-list-types.test.ts) | — |
| [REQ-069](REQ-069-enhanced-kpis-analytics.md) | Enhanced KPIs & Analytics | 124 | ✅ Complete | [lib/kpi](../../lib/) | [kpi.test.ts](../../lib/__tests__/kpi.test.ts) | [retro](../history/retros/sprint-124-retro.md) |
| [REQ-070](REQ-070-brewery-menu-uploads.md) | Non-Beer Menu Uploads | 82, 128 | ✅ Complete | [lib/menus](../../lib/) | [menus.test.ts](../../lib/__tests__/menus.test.ts) | [retro](../history/retros/sprint-128-retro.md) |
| [REQ-071](REQ-071-the-barback-ai-beer-crawler.md) | The Barback (AI Crawler) | 79, 146 | ✅ Complete | [scripts/barback-crawl.mjs](../../scripts/barback-crawl.mjs), [.github/workflows/barback.yml](../../.github/workflows/barback.yml) | [cron-ai-suggestions.test.ts](../../lib/__tests__/cron-ai-suggestions.test.ts) | [retro](../history/retros/sprint-146-retro.md) |
| [REQ-072](REQ-072-multi-location-brewery-support.md) | Multi-Location Brewery Support | 114-137 | ✅ Complete (arc) | [lib/brand-*](../../lib/) | [brand-auth.test.ts](../../lib/__tests__/brand-auth.test.ts), [brand-billing.test.ts](../../lib/__tests__/brand-billing.test.ts), [brand-crm.test.ts](../../lib/__tests__/brand-crm.test.ts), [brand-propagation.test.ts](../../lib/__tests__/brand-propagation.test.ts), [brand-team-activity.test.ts](../../lib/__tests__/brand-team-activity.test.ts), [brand-tier-gates.test.ts](../../lib/__tests__/brand-tier-gates.test.ts), [brand-routes-use-shared-auth.test.ts](../../lib/__tests__/brand-routes-use-shared-auth.test.ts), [brand-onboarding.test.ts](../../lib/__tests__/brand-onboarding.test.ts), [brand-digest.test.ts](../../lib/__tests__/brand-digest.test.ts) | — |
| [REQ-073](REQ-073-pos-integration.md) | POS Integration (Toast, Square) | 86-88 | ✅ Complete | [lib/pos-sync](../../lib/) | [pos-sync.test.ts](../../lib/__tests__/pos-sync.test.ts) | [retro](../history/retros/sprint-87-retro.md) |
| [REQ-074](REQ-074-brewery-challenges.md) | Brewery Challenges | 81 | ✅ Complete | [lib/challenges](../../lib/) | [challenges.test.ts](../../lib/__tests__/challenges.test.ts) | — |
| [REQ-075](REQ-075-sponsored-challenges.md) | Sponsored Challenges | 91 | ✅ Complete | [lib/sponsored-challenges](../../lib/) | [sponsored-challenges.test.ts](../../lib/__tests__/sponsored-challenges.test.ts) | [retro](../history/retros/sprint-91-retro.md) |
| [REQ-076](REQ-076-brewery-crm.md) | Brewery CRM | 89 | ✅ Complete | [lib/crm](../../lib/), [lib/brand-crm](../../lib/) | [crm.test.ts](../../lib/__tests__/crm.test.ts), [brand-crm.test.ts](../../lib/__tests__/brand-crm.test.ts) | — |
| [REQ-077](REQ-077-ad-engine.md) | Ad Engine | 93, 94 | ✅ Complete | [app/(brewery)/ads](../../app/) | ⚠️ gap | [retro](../history/retros/sprint-93-retro.md), [retro](../history/retros/sprint-94-retro.md) |
| [REQ-078](REQ-078-digital-mug-clubs.md) | Digital Mug Clubs | 94 | ✅ Complete | [lib/mug-club-perks](../../lib/) | [mug-club-perks.test.ts](../../lib/__tests__/mug-club-perks.test.ts) | [retro](../history/retros/sprint-94-retro.md) |
| [REQ-079](REQ-079-promotion-hub.md) | Promotion Hub | 95, 146 | ✅ Complete | [lib/promotions](../../lib/), [lib/ai-promotions](../../lib/) | [promotions.test.ts](../../lib/__tests__/promotions.test.ts), [ai-promotions.test.ts](../../lib/__tests__/ai-promotions.test.ts) | [retro](../history/retros/sprint-95-retro.md) |
| [REQ-080](REQ-080-fraud-prevention.md) | Fraud Prevention | 96 | ✅ Phase 1 Complete | [lib/rate-limiting](../../lib/), [lib/session-flow](../../lib/) | [rate-limiting.test.ts](../../lib/__tests__/rate-limiting.test.ts), [security-headers.test.ts](../../lib/__tests__/security-headers.test.ts) | [retro](../history/retros/sprint-96-retro.md) |
| [REQ-081](REQ-081-session-drawer.md) | Session Drawer Overhaul | 96 | ✅ Complete | [components/SessionDrawer](../../components/) | [session-flow.test.ts](../../lib/__tests__/session-flow.test.ts) | [retro](../history/retros/sprint-96-retro.md) |
| [REQ-082](REQ-082-tier-feature-matrix.md) | Tier/Feature Matrix | 96 | ✅ Complete | [lib/tier-gates](../../lib/), [lib/brand-tier-gates](../../lib/) | [tier-gates.test.ts](../../lib/__tests__/tier-gates.test.ts), [brand-tier-gates.test.ts](../../lib/__tests__/brand-tier-gates.test.ts) | [retro](../history/retros/sprint-96-retro.md) |
| [REQ-083](REQ-083-public-api-v1.md) | Public API v1 | 85 | ✅ Complete | [app/api/v1/](../../app/), [lib/api-keys](../../lib/) | [api-keys.test.ts](../../lib/__tests__/api-keys.test.ts), [api-keys-extended.test.ts](../../lib/__tests__/api-keys-extended.test.ts) | [retro](../history/retros/sprint-85-retro.md) |
| [REQ-084](REQ-084-beverage-colors.md) | Beverage Category Colors | 83 | ✅ Complete | [lib/beer-style-colors](../../lib/) | [beer-style-colors.test.ts](../../lib/__tests__/beer-style-colors.test.ts) | [retro](../history/retros/sprint-83-retro.md) |

## REQs to backfill (Wave 3)

These shipped features do not yet have a REQ file. [Sam](../../.claude/agents/sam.md) and [Sage](../../.claude/agents/sage.md) write minimal stubs (title, sprint, status, acceptance bullets, Implementation + Tests + History links) in Wave 3:

| Proposed REQ | Feature | Shipped | Tests | Retro |
|---|---|---|---|---|
| REQ-085 | Referrals + Group Sessions V1 | Sprint 37 | ⚠️ gap | — |
| REQ-086 | HopRoute Phase 1 + Live | Sprints 38-40 | [hop-route-concierge.test.ts](../../lib/__tests__/hop-route-concierge.test.ts) | — |
| REQ-087 | Three-Tab Feed | Sprint 27 | [api-feed.test.ts](../../lib/__tests__/api-feed.test.ts) | — |
| REQ-088 | Your Round | Sprint 29 | [your-round.test.ts](../../lib/__tests__/your-round.test.ts) | — |
| REQ-089 | Stripe Billing + E2E | Sprints 41-50 | [stripe.test.ts](../../lib/__tests__/stripe.test.ts) | — |
| REQ-090 | Smart Search (pg_trgm + typeahead) | Sprints 114, 138 | [sprint-138-bartender.test.ts](../../lib/__tests__/sprint-138-bartender.test.ts) | [retro](../history/retros/sprint-138-retro.md) |
| REQ-091 | Superadmin Command Center | Sprint 136 | [superadmin-metrics.test.ts](../../lib/__tests__/superadmin-metrics.test.ts), [superadmin-stats.test.ts](../../lib/__tests__/superadmin-stats.test.ts), [superadmin-brewery.test.ts](../../lib/__tests__/superadmin-brewery.test.ts) | [retro](../history/retros/sprint-136-retro.md) |
| REQ-092 | Superadmin Brewery Detail + Impersonation | Sprint 140 | [superadmin-brewery-list.test.ts](../../lib/__tests__/superadmin-brewery-list.test.ts), [superadmin-user.test.ts](../../lib/__tests__/superadmin-user.test.ts), [superadmin-intelligence.test.ts](../../lib/__tests__/superadmin-intelligence.test.ts) | [retro](../history/retros/sprint-140-retro.md) |
| REQ-093 | Data Standardization + Social Links | Sprints 132, 135 | [brewery-utils.test.ts](../../lib/__tests__/brewery-utils.test.ts) | [retro](../history/retros/sprint-132-retro.md), [retro](../history/retros/sprint-135-retro.md) |
| REQ-094 | Brewery Admin Nav Reorganization | Sprint 133 | [brewery-admin-nav.test.ts](../../lib/__tests__/brewery-admin-nav.test.ts) | [retro](../history/retros/sprint-133-retro.md) |
| REQ-095 | Multi-Tier Brand Team Roles | Sprint 122 | [brand-team-activity.test.ts](../../lib/__tests__/brand-team-activity.test.ts) | [retro](../history/retros/sprint-122-retro.md) |
| REQ-096 | Brand-Wide Loyalty Passport | Sprint 125 | [brand-loyalty.test.ts](../../lib/__tests__/brand-loyalty.test.ts) | [retro](../history/retros/sprint-125-retro.md) |
| REQ-097 | Storefront (Public Brewery Pages) | Sprint 131 | [storefront.test.ts](../../lib/__tests__/storefront.test.ts) | [retro](../history/retros/sprint-131-retro.md) |
| REQ-098 | Bartender Experience | Sprint 138 | [sprint-138-bartender.test.ts](../../lib/__tests__/sprint-138-bartender.test.ts) | [retro](../history/retros/sprint-138-retro.md) |
| REQ-099 | Tooltip/HelpIcon + Resources | Sprint 139 | [sprint-139-guide.test.ts](../../lib/__tests__/sprint-139-guide.test.ts) | [retro](../history/retros/sprint-139-retro.md) |
| REQ-100 | Cookie Consent + Compliance Audit | Sprints 77, 151 | [compliance-audit.test.ts](../../lib/__tests__/compliance-audit.test.ts), [age-verification.test.ts](../../lib/__tests__/age-verification.test.ts), [location-consent.test.ts](../../lib/__tests__/location-consent.test.ts), [legal-pages.test.ts](../../lib/__tests__/legal-pages.test.ts) | [retro](../history/retros/sprint-151-retro.md) |
| REQ-101 | Supabase Realtime (Tap Lists, Presence) | Sprint 156 | [realtime-hook.test.ts](../../lib/__tests__/realtime-hook.test.ts) | [retro](../history/retros/sprint-156-retro.md) |
| REQ-102 | Engagement Engine (Leaderboard, Streaks, Trending) | Sprint 157 | [api-leaderboard.test.ts](../../lib/__tests__/api-leaderboard.test.ts), [trending.test.ts](../../lib/__tests__/trending.test.ts) | [retro](../history/retros/sprint-157-retro.md) |
| REQ-103 | FTC Disclosures + Age Gate | Sprint 156 | [ftc-disclosure.test.tsx](../../lib/__tests__/ftc-disclosure.test.tsx), [age-verification.test.ts](../../lib/__tests__/age-verification.test.ts) | [retro](../history/retros/sprint-156-retro.md) |
| REQ-104 | Intelligence Layer (Magic Number, Brewery Health, Benchmarks) | Sprints 158-159 | [superadmin-intelligence.test.ts](../../lib/__tests__/superadmin-intelligence.test.ts), [brewery-health.test.ts](../../lib/__tests__/brewery-health.test.ts), [brewery-benchmarks.test.ts](../../lib/__tests__/brewery-benchmarks.test.ts), [win-back.test.ts](../../lib/__tests__/win-back.test.ts) | [retro](../history/retros/sprint-159-retro.md) |
| REQ-105 | Consumer IA Restructure (PillTabs, Explore modes) | Sprint 160 | [pill-tabs.test.tsx](../../lib/__tests__/pill-tabs.test.tsx) | [retro](../history/retros/sprint-160-retro.md) |
| REQ-106 | Sensory Vibe (XP Variable, Celebration, Liquid Glass) | Sprint 161 | [xp-variable.test.ts](../../lib/__tests__/xp-variable.test.ts) | [retro](../history/retros/sprint-161-retro.md) |
| REQ-107 | Personality Axes + Four Favorites | Sprint 162 | [personality.test.ts](../../lib/__tests__/personality.test.ts), [personality-axis-labels.test.ts](../../lib/__tests__/personality-axis-labels.test.ts) | [retro](../history/retros/sprint-162-retro.md) |
| REQ-108 | Glow-Up (Depth, Shadow System) | Sprints 163-166 | [landing-colors.test.ts](../../lib/__tests__/landing-colors.test.ts) | [retro](../history/retros/sprint-166-retro.md) |
| REQ-109 | Board Display Formats | Sprint 167 | [board-settings.test.ts](../../lib/__tests__/board-settings.test.ts), [board-themes.test.ts](../../lib/__tests__/board-themes.test.ts), [board-display-scale.test.ts](../../lib/__tests__/board-display-scale.test.ts) | [retro](../history/retros/sprint-167-retro.md) |
| REQ-110 | Consumer Pages Polish | Sprint 168 | ⚠️ gap | [retro](../history/retros/sprint-168-retro.md) |
| REQ-111 | Podium, Rarity Rings, Mosaics, Haptic | Sprint 169 | [useHaptic.test.ts](../../hooks/__tests__/useHaptic.test.ts) | [retro](../history/retros/sprint-169-retro.md) |
| REQ-112 | Detent Sheet, OLED Black, Motion Normalization | Sprint 170 | [useDetentSheet.test.ts](../../hooks/__tests__/useDetentSheet.test.ts), [motion-imports.test.ts](../../lib/__tests__/motion-imports.test.ts) | [retro](../history/retros/sprint-170-retro.md) |
| REQ-113 | Consumer UI Overhaul (Tokens) | Sprint 171 | [landing-colors.test.ts](../../lib/__tests__/landing-colors.test.ts) | — *(retro file pending)* |
| REQ-114 | Design Audit Implementation | Sprint 172 | ⚠️ gap | — *(retro file pending)* |
| REQ-115 | Display Suite Foundation | Sprint 175 | [board-display-scale.test.ts](../../lib/__tests__/board-display-scale.test.ts), [board-themes.test.ts](../../lib/__tests__/board-themes.test.ts) | [retro](../history/retros/sprint-175-retro.md) |
| REQ-116 | Sensory Layer (SRM, Aroma/Taste/Finish) | Sprint 176 | [beer-sensory.test.ts](../../lib/__tests__/beer-sensory.test.ts), [srm-colors.test.ts](../../lib/__tests__/srm-colors.test.ts), [SensoryNotesPicker.test.tsx](../../components/__tests__/SensoryNotesPicker.test.tsx) | [retro](../history/retros/sprint-176-retro.md) |
| REQ-117 | Stat Write-Path Guards (Orphan Fix) | Sprint 177 | [stat-write-paths.test.ts](../../lib/__tests__/stat-write-paths.test.ts), [orphaned-columns-guard.test.ts](../../lib/__tests__/orphaned-columns-guard.test.ts) | — |
| REQ-118 | HopRoute Concierge (Taste Fingerprint) | Sprint 178 | [hop-route-concierge.test.ts](../../lib/__tests__/hop-route-concierge.test.ts) | [retro](../history/retros/sprint-178-retro.md) |

## Conventions for REQ files

Every REQ file should end with this footer (inline-linked, not just listed):

```markdown
## Implementation
- Primary: [lib/foo.ts](../../lib/foo.ts), [app/(brewery)/bar/page.tsx](../../app/(brewery)/bar/page.tsx)
- Migration: [supabase/migrations/NNN_name.sql](../../supabase/migrations/NNN_name.sql)

## Tests
- Unit: [lib/__tests__/foo.test.ts](../../lib/__tests__/foo.test.ts)
- E2E: frozen in [e2e.frozen/](../../e2e.frozen/)

## History
- Shipped: [Sprint NNN](../history/retros/sprint-NNN-retro.md)
- Plan: [sprint-NNN-plan.md](../history/plans/sprint-NNN-plan.md)
```

Acceptance criteria prose should link inline to the component, helper, or schema being referenced (e.g. "when the user taps the wishlist button" → link to [components/ui/WishlistButton.tsx](../../components/ui/WishlistButton.tsx)).

## Cross-links

- **Reverse index** (test → REQ) lives in [testing/README.md](../testing/README.md).
- **Architecture** to understand *how* each REQ fits: [architecture/README.md](../architecture/README.md).
- **Retros** to read *how* each REQ shipped: [history/README.md](../history/README.md).
- **QA checklist template** for new REQs: [QA-checklist-template.md](QA-checklist-template.md).

---

> **Status (2026-04-15):** 30 existing REQ files have accurate RTM entries; 34 backfill REQs are named and mapped but the stub files aren't written yet — Sam and Sage own Wave 3. Gaps flagged honestly with `⚠️ gap`.
