# Sprint 87 — The Sync Engine ⚡
**Arc:** Open the Pipes (Sprints 85-90)
**Theme:** Build the sync brain — menu reconciliation, auto-mapping, conflict resolution
**Date:** 2026-04-01
**PM:** Morgan | **Assist:** Sage

---

## Why This Sprint

Sprint 86 laid every pipe — schema, encryption, OAuth scaffolding, webhook receivers, Settings UI. But pipes without water are just decoration. Sprint 87 builds the **sync engine** — the actual logic that takes POS menu data and turns it into a live, accurate HopTrack tap list.

We're building this provider-agnostic. Toast and Square partner approvals are pending, so we build the engine with a clean adapter interface. When partner access lands, we plug in the real API calls and we're live in hours, not sprints.

Drew said it best: "Speed is the P0." A tap list that lies is worse than no tap list.

---

## Goal 1: POS Sync Engine (Core)

**Owner:** Avery (build) | **Reviewer:** Jordan (architecture)

### `lib/pos-sync/engine.ts` — The Reconciliation Engine

The heart of the POS integration. Takes a list of POS menu items and reconciles against the brewery's current tap list.

**Input:** Array of normalized POS items (provider-agnostic shape)
**Output:** Sync result — items added, updated, removed, unmapped, conflicts

**Reconciliation logic:**
1. **Normalize** — Strip provider-specific fields into a common `PosMenuItem` shape (name, category, price_cents, is_available, pos_item_id, variations)
2. **Match** — For each POS item, find the corresponding HopTrack beer:
   - First: exact match on `beers.pos_item_id` (previously mapped)
   - Second: fuzzy match on name (Levenshtein distance ≤ 3 OR substring containment)
   - Third: unmapped → queue for manual mapping
3. **Diff** — Compare matched items: price changed? availability changed? name changed?
4. **Apply** — Execute changes: insert new beers, update existing, deactivate removed (soft — set `is_on_tap = false`, never delete)
5. **Log** — Write to `pos_sync_logs` with full audit trail

**Key rules:**
- Never delete beers — only toggle `is_on_tap`
- Price changes update `pos_price_cents` (display only, not authoritative)
- New unmapped items get `mapping_type = 'unmapped'` and appear in the mapping UI
- Conflicts (name mismatch on mapped ID) flagged for manual review
- Entire sync is transactional — partial failures roll back

### `lib/pos-sync/normalizer.ts` — Provider Adapters

Clean adapter pattern for provider-specific data shapes:

```
interface PosProvider {
  name: 'toast' | 'square'
  normalizeMenuItems(raw: unknown): PosMenuItem[]
  normalizeWebhookPayload(raw: unknown): PosMenuItem[]
}
```

- `toastAdapter` — maps Toast `menuItems` → `PosMenuItem[]`
- `squareAdapter` — maps Square `CatalogObject[]` → `PosMenuItem[]`
- Each adapter handles provider quirks (Square's item/variation model, Toast's nested menu groups)
- Adapters work with mock data now, real API responses later — same shape either way

### `lib/pos-sync/mapper.ts` — Auto-Mapping Algorithm

Fuzzy matching engine for first-time sync (brewery connects POS, 40 items need mapping):

- **Stage 1: Exact** — `pos_item_name.toLowerCase() === beer.name.toLowerCase()`
- **Stage 2: Normalized** — Strip common suffixes (IPA, Ale, Lager, Draft, Pint, Can), compare cores
- **Stage 3: Fuzzy** — Levenshtein distance ≤ 3 on normalized names
- **Stage 4: Style hint** — If POS item category maps to a beer style, prefer beers of that style
- **Unmapped** — Everything else → `mapping_type = 'unmapped'`, surface in UI

Target: ≥80% auto-mapped on first sync (REQ-073 acceptance criteria).

Returns confidence score per mapping (high/medium/low). Medium confidence gets a "suggested" badge in the mapping UI for brewery owner review.

---

## Goal 2: Sync Status & History UI

**Owner:** Avery (build) | **Reviewer:** Alex (UX)

### POS Settings — Sync History Panel

Extend the existing POS Settings page (Sprint 86) with:

**Sync History Table** (last 20 syncs from `pos_sync_logs`):
- Timestamp, sync type badge (webhook / manual / scheduled), duration
- Items: +added / ~updated / -removed / ?unmapped
- Status: success (green) / partial (yellow) / failed (red)
- Expandable row → error details if failed

**Sync Status Card** (replaces simple "last synced" text):
- Current sync state: idle / syncing (animated) / error
- Last successful sync timestamp + "X minutes ago" relative
- Items in sync / unmapped count with link to mapping UI
- Next scheduled sync countdown (if polling enabled)

**Mapping Review UI** — Enhancement to Sprint 86's field mapping table:
- Filter: All / Unmapped / Auto-mapped / Manual
- Unmapped items show suggested matches (from mapper confidence scores)
- One-click accept suggestion or manual search-and-link
- "Create New Beer" inline for POS items that don't exist in HopTrack yet
- Batch actions: approve all high-confidence suggestions

### Conflict Resolution (Sam's edge case)

When a mapped beer's name diverges from the POS item name:
- Yellow "conflict" badge on the mapping row
- Side-by-side comparison: "POS says: X" vs "HopTrack says: Y"
- Actions: Keep HopTrack name / Update to POS name / Unmap

---

## Goal 3: Webhook Processing + Manual Sync

**Owner:** Avery (build) | **Reviewer:** Riley (infra)

### Wire Webhook Receivers to Sync Engine

Sprint 86 built the webhook endpoints with signature verification. Now wire them to the actual sync engine:

**`/api/pos/webhook/toast`** — On `menuPublished` event:
1. Verify HMAC signature (already done in S86)
2. Extract menu items from payload
3. Pass through `toastAdapter.normalizeWebhookPayload()`
4. Run sync engine
5. Return 200 (webhook must respond fast — sync runs async)

**`/api/pos/webhook/square`** — On `catalog.version.updated` event:
1. Verify HMAC signature (already done in S86)
2. Extract catalog changes
3. Pass through `squareAdapter.normalizeWebhookPayload()`
4. Run sync engine
5. Return 200

### Manual "Sync Now" Enhancement

Wire the existing "Sync Now" button (S86 UI) to actually trigger a sync:
- `POST /api/pos/sync` — already exists, now calls sync engine
- 5-minute debounce (tracked in `pos_connections.last_sync_at`)
- Shows syncing animation in UI while running
- Toast notification with result summary on completion
- Error state if sync fails (with retry option)

### Mock Provider Mode

Since real API access is pending, build a mock mode for testing:
- `lib/pos-sync/mock-provider.ts` — generates realistic POS menu data
- 20-40 items per sync, mix of beers/ciders/cocktails
- Simulates webhook payloads for both Toast and Square shapes
- Toggled by `POS_MOCK_MODE=true` env var
- Used by E2E tests and local development

---

## Goal 4: Testing

**Owner:** Reese (automation) | **Reviewer:** Casey (QA)

### Unit Tests (Vitest)

`lib/__tests__/pos-sync.test.ts`:
- Sync engine: exact match, fuzzy match, unmapped items, price updates, deactivation
- Normalizer: Toast adapter, Square adapter, malformed data handling
- Mapper: exact name, normalized name, fuzzy match, style hint, confidence scoring
- Edge cases: empty menu, all-new items, all-removed items, zero changes

Target: 25+ tests covering the sync engine core.

### Integration Test Scenarios (Casey's matrix)

1. ✅ Happy path: brewery connects → first sync maps 30/35 items → 5 unmapped shown in UI
2. ✅ Webhook sync: POS menu updated → webhook fires → tap list reflects change within engine execution
3. ✅ Manual sync: brewery clicks "Sync Now" → debounce respected → sync runs
4. ✅ Conflict: mapped beer name changed in POS → conflict badge appears
5. ✅ Deactivation: beer removed from POS → `is_on_tap = false` (not deleted)
6. ✅ Tier gate: Tap tier brewery sees locked POS settings
7. ❌ Sad path: webhook with invalid signature → rejected, logged
8. ❌ Sad path: POS API timeout → graceful error, retry suggestion
9. ❌ Sad path: sync with 0 items → warning (likely POS misconfiguration)

---

## What's NOT in This Sprint

- ❌ Real Toast/Square OAuth (pending partner approval) — mock mode instead
- ❌ Token refresh automation (needs real tokens first)
- ❌ Push notifications on sync errors (Sprint 88+)
- ❌ Superadmin POS health dashboard (Sprint 88+)
- ❌ Sales data / keg tracking from POS (Phase 2, Sprint 89+)
- ❌ Barcode scanning (Sprint 88 — F-008)

---

## Migration

**No new migration.** Sprint 86's migration 058 has everything we need. All work is application-layer.

---

## File Changes (Estimated)

### New Files
| File | Owner | Purpose |
|------|-------|---------|
| `lib/pos-sync/engine.ts` | Avery | Reconciliation engine |
| `lib/pos-sync/normalizer.ts` | Avery | Provider adapters (Toast + Square) |
| `lib/pos-sync/mapper.ts` | Avery | Auto-mapping / fuzzy match |
| `lib/pos-sync/types.ts` | Avery | Shared POS sync interfaces |
| `lib/pos-sync/mock-provider.ts` | Avery | Mock data generator for testing |
| `lib/__tests__/pos-sync.test.ts` | Reese | 25+ unit tests |

### Modified Files
| File | Owner | Change |
|------|-------|--------|
| `app/api/pos/webhook/toast/route.ts` | Avery | Wire to sync engine |
| `app/api/pos/webhook/square/route.ts` | Avery | Wire to sync engine |
| `app/api/pos/sync/route.ts` | Avery | Wire manual sync to engine |
| `components/brewery-admin/POSSettingsClient.tsx` | Avery | Sync history panel, mapping review UI, conflict badges |
| `.env.local.example` | Riley | POS_MOCK_MODE var |

---

## Success Criteria

- [ ] Sync engine reconciles mock POS data → correct tap list state
- [ ] Auto-mapper achieves ≥80% match rate on realistic mock data
- [ ] Unmapped items surface in mapping UI with suggested matches
- [ ] Conflicts show side-by-side comparison with resolution actions
- [ ] Sync history shows last 20 syncs with full detail
- [ ] "Sync Now" works with 5-minute debounce
- [ ] Webhooks pipe through to sync engine (mock payloads)
- [ ] 25+ unit tests passing
- [ ] Zero schema changes needed — all application-layer

---

## Team Credits (Planned)

- **Avery** 💻 — Sync engine, adapters, mapper, UI enhancements
- **Jordan** 🏛️ — Architecture review on adapter pattern and sync transactionality
- **Riley** ⚙️ — Infra review, mock mode setup, env config
- **Quinn** ⚙️ — Query optimization on sync log reads, index review
- **Alex** 🎨 — Sync status animations, mapping review UX
- **Casey** 🔍 — Test matrix, QA sign-off
- **Reese** 🧪 — Unit tests, mock provider data
- **Sam** 📊 — Conflict resolution UX requirements, edge case validation
- **Drew** 🍻 — Real-world sync scenario validation ("Friday night keg blow" test)
- **Taylor** 💰 — Pitch guide update with sync speed story
- **Jamie** 🎨 — Sync status animation polish, brand alignment
- **Sage** 📋 — Sprint plan, ticket specs, retro prep

---

*The pipes are laid. Now we make them flow.* ⚡
