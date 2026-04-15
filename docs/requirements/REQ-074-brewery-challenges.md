# REQ-074: Brewery Challenge System

**Status:** COMPLETE
**Sprint:** 81 (The Challenge)
**Feature:** F-019

## Overview
End-to-end brewery challenge system allowing brewery admins to create challenges that consumers can discover, participate in, and complete for rewards. Supports four challenge types with automatic progress tracking and completion detection.

## Requirements
- Four challenge types: `visit_count` (visit N times), `beer_count` (log N unique beers), `specific_beer` (log a particular beer), `style_explorer` (log N distinct styles)
- Brewery admin CRUD: create, edit, delete challenges with title, description, type, target value, reward text, start/end dates
- Consumer discovery: challenges appear on brewery detail page and in feed
- Progress tracking: automatic increment on session end / beer log based on challenge type
- Auto-completion: challenge marked complete when target met, celebration shown to user
- Feed card: `ChallengeFeedCard` displays challenge progress and completion in home feed
- Migration 054: `brewery_challenges` and `challenge_progress` tables with RLS

## Acceptance Criteria
- Admin can create all 4 challenge types with validation (target > 0, end date > start date)
- Consumer sees available challenges on brewery page with progress bar
- Progress increments automatically on relevant actions (no manual tracking)
- Completed challenges show celebration overlay and feed card
- Expired challenges stop accepting progress
- Delete uses inline AnimatePresence confirmation (no browser dialogs)
- 29 Vitest tests passing

## Technical Notes
- Tables: `brewery_challenges` (brewery-scoped), `challenge_progress` (user + challenge FK)
- RLS: brewery admins manage own challenges; authenticated users read all, write own progress
- Progress update runs in session-end API and beer-log API as post-action side effect
- Challenge types are enum-validated at API level

---

## RTM Links

### Implementation
[lib/challenges](../../lib/)

### Tests
[challenges.test.ts](../../lib/__tests__/challenges.test.ts)

### History
- [retro](../history/retros/sprint-81-retro.md)
- [plan](../history/plans/sprint-81-plan.md)

## See also
[REQ-075](REQ-075-sponsored-challenges.md)

> Added 2026-04-15 during the wiki reorg — see the [RTM](README.md) for the master table.
