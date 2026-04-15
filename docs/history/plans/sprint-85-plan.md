# Sprint 85 Plan — The Pipeline
**PM:** Morgan | **Date:** 2026-03-31
**Arc:** Open the Pipes (Sprints 85-90) — OPENING SPRINT
**Theme:** Versioned public API foundation + POS integration research

---

## Why This Sprint

The "Stick Around" arc is done — retention is solid (Wrapped, challenges, digest emails, ROI cards). Now we open the pipes. The next 6 sprints are about integrations: POS, CRM, public API, barcode scanning, multi-location. But every one of those depends on a clean, versioned API foundation.

We already have public endpoints from Sprint 80 (embed widget, brewery/beer API), plus 57 internal endpoints documented in `docs/API-REFERENCE.md`. But they're scattered, unversioned, and not designed for third-party consumption. No API keys. No rate limiting per consumer. No standardized response envelope. If we bolt POS integrations onto the current API surface, we'll regret it by Sprint 88.

Morgan's call: **build the foundation first.** Public API v1 this sprint. POS research runs in parallel so we're ready to wire Toast + Square the moment the pipes are open.

Taylor's take: "Every POS partner and third-party integration we pitch will ask 'do you have an API?' before anything else. This is table stakes for revenue conversations."

---

## Sprint Goals

### Goal 1: Public API v1 (F-016)
**Owner:** Avery (build) · Jordan (architecture review) · Quinn (migration) · Riley (infra review)
**Effort:** L

A versioned, key-authenticated REST API that third parties and POS integrations can build against. Brewery owners generate API keys from their dashboard. Standardized responses, rate limiting, CORS — the works.

**Deliverables:**

#### 1a. API Key System
**Owner:** Quinn (migration) · Avery (API + UI)
**Reviewer:** Jordan, Riley

**Migration 057 — `api_keys` table:**
```sql
CREATE TABLE api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brewery_id uuid NOT NULL REFERENCES breweries(id) ON DELETE CASCADE,
  name text NOT NULL,               -- user-given label ("My Website", "POS Integration")
  key_hash text NOT NULL,           -- SHA-256 hash of the actual key
  key_prefix text NOT NULL,         -- first 8 chars for identification ("ht_live_a1b2...")
  permissions text[] NOT NULL DEFAULT '{"read"}',  -- future: read, write, admin
  rate_limit integer NOT NULL DEFAULT 100,         -- req/min
  last_used_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_api_keys_brewery ON api_keys(brewery_id);
CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);

-- RLS: brewery owners only
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Brewery owners manage their API keys"
  ON api_keys FOR ALL
  USING (brewery_id IN (
    SELECT brewery_id FROM brewery_staff WHERE user_id = auth.uid()
  ));
```

**Key generation flow:**
- Owner clicks "Generate API Key" in brewery settings
- Backend generates a `ht_live_` prefixed key (crypto.randomUUID + prefix)
- Key is displayed ONCE in a copy-to-clipboard modal (never stored in plaintext)
- SHA-256 hash stored in `api_keys` table
- Key format: `ht_live_{32-char-random}` (e.g., `ht_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`)

#### 1b. Versioned API Route Group — `app/api/v1/`
**Owner:** Avery
**Reviewer:** Jordan

New route group with middleware-style authentication and rate limiting:

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/v1/breweries/:id` | GET | Public | Brewery info (name, address, hours, logo, description) |
| `/api/v1/breweries/:id/beers` | GET | Public | On-tap beers (active tap list) |
| `/api/v1/breweries/:id/menu` | GET | Public | Full menu (all item types, grouped) |
| `/api/v1/breweries/:id/events` | GET | Public | Upcoming events |
| `/api/v1/breweries/:id/stats` | GET | API Key | Public stats (check-in count, avg rating, popular beers) |
| `/api/v1/beers/:id` | GET | Public | Individual beer detail |
| `/api/v1/beers/search` | GET | Public | Beer search (`?q=`, `?style=`, `?brewery_id=`) |

**Standardized response envelope:**
```typescript
interface ApiResponse<T> {
  data: T;
  meta?: {
    total: number;
    page: number;
    per_page: number;
  };
  error?: {
    code: string;       // "NOT_FOUND", "RATE_LIMITED", "UNAUTHORIZED"
    message: string;
  };
}
```

**Rate limiting:**
- Authenticated (API key in `Authorization: Bearer ht_live_...` header): 100 req/min per key
- Unauthenticated public endpoints: 20 req/min per IP
- Rate limit headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- 429 response with `Retry-After` header when exceeded

**CORS:**
- `Access-Control-Allow-Origin: *` on all v1 endpoints
- `Access-Control-Allow-Headers: Authorization, Content-Type`
- OPTIONS preflight handler

#### 1c. API Key Management UI
**Owner:** Avery
**Reviewer:** Alex (UX), Jordan

Add "API Keys" section to brewery admin Settings page (`BrewerySettingsClient.tsx`):

- List existing keys: name, prefix (`ht_live_a1b2...`), created date, last used, status (active/revoked)
- "Generate New Key" button — opens modal:
  - Name input (required)
  - On create: shows full key once with prominent "Copy" button and warning ("This key won't be shown again")
  - AnimatePresence slide-down for the key reveal
- Revoke button per key — inline confirmation (our standard pattern)
- Empty state: "Generate an API key to integrate HopTrack with your website, POS system, or other tools."
- Max 5 active keys per brewery (prevents abuse)

#### 1d. API Documentation Page
**Owner:** Avery
**Reviewer:** Jamie (brand copy)

Static page at `app/(app)/developers/page.tsx` (or stretch: `/docs/api`):
- Overview of available endpoints
- Authentication instructions (API key header)
- Rate limit info
- Example requests/responses (curl + JS fetch)
- Link to generate keys (brewery owners)

**Note:** This is a simple static page, not a full docs site. Enough to get a developer started.

---

### Goal 2: POS Integration Research (REQ-073)
**Owner:** Sam (requirements) · Taylor (revenue impact) · Drew (brewery ops validation)
**Effort:** S

Research and document requirements for POS integration (Toast + Square), to be built in Sprints 86-87.

**Deliverables:**

1. **REQ-073 — POS Integration Requirements** (`docs/requirements/REQ-073-pos-integration.md`)
   - Toast POS API capabilities: menu sync, transaction data, webhook events
   - Square API capabilities: catalog sync, orders, loyalty, webhooks
   - Data flow diagrams: what syncs where, who is source of truth
   - API access requirements: partner programs, sandbox accounts, approval timelines
   - Brewery UX: how does a brewery owner connect their POS?
   - Privacy/security: what data do we store, what do we pass through?
   - Pricing implications: which tier gets POS integration? (Taylor: Cask or Barrel)

2. **Competitive analysis addendum** — how Untappd for Business handles POS (if at all)

3. **Technical feasibility notes** (Jordan) — where POS data maps to our schema, what needs to change

---

## Technical Notes (Jordan)

### API Architecture Decisions

**Why `/api/v1/` and not extending existing endpoints?**
Our 57 existing endpoints are internal — they assume Supabase auth, return raw Supabase shapes, and have no versioning. The v1 API is a public contract:
- Stable response shapes (the envelope never changes)
- Versioned (v2 can coexist when needed)
- Key-based auth (no Supabase session required)
- Rate limited per consumer, not per user session
- Minimal data exposure (no internal IDs, no user data, no admin fields)

**API key validation pattern:**
```typescript
// lib/api-auth.ts
async function validateApiKey(req: Request): Promise<{ breweryId: string } | null> {
  const auth = req.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ht_live_')) return null;
  const key = auth.replace('Bearer ', '');
  const hash = await sha256(key);
  // Look up hash, check not revoked, update last_used_at
}
```

**Rate limiting approach:** In-memory Map with sliding window (simple, no Redis dependency). Reset on deploy is acceptable at our scale. If we outgrow it, we add Redis in the infra arc.

**Reuse:** The v1 endpoints should call shared query functions (not duplicate SQL). If `lib/queries/breweries.ts` exists, the v1 route calls it and reshapes the response into the envelope.

---

## Edge Cases (Casey)

| Case | Handling |
|------|----------|
| Invalid API key | 401 `{ error: { code: "UNAUTHORIZED", message: "Invalid or revoked API key" } }` |
| Expired/revoked key | Same 401 — don't leak whether key existed |
| Rate limit exceeded | 429 with `Retry-After` header, clear error message |
| Brewery not found | 404 with standardized error envelope |
| Brewery with 0 beers | 200 with `{ data: [], meta: { total: 0 } }` — not an error |
| API key for wrong brewery | Stats endpoint: 403. Public endpoints don't check key ownership. |
| Key generation when at 5-key limit | Inline error: "Maximum 5 active keys. Revoke an existing key first." |
| Concurrent key generation | `key_hash` unique constraint prevents collision |
| SQL injection in search `?q=` | Parameterized queries (Supabase handles this) |

---

## NOT in Scope

- Write endpoints (POST/PUT/DELETE) — v1 is read-only
- User-facing API (check-ins, social, achievements) — brewery data only
- Webhook system (push notifications to API consumers) — future sprint
- API usage analytics dashboard — future sprint
- Toast/Square actual integration code — that's Sprint 86-87
- OAuth2 flow — API keys are sufficient for v1

---

## Team Assignments

| Person | Task | Priority |
|--------|------|----------|
| **Morgan** | Sprint lead, priorities, scope control | P0 |
| **Sage** | Plan, specs, coordination, retro prep | P0 |
| **Avery** | API key generation, v1 endpoints, key management UI, docs page | P0 |
| **Jordan** | Architecture review: route structure, auth pattern, response envelope | P0 |
| **Quinn** | Migration 057 (`api_keys` table + RLS + indexes) | P0 |
| **Riley** | Infra review: rate limiting approach, CORS config, key storage security | P0 |
| **Alex** | UX for key management UI (generate modal, key list, revoke flow) | P1 |
| **Casey** | Full QA: auth flows, rate limits, error responses, edge cases | P0 |
| **Reese** | API integration tests (authenticated + unauthenticated, rate limits) | P1 |
| **Sam** | REQ-073 POS integration requirements doc | P1 |
| **Taylor** | Revenue validation: POS tier placement, API as sales asset | P1 |
| **Drew** | Validate: does this API surface what a brewery website/POS actually needs? | P1 |
| **Jamie** | Brand copy for developer docs page | P2 |

---

## Success Criteria

- [ ] Migration 057 applied — `api_keys` table with RLS
- [ ] Brewery owner can generate, name, and revoke API keys from Settings
- [ ] Key shown once on creation, stored as SHA-256 hash only
- [ ] All 7 v1 endpoints return data in standardized envelope
- [ ] Unauthenticated endpoints work without API key (public brewery/beer data)
- [ ] Stats endpoint requires valid API key (401 without)
- [ ] Rate limiting enforced: 100/min authenticated, 20/min unauthenticated
- [ ] Rate limit headers present on all v1 responses
- [ ] CORS headers allow cross-origin requests
- [ ] Developer docs page exists with examples
- [ ] REQ-073 written and reviewed by Sam, Taylor, Drew
- [ ] Existing 57 internal endpoints unaffected
- [ ] `npm run build` passes clean
- [ ] All existing tests pass (39 Vitest + 29 challenge)
- [ ] Casey signs off on happy + sad paths
- [ ] Reese has integration tests covering auth + rate limits

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| API key leakage (plaintext storage) | Low | Critical | SHA-256 hash only in DB, key shown once, never logged |
| Rate limiting bypass (IP spoofing) | Low | Medium | Acceptable at our scale; add Redis/Cloudflare later if needed |
| Response envelope changes breaking consumers | Low | High | Freeze the envelope shape — `data`, `meta`, `error` are permanent |
| Scope creep into write endpoints | Medium | Medium | Strict scope: v1 is read-only, period |
| POS research blocking dev work | Low | Low | Research runs in parallel, different owners |
| In-memory rate limiter resetting on deploy | Medium | Low | Acceptable for v1 — document as known limitation |

---

*"The Pipeline" — because before anything can flow, you need the pipes.*

*This is a living document. -- Morgan*
