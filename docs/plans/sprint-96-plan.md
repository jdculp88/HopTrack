# Sprint 96 — The Lockdown
**Arc:** The Flywheel (Sprint 6 of 6 — FINAL)
**Theme:** Secure the foundation, fix the core flow
**PM:** Morgan | **Arch:** Jordan | **Dev:** Avery | **QA:** Casey + Reese | **Design:** Alex

---

## Sprint Goals

### Goal 1: Session Drawer UX Overhaul (BL-011)
**Owner:** Alex (design) + Avery (dev)
**Size:** L
**Priority:** P0

The most-used feature in the app has core UX issues:

1. **Beer selections don't persist** when closing the drawer — need to save state so closing/reopening preserves selections
2. **Lower drawer with selections** — minimize drawer without losing work
3. **Active session card** — show live status: current beer, total beers, HopRoute status, drinking companions
4. **Cancel session** — "are you sure?" confirmation with data loss warning. Currently only "end session" which saves. Need ability to discard without saving.
5. **Look and feel** — drawer should match the app's design system (rounded-2xl, CSS vars, Framer Motion)

### Goal 2: Fraud Prevention Phase 1 (BL-010)
**Owner:** Jordan (architecture) + Drew (validation)
**Size:** M

Phase 1: Brewery-side confirmation for reward redemptions.

**Scope:**
- Design doc for full fraud prevention strategy (Phase 1-3)
- Staff confirmation flow: when a user redeems a loyalty reward or mug club perk, brewery staff confirms via dashboard before it's honored
- Redemption codes or QR-based verification
- Applies to: loyalty stamp redemptions, mug club perk claims

**NOT in Phase 1:** POS validation, session verification, automated fraud detection. Those are Phase 2+.

### Goal 3: Tier Feature Matrix + Billing Clarity (BL-007 + BL-008)
**Owner:** Taylor (strategy) + Avery (dev)
**Size:** S

1. **Feature matrix** — define exactly what Free/Tap/Cask/Barrel gets, feature by feature
2. **Billing page upgrade** — show current tier prominently, what you're paying, feature comparison, clear upgrade/downgrade paths. Replace current minimal Stripe portal link with a proper tier comparison page.

### Goal 4: Arc Close-Out — The Flywheel
**Owner:** Morgan + Sage
**Size:** S

- Flywheel arc summary (6 sprints)
- Roadmap update
- Next arc preview
- Retro

---

## Acceptance Criteria

### Session Drawer
- [ ] Beer selections persist when drawer is closed and reopened
- [ ] Drawer can be minimized (lowered) without losing selections
- [ ] Active session shows: live indicator, current beer, total beers logged, HopRoute status, companions
- [ ] "Cancel session" option with confirmation dialog and data loss warning
- [ ] Drawer matches app design system (no browser-default styling)

### Fraud Prevention
- [ ] Design doc written covering Phase 1-3 strategy
- [ ] Brewery staff can confirm/approve reward redemptions from dashboard
- [ ] Redemption requires verification (code or staff tap) before perk is honored
- [ ] Loyalty stamp redemptions gated behind confirmation
- [ ] Mug club perk claims gated behind confirmation

### Tier Matrix + Billing
- [ ] Feature matrix documented (Free vs Tap vs Cask vs Barrel)
- [ ] Billing page shows current tier with visual indicator
- [ ] Billing page shows feature comparison between tiers
- [ ] Upgrade/downgrade CTAs are clear

### Arc Close-Out
- [ ] Flywheel arc summary in roadmap
- [ ] Sprint 96 retro delivered
- [ ] Next arc previewed

---

## Backlog Items NOT in Sprint 96 (Queued)

| # | Item | When |
|---|------|------|
| BL-009 | Mug club consumer experience | Next arc (needs fraud prevention first) |
| BL-012 | Homepage screenshot refresh | Jamie side goal, any sprint |

---

*Sprint plan written by Sage, approved by Morgan.*
