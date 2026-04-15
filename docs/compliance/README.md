# Compliance 🔐

*Legal, security, privacy — the guardrails around HopTrack.* Owned by [Sam](../../.claude/agents/sam.md) and [Casey](../../.claude/agents/casey.md).

**Back to [wiki home](../README.md).**

---

## The three pillars

- **[gdpr-ccpa.md](gdpr-ccpa.md)** — our GDPR and CCPA assessment. Covers data subject rights, retention, consent, and export. Originated in [Sprint 151](../history/retros/sprint-151-retro.md).
- **[security-and-fraud-prevention.md](security-and-fraud-prevention.md)** — the security model, fraud controls, and session guardrails. See [REQ-080](../requirements/REQ-080-fraud-prevention.md) for the feature-level breakdown and the [Sprint 96 retro](../history/retros/sprint-96-retro.md) for the Phase 1 ship.
- **ftc-disclosures.md** *(to write)* — the FTC disclosure patterns introduced as a P0 in [Sprint 156](../history/retros/sprint-156-retro.md). Tests live in [lib/__tests__/ftc-disclosure.test.tsx](../../lib/__tests__/ftc-disclosure.test.tsx). Sam owns the deep write-up.

## How compliance touches the product

- **Auth** — RLS policies live next to tables in [supabase/migrations/](../../supabase/migrations/). See [architecture/auth-and-rls.md](../architecture/auth-and-rls.md).
- **Age gate** — shipped in [Sprint 156](../history/retros/sprint-156-retro.md). Location consent and the WCAG audit are in the same retro.
- **Brand team roles** — see [REQ-072](../requirements/REQ-072-multi-location-brewery-support.md) and [lib/__tests__/brand-auth.test.ts](../../lib/__tests__/brand-auth.test.ts).
- **CSP + rate limits** — [Sprint 137](../history/retros/sprint-137-retro.md) closed the last gaps. CSP header config lives in [next.config.ts](../../next.config.ts).

## Review cadence

Compliance docs are reviewed every **quarter** or when a regulatory change lands, whichever comes first. Sam pulls the review; Casey verifies the tests still cover the controls.

## When legal asks a question

Point them at this folder. If the answer isn't here, file it here after you answer it — that's the whole wiki thesis.

---

> **Status (2026-04-15):** two of three files exist. `ftc-disclosures.md` is the remaining stub for Sam.
