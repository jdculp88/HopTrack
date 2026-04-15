# REQ-078: Digital Mug Clubs

**Status:** COMPLETE
**Sprint:** 94 (The Club)
**Feature:** F-020

## Overview
Digital mug club system replacing physical membership cards, allowing breweries to create paid membership clubs with perks that consumers can join, manage, and redeem benefits from.

## Requirements
- Club CRUD: brewery admin creates clubs with name, description, annual fee, max members, perks list
- Perks management: free-text perk items (e.g., "10% off all pours", "Free birthday beer", "Members-only releases")
- Member management: admin views member list, can remove members, sees join date and status
- Consumer join flow: discover clubs on brewery page, view perks, join (payment stubbed for Phase 1)
- Perk claiming: members can claim perks with staff confirmation
- Member badge: active mug club members show badge on brewery profile
- Club status: active/paused/archived lifecycle managed by brewery admin

## Acceptance Criteria
- Brewery admin can create a mug club with name, fee, perks, and member cap
- Consumer sees available clubs on brewery detail page with perk list
- Consumer can join a club (join button, confirmation)
- Active member sees "Member" badge and can access perk claiming
- Admin sees member list with count, join dates, and removal option
- Archived clubs stop accepting new members but existing members retain access
- Member cap enforced (join button disabled when full)

## Technical Notes
- Migration: `mug_clubs` table (brewery-scoped), `mug_club_members` (user + club FK), `mug_club_perk_claims`
- RLS: brewery admins manage own clubs; authenticated users read clubs, manage own membership
- Payment integration stubbed — join is free in Phase 1, fee is display-only
- Perk claiming reuses redemption code pattern from loyalty system
- Club discovery query filters by active status and available capacity

---

## RTM Links

### Implementation
[lib/mug-club-perks](../../lib/)

### Tests
[mug-club-perks.test.ts](../../lib/__tests__/mug-club-perks.test.ts)

### History
- [retro](../history/retros/sprint-94-retro.md)
- [plan](../history/plans/sprint-94-plan.md)

## See also
[REQ-003](REQ-003-loyalty-system.md)

> Added 2026-04-15 during the wiki reorg — see the [RTM](README.md) for the master table.
