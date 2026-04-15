# Skills Index 🛠️

*Contextual technical knowledge — loaded when it's needed.*

**Back to [team](README.md) · [wiki home](../README.md).**

---

Skills are how HopTrack's technical knowledge stays navigable. Instead of one giant CLAUDE.md, we split technical conventions into 8 skills that load contextually — Morgan loads them when the work matches their trigger. Every skill lives in [.claude/skills/](../../.claude/skills/).

## The skills

| Skill | Triggers On | Owns | File |
|---|---|---|---|
| **hoptrack-conventions** | Writing, reviewing, refactoring code | Next.js 16 patterns, Supabase rules, Tailwind v4, Framer Motion, BANNED UI patterns, REQUIRED UI patterns, DRY imports | [SKILL.md](../../.claude/skills/hoptrack-conventions/SKILL.md) |
| **hoptrack-design-system** | Visual or design work | Sprint 11 decisions, brand colors, font stack, card-bg system, beer-style color families, shadow system, Framer Motion rules, haptic rules, reduced-motion rules | [SKILL.md](../../.claude/skills/hoptrack-design-system/SKILL.md) |
| **hoptrack-testing** | Writing, fixing, reviewing tests | Vitest + Playwright patterns, Casey's coverage rules, Reese's automation standards, Supabase mock pattern, Playwright-frozen context | [SKILL.md](../../.claude/skills/hoptrack-testing/SKILL.md) |
| **hoptrack-debug** | Anything broken | Debug playbook. **Rule #1: check CI first.** Systematic diagnostic order: CI → browser console → server logs → database → reproduce → add logging | [SKILL.md](../../.claude/skills/hoptrack-debug/SKILL.md) |
| **hoptrack-retro-format** | "retro", "pulse check", "lessons learned" | Sprint 12 retro format — everyone speaks, everyone gets roasted, live in chat first, then saved | [SKILL.md](../../.claude/skills/hoptrack-retro-format/SKILL.md) |
| **hoptrack-codebase-map** | Navigating the project, searching for a helper, "where does X live" | Where everything lives: route groups, shared libs, hooks, types, scripts, docs | [SKILL.md](../../.claude/skills/hoptrack-codebase-map/SKILL.md) |
| **supabase-migration** | Touching the schema, writing a migration | Sequential numbering, RLS in same migration, `gen_random_uuid`, rollback plans, `NOTIFY pgrst 'reload schema'` after FK changes | [SKILL.md](../../.claude/skills/supabase-migration/SKILL.md) |
| **sprint-close** | Manual only — Joshua says "close the sprint" | 6-step close ceremony: retro → CLAUDE.md → agent files → memory → seed-next-day → commit | [SKILL.md](../../.claude/skills/sprint-close/SKILL.md) |

## How skills relate to the wiki

The wiki is the **durable, versioned** knowledge layer — it lives in `docs/` and survives context resets. Skills are the **contextual, operational** layer — they load into Morgan's context *when* the work matches their trigger. Same knowledge, different delivery.

When a convention is mature enough to be canonical, it belongs in both places:

- The wiki has the **reference** ([architecture/tech-stack.md](../architecture/tech-stack.md), [testing/vitest-guide.md](../testing/README.md), [design/design-system.md](../design/design-system.md)).
- The skill has the **trigger** so Morgan doesn't have to remember to load it.

The [hoptrack-codebase-map skill](../../.claude/skills/hoptrack-codebase-map/SKILL.md) is the closest peer to this wiki — it's the file-level map Morgan loads when navigating code.

## Cross-links

- **Who uses which skill** — every teammate's agent file in [.claude/agents/](../../.claude/agents/) references the skills relevant to their role.
- **Architecture blueprint** — [architecture/README.md](../architecture/README.md) shares ground with `hoptrack-conventions` and `hoptrack-codebase-map`.
- **Testing strategy** — [testing/README.md](../testing/README.md) shares ground with `hoptrack-testing`.
- **Design system** — [design/design-system.md](../design/design-system.md) shares ground with `hoptrack-design-system`.
- **Debug order** — [operations/README.md](../operations/README.md) references `hoptrack-debug` when things break.

---

*Skills load contextually. The wiki is always there.* 🍺
