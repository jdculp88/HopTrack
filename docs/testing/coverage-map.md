# Coverage Map — Reverse RTM Index

*Test file → REQ(s) it covers.* The inverse of the [RTM](../requirements/README.md). Owned by [Casey](../../.claude/agents/casey.md) and [Reese](../../.claude/agents/qa-automation.md).

**Back to [testing](README.md) · [wiki home](../README.md).**

---

## How to read this page

Every test file in [lib/__tests__/](../../lib/__tests__/), [components/__tests__/](../../components/__tests__/), and [hooks/__tests__/](../../hooks/__tests__/) appears in a row below with the REQ(s) it covers. A test can cover multiple REQs; a REQ can be covered by multiple tests — the [RTM](../requirements/README.md) goes the other way.

If a test is marked **cross-cutting**, it doesn't map to a single REQ — it guards platform-wide invariants (DRY patterns, rate limiting, RLS safety, type audits, health checks, etc.). These are the suite's backbone.

## The map

### lib/__tests__ (components, services, business logic)

| Test file | Covers |
|---|---|
| [a11y.test.tsx](../../lib/__tests__/a11y.test.tsx) | cross-cutting (WCAG compliance) |
| [age-verification.test.ts](../../lib/__tests__/age-verification.test.ts) | [REQ-100](../requirements/REQ-100-compliance-cookies.md), [REQ-103](../requirements/REQ-103-ftc-age-gate.md) |
| [ai-promotions.test.ts](../../lib/__tests__/ai-promotions.test.ts) | [REQ-079](../requirements/REQ-079-promotion-hub.md) |
| [api-feed.test.ts](../../lib/__tests__/api-feed.test.ts) | [REQ-087](../requirements/REQ-087-three-tab-feed.md) |
| [api-helpers.test.ts](../../lib/__tests__/api-helpers.test.ts) | cross-cutting (API patterns) |
| [api-keys.test.ts](../../lib/__tests__/api-keys.test.ts) | [REQ-083](../requirements/REQ-083-public-api-v1.md) |
| [api-keys-extended.test.ts](../../lib/__tests__/api-keys-extended.test.ts) | [REQ-083](../requirements/REQ-083-public-api-v1.md) |
| [api-leaderboard.test.ts](../../lib/__tests__/api-leaderboard.test.ts) | [REQ-102](../requirements/REQ-102-engagement-engine.md) |
| [api-response-patterns.test.ts](../../lib/__tests__/api-response-patterns.test.ts) | cross-cutting (API response convention) |
| [api-response.test.ts](../../lib/__tests__/api-response.test.ts) | cross-cutting |
| [beer-sensory.test.ts](../../lib/__tests__/beer-sensory.test.ts) | [REQ-010](../requirements/REQ-010-flavor-tags-serving-styles.md), [REQ-116](../requirements/REQ-116-sensory-layer.md) |
| [beer-style-colors.test.ts](../../lib/__tests__/beer-style-colors.test.ts) | [REQ-084](../requirements/REQ-084-beverage-colors.md) |
| [board-display-scale.test.ts](../../lib/__tests__/board-display-scale.test.ts) | [REQ-006](../requirements/REQ-006-tv-display.md), [REQ-109](../requirements/REQ-109-board-display-formats.md), [REQ-115](../requirements/REQ-115-display-suite.md) |
| [board-settings.test.ts](../../lib/__tests__/board-settings.test.ts) | [REQ-006](../requirements/REQ-006-tv-display.md), [REQ-109](../requirements/REQ-109-board-display-formats.md) |
| [board-themes.test.ts](../../lib/__tests__/board-themes.test.ts) | [REQ-006](../requirements/REQ-006-tv-display.md), [REQ-115](../requirements/REQ-115-display-suite.md) |
| [brand-auth.test.ts](../../lib/__tests__/brand-auth.test.ts) | [REQ-004](../requirements/REQ-004-brewery-accounts.md), [REQ-072](../requirements/REQ-072-multi-location-brewery-support.md), [REQ-095](../requirements/REQ-095-brand-team-roles.md) |
| [brand-billing.test.ts](../../lib/__tests__/brand-billing.test.ts) | [REQ-089](../requirements/REQ-089-stripe-billing.md), [REQ-072](../requirements/REQ-072-multi-location-brewery-support.md) |
| [brand-crm.test.ts](../../lib/__tests__/brand-crm.test.ts) | [REQ-072](../requirements/REQ-072-multi-location-brewery-support.md), [REQ-076](../requirements/REQ-076-brewery-crm.md) |
| [brand-digest.test.ts](../../lib/__tests__/brand-digest.test.ts) | [REQ-072](../requirements/REQ-072-multi-location-brewery-support.md) |
| [brand-loyalty.test.ts](../../lib/__tests__/brand-loyalty.test.ts) | [REQ-003](../requirements/REQ-003-loyalty-system.md), [REQ-096](../requirements/REQ-096-brand-loyalty.md) |
| [brand-onboarding.test.ts](../../lib/__tests__/brand-onboarding.test.ts) | [REQ-072](../requirements/REQ-072-multi-location-brewery-support.md) |
| [brand-propagation.test.ts](../../lib/__tests__/brand-propagation.test.ts) | [REQ-072](../requirements/REQ-072-multi-location-brewery-support.md) |
| [brand-routes-use-shared-auth.test.ts](../../lib/__tests__/brand-routes-use-shared-auth.test.ts) | [REQ-072](../requirements/REQ-072-multi-location-brewery-support.md), cross-cutting (DRY auth) |
| [brand-team-activity.test.ts](../../lib/__tests__/brand-team-activity.test.ts) | [REQ-072](../requirements/REQ-072-multi-location-brewery-support.md), [REQ-095](../requirements/REQ-095-brand-team-roles.md) |
| [brand-tier-gates.test.ts](../../lib/__tests__/brand-tier-gates.test.ts) | [REQ-072](../requirements/REQ-072-multi-location-brewery-support.md), [REQ-082](../requirements/REQ-082-tier-feature-matrix.md) |
| [breweries-api-consistency.test.ts](../../lib/__tests__/breweries-api-consistency.test.ts) | cross-cutting (API consistency) |
| [brewery-admin-nav.test.ts](../../lib/__tests__/brewery-admin-nav.test.ts) | [REQ-094](../requirements/REQ-094-brewery-admin-nav.md) |
| [brewery-benchmarks.test.ts](../../lib/__tests__/brewery-benchmarks.test.ts) | [REQ-007](../requirements/REQ-007-brewery-insights.md), [REQ-104](../requirements/REQ-104-intelligence-layer.md) |
| [brewery-health.test.ts](../../lib/__tests__/brewery-health.test.ts) | [REQ-007](../requirements/REQ-007-brewery-insights.md), [REQ-104](../requirements/REQ-104-intelligence-layer.md) |
| [brewery-page-safety.test.ts](../../lib/__tests__/brewery-page-safety.test.ts) | cross-cutting (safety guards) |
| [brewery-utils.test.ts](../../lib/__tests__/brewery-utils.test.ts) | [REQ-093](../requirements/REQ-093-data-standardization.md) |
| [challenges.test.ts](../../lib/__tests__/challenges.test.ts) | [REQ-074](../requirements/REQ-074-brewery-challenges.md) |
| [compliance-audit.test.ts](../../lib/__tests__/compliance-audit.test.ts) | [REQ-100](../requirements/REQ-100-compliance-cookies.md) |
| [crm.test.ts](../../lib/__tests__/crm.test.ts) | [REQ-076](../requirements/REQ-076-brewery-crm.md) |
| [cron-ai-suggestions.test.ts](../../lib/__tests__/cron-ai-suggestions.test.ts) | [REQ-071](../requirements/REQ-071-the-barback-ai-beer-crawler.md) |
| [cron-onboarding-drip.test.ts](../../lib/__tests__/cron-onboarding-drip.test.ts) | cross-cutting (cron workflow) |
| [cron-trial-lifecycle.test.ts](../../lib/__tests__/cron-trial-lifecycle.test.ts) | [REQ-089](../requirements/REQ-089-stripe-billing.md) |
| [cron-weekly-digest.test.ts](../../lib/__tests__/cron-weekly-digest.test.ts) | [REQ-072](../requirements/REQ-072-multi-location-brewery-support.md) |
| [digest-recommendations.test.ts](../../lib/__tests__/digest-recommendations.test.ts) | [REQ-104](../requirements/REQ-104-intelligence-layer.md) |
| [dry-patterns.test.ts](../../lib/__tests__/dry-patterns.test.ts) | cross-cutting (DRY enforcement) |
| [email-health.test.ts](../../lib/__tests__/email-health.test.ts) | cross-cutting (email) |
| [email-triggers.test.ts](../../lib/__tests__/email-triggers.test.ts) | cross-cutting (email) |
| [email.test.ts](../../lib/__tests__/email.test.ts) | cross-cutting (email) |
| [env-audit.test.ts](../../lib/__tests__/env-audit.test.ts) | cross-cutting (env config) |
| [env.test.ts](../../lib/__tests__/env.test.ts) | cross-cutting (env config) |
| [error-boundary.test.tsx](../../lib/__tests__/error-boundary.test.tsx) | [REQ-102](../requirements/REQ-102-engagement-engine.md) |
| [for-breweries.test.ts](../../lib/__tests__/for-breweries.test.ts) | cross-cutting |
| [ftc-disclosure.test.tsx](../../lib/__tests__/ftc-disclosure.test.tsx) | [REQ-103](../requirements/REQ-103-ftc-age-gate.md) |
| [geo.test.ts](../../lib/__tests__/geo.test.ts) | cross-cutting (geo utilities) |
| [health-extended.test.ts](../../lib/__tests__/health-extended.test.ts) | cross-cutting (/api/health) |
| [health.test.ts](../../lib/__tests__/health.test.ts) | cross-cutting (/api/health) |
| [hooks.test.ts](../../lib/__tests__/hooks.test.ts) | cross-cutting (hooks) |
| [hop-route-concierge.test.ts](../../lib/__tests__/hop-route-concierge.test.ts) | [REQ-086](../requirements/REQ-086-hoproute-phase1.md), [REQ-118](../requirements/REQ-118-hoproute-concierge.md) |
| [integration/user-flows.test.ts](../../lib/__tests__/integration/user-flows.test.ts) | cross-cutting (integration) |
| [kpi.test.ts](../../lib/__tests__/kpi.test.ts) | [REQ-007](../requirements/REQ-007-brewery-insights.md), [REQ-069](../requirements/REQ-069-enhanced-kpis-analytics.md) |
| [landing-colors.test.ts](../../lib/__tests__/landing-colors.test.ts) | [REQ-108](../requirements/REQ-108-glow-up-depth.md), [REQ-113](../requirements/REQ-113-consumer-ui-overhaul.md) |
| [legal-pages.test.ts](../../lib/__tests__/legal-pages.test.ts) | [REQ-100](../requirements/REQ-100-compliance-cookies.md) |
| [location-consent.test.ts](../../lib/__tests__/location-consent.test.ts) | [REQ-100](../requirements/REQ-100-compliance-cookies.md) |
| [logger.test.ts](../../lib/__tests__/logger.test.ts) | cross-cutting (logging) |
| [menus.test.ts](../../lib/__tests__/menus.test.ts) | [REQ-002](../requirements/REQ-002-brewery-images-beer-menus.md), [REQ-070](../requirements/REQ-070-brewery-menu-uploads.md) |
| [moderation.test.ts](../../lib/__tests__/moderation.test.ts) | [REQ-103](../requirements/REQ-103-ftc-age-gate.md) |
| [motion-imports.test.ts](../../lib/__tests__/motion-imports.test.ts) | [REQ-112](../requirements/REQ-112-detent-oled-motion.md), cross-cutting |
| [mug-club-perks.test.ts](../../lib/__tests__/mug-club-perks.test.ts) | [REQ-003](../requirements/REQ-003-loyalty-system.md), [REQ-078](../requirements/REQ-078-digital-mug-clubs.md) |
| [notification-categories.test.ts](../../lib/__tests__/notification-categories.test.ts) | cross-cutting (notifications) |
| [orphaned-columns-guard.test.ts](../../lib/__tests__/orphaned-columns-guard.test.ts) | [REQ-117](../requirements/REQ-117-stat-write-paths.md), cross-cutting |
| [percentiles.test.ts](../../lib/__tests__/percentiles.test.ts) | [REQ-107](../requirements/REQ-107-personality-axes-four-favorites.md) |
| [personality.test.ts](../../lib/__tests__/personality.test.ts) | [REQ-107](../requirements/REQ-107-personality-axes-four-favorites.md) |
| [personality-axis-labels.test.ts](../../lib/__tests__/personality-axis-labels.test.ts) | [REQ-107](../requirements/REQ-107-personality-axes-four-favorites.md) |
| [pill-tabs.test.tsx](../../lib/__tests__/pill-tabs.test.tsx) | [REQ-105](../requirements/REQ-105-consumer-ia-restructure.md) |
| [pint-rewind.test.ts](../../lib/__tests__/pint-rewind.test.ts) | [REQ-005](../requirements/REQ-005-wrapped-recaps.md) |
| [pos-sync.test.ts](../../lib/__tests__/pos-sync.test.ts) | [REQ-073](../requirements/REQ-073-pos-integration.md) |
| [promotions.test.ts](../../lib/__tests__/promotions.test.ts) | [REQ-079](../requirements/REQ-079-promotion-hub.md) |
| [rate-limiting.test.ts](../../lib/__tests__/rate-limiting.test.ts) | [REQ-080](../requirements/REQ-080-fraud-prevention.md), cross-cutting |
| [realtime-hook.test.ts](../../lib/__tests__/realtime-hook.test.ts) | [REQ-101](../requirements/REQ-101-supabase-realtime.md) |
| [recommendations-ai.test.ts](../../lib/__tests__/recommendations-ai.test.ts) | cross-cutting (AI) |
| [retry.test.ts](../../lib/__tests__/retry.test.ts) | cross-cutting (retry util) |
| [review-report.test.ts](../../lib/__tests__/review-report.test.ts) | [REQ-103](../requirements/REQ-103-ftc-age-gate.md) |
| [rls-safety.test.ts](../../lib/__tests__/rls-safety.test.ts) | cross-cutting (RLS safety) |
| [roi-extended.test.ts](../../lib/__tests__/roi-extended.test.ts) | [REQ-007](../requirements/REQ-007-brewery-insights.md) |
| [roi.test.ts](../../lib/__tests__/roi.test.ts) | [REQ-007](../requirements/REQ-007-brewery-insights.md) |
| [schemas.test.ts](../../lib/__tests__/schemas.test.ts) | [REQ-102](../requirements/REQ-102-engagement-engine.md), cross-cutting (Zod) |
| [security-headers.test.ts](../../lib/__tests__/security-headers.test.ts) | [REQ-080](../requirements/REQ-080-fraud-prevention.md), cross-cutting |
| [session-flow.test.ts](../../lib/__tests__/session-flow.test.ts) | [REQ-025](../requirements/REQ-025-sessions-tap-wall.md), [REQ-081](../requirements/REQ-081-session-drawer.md) |
| [session-og.test.ts](../../lib/__tests__/session-og.test.ts) | [REQ-025](../requirements/REQ-025-sessions-tap-wall.md), [REQ-101](../requirements/REQ-101-supabase-realtime.md) |
| [share.test.ts](../../lib/__tests__/share.test.ts) | [REQ-009](../requirements/REQ-009-reactions-wishlist.md) |
| [smart-triggers.test.ts](../../lib/__tests__/smart-triggers.test.ts) | cross-cutting |
| [sponsored-challenges.test.ts](../../lib/__tests__/sponsored-challenges.test.ts) | [REQ-075](../requirements/REQ-075-sponsored-challenges.md) |
| [sprint-138-bartender.test.ts](../../lib/__tests__/sprint-138-bartender.test.ts) | [REQ-090](../requirements/REQ-090-smart-search.md), [REQ-098](../requirements/REQ-098-bartender-experience.md) |
| [sprint-139-guide.test.ts](../../lib/__tests__/sprint-139-guide.test.ts) | [REQ-099](../requirements/REQ-099-tooltip-resources.md) |
| [srm-colors.test.ts](../../lib/__tests__/srm-colors.test.ts) | [REQ-010](../requirements/REQ-010-flavor-tags-serving-styles.md), [REQ-116](../requirements/REQ-116-sensory-layer.md) |
| [stat-write-paths.test.ts](../../lib/__tests__/stat-write-paths.test.ts) | [REQ-117](../requirements/REQ-117-stat-write-paths.md) |
| [stats-query-limits.test.ts](../../lib/__tests__/stats-query-limits.test.ts) | cross-cutting (query limits) |
| [storefront.test.ts](../../lib/__tests__/storefront.test.ts) | [REQ-097](../requirements/REQ-097-storefront.md) |
| [stripe.test.ts](../../lib/__tests__/stripe.test.ts) | [REQ-089](../requirements/REQ-089-stripe-billing.md) |
| [superadmin-brewery.test.ts](../../lib/__tests__/superadmin-brewery.test.ts) | [REQ-091](../requirements/REQ-091-superadmin-command-center.md) |
| [superadmin-brewery-list.test.ts](../../lib/__tests__/superadmin-brewery-list.test.ts) | [REQ-092](../requirements/REQ-092-superadmin-brewery-detail.md) |
| [superadmin-intelligence.test.ts](../../lib/__tests__/superadmin-intelligence.test.ts) | [REQ-092](../requirements/REQ-092-superadmin-brewery-detail.md), [REQ-104](../requirements/REQ-104-intelligence-layer.md) |
| [superadmin-metrics.test.ts](../../lib/__tests__/superadmin-metrics.test.ts) | [REQ-091](../requirements/REQ-091-superadmin-command-center.md) |
| [superadmin-stats.test.ts](../../lib/__tests__/superadmin-stats.test.ts) | [REQ-091](../requirements/REQ-091-superadmin-command-center.md) |
| [superadmin-user.test.ts](../../lib/__tests__/superadmin-user.test.ts) | [REQ-092](../requirements/REQ-092-superadmin-brewery-detail.md) |
| [tap-list-types.test.ts](../../lib/__tests__/tap-list-types.test.ts) | [REQ-025](../requirements/REQ-025-sessions-tap-wall.md) |
| [temporal.test.ts](../../lib/__tests__/temporal.test.ts) | cross-cutting (time utilities) |
| [tier-gates.test.ts](../../lib/__tests__/tier-gates.test.ts) | [REQ-082](../requirements/REQ-082-tier-feature-matrix.md) |
| [trending.test.ts](../../lib/__tests__/trending.test.ts) | [REQ-102](../requirements/REQ-102-engagement-engine.md) |
| [type-safety-audit.test.ts](../../lib/__tests__/type-safety-audit.test.ts) | cross-cutting (type safety) |
| [use-cache-audit.test.ts](../../lib/__tests__/use-cache-audit.test.ts) | [REQ-104](../requirements/REQ-104-intelligence-layer.md), cross-cutting (`use cache`) |
| [user-avatar.test.tsx](../../lib/__tests__/user-avatar.test.tsx) | cross-cutting (avatar) |
| [view-transitions.test.ts](../../lib/__tests__/view-transitions.test.ts) | [REQ-102](../requirements/REQ-102-engagement-engine.md) |
| [waitlist-schema.test.ts](../../lib/__tests__/waitlist-schema.test.ts) | cross-cutting (waitlist) |
| [wcag-skip-links.test.ts](../../lib/__tests__/wcag-skip-links.test.ts) | cross-cutting (WCAG) |
| [win-back.test.ts](../../lib/__tests__/win-back.test.ts) | [REQ-104](../requirements/REQ-104-intelligence-layer.md) |
| [wrapped.test.ts](../../lib/__tests__/wrapped.test.ts) | [REQ-005](../requirements/REQ-005-wrapped-recaps.md) |
| [xp.test.ts](../../lib/__tests__/xp.test.ts) | [REQ-008](../requirements/REQ-008-xp-leveling-system.md) |
| [xp-variable.test.ts](../../lib/__tests__/xp-variable.test.ts) | [REQ-008](../requirements/REQ-008-xp-leveling-system.md), [REQ-106](../requirements/REQ-106-sensory-vibe.md) |
| [your-round.test.ts](../../lib/__tests__/your-round.test.ts) | [REQ-088](../requirements/REQ-088-your-round.md), [REQ-107](../requirements/REQ-107-personality-axes-four-favorites.md) |

### components/__tests__

| Test file | Covers |
|---|---|
| [SensoryNotesPicker.test.tsx](../../components/__tests__/SensoryNotesPicker.test.tsx) | [REQ-116](../requirements/REQ-116-sensory-layer.md) |
| [theme-toggle.test.tsx](../../components/__tests__/theme-toggle.test.tsx) | [REQ-001](../requirements/REQ-001-theme-toggle.md) |

### hooks/__tests__

| Test file | Covers |
|---|---|
| [useDetentSheet.test.ts](../../hooks/__tests__/useDetentSheet.test.ts) | [REQ-112](../requirements/REQ-112-detent-oled-motion.md) |
| [useHaptic.test.ts](../../hooks/__tests__/useHaptic.test.ts) | [REQ-111](../requirements/REQ-111-podium-haptic.md) |
| [useLongPress.test.ts](../../hooks/__tests__/useLongPress.test.ts) | [REQ-106](../requirements/REQ-106-sensory-vibe.md) |

### e2e.frozen

Frozen since [Sprint 173](../history/retros/sprint-173-ci-unblock.md). 87 specs at freeze time. Not currently mapped to REQs because none run in CI; re-map on thaw.

## Known coverage gaps

The [RTM](../requirements/README.md) marks these with `⚠️ gap`:

- [REQ-012 Beer Wishlist](../requirements/REQ-012-beer-wishlist.md) — no dedicated wishlist test
- [REQ-077 Ad Engine](../requirements/REQ-077-ad-engine.md) — ad engine test coverage pending
- [REQ-085 Referrals + Group Sessions](../requirements/REQ-085-referrals-group-sessions.md) — backfill, no direct test
- [REQ-110 Consumer Pages Polish](../requirements/REQ-110-consumer-pages-polish.md) — polish covered by component tests but no polish-specific suite
- [REQ-114 Design Audit](../requirements/REQ-114-design-audit.md) — audit was visual/structural
- [REQ-009 Reactions & Wishlist](../requirements/REQ-009-reactions-wishlist.md) — partial via share.test.ts
- REQ-013 Beer Passport — no dedicated test, UI-level only

Casey files these as carryover tasks; Reese writes the specs that close them.

## Cross-links

- **Forward RTM** (REQ → Test) — [requirements/README.md](../requirements/README.md).
- **Testing strategy** — [testing/README.md](README.md).
- **hoptrack-testing skill** — [.claude/skills/hoptrack-testing/SKILL.md](../../.claude/skills/hoptrack-testing/SKILL.md).

---

> **Status (2026-04-15):** every test file in `lib/__tests__/`, `components/__tests__/`, and `hooks/__tests__/` is accounted for. The 7 coverage gaps above are the honest list.
