# HopTrack QA Checklist Template
**Owner:** Casey (QA Engineer)
**Created:** 2026-03-24

---

## How to Use
Copy this template when closing any bug or feature. Fill out all sections. A feature is NOT done until Casey signs off.

---

## Feature / Bug: [NAME HERE]
**Ticket:** BUG-XXX or REQ-XXX
**Build:** (branch / commit)
**Tested by:** Casey
**Date:**

---

## Acceptance Criteria
*Copied from the REQ or BUG doc — every item must be checked*
- [ ] AC 1
- [ ] AC 2
- [ ] AC 3

---

## Test Environments
- [ ] Desktop Chrome (light mode)
- [ ] Desktop Chrome (dark mode)
- [ ] Mobile Safari — iPhone viewport (375px)
- [ ] Mobile Chrome — Android viewport (390px)
- [ ] Tablet viewport (768px)

---

## Functional Tests
- [ ] Happy path works end-to-end
- [ ] Error states display correctly (network errors, validation failures)
- [ ] Loading states show correctly (skeleton loaders, spinners)
- [ ] Empty states show correctly (no data scenarios)
- [ ] Auth-gated routes redirect unauthenticated users

---

## Visual / UX Tests
- [ ] Light mode — no contrast issues, all elements visible
- [ ] Dark mode — no contrast issues, all elements visible
- [ ] Animations play correctly (no jank, no stuck states)
- [ ] Typography correct (Playfair Display for headings, DM Sans for body)
- [ ] Gold accent (`#D4A843`) used consistently for CTAs
- [ ] Spacing consistent with design system

---

## Performance Tests
- [ ] No console errors or warnings
- [ ] No unnecessary re-renders (check React DevTools if applicable)
- [ ] Images load correctly (no broken image icons)
- [ ] Page loads in under 3s on simulated 3G

---

## Edge Cases
- [ ] Long text / names don't break layouts
- [ ] Empty arrays / null data handled gracefully
- [ ] Network offline state handled (where applicable)
- [ ] Rapid clicks / double-submissions handled

---

## Regression
- [ ] Adjacent features not broken by this change
- [ ] Build passes (`npm run build`)
- [ ] No new TypeScript errors

---

## Sign-off
**Result:** ✅ PASS / ❌ FAIL / ⚠️ PASS WITH NOTES

**Notes:**

**Casey's sign-off:**
