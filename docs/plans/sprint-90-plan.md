# Sprint 90 — The Close-Out 🔐
**PM:** Morgan | **Arc:** Open the Pipes (Sprint 6 of 6 — FINAL)
**Date:** 2026-04-01

> The final sprint of the Open the Pipes arc. Polish what we built, research what's next, close the book.

---

## Arc Recap (Sprints 85-89)
| Sprint | Name | What Shipped |
|--------|------|-------------|
| 85 | The Pipeline | Public API v1 — 7 endpoints, API keys, rate limiting, docs |
| 86 | The Connector | POS foundation — schema, AES-256-GCM encryption, webhooks, Settings UI |
| 87 | The Sync Engine | POS sync engine — reconciliation, auto-mapper, Toast+Square adapters, 33 tests |
| 88 | The Monitor | POS visibility — dashboard card, sync log page, alert banner, quick action |
| 89 | The Rolodex | Brewery CRM — customer profiles, engagement scoring, segments, barcode pilot |

**Arc exit criteria (from roadmap research):**
- ✅ At least one POS integration live (engine built, mock mode, OAuth pending partner approval)
- ✅ Barcode scanning in consumer app (pilot — migration 059, lookup API)
- ✅ API documented (7 v1 endpoints, Resources section)
- ✅ CRM shipped (bonus goal)

---

## Sprint 90 Goals

### Goal 1: API v1 Polish
**Owner:** Avery (Dev Lead) | **Reviewer:** Jordan (Architecture)

Jordan's audit found 4 issues in the api-keys endpoint:
1. Missing `export const OPTIONS = apiOptions` CORS handler
2. GET returns raw `{ data: keys }` instead of using `apiResponse()` helper
3. PATCH returns `{ success: true }` instead of using `apiResponse()` helper
4. GET/PATCH missing rate limiting (POST has it)

Also: update `docs/API-REFERENCE.md` with the v1 endpoints section.

### Goal 2: CRM Tier Threshold Fix
**Owner:** Avery (Dev Lead)

The CSV export (`/api/brewery/[brewery_id]/customers/export/route.ts`) uses different segment thresholds than `lib/crm.ts`:
- Export: VIP ≥30, Power ≥15, Regular ≥5
- CRM lib: VIP ≥10, Power ≥5, Regular ≥2

Fix: export should import thresholds from `lib/crm.ts` — single source of truth.

### Goal 3: Multi-Location Research (REQ-062 Audit)
**Owner:** Sam (Business Analyst)

REQ-072 already exists with a comprehensive multi-location spec. Sprint 90 task: review REQ-072, confirm it's complete for The Flywheel arc (Sprints 91-96), and flag any gaps. Key areas:
- `brewery_brands` parent table design
- `brand_accounts` permission model
- Brand-level billing (Stripe)
- Aggregated analytics approach
- Consumer-facing brand pages

No code — research and documentation only.

### Goal 4: Arc Close-Out
**Owner:** Morgan (PM) + Sage (PM Assistant)

- Update `docs/roadmap.md` with Sprint 90 + Open the Pipes arc summary
- Preview The Flywheel arc (Sprints 91-96) in roadmap
- Sprint 90 retro + arc retro (6-sprint retrospective)

---

## What's NOT in Sprint 90
- No new migrations
- No new features
- No POS OAuth (blocked on partner approval)
- No multi-location implementation (that's The Flywheel arc)

---

## Test Plan
- [ ] `npm run build` passes clean
- [ ] API v1 api-keys endpoint: OPTIONS request returns CORS headers
- [ ] API v1 api-keys GET/PATCH use standard envelope format
- [ ] CSV export uses CRM lib thresholds
- [ ] Existing Vitest tests pass (`npm run test`)
