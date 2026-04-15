# REQ-103 — FTC Disclosures + Age Gate
**Status:** ✅ Complete · **Sprint:** 156 · **Backfilled:** 2026-04-15

## Summary
P0 compliance — FTC disclosure patterns for sponsored challenges and the 21+ age gate. See [compliance/](../compliance/README.md).

## Acceptance Criteria
- [x] FTC disclosure component shown on sponsored content.
- [x] Age gate (21+) before consumer app use.
- [x] Review moderation flow.

## Implementation
- Primary: [lib/ftc-disclosure](../../lib/), [lib/age-verification](../../lib/), [lib/moderation](../../lib/)

## Tests
- Unit: [ftc-disclosure.test.tsx](../../lib/__tests__/ftc-disclosure.test.tsx), [age-verification.test.ts](../../lib/__tests__/age-verification.test.ts), [moderation.test.ts](../../lib/__tests__/moderation.test.ts)

## History
- Retro: [sprint-156-retro.md](../history/retros/sprint-156-retro.md)

## See also
- [compliance/README.md](../compliance/README.md) · [REQ-075](REQ-075-sponsored-challenges.md)
