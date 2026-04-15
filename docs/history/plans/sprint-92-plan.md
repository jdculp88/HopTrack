# Sprint 92 — The Audit Fix 🔧
**PM:** Morgan | **Arc:** The Flywheel (Sprint 2 of 6)
**Date:** 2026-04-01

> The Flywheel can't spin on a cracked foundation. Burn down every P0 and the high-impact P1s from the Sprint 91 deep audit before pushing deeper into revenue features.

---

## Sprint 92 Goals

### Goal 1: P0 Fixes (3 bugs — zero tolerance)
**Owner:** Avery (Dev Lead) | **Reviewer:** Jordan (Architecture)

| # | Bug | Fix |
|---|-----|-----|
| P0-1 | ActiveSessionsCounter never updates — polls but ignores response | Add lightweight `/api/brewery/[id]/active-sessions` endpoint, wire state update in polling interval |
| P0-2 | Embed page missing auth check — any user can access any brewery's embed config | Add brewery ownership verification (`claimed_by` or superadmin check) |
| P0-3 | 2x `motion.button` violations (ApiKeyManager:211, BillingClient:325) | Replace with `<button>` + inner `<motion.div>` per convention |

### Goal 2: P1 Fixes — Consumer (4 bugs)
**Owner:** Avery | **Reviewer:** Jordan, Alex (feel)

| # | Bug | Fix |
|---|-----|-----|
| P1-4 | Hardcoded fake data in Discover (seasonal beers, curated collections) | Remove fake data, replace with real DB queries or remove sections |
| P1-5 | 6 curated collection cards all "Coming soon" | Wire collections to real beer lists or remove placeholder section |
| P1-6 | Beer list Edit button links to profile | Fix href to list edit page |
| P1-7 | Broken notification link `/profile/achievements` | Fix to `/achievements` |

### Goal 3: P1 Fixes — Brewery Admin (3 bugs)
**Owner:** Avery | **Reviewer:** Casey (QA)

| # | Bug | Fix |
|---|-----|-----|
| P1-8 | Missing toasts on Loyalty mutations (6 operations) | Add success/error toasts to toggleProgram, togglePromo, deletePromo + save/create |
| P1-9 | Missing toasts on Events mutations (4 operations) | Add success/error toasts to toggleEvent, deleteEvent + save/create |
| P1-15 | 3 pages missing loading.tsx (challenges, embed, customer profile) | Add skeleton loading states |

### Goal 4: P1 Fixes — API & Data Integrity (2 bugs)
**Owner:** Avery | **Reviewer:** Riley (Infra), Sam (BA)

| # | Bug | Fix |
|---|-----|-----|
| P1-12 | 5 GET endpoints missing auth | Add auth check — these are app-internal routes (not v1 public API), require logged-in user |
| P1-14 | Leaderboard monthly XP may use wrong column | Audit `xp_earned` vs `xp_awarded`, verify column exists and is correct |

### Goal 5: P2 Quick Wins (4 bugs)
**Owner:** Avery

| # | Bug | Fix |
|---|-----|-----|
| P2-20 | Promotions page missing mobile top padding | Add `pt-16` |
| P2-21 | Events delete no success toast | Add toast (covered by P1-9) |
| P2-22 | Embed + Challenges pages missing metadata export | Add `export const metadata` |
| P2-16 | Non-interactive seasonal beer cards | Fixed by P1-4 (removing fake data) |

---

## What's NOT in Sprint 92 (deferred to 93-94)

| # | Bug | Reason |
|---|-----|--------|
| P1-10 | Silent delete failures (no DB result check) | Needs pattern decision — Sprint 93 |
| P1-11 | Drag-sort N individual updates | Performance optimization — Sprint 93 |
| P1-13 | Missing rate limits on 11+ mutation endpoints | Bulk task — Sprint 93 |
| P2-17 | Inconsistent response envelopes | v1 vs internal — Sprint 94 |
| P2-18 | 4 pages not in sidebar nav | Nav redesign — Sprint 93 |
| P2-23-25 | Accessibility (skip-to-content, main id, aria-label) | Sprint 93 |

---

## Exit Criteria
- [ ] All 3 P0s fixed and verified
- [ ] 9 P1s fixed
- [ ] 4 P2 quick wins done
- [ ] 149+ Vitest tests still passing
- [ ] `npm run build` clean
- [ ] Reese: regression tests for P0-2 (embed auth)

---

*16 bugs in, 0 bugs out. — Morgan* 🍺
