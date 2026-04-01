# Sprint 94 — The Club 🍻
**PM:** Morgan | **Arc:** The Flywheel (Sprint 4 of 6)
**Date:** TBD

> Digital Mug Clubs (F-020) + remaining P2 polish from the Sprint 91 audit.

---

## Sprint 94 Goals

### Goal 1: Digital Mug Clubs (F-020)
**Owner:** Avery (Dev Lead) | **Reviewer:** Jordan (Architecture)

Digital mug club memberships managed through HopTrack. Brewery charges annual fee, members get perks (discounts, early access, exclusive events).

*Detailed spec TBD — requires REQ from Sam.*

### Goal 2: Remaining P2 Polish (from QA Audit)
**Owner:** Avery (Dev Lead)

1. **Standardize API response envelopes** — internal routes should match v1 `{ data, meta, error }` pattern where possible
2. **POS routes envelope consistency** — sync-logs, status, mapping should use same shape
3. **Move Wrapped/Pint Rewind to server-side fetch** — eliminate double loading flash
4. **Validate beer_id existence** in `POST /api/sessions/[id]/beers`
5. **Verify Settings `#invite-friends` hash anchor** exists

---

## Test Plan
- [ ] Mug club CRUD works end-to-end
- [ ] Consumer can join/view mug club from brewery page
- [ ] API response shapes consistent across new endpoints
- [ ] Wrapped/Pint Rewind load in single pass (no double flash)
- [ ] Existing tests pass (`npm run test`)

---

*This is a living document.* 🍺
