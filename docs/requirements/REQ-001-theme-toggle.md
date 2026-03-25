# REQ-001 — Light / Dark Theme Toggle
**Status:** In Progress
**Priority:** Now
**Owner:** Alex (UI/UX), Jordan (Dev)
**Sprint:** 1

## Summary
Add a light/dark theme toggle to HopTrack. Dark mode remains the default. Light mode uses warm off-whites with the same gold accent system.

## Light Theme Palette
| Token | Dark Value | Light Value |
|-------|-----------|-------------|
| `--color-bg` | `#0F0E0C` | `#FAF7F2` |
| `--color-surface` | `#1C1A16` | `#FFFFFF` |
| `--color-surface-2` | `#252219` | `#F0EAE0` |
| `--color-border` | `#3A3628` | `#E2D9CC` |
| `--color-text-primary` | `#F5F0E8` | `#1A1814` |
| `--color-text-secondary` | `#A89F8C` | `#6B5F4E` |
| `--color-text-muted` | `#6B6456` | `#9E8E7A` |
| `--color-accent-gold` | `#D4A843` | `#C49A35` *(slightly deeper for contrast)* |

## Acceptance Criteria
- [ ] Toggle button in Settings page and accessible from AppNav
- [ ] Preference persisted to `localStorage`
- [ ] System preference (`prefers-color-scheme`) used as default if no saved preference
- [ ] All pages render correctly in both themes
- [ ] No hardcoded hex colors remain in components — all use CSS variables
- [ ] Transition between themes is smooth (150ms ease)

## Notes
- Theme applied via `data-theme="light"` on `<html>` element
- Tailwind classes updated to reference CSS variables rather than raw hex
