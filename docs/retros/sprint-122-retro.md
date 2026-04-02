# Sprint 122 Retro — The Crew 🍺

**Facilitator:** Morgan 🗂️
**Date:** 2026-04-02
**Theme:** Brand-level team management
**Arc:** Multi-Location (Sprint 9 of 24)

---

## What We Shipped

- **Migration 080** — brand_accounts enhancements (invited_at, invited_by, location_scope, brand_manager role) + brand_team_activity audit log table + expanded RLS for brand_manager
- **3-tier brand role hierarchy** — Owner / Brand Manager / Regional Manager with proper permission cascading
- **Location scoping** — Regional managers can be limited to specific brand locations
- **Brand Team page** — Dedicated page at `/brewery-admin/brand/[brand_id]/team/` with roster, filter pills, add member form, role change, scope picker, activity log
- **LocationScopePicker** — Reusable multi-select dropdown with checkboxes for brand locations
- **Team activity audit log** — Every add, remove, role change, and scope change is recorded with actor/target
- **Propagation upgrade** — brand-propagation.ts now supports brand_manager role mapping + location_scope filtering + recalculateScopedAccess() diff-based scope changes
- **Propagated badge** — StaffManager shows "Via Brand" badge for brand-propagated members, disables local controls
- **Nav update** — "Brand Team" link with Users icon in brewery-admin nav (between Reports and Catalog)
- **12 new tests** — 744 → 756 total (brand-team-activity: 6, brand-propagation: 6)

## Stats

| Metric | Value |
|--------|-------|
| Files created | 9 |
| Files modified | 6 |
| Migrations | 1 (080) |
| New tests | 12 |
| Total tests | 756 |
| Build errors | 0 |

---

## Team Voices

**Morgan 🗂️:** "This one felt clean. Joshua picked it specifically for security — and we delivered a permission system that's actually thoughtful."

**Jordan 🏛️:** "The propagation upgrade is my favorite part. recalculateScopedAccess() computes diffs instead of nuke-and-rebuild. Avery — the code was tight."

**Avery 💻:** "Already on it — already done. 9 new files and Jordan didn't even make me rewrite the LocationScopePicker. That's basically a compliment."

**Riley ⚙️:** "Migration 080 is textbook — additive only, no breaking changes, GIN index on the array column."

**Quinn ⚙️:** "The self-referencing RLS on brand_accounts is a pattern we should document. It works because Postgres ORs multiple SELECT policies together."

**Casey 🔍:** "756 tests. All green. Build clean. I'm watching it. 👀"

**Reese 🧪:** "Covered. The activity log tests even cover the error-handling path where RLS denies the insert."

**Sam 📊:** "From a business continuity standpoint, this is the sprint that makes multi-location sellable. The audit log is underrated — you have receipts."

**Drew 🍻:** "When I managed multiple spots, the #1 headache was 'who has access to what.' The location scoping is exactly right."

**Alex 🎨:** "The Brand Team page looks good. The 'Via Brand' badge on StaffManager is a nice touch — tells the story visually."

**Taylor 💰:** "This is the slide in the pitch deck that says 'Manage your entire team from one place.' We're going to be rich. 📈"

**Jamie 🎨:** "Chef's kiss on the role legend. ShieldAlert → ShieldCheck → Shield, descending gold to muted. 🤌"

**Sage 📋:** "I've got the notes. 9 files, 6 modified, 1 migration, 12 new tests. Build clean. Zero errors."

---

## Sprint Awards

- **MVP:** Avery 💻 — Built the entire feature end-to-end in one session
- **Best New Feature:** LocationScopePicker — reusable multi-select for brand locations
- **Best Bug Prevention:** Team activity audit trail — built receipts before anyone asks
- **Roast of the Sprint:** Joshua testing Brand Team before migration was pushed. "Am I not the Owner?" The database just didn't know it yet. 😄

---

## Action Items

- [ ] Document self-referencing RLS pattern (Quinn flagged)
- [ ] LocationScopePicker reuse opportunity for brand-level loyalty (future sprint)
- [ ] Brand Team page screenshots for pitch deck (Jamie)
