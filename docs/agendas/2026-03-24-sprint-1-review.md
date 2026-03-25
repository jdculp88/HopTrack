# HopTrack Meeting Agenda
**Date:** 2026-03-24 (next session)
**Type:** Sprint 1 Review + Sprint 2 Planning
**Attendees:** Morgan, Sam, Alex, Jordan, Riley, Taylor (Sales), Drew (Industry Expert), *(Casey — QA joining!)*

---

## Standing Items
- [ ] Welcome Casey to the team (QA Engineer)
- [ ] Review Sprint 1 work demoed in app

---

## Bug Review

### BUG-001 — Light Theme Contrast & Sidebar (Alex + Jordan)
- Hardcoded hex colors in components not responding to theme toggle
- Sidebar feels disconnected in light mode
- **Goal:** Audit all components, migrate to CSS variable tokens
- **Priority:** Fix before promoting light mode to users

### BUG-002 — Star Rating Final Star Too Small (Jordan)
- 5th star renders smaller than the rest in the check-in modal
- Suspected flex/sizing issue in `StarRating.tsx`
- **Priority:** Fix this sprint

### BUG-003 — Check-In Post-Submit Navigation (All — needs decision)
- After completing a check-in, "Back to Feed" has no defined destination
- **Discussion needed:** Where should the user land after a successful check-in?
  - A) Home feed  B) Their profile  C) Brewery page  D) Beer page  E) Stay + refresh
- **Priority:** High — needs a decision before fix can be implemented

---

## Sprint 2 Planning

### REQ-004 — Brewery Accounts & Verification
- Claim flow, email domain verification
- `brewery_accounts` + `brewery_claims` tables
- Brewery admin dashboard route group `(brewery)`

### REQ-003 — Loyalty System
- Loyalty program builder for brewery admins
- Stamp cards for consumers
- QR redemption flow

### REQ-002 — Brewery Images & Beer Menus
- Supabase Storage bucket setup (Riley)
- Brewery admin beer list management
- Consumer-facing tap list on brewery detail page

### REQ-001 — Domestic Beers / "How American Are You"
- `is_domestic` flag on beers table
- Parallel achievement track (does NOT count toward brewery/variety goals)

---

## Open Discussion
- Pricing tiers for brewery accounts (Morgan + Sam)
- Casey onboarding — QA process, test coverage priorities
- Any blockers from Sprint 1?

---

## Action Items (to be filled during meeting)
- [ ]
- [ ]
- [ ]
