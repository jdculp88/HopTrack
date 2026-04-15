# REQ-080: Fraud Prevention Phase 1

**Status:** COMPLETE
**Sprint:** 96 (The Lockdown)
**Feature:** F-031

## Overview
First phase of fraud prevention for the loyalty redemption system, introducing redemption codes with time-limited expiry and staff-side confirmation to prevent self-service abuse.

## Requirements
- 6-character alphanumeric redemption codes generated on loyalty reward claim
- 5-minute expiry window: code becomes invalid after expiry, user must re-request
- Staff confirmation flow: brewery staff enters code on dashboard to validate and complete redemption
- Rate limiting: max 3 redemption attempts per user per hour to prevent brute-force
- Code display: consumer sees large, readable code with countdown timer
- Staff dashboard widget: code entry field with real-time validation feedback
- Audit trail: all redemption attempts (success + failure) logged with timestamps

## Acceptance Criteria
- Consumer receives 6-char code when claiming loyalty reward
- Code displays with visible countdown timer (MM:SS format)
- Expired codes show clear "Expired" state with re-request option
- Staff can enter code on dashboard and see instant valid/invalid feedback
- Valid code confirmation completes the redemption and updates loyalty status
- Invalid/expired code shows descriptive error message
- Rate limit enforced: 4th attempt within 1 hour returns 429
- Audit log captures all attempts for fraud investigation

## Technical Notes
- Code generation: `crypto.randomBytes(3).toString('hex').toUpperCase()` (6 chars)
- Expiry stored as `created_at + 5min` interval, checked server-side
- Staff confirmation endpoint validates code + expiry + brewery match in single query
- Rate limiting uses existing rate limit middleware with per-user key
- Codes are one-time-use: marked consumed on successful staff confirmation

---

## RTM Links

### Implementation
[lib/rate-limiting](../../lib/), [lib/session-flow](../../lib/), [lib/security-headers](../../lib/)

### Tests
[rate-limiting.test.ts](../../lib/__tests__/rate-limiting.test.ts), [security-headers.test.ts](../../lib/__tests__/security-headers.test.ts)

### History
- [retro](../history/retros/sprint-96-retro.md)
- [plan](../history/plans/sprint-96-plan.md)

## See also
[compliance/security-and-fraud-prevention.md](../compliance/security-and-fraud-prevention.md)

> Added 2026-04-15 during the wiki reorg — see the [RTM](README.md) for the master table.
