# Sprint 16 — "Turn It Up" 🍺

**Date:** 2026-03-27
**PM:** Morgan
**Theme:** New consumer features + brewery dashboard polish + carry-over infra
**Approach:** Ship everything. Quality over speed. If items slip to S17, that's fine — polished > rushed.

> *"Drew's bar top. Polished. Every surface. That's the standard."* — Joshua

---

## P0 — Carry-Over Infra (Day 1)

| ID | Title | Owner | Status |
|----|-------|-------|--------|
| S16-001 | Generate VAPID keys | Riley + Jordan | ✅ |
| S16-002 | Apply migration 014 (reactions FK backfill) | Riley + Jordan | ✅ |
| S16-003 | Apply migration 015 (drop checkins) + type cleanup | Riley + Jordan | ✅ |
| S16-004 | Xcode Simulator build | Alex + Jordan | 🔲 |
| S16-005 | Close first brewery | Taylor | 🔲 |

---

## P1 — Consumer Features

| ID | Title | Owner | Status |
|----|-------|-------|--------|
| S16-006 | Session comments — migration 016 + API | Jordan + Riley | 🔲 |
| S16-007 | Session comments — UI in SessionCard | Jordan + Alex | 🔲 |
| S16-008 | Session comments — notifications + push | Jordan | 🔲 |
| S16-009 | Notification actions (Accept/Decline, view links) | Jordan | 🔲 |

---

## P1 — Brewery Dashboard Polish

| ID | Title | Owner | Status |
|----|-------|-------|--------|
| S16-011 | TV Display / "The Board" (REQ-018) | Jordan + Alex | 🔲 |
| S16-012 | Tap list — drag reorder + 86'd toggle | Jordan + Alex | 🔲 |
| S16-013 | Analytics upgrades — 3 new charts | Jordan | 🔲 |

---

## P2 — Stretch (May Slip to Sprint 17)

| ID | Title | Owner | Status |
|----|-------|-------|--------|
| S16-010 | Domestic beer achievement (REQ-016) | Jordan | 🔲 |
| S16-014 | Loyalty dashboard enhancements | Jordan | 🔲 |
| S16-020 | Brewery events — migration 018 + API | Jordan + Riley | 🔲 |
| S16-021 | Brewery events — admin CRUD | Jordan + Alex | 🔲 |
| S16-022 | Brewery events — consumer view | Jordan + Alex | 🔲 |

---

## Key Architectural Decisions

- **Comments:** No threading. Flat list, text only, 500 chars. Simple MVP.
- **Board Realtime:** Full refetch on change. Beer lists are small. Simple > clever.
- **Drag reorder:** @dnd-kit over deprecated react-beautiful-dnd.
- **86'd vs off-tap:** Distinct concepts. 86'd = out tonight (strikethrough). Off-tap = not serving (hidden).
- **Domestic = style-based.** Lager/Pilsner/Cream Ale/Blonde Ale. Not brand-based.
- **Events MVP:** No RSVP. Post and view only.

---

## Migrations

| # | Name | Status |
|---|------|--------|
| 014 | reactions FK backfill | ✅ APPLIED |
| 015 | drop checkins | ✅ APPLIED |
| 016 | session_comments | 🔲 |
| 017 | domestic_achievements | 🔲 |
| 018 | brewery_events | 🔲 |
| 019 | tap_list_display_order + is_86d | 🔲 |

---

*This is a living document.* — Morgan (she can't help herself)
