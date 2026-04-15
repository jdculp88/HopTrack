# Sprint 95 Retro — The Hub
**Facilitated by:** Morgan
**Date:** 2026-04-01
**Arc:** The Flywheel (Sprint 5 of 6)

---

## What We Shipped

| Goal | Status | Owner |
|------|--------|-------|
| **F-029: Promotion Hub Dashboard** | Shipped | Avery + Jordan |
| **HopRoute Config Relocation** | Shipped | Avery |
| **Empty State Coaching Cards** | Shipped | Alex + Avery |
| **BL-006: Event Ticketing (captured)** | Captured | Sage |
| **Unit Tests (+11)** | Shipped | Reese |
| **Router Cache Fix (staleTimes)** | Shipped | Riley |
| **Backlog Capture (BL-007–BL-012)** | Captured | Morgan + Sage |

**Delivery rate:** 100% (zero carryover)
**Tests:** 206 → 217 (+11 new)
**Lint errors:** 0
**P0 bugs:** 0
**Migrations:** 0 (pure aggregation sprint)

---

## What Went Well

- **Promotion Hub came together fast** — Jordan's patterns from Sprints 91-94 made the aggregation layer mechanical. Server component + client component + parallel Supabase queries = done.
- **No new migration needed** — all data lived in existing tables. Schema from the Flywheel arc was solid.
- **staleTimes fix** — one config line solved a multi-sprint annoyance. No more Cmd+Shift+R.
- **Real-time backlog capture** — founder brain dump went directly into roadmap backlog with full context. New workflow pattern worth keeping.
- **Tier upsell is now visible** — locked cards in the Promotion Hub show Tap-tier breweries exactly what upgrading unlocks. Sales tool disguised as a dashboard.

## What Could Be Better

- **staleTimes should have been caught earlier** — team blamed Turbopack for stale pages when it was the Router Cache config the whole time. Lesson: read the framework docs when symptoms don't match expectations.
- **Session drawer UX issues surfaced late** — BL-011 (beer selections not persisting, no cancel option) is a core flow problem that should have been caught in QA earlier. Casey and Reese need to add session flow to regression suite.

## Action Items

- [ ] BL-011 (Session drawer UX) → Sprint 96 P0
- [ ] BL-010 (Fraud prevention Phase 1) → Sprint 96
- [ ] BL-007 + BL-008 (Tier matrix + billing clarity) → Sprint 96
- [ ] BL-009 (Mug club consumer UX) → Next arc
- [ ] BL-012 (Homepage screenshots) → Jamie side goal, any sprint
- [ ] Add session flow to QA regression checklist

---

## Sprint 96 Preview — The Lockdown

**Theme:** Secure the foundation, fix the core flow
**Arc:** The Flywheel (Sprint 6 of 6 — FINAL)

| Goal | Owner | Size |
|------|-------|------|
| Session Drawer UX Overhaul (BL-011) | Alex + Avery | L |
| Fraud Prevention Phase 1 (BL-010) | Jordan + Drew | M |
| Tier Feature Matrix (BL-007 + BL-008) | Taylor + Avery | S |
| Arc Close-Out | Morgan + Sage | S |

---

## Roast Corner

- **Morgan on Jordan:** "He blamed Turbopack for stale pages for 15 sprints. It was one config line. I'm framing the diff."
- **Jordan on Riley:** "Riley said 'the config pipeline is real now' like he discovered fire. It's `staleTimes: { dynamic: 0 }`. Four words."
- **Drew on Taylor:** "'We're going to be rich' — Taylor's catchphrase has appeared in more retros than actual revenue. But honestly? The tier upsell in the Promotion Hub might be the thing that changes that."
- **Casey on Avery:** "'Already on it' count this sprint: 1. He's getting efficient with the catchphrase too."
- **Alex on Morgan:** "Morgan smiled at Jordan's commit again. We all saw it. It's in the retro. It's canonical."

---

## The Flywheel Arc — Progress (5/6 Complete)

| Sprint | Name | Delivered |
|--------|------|-----------|
| 91 | The Spotlight | Sponsored challenges (geo discovery, analytics, deep QA audit) |
| 92 | The Audit Fix | 16 bugs fixed (3 P0s, 9 P1s, 4 P2s), zero P0s remaining |
| 93 | The Hardening | Ad engine (F-028), QA audit close-out (30/30), 11 rate limits |
| 94 | The Club | Digital mug clubs (F-020), ad feed wiring, security RLS fix, lint zero |
| 95 | The Hub | Promotion Hub (F-029), HopRoute relocation, router cache fix |
| **96** | **The Lockdown** | **Session drawer, fraud prevention, tier matrix (PLANNED)** |

**Arc status:** 5 clean sprints, 0 carryover across all. One sprint to go.

---

*Retro delivered live in chat. Saved to file on request. — Morgan*
