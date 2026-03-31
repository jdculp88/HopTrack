# Requirements Index
**Last updated:** 2026-03-31 (Sprint 74)
**Audited by:** Sam + Sage

All requirements below are COMPLETE and shipped. These documents are preserved as historical reference for the design decisions and acceptance criteria behind each feature.

| REQ | Feature | Sprint Delivered | Status |
|-----|---------|-----------------|--------|
| REQ-001 | Theme Toggle (dark/light) | Sprint 11 | COMPLETE |
| REQ-002 | Brewery Images & Beer Menus | Sprint 12 | COMPLETE |
| REQ-003 | Loyalty System | Sprint 16 | COMPLETE |
| REQ-004 | Brewery Accounts & Claims | Sprint 14 | COMPLETE |
| REQ-005 | Wrapped Recaps (Pint Rewind) | Sprint 33 | COMPLETE |
| REQ-006 | TV Display (The Board) | Sprint 16 | COMPLETE |
| REQ-007 | Brewery Insights & Analytics | Sprint 43 | COMPLETE |
| REQ-008 | XP & Leveling System | Sprint 13 | COMPLETE |
| REQ-009 | Reactions & Wishlist | Sprint 13 | COMPLETE |
| REQ-010 | Flavor Tags & Serving Styles | Sprint 13 | COMPLETE |
| REQ-011 | Check-in Flow (deprecated) | Sprint 14 | DEPRECATED (replaced by Sessions in Sprint 16) |
| REQ-012 | Beer Wishlist | Sprint 13 | COMPLETE |
| REQ-013 | Beer Passport | Sprint 63 | COMPLETE (revamped) |
| REQ-025 | Sessions & Tap Wall | Sprint 16 | COMPLETE |

### Queued

| REQ | Feature | Sprint Target | Status |
|-----|---------|--------------|--------|
| REQ-069 | Enhanced KPIs & Analytics (Drinker + Brewery) | Stick Around (79-84) | QUEUED |
| REQ-070 | Non-Beer Menu Uploads for Breweries | Launch or Bust (75-78) / Stick Around (79-84) | QUEUED |

### Notes
- REQ-011 (check-in flow) was superseded by the Sessions system (REQ-025). The `checkins` table was dropped in migration 015.
- REQ-013 (Beer Passport) was revamped in Sprint 63 with style-colored stamps, sort controls, and animated count.
- Requirements REQ-014 through REQ-024 were tracked in `docs/roadmap.md` rather than as individual REQ files.
- The QA checklist template (`QA-checklist-template.md`) is available for any future feature QA.
