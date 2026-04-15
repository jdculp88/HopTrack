# REQ-079: Promotion Hub

**Status:** COMPLETE
**Sprint:** 95 (The Hub)
**Feature:** F-029

## Overview
Centralized promotion management dashboard for brewery admins, providing a single view of all active and expired promotions with summary analytics.

## Requirements
- Unified promotion view: aggregates challenges, sponsored challenges, ads, and loyalty offers into one page
- Active vs. expired tabs: promotions sorted by status with clear visual separation
- Summary analytics: total impressions, clicks, completions, and engagement rate per promotion
- Promotion type badges: visual indicator for each promotion type (challenge, ad, loyalty, sponsored)
- Quick actions: pause, resume, edit, and delete promotions inline
- Empty state: friendly message with CTA to create first promotion when none exist
- Filters: by promotion type, date range, and status

## Acceptance Criteria
- Brewery admin sees all promotions in one unified list
- Active and expired tabs filter correctly
- Analytics numbers match individual promotion detail pages
- Quick actions (pause/resume/delete) work inline with optimistic updates
- Delete uses inline AnimatePresence confirmation
- Page loads with skeleton state
- Empty state shows when brewery has no promotions of any kind
- Filters narrow results correctly and persist in URL params

## Technical Notes
- Aggregation query joins across `brewery_challenges`, `sponsored_challenges`, `brewery_ads`, and loyalty tables
- Analytics computed server-side and passed as props (no client-side aggregation)
- Reuses existing CRUD endpoints for each promotion type (no new API routes)
- URL params for active tab and filters (shareable state)
- HopRoute config relocated to Settings during this sprint (cleanup)

---

## RTM Links

### Implementation
[lib/promotions](../../lib/), [lib/ai-promotions](../../lib/)

### Tests
[promotions.test.ts](../../lib/__tests__/promotions.test.ts), [ai-promotions.test.ts](../../lib/__tests__/ai-promotions.test.ts)

### History
- [retro](../history/retros/sprint-95-retro.md)
- [plan](../history/plans/sprint-95-plan.md)

> Added 2026-04-15 during the wiki reorg — see the [RTM](README.md) for the master table.
