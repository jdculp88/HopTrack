# Archive 🗄️

*Preserved for context, not maintained.*

**Back to [wiki home](../README.md).**

---

Anything in this folder is historically interesting but not a source of truth. We preserve it so the "why" is never lost, but we don't rely on it for current decisions. If something here contradicts a live doc elsewhere in the wiki, **trust the live doc.**

## What's here

- **[checkins-deprecation-plan.md](checkins-deprecation-plan.md)** — the plan that killed the old `checkins` table in favor of the Sessions system. See [REQ-011](../requirements/REQ-011-checkin-flow.md) (deprecated) → [REQ-025](../requirements/REQ-025-sessions-tap-wall.md) (replacement).
- **[documentation-audit.md](documentation-audit.md)** — an earlier audit that informed parts of this wiki reorg.
- **[url-reference.md](url-reference.md)** — a historical URL reference from before the app-router conventions settled.
- **[drew-brewery-ops-review.md](drew-brewery-ops-review.md)** — Drew's real-world brewery ops review. Useful historical context; live ops lives in [operations/](../operations/README.md).
- **[morgan-claude.md](morgan-claude.md)** — stale duplicate of Morgan's CLAUDE content from before she became a top-level persona in [../../CLAUDE.md](../../CLAUDE.md). Preserved in case someone references the old path.
- **[sprint-29-testing-weekend.md](sprint-29-testing-weekend.md)** and **[sprint-30-testing-audit.md](sprint-30-testing-audit.md)** — one-off testing pushes from Sprints 29-30, before the current testing setup.
- **[josh-plan/](josh-plan/)** — two pre-wiki planning files Joshua kept at the repo root: [new-functionality.md](josh-plan/new-functionality.md) and [server-links.md](josh-plan/server-links.md). Preserved verbatim.

## When to move things here

- A doc has been superseded by a new one — add a deprecation note at the top, move it here, update the superseding doc to link back with context (*"previously tracked in docs/archive/<name>.md"*).
- A planning file is one-off and complete — move here.
- A file was at the repo root and doesn't fit a live section — move here with a note.

## When NOT to move things here

- If it's still load-bearing for current work — it belongs in its live section.
- If it's a retro or sprint plan — those live in [history/](../history/README.md), not here.
- If the content is wrong, update it in place; don't archive the truth.

---

*The archive is a graveyard with good lighting.* 🍺
