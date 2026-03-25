# BUG-002 — Star Rating Final Star Renders Too Small
**Status:** Open
**Priority:** Medium
**Reported:** 2026-03-23
**Reported By:** Morgan (Project Owner)
**Assigned To:** Jordan (Dev)

## Description
In the star rating component, the final (5th) star renders noticeably smaller than the others.

## Steps to Reproduce
1. Open the check-in modal
2. Navigate to Step 3 (rate & review)
3. Observe the star rating row — the last star is smaller than the rest

## Expected Behavior
All 5 stars render at identical size.

## Suspected Location
`components/ui/StarRating.tsx`

## Notes
- Likely a flex/sizing issue on the last child element or a `whileTap` Framer Motion transform not resetting cleanly on the final star
- Added to next meeting agenda
