# Sprint 21 — All of It 🍺
**Dates:** 2026-03-27
**Theme:** QoL sweep + QR Table Tents + Board → App visual bridge

---

## Sprint Goal
Ship a full QoL pass across consumer and brewery admin, land the QR Table Tent feature Drew's Asheville contacts have been asking for, and smooth the visual bridge from The Board into the app.

---

## Tickets

### P0 — Non-Negotiable

| ID | Owner | Title | Status |
|----|-------|-------|--------|
| S21-001 | Casey + Jordan | Playwright E2E foundation — auth, session create, Board render (3 tests) | 🔲 |
| S21-002 | Jordan | ActiveSessionBanner live timer — interval-based elapsed time | ✅ |
| S21-003 | Jordan | Explore filter persistence — sync to URL search params | ✅ |
| S21-004 | Sam + Jordan | Empty states with personality — beer-themed copy + CTAs | ✅ |
| S21-005 | Jordan | SessionCard truncation — title tooltip on long beer/brewery names | ✅ |

### P1 — Ship It

| ID | Owner | Title | Status |
|----|-------|-------|--------|
| S21-006 | Jordan | Modal focus trap — keyboard accessibility | ✅ |
| S21-007 | Alex + Jordan | Board settings preview — inline live preview before apply | ✅ |
| S21-008 | Jordan | Tap List unsaved changes guard — dirty-state detection | ✅ |
| S21-009 | Jordan | Dashboard Recent Visits pagination — View All + paginated API | ✅ |

### P1 — New Features

| ID | Owner | Title | Status |
|----|-------|-------|--------|
| S21-010 | Taylor + Jordan | QR Code Table Tents — branded QR from brewery dashboard, print-ready | ✅ |
| S21-011 | Jamie + Jordan | Board → App visual bridge — cream/gold branded transition when entering from Board | ✅ |

---

## Notes

- S21-001 (Playwright) carries from Sprint 20 — Casey has a sit-in scheduled if it slips again
- QR Table Tents use `qrcode` npm package — SVG output, no canvas required
- Visual bridge is a `/board-welcome/[brewery_id]` route — cream background, gold HopTrack mark, brewery name, "Open in App" CTA
- Filter persistence uses `useSearchParams` + `useRouter` — SSR-safe, shareable URLs
- All Board styles remain inline (Tailwind JIT avoidance)
- Migrations: none required this sprint

---

## Team Notes

- Morgan: voted on by the whole team — this is a team sprint, not a Jordan sprint
- Drew: QR tents are the closer. Every Asheville contact asked for this.
- Taylor: demo URL confirmed before Tuesday. Go close a brewery.
- Casey: Playwright is P0. Last carry. Sit-in is real.
- Jamie: visual bridge is yours to spec — Jordan builds what you design
