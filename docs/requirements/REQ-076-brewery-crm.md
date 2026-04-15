# REQ-076: Brewery CRM

**Status:** COMPLETE
**Sprint:** 89 (The Rolodex)
**Feature:** F-025

## Overview
Customer relationship management system for brewery admins, providing customer profiles with engagement scoring, automatic segmentation, and targeted messaging capabilities.

## Requirements
- Customer profiles: visit history, beers logged, loyalty status, last visit, total sessions
- Engagement scoring: 1-100 score calculated from visit frequency, recency, loyalty activity, and social engagement
- Automatic segmentation: VIP (score 80+), Power (50-79), Regular (20-49), New (< 20)
- Segment-based filtering: admin can view and message customers by segment
- Segmented messaging: send targeted notifications to specific customer segments
- Profile builder: `lib/crm.ts` with `buildCustomerProfile()`, `calculateEngagementScore()`, `getCustomerSegment()`
- CRM page in brewery admin with customer list, segment filters, and profile detail view

## Acceptance Criteria
- Brewery admin sees customer list sorted by engagement score (highest first)
- Segment filter pills (All / VIP / Power / Regular / New) filter the list in real-time
- Customer profile shows visit timeline, top beers, loyalty status, and engagement breakdown
- Engagement score updates reflect actual user activity (not stale)
- Segmented messaging sends push notifications only to selected segment
- Messaging respects existing rate limits (5/hr per brewery)
- CRM page loads with skeleton and handles empty state (no customers yet)

## Technical Notes
- `lib/crm.ts` exports profile builder, scoring algorithm, and segment classifier
- Scoring weights: recency (30%), frequency (30%), loyalty (20%), social (20%)
- Segments are computed at query time (not stored) to stay current
- Reuses existing `messages` API with added segment filter parameter
- No new migration required — queries existing sessions, beer_logs, loyalty tables

---

## RTM Links

### Implementation
[lib/crm](../../lib/), [lib/brand-crm](../../lib/)

### Tests
[crm.test.ts](../../lib/__tests__/crm.test.ts), [brand-crm.test.ts](../../lib/__tests__/brand-crm.test.ts)

### History
- [retro](../history/retros/sprint-89-retro.md)
- *(no dedicated plan file)*

> Added 2026-04-15 during the wiki reorg — see the [RTM](README.md) for the master table.
