# HopTrack Sprint Kickoff Meeting
**Date:** 2026-03-24 (afternoon)
**Type:** Sprint Planning + Requirements Validation
**Attendees:** Morgan, Sam, Alex, Jordan, Riley, Taylor, Drew, Casey, **Jamie** (Marketing — new!)

---

## New Team Member
**Jamie** — Brand & Marketing Lead
- First observations: HopTrack name strong, gold/dark palette differentiated, editorial aesthetic is a genuine competitive moat
- First deliverable: Brand document (name validation, logo concepts, taglines, brand voice) — by end of day

## Sprint 1 Retrospective (Sam)
- All 9 items shipped ✅
- Build green, no TypeScript errors
- 31 files migrated from hardcoded hex to CSS variables — theme system is clean

## Sam's Requirements Validation — Parity Report

### REQ-001 — Theme Toggle
| Criteria | Status |
|----------|--------|
| Toggle in Settings + AppNav | ✅ ThemeToggle in AppNav, full variant in Settings |
| localStorage persistence | ✅ ThemeProvider reads/writes key `hoptrack-theme` |
| System preference default | ✅ matchMedia check on mount |
| All pages correct in both themes | ✅ 31 files migrated |
| No hardcoded hex remaining (structural) | ✅ Batch migration complete |
| 150ms transition | ✅ `transition: background-color 0.15s ease` on body |
**Status: CLOSED — all AC met ✅**

### REQ-002 — Brewery Images + Beer Menus
| Criteria | Status |
|----------|--------|
| Brewery detail shows cover image | 🟡 Unsplash fallback in ProfileBanner, brewery page needs wiring |
| Gradient placeholder while loading | ✅ |
| Brewery admin can upload photo | 🔴 Not built — needs Storage bucket + upload UI |
| Admin can add/edit beers | 🔴 Not built — core Sprint 2 work |
| Consumers see active tap list | 🔴 Not built |
| Beer cards show style badge, ABV, rating | ✅ BeerCard component complete |
**Status: IN PROGRESS — admin + tap list pending this sprint**

### REQ-003 — Loyalty System
| Criteria | Status |
|----------|--------|
| All items | 🔴 Not started — Sprint 3 |
**Status: PLANNED**

### REQ-004 — Brewery Accounts + Verification
| Criteria | Status |
|----------|--------|
| All items | 🔴 Not started — Sprint 2 core work |
**Status: PLANNED — starting now**

### Bugs
| Bug | Status |
|-----|--------|
| BUG-001 Theme contrast + sidebar | ✅ Fixed (hex migration) |
| BUG-002 Star rating final star | ✅ Fixed |
| BUG-003 Check-in exit navigation | ✅ Fixed → /home |

## Sprint 2+3 Combined Plan (this session)
Per Morgan's request: build brewery admin dashboard with test data NOW so Morgan can see it.

**Tasks:**
1. DB migration: `brewery_accounts` + `brewery_claims` tables
2. Brewery admin route group `(brewery-admin)`
3. Dashboard overview page
4. Tap list editor
5. Analytics page
6. Settings page
7. Test data seed SQL

## Marketing Workstream (Jamie)
- Validate "HopTrack" as final name
- Develop 3 logo concepts (sketch descriptions)
- 5 tagline options
- Brand voice guide
- Deliverable: `docs/strategy/brand-guide.md`

## Action Items
- [ ] Jordan: Build brewery admin dashboard (today)
- [ ] Riley: Plan Supabase Storage bucket setup
- [ ] Sam: Keep requirements validation doc updated as features ship
- [ ] Jamie: Brand guide by end of session
- [ ] Casey: QA checklist for brewery admin when Jordan ships
- [ ] Morgan: Review test brewery and give feedback
