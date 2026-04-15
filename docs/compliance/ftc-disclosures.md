# FTC Disclosures

*How HopTrack handles sponsored content disclosures.* Owned by [Sam](../../.claude/agents/sam.md).

**Back to [compliance](README.md) · [wiki home](../README.md).**

---

## Why this exists

HopTrack supports sponsored challenges ([REQ-075](../requirements/REQ-075-sponsored-challenges.md)) and eventually sponsored promotions. The FTC requires clear, conspicuous disclosure when content is paid or incentivized. Missing those disclosures is a P0 — not a P1, not a "we'll fix it later."

The P0 was called out and shipped in [Sprint 156 — The Triple Shot](../history/retros/sprint-156-retro.md) ([REQ-103](../requirements/REQ-103-ftc-age-gate.md)).

## What we show

- **Sponsored challenges** carry a visible "Sponsored" badge on every surface (feed card, challenge detail page, share card).
- **Share cards** include the disclosure in the image itself, not just as caption text.
- **Review content** tied to sponsorship is moderated — see [lib/moderation](../../lib/) and [lib/__tests__/moderation.test.ts](../../lib/__tests__/moderation.test.ts).

## Where it lives

- Component: [lib/ftc-disclosure](../../lib/).
- Tests: [lib/__tests__/ftc-disclosure.test.tsx](../../lib/__tests__/ftc-disclosure.test.tsx).
- Related: [lib/__tests__/review-report.test.ts](../../lib/__tests__/review-report.test.ts).

## Age gate

Adjacent to FTC but distinct: the 21+ age gate also shipped in [Sprint 156](../history/retros/sprint-156-retro.md). Every consumer entry point runs the age check before surfacing content. See [lib/age-verification](../../lib/) and [lib/__tests__/age-verification.test.ts](../../lib/__tests__/age-verification.test.ts).

## When to add a disclosure

- Any time money changes hands tied to content visibility.
- Any time a brewery's promotion is amplified by the platform beyond organic.
- Any time a HopTrack employee reviews something they're compensated for.

When in doubt, show the disclosure. The cost is zero; the cost of not showing it is a letter from the FTC.

## Cross-links

- [REQ-103 FTC Disclosures + Age Gate](../requirements/REQ-103-ftc-age-gate.md).
- [REQ-075 Sponsored Challenges](../requirements/REQ-075-sponsored-challenges.md).
- [compliance/README.md](README.md).
- [compliance/gdpr-ccpa.md](gdpr-ccpa.md).
