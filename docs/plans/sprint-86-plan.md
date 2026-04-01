# Sprint 86 — The Connector 🔌
**Arc:** Open the Pipes (Sprints 85-90)
**Theme:** POS integration foundation — build everything before partner API access arrives
**Date:** 2026-04-01
**PM:** Morgan | **Assist:** Sage

---

## Why This Sprint

REQ-073 is crystal clear: POS integration is the feature that justifies Cask pricing and kills the #1 brewery objection (double-entry). Toast and Square partner approvals take time, but we can build the full foundation now — schema, encryption, OAuth scaffolding, webhook receivers, and the entire brewery admin UI. When partner access comes through, we wire in the real API calls and we're live.

Sprint 85 shipped the Public API (data OUT). Sprint 86 builds the integration layer (data IN).

---

## Goal 1: POS Database Schema + Encryption

**Owner:** Riley + Quinn
**Reviewer:** Jordan

### Migration 058: `058_pos_integration.sql`

**New tables:**

`pos_connections` — One row per brewery per POS provider
- id, brewery_id (FK), provider (toast/square), access_token_encrypted (bytea), refresh_token_encrypted (bytea), token_expires_at, provider_location_id, provider_merchant_id, status (active/error/disconnected), last_sync_at, last_sync_status (success/partial/failed), last_sync_item_count, webhook_subscription_id, connected_at, created_at, updated_at
- UNIQUE constraint: (brewery_id, provider)
- RLS: brewery owner SELECT/INSERT/UPDATE/DELETE

`pos_item_mappings` — Maps POS menu items to HopTrack beers
- id, pos_connection_id (FK), brewery_id (FK), pos_item_id, pos_item_name, beer_id (FK, nullable), mapping_type (auto/manual/unmapped), created_at, updated_at
- RLS: brewery owner CRUD

`pos_sync_logs` — Audit trail for all sync operations
- id, pos_connection_id (FK), brewery_id (FK), sync_type (webhook/manual/scheduled), provider, items_added, items_updated, items_removed, items_unmapped, status (success/partial/failed), error (nullable), duration_ms, created_at
- RLS: brewery owner SELECT, service role INSERT

**Columns added to existing tables:**

`beers`: pos_item_id (text), pos_price_cents (integer), pos_last_seen_at (timestamptz)
`breweries`: pos_provider (text), pos_connected (boolean default false), pos_last_sync_at (timestamptz)

### Encryption Utility: `lib/pos-crypto.ts`

- `encryptToken(plaintext: string): string` — AES-256-GCM, returns base64 encoded (iv + ciphertext + tag)
- `decryptToken(encrypted: string): string` — reverse
- Uses `POS_TOKEN_ENCRYPTION_KEY` env var (32-byte hex key)
- Tokens never logged, never sent to client, decrypted only at moment of API call

---

## Goal 2: POS Settings UI + OAuth Flow Stubs

**Owner:** Avery (build) + Alex (design decisions)
**Reviewer:** Jordan

### POS Settings Section

Added as a new section in `BrewerySettingsClient.tsx` (consistent with API Keys pattern from Sprint 85).

**Connection cards:**
- One card per provider (Toast, Square)
- Disconnected state: provider logo, description, "Connect" button
- Connected state: provider name, connected date, last sync time, traffic light indicator, "Disconnect" button, "Sync Now" button
- Traffic light: green (synced < 5min), yellow (synced < 1hr), red (sync failed or > 6hr stale)

**Field mapping table:**
- Shows POS items mapped to HopTrack beers
- Columns: POS item name | Mapped beer (dropdown) | Style (editable) | ABV (editable) | Status (auto/manual/unmapped)
- "Auto-Map" button for bulk fuzzy matching
- Unmapped items highlighted with amber indicator

**Tier gating:**
- Tap tier: POS section shows locked overlay with "Connect your POS and never double-enter a tap list again. Upgrade to Cask to unlock." + gold CTA
- Cask/Barrel: full access

### OAuth Flow Stubs

Endpoints scaffolded with placeholder provider URLs. Real OAuth URLs wired in Sprint 87 when partner access arrives.

- `GET /api/pos/connect/[provider]` — Generates state param, stores in cookie, redirects to provider auth URL
- `GET /api/pos/callback/[provider]` — Exchanges auth code for tokens, encrypts, stores in pos_connections
- `POST /api/pos/disconnect/[provider]` — Revokes token (stub), deletes pos_connections row, cleans up webhooks

---

## Goal 3: Webhook Infrastructure + API Endpoints

**Owner:** Avery
**Reviewer:** Jordan

### Webhook receivers
- `POST /api/pos/webhook/toast` — HMAC-SHA256 signature verification, replay protection (reject > 5min), parse menu changes, diff against current tap list, apply changes, log to pos_sync_logs
- `POST /api/pos/webhook/square` — Same pattern for Square's `catalog.version.updated` events

### Status & mapping endpoints
- `GET /api/pos/status` — Connection health for authenticated brewery (provider, last sync, health indicator)
- `GET /api/pos/mapping` — Current field mappings for brewery's POS connection
- `PUT /api/pos/mapping` — Update mappings (manual override of auto-mapped or unmapped items)

### Sync endpoint
- `POST /api/pos/sync/[provider]` — Manual sync trigger, 5-minute debounce, pulls current menu from POS API (stubbed), diffs, applies, logs

All endpoints use standardized JSON envelope from Sprint 85: `{ data, meta, error }`.

---

## Files Created/Modified

### New files
- `supabase/migrations/058_pos_integration.sql`
- `lib/pos-crypto.ts`
- `app/api/pos/connect/[provider]/route.ts`
- `app/api/pos/callback/[provider]/route.ts`
- `app/api/pos/disconnect/[provider]/route.ts`
- `app/api/pos/sync/[provider]/route.ts`
- `app/api/pos/webhook/toast/route.ts`
- `app/api/pos/webhook/square/route.ts`
- `app/api/pos/status/route.ts`
- `app/api/pos/mapping/route.ts`

### Modified files
- `app/(brewery-admin)/.../settings/BrewerySettingsClient.tsx` — POS section added
- `types/database.ts` — PosConnection, PosItemMapping, PosSyncLog interfaces + table registration
- `.env.local.example` — POS_TOKEN_ENCRYPTION_KEY, TOAST_CLIENT_ID, TOAST_CLIENT_SECRET, SQUARE_APP_ID, SQUARE_APP_SECRET, TOAST_WEBHOOK_SECRET, SQUARE_WEBHOOK_SECRET
- `docs/roadmap.md` — Sprint 86 entry

---

## Team Assignments

| Person | Owns | Notes |
|--------|------|-------|
| Riley + Quinn | Migration 058, pos-crypto.ts, env setup | Schema matches REQ-073 Section 7 exactly |
| Avery | All API endpoints, OAuth scaffolding, webhook receivers, Settings UI | Under Jordan's review |
| Alex | POS Settings UX, connection cards, tier gating design | Must feel premium for Cask upsell |
| Jordan | Architecture review: encryption, webhook pipeline, field mapping | Enforce abstraction layer per REQ-073 R-09 |
| Sam | Acceptance criteria validation against REQ-073 | Phase 1 checklist items 1-17 |
| Casey + Reese | Test sync states, tier gating, disconnect, webhook replay protection | Zero tolerance |
| Drew | Validate field mapping UX for busy taproom context | "Would I use this on a Friday night?" |
| Taylor | Cask upsell CTA copy, POS feature in pitch deck | This is the sales closer |

---

## Success Criteria

- [ ] Migration 058 applies cleanly with all 3 tables + column additions
- [ ] RLS policies enforce brewery-owner scoping on all POS tables
- [ ] Token encryption round-trips correctly (encrypt → store → decrypt → use)
- [ ] POS_TOKEN_ENCRYPTION_KEY absence handled gracefully (no crash, clear error)
- [ ] All 9 API endpoints return proper JSON envelope responses
- [ ] Webhook receivers reject invalid signatures and replay attacks
- [ ] POS Settings section visible in brewery admin for Cask/Barrel tier
- [ ] Tap tier sees locked overlay with upgrade CTA
- [ ] Connect/Disconnect flow works end-to-end (with stubbed provider)
- [ ] Field mapping UI renders with mock data
- [ ] Sync Now button debounces at 5 minutes
- [ ] Traffic light indicator shows correct state based on last_sync_at
- [ ] `npm run build` passes clean

---

## What This Enables

Sprint 87 wires in real Toast/Square API calls. With the schema, encryption, UI, and webhook infrastructure already built, Sprint 87 is purely integration code — no scaffolding, no UI, just connecting the pipes.

---

*"This is a living document."* — Morgan
