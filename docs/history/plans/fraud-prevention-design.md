# Fraud Prevention Strategy — Design Doc
**Author:** Jordan (Architecture Lead) + Drew (Brewery Ops)
**Sprint:** 96 — The Lockdown
**Status:** Phase 1 shipped

---

## Problem

Loyalty rewards and mug club perks have zero verification. A customer can claim they're redeeming a reward with nothing but a screen that says "Reward Ready!" — no staff confirmation, no audit trail, no fraud prevention. Drew flagged this as operational chaos waiting to happen on a busy Friday night.

---

## Three-Phase Approach

### Phase 1: Redemption Codes + Staff Confirmation (Sprint 96)

**Shipped.** Short-lived verification codes bridge the trust gap between customer claims and brewery operations.

**How it works:**
1. Customer earns enough loyalty stamps (or is an active mug club member)
2. Customer taps "Redeem Reward" / "Claim Perk" in the app
3. App generates a 6-character alphanumeric code (5-minute expiry)
4. Customer shows the code to brewery staff
5. Staff enters the code in the brewery admin loyalty page
6. System validates: code exists, not expired, matches brewery, user is eligible
7. On confirmation: stamps decremented (loyalty) or perk logged (mug club), code marked confirmed

**Security measures:**
- 6-char code space (~2B combinations) + 5-minute window = brute force impractical
- Rate limited: 5 generates/min per user, 10 confirms/min per brewery
- Auto-cancel previous pending codes (prevents accumulation)
- Expired codes auto-marked (cleanup function)
- All codes have full audit trail (created_at, confirmed_at, confirmed_by)

**Migration:** `066_redemption_codes.sql`

---

### Phase 2: POS Validation (Future)

Tie redemptions to actual POS transactions. When a staff member confirms a redemption code, the system checks whether a corresponding comp/discount transaction exists in the POS system (Toast/Square via the sync engine from Sprints 86-87).

**Scope:**
- Redemption confirmation requires matching POS transaction within N-minute window
- Auto-flag mismatches for manager review
- Dashboard shows redemption-to-POS reconciliation report
- Requires: POS sync engine live with real provider credentials

**Prerequisite:** Active POS integration (currently stubbed, pending partner approval)

---

### Phase 3: Automated Fraud Detection (Future)

Pattern-based anomaly detection on stamp accumulation and redemption behavior.

**Signals to monitor:**
- Rapid stamp accumulation (multiple sessions in short window)
- Session duration anomalies (2-minute sessions that earn stamps)
- Geographic inconsistency (stamping at brewery while phone GPS is elsewhere)
- Redemption frequency spikes per user
- Unusually high redemption rates vs. visit patterns

**Actions:**
- Auto-flag suspicious activity for brewery review
- Temporary hold on redemption (requires manager override)
- Weekly fraud digest email to brewery owners

**Prerequisite:** Sufficient data volume (months of real usage patterns)

---

## Decision Log

| Decision | Rationale |
|----------|-----------|
| 6-char codes, not QR | Simpler for staff — no scanning hardware needed. QR can be added later as an upgrade. |
| 5-minute expiry | Short enough to prevent sharing, long enough for busy bar staff. Drew validated this window. |
| Code input, not scan | Brewery staff already have the admin dashboard open. Adding a text input is zero-friction vs. building a scanner PWA. |
| Phase 1 first, POS later | POS integration is stubbed. We can't tie to transactions until real credentials are live. |
| No separate staff app | Reuse the brewery admin dashboard. One less app to build and maintain. |

---

*Document authored by Jordan, validated by Drew. Phase 1 implementation by Avery.*
