# Sprint 85 Retro — The Pipeline
**Facilitated by:** Sam (Business Analyst / QA Lead) 📊
**Sprint Theme:** Public API v1 — the foundation for all integrations
**Arc:** Open the Pipes (Sprints 85-90) — OPENING SPRINT

---

## What Shipped

**Goal 1: Public API v1 (F-016)**
7 versioned endpoints at `/api/v1/`: brewery detail, beers/tap list (with pour sizes + pagination), full menu (grouped by item_type), events, stats (API key required, brewery-scoped), beer detail, beer search. API key system with SHA-256 hashing, `ht_live_` prefix, max 5 per brewery, revocable. Standardized JSON envelope (`{ data, meta, error }`). Rate limiting: 100 req/min authenticated, 20 req/min unauthenticated. CORS enabled. ApiKeyManager UI in brewery Settings. API Documentation section in Resources page.

**Goal 2: POS Integration Research (REQ-073)**
Sam wrote comprehensive requirements for Toast + Square POS integration: OAuth2 flows, menu sync webhooks, sales intelligence, keg tracking, encrypted token storage, tier gating. Groundwork for Sprint 86.

**Migration 057:** `api_keys` table with RLS (brewery admins + superadmin), 5-key limit trigger.

---

## The Round Table

**Sam** 📊: I'll facilitate this one. From a business continuity standpoint, this sprint changes what HopTrack is. We went from "app with internal API endpoints" to "platform with a public API." That's a category shift. The standardized envelope, the key system, the rate limiting — this is what partners expect to see. And REQ-073 is the most thorough requirements doc we've written. 14 sections, acceptance criteria, phase breakdown. The POS work ahead has a blueprint now.

**Jordan** 🏛️: The API architecture is clean. Versioned routes under `/api/v1/`, separate from our internal endpoints. The `apiResponse()` and `apiError()` helpers enforce the envelope pattern — you literally can't return a non-standard response without trying. The key validation middleware is a single `validateApiKey()` call. No magic, no middleware chain, just a function. That's the pattern I want.

**Avery** 💻: Seven endpoints, all following the same shape. Once Jordan blessed the pattern on the first one, the rest were fast. The stats endpoint being brewery-scoped (key must match brewery_id) was the right security call — no key can pull another brewery's analytics. The pagination on beers and events uses cursor-based offset with `limit` and `offset` query params. Already on it for the POS work next sprint.

**Alex** 🎨: The ApiKeyManager UI in Settings — that feels right. Generate a key, see the prefix, copy the full key (shown once), revoke with inline confirmation. No modal for key creation, just an AnimatePresence slide-down with the name input. The "shown once" warning in amber is important UX. Does it feel right? Yes. Does it feel serious? Also yes. Good.

**Riley** ⚙️: Migration 057 is clean. The 5-key limit trigger is a database-level enforcement — even if someone bypasses the API, they can't create more than 5 keys per brewery. Belt and suspenders. The CORS config in `next.config.ts` scopes to `/api/v1/` only — internal endpoints aren't exposed. The migration pipeline is real and it ran smooth.

**Quinn** ⚙️: Let me check the migration state first — 057 applied, indexes on `brewery_id` and `key_hash` are live. The `key_hash` index is critical for the hot path — every authenticated request does a hash lookup. SHA-256 is fast but the index makes it O(1) instead of a table scan. Rate limiting state is in-memory (per-instance) for now — works fine at our scale, Redis later if needed.

**Casey** 🔍: Zero P0 bugs open right now. ZERO. I tested every endpoint: valid key, invalid key, revoked key, expired rate limit, missing key on stats, CORS preflight, pagination boundaries. The rate limiter correctly returns 429 with a `Retry-After` header. The error envelope is consistent across all failure modes. I'm watching it.

**Reese** 🧪: Covered. The API endpoints are pure request/response — perfect for automated testing. I've got curl-based test scripts for all 7 endpoints. The key lifecycle (create → use → revoke → reject) is a clean test flow. Unit test candidates: `generateApiKey()`, `validateApiKey()`, `hashApiKey()`.

**Drew** 🍻: Public API means third parties can build on us. A brewery's website can pull their live tap list from HopTrack. A beer review site can link to our beer detail. That's the network effect — every integration makes HopTrack more valuable to the brewery. I felt that physically. In a good way.

**Taylor** 💰: "Do you have an API?" is the first question every integration partner asks. Now the answer is yes, here's the docs. The Resources page with API documentation is a sales tool. When I'm pitching Cask tier and the brewery says "can we put the tap list on our website?" — I point them to the API. That's a close. We're going to be rich.

**Jamie** 🎨: The API Documentation section in Resources keeps the brand voice. It's not sterile developer docs — it's HopTrack explaining how to use the API with personality. The code examples use brewery names from our seed data. Little touches that make it feel like us. Chef's kiss.

**Morgan** 🗂️: New arc, clean start. The Pipeline is exactly what it sounds like — we laid the pipe. Data flows out now. Sprint 86 builds the pipes for data flowing IN (POS). Sam's REQ-073 is the blueprint. This is a living document and so is that API.

**Sage** 📋: Sprint 85 deliverables logged: 7 endpoints, 1 migration, API key system, rate limiting, CORS, UI, docs, REQ-073. Zero carryover. I've got the notes.

---

## Roast Corner

**Casey** to **Quinn**: "The rate limiter is in-memory per-instance." Quinn: "It works at our scale." Casey: "Our scale is one founder and thirteen imaginary team members."

**Drew** to **Taylor**: You said "table stakes" three times in the planning meeting. That's a drinking game now.

**Jordan** to **Avery**: Seven endpoints, same pattern, no deviations. I almost don't have a job anymore. *Almost.*

**Sam** to **Joshua**: "You built a platform and didn't notice. That's very on-brand."

---

*The pipe is laid. The water's about to flow.* 🍺
