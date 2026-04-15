# REQ-116 — Sensory Layer (SRM, Aroma/Taste/Finish)
**Status:** ✅ Complete · **Sprint:** 176 · **Backfilled:** 2026-04-15

## Summary
Drew's S175 ask shipped end-to-end — beer SRM column, aroma/taste/finish arrays, `is_default` pour-size flag, SensoryNotesPicker + SrmPicker components. Full P&P seed with glass picks. Migrations 111 + 112.

## Acceptance Criteria
- [x] `beer.srm` numeric column.
- [x] `aroma[]`, `taste[]`, `finish[]` arrays on beer.
- [x] `is_default` on pour sizes.
- [x] SensoryNotesPicker component.
- [x] SrmPicker component.
- [x] P&P brewery seed with glass picks.

## Implementation
- Primary: [lib/beer-sensory](../../lib/), [lib/srm-colors](../../lib/)
- Components: [components/SensoryNotesPicker](../../components/), [components/SrmPicker](../../components/)
- Migrations: [supabase/migrations/](../../supabase/migrations/)

## Tests
- Unit: [beer-sensory.test.ts](../../lib/__tests__/beer-sensory.test.ts), [srm-colors.test.ts](../../lib/__tests__/srm-colors.test.ts), [SensoryNotesPicker.test.tsx](../../components/__tests__/SensoryNotesPicker.test.tsx)

## History
- Retro: [sprint-176-retro.md](../history/retros/sprint-176-retro.md)

## See also
- [REQ-010](REQ-010-flavor-tags-serving-styles.md) *(original flavor tags)*
