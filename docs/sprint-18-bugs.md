# Sprint 18 — Bug Log
**Filed:** 2026-03-27 · **Source:** Joshua live demo review of The Board
**Priority legend:** P0 = ship blocker · P1 = fix this sprint · P2 = schedule

---

## The Board Bugs

### BUG-S18-001 · P0 — Board fonts don't match branding
**Screen:** `/brewery-admin/[brewery_id]/board`
**Symptom:** The font used on The Board doesn't feel right — doesn't match the HopTrack brand system (Playfair Display for display, DM Sans for body, JetBrains Mono for mono). This is the first thing the world sees when they walk up to the bar. It has to be on-brand.
**Owner:** Alex + Jordan
**Files to check:** `app/(brewery-admin)/brewery-admin/[brewery_id]/board/BoardClient.tsx`, `globals.css`

---

### BUG-S18-002 · P1 — Board scrolling behavior is awkward
**Screen:** `/brewery-admin/[brewery_id]/board`
**Symptom:** The auto-scroll on The Board feels weird. Need a cleaner, more elegant way to display each beer — something that looks intentional and polished on a TV. Current scroll doesn't feel like a premium product.
**Requested:** Rethink the display approach entirely — consider alternatives to scrolling (pagination, columns, fade transitions, etc.). This is what customers see at the bar. It has to be nice.
**Owner:** Alex + Jordan
**Files to check:** `BoardClient.tsx`

---

### BUG-S18-003 · P0 — 90% of Board text is not visible / unreadable
**Screen:** `/brewery-admin/[brewery_id]/board`
**Symptom:** Most of the text content on The Board is not legible. Whether it's contrast, font size, color, or a rendering issue — 90% of the text can't be read. Critical for a TV display product.
**Owner:** Jordan + Alex
**Files to check:** `BoardClient.tsx`, related CSS

---

### BUG-S18-004 · P1 — Board needs brewery logo/branding, not just text name
**Screen:** `/brewery-admin/[brewery_id]/board`
**Symptom:** The Board just shows the brewery name as plain text. Needs a logo or designed branding element that looks good on a TV. Design should be replicable across breweries — a template system or generated logo treatment, not custom per-brewery.
**Requested:** Design a brewery identity treatment (logo lockup, monogram, or stylized header) that works generically for any brewery but looks premium. Think: brewery name + icon/badge that auto-generates.
**Owner:** Alex + Jamie
**Files to check:** `BoardClient.tsx`

---

## Summary Table

| Bug | Severity | Description | Owner | Status |
|---|---|---|---|---|
| BUG-S18-001 | **P0** | Board fonts off-brand | Alex + Jordan | Open |
| BUG-S18-002 | P1 | Board scrolling awkward | Alex + Jordan | Open |
| BUG-S18-003 | **P0** | Board text unreadable (90%) | Jordan + Alex | Open |
| BUG-S18-004 | P1 | Board needs logo/branding treatment | Alex + Jamie | Open |

**P0 count: 2** (fonts, text visibility)
**P1 count: 2** (scrolling, logo)

---

## Carry-over from Sprint 17

| Item | Severity | Description | Owner |
|---|---|---|---|
| S17-009 | P2 | Nav brand/UX review | Alex + Morgan + Sam |
| S17-012 | P2 | Playwright E2E test suite | Casey |
| S17-014 | P2 | TestFlight submission (waiting on Apple Dev account) | Alex |

---

## Design Discussion (Sprint 18)

### DESIGN-001 — Landing page "wow moment" exploration
**Requested by:** Joshua
**Context:** Current landing pages (`/` and `/for-breweries`) are strong. But we need a signature wow moment — something like Wispr Flow's scrolling text effect that makes people stop and stare. This is our first impression.
**Action:** Design exploration ONLY — do NOT change current landing pages. Brainstorm, mock up, present to the group. Decide as a team what (if anything) we build.
**Owner:** Alex + Jamie + Morgan
**Status:** Discussion item — no build until team approves
