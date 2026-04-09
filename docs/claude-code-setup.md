# HopTrack Claude Code Setup — "The Harness"

*Last updated: Sprint 173 — The Harness mini-sprint*

This doc explains how HopTrack's Claude Code environment is configured. It's the onboarding guide for anyone new to the project (future hires, future-you, a fresh clone on a new machine).

---

## What's in The Harness

The Harness is the full Claude Code configuration for HopTrack, designed to make the AI team measurably better without adding friction. It has 4 components:

1. **CLAUDE.md** — Always-loaded team context (200 lines, Morgan's persona + team index + pointers)
2. **Agent files** (`.claude/agents/`) — 15 teammate personas with full personality and backstory
3. **Skills** (`.claude/skills/`) — 8 on-demand playbooks that load only when relevant
4. **Hooks + permissions + MCP** (`.claude/settings.json` + `.claude/hooks/` + `.mcp.json`) — Safety net, automation, and external tool connections

---

## E2E Tests Are Frozen (Sprint 173)

Before reading the skills section: know that **Playwright E2E is currently frozen**. The entire infrastructure lives in `/e2e.frozen/` at the repo root. `@playwright/test` is removed from `devDependencies`, the `test:e2e` npm scripts are gone, and there's no e2e job in CI.

**Reason:** `hoptrack-staging` Supabase is empty. Running 112 auth-dependent tests against an empty DB timed out for hours on every CI run. See `/e2e.frozen/README.md` for the full thaw procedure when we're ready to bring E2E back.

**What's still active:** 1861+ Vitest unit tests, type checking, linting, build. That's the real gate.

---

## The 8 Skills

All skills live in `.claude/skills/<name>/SKILL.md` and load contextually based on their `description` field. Claude loads only the skills relevant to the current task.

| Skill | What it contains | When it triggers |
|---|---|---|
| **`sprint-close`** | 6-step sprint close ceremony (retro → CLAUDE.md → agents → memory → seed → commit) | ONLY on explicit "close the sprint" / "end the sprint" — has `disable-model-invocation: true` because it has side effects |
| **`hoptrack-conventions`** | Code rules: Next.js 16, Supabase, Tailwind v4, Framer Motion, BANNED UI patterns, REQUIRED DRY imports | Writing, reviewing, or refactoring code |
| **`hoptrack-design-system`** | Sprint 11 design decisions, brand colors, font stack, card backgrounds, shadow system, haptics, Framer Motion rules | Any visual/design change — pushy trigger |
| **`hoptrack-testing`** | Vitest + Playwright patterns, Casey's rules, the `createMockClient(): any` pattern, how to debug test failures | Writing, fixing, or reviewing tests |
| **`hoptrack-debug`** | Debug playbook — check CI FIRST (S173 rule), then browser console, server logs, database, reproduce | Anything broken, failing, or unexpected |
| **`hoptrack-retro-format`** | Sprint 12 retro format — everyone speaks, everyone gets roasted, live first then saved | Retros, pulse checks, team reviews |
| **`supabase-migration`** | Migration rules — sequential numbering, RLS in same file, rollback plans, `NOTIFY pgrst reload` | Touching schema or writing migrations |
| **`hoptrack-codebase-map`** | Where everything lives — route groups, lib files, hooks, types, docs, scripts | Navigating the project, "where does X live" |

Skills use progressive disclosure: descriptions are always loaded (~200 chars each), full bodies load only when triggered. You can have many skills without context cost.

---

## The Hooks

Hooks are event-driven shell scripts that fire at specific lifecycle moments. HopTrack has 3:

### `block-secrets.sh` (PreToolUse, matcher: Bash)
Fires before every Bash command. Blocks:
- Attempts to `git add`/`git commit` a `.env` file
- Commands containing known secret patterns (`sk_live_*`, `SUPABASE_SERVICE_ROLE_KEY=...`, etc.)
- Attempts to stage files matching `*secret*`, `*.pem`, `*.key`, etc.

**Effect:** Claude literally cannot commit secrets, even if told to.

### `post-lint.sh` (PostToolUse, matcher: Edit|Write|MultiEdit)
Fires after every file edit. Runs `npx eslint --quiet` on the edited file. If any errors are found, surfaces them to Claude immediately.

**Effect:** React compiler errors are caught the moment they're introduced, not 9 days later in CI. This is the S173 retro's #1 action item, enforced as automation.

### `session-start.sh` (SessionStart)
Fires when a new Claude Code session opens. Prints:
- Current git branch and working tree state
- Last 3 CI run results from GitHub Actions
- Current sprint state from CLAUDE.md

**Effect:** Claude never opens a session blind to the pipeline. Directly prevents the S173 failure mode (CI red for 9 days because nobody was looking).

---

## The Permissions

`.claude/settings.json` has `permissions.deny` and `permissions.allow` lists:

### `deny` (Claude cannot run these, ever)
- `git reset --hard *`
- `git push --force *`
- `rm -rf /` and variants
- `rm -rf .git`
- `psql * DROP TABLE *` / `DROP DATABASE *` / `TRUNCATE *`
- `supabase db reset *`
- `supabase projects delete *`

### `allow` (Claude runs without per-use approval prompts)
- All `npm run lint`, `npm run test`, `npm run build`, `npm run dev` variants
- `npx tsc --noEmit`, `npx eslint`, `npx vitest`, `npx playwright`
- `gh run list`, `gh run view`, `gh workflow run`, etc.
- `git status`, `git diff`, `git log`, `git branch`, `git show`, `git stash`
- `supabase db diff`, `supabase migration list`

**Effect:** Safety net on destructive commands + frictionless execution of routine commands. 90% reduction in permission interruptions.

---

## The MCP Server (Supabase)

`.mcp.json` configures the Supabase MCP server pointing at `hoptrack-staging` (NOT the main HopTrack project in us-east-2).

### Why staging, not main
Per [Supabase docs](https://supabase.com/docs/guides/getting-started/mcp): *"Supabase MCP is only designed for development and testing purposes. It is recommended to not connect to production."*

The MCP lets Claude query the actual database schema, introspect RLS policies, run diagnostic SELECTs, and generate migrations from real state. We never want that firehose pointed at real customer data.

### Required environment variables
Add these to `.env.local` (gitignored — never commit):

```bash
SUPABASE_STAGING_URL=https://<staging-project-ref>.supabase.co
SUPABASE_STAGING_SERVICE_ROLE_KEY=<staging-service-role-key>
```

### Important: staging must be seeded first
As of Sprint 173, `hoptrack-staging` is empty (0 tables, 0 migrations). The MCP config is in place but will error on connection until staging is seeded. See `memory/feedback_staging_supabase_empty.md` for the half-day ops sprint to seed it.

### Who uses it
- **Riley** — migration state audits
- **Quinn** — query optimization, index analysis
- **Avery** — RLS policy debugging
- **Dakota** — schema lookups when building features
- **Jordan** — architecture decisions that need real schema context

---

## First-Time Setup on a New Machine

1. **Clone the repo**
   ```bash
   git clone https://github.com/jdculp88/HopTrack.git
   cd HopTrack
   npm install
   ```

2. **Copy the env template**
   ```bash
   cp .env.local.example .env.local
   # Fill in your real values — NEVER commit this file
   ```

3. **Verify hooks are executable**
   ```bash
   ls -la .claude/hooks/
   # Should show -rwxr-xr-x on all three .sh files
   # If not: chmod +x .claude/hooks/*.sh
   ```

4. **Authenticate gh CLI** (for session-start hook CI check)
   ```bash
   gh auth login
   ```

5. **Open Claude Code in the project**
   ```bash
   claude
   ```
   The session-start hook should fire automatically and print current CI + git state.

6. **Test the hooks**
   ```bash
   # This should be BLOCKED by block-secrets.sh:
   # (Don't actually run it — just verify the block works if Claude tries)
   # git add .env
   ```

---

## Troubleshooting

### "Hook scripts not firing"
- Check that hooks are executable: `ls -la .claude/hooks/`
- Check that `.claude/settings.json` has the hook wiring in place
- Restart Claude Code session to pick up settings changes

### "Lint hook is too slow"
- The hook has a 30s timeout. If it's timing out, check your `eslint.config.mjs` for slow rules
- Alternative: tighten the matcher to only fire on specific paths

### "session-start hook shows '(gh CLI unavailable)'"
- Install gh: `brew install gh`
- Authenticate: `gh auth login`

### "Skills aren't triggering when I expect"
- Run `gh run list --workflow=CI --limit 3` to verify the S173 regression guard lint step is in CI
- Skills use "pushy" descriptions but still require a keyword match. Be more explicit in your prompt.
- Check skill is loaded: `/sprint-close` should autocomplete

### "MCP server won't connect"
- As of Sprint 173, `hoptrack-staging` is empty. MCP will error until staging is seeded.
- Verify env vars are set: `echo $SUPABASE_STAGING_URL`
- Check you're pointing at staging, NOT main

---

## The Philosophy

This setup follows the research-backed patterns from:
- [Claude Code official docs](https://code.claude.com/docs/en/skills)
- [HumanLayer: Writing a good CLAUDE.md](https://www.humanlayer.dev/blog/writing-a-good-claude-md) (CLAUDE.md under 300 lines)
- [Anthropic skills repo](https://github.com/anthropics/skills)
- [claude-md-optimizer](https://github.com/wrsmith108/claude-md-optimizer)

**Core principles:**
1. **Progressive disclosure** — CLAUDE.md (always-on) is small, skills (on-demand) do the heavy lifting
2. **Personalities grow in agent files, not CLAUDE.md** — duplication was killing context
3. **Safety via hooks, not vigilance** — humans forget; scripts don't
4. **Read before guessing** — debug playbook starts with "check CI first" because S173 proved it
5. **Pushy skill triggers** — Claude under-triggers by default; the research was explicit about this

---

## Related Files

- `CLAUDE.md` — Team context and pointers (201 lines post-S173)
- `AGENTS.md` — Agent architecture manifest
- `.claude/agents/` — 15 teammate personality files
- `.claude/skills/` — 8 on-demand skill playbooks
- `.claude/hooks/` — 3 automation scripts
- `.claude/settings.json` — Permissions + hook wiring
- `.mcp.json` — MCP server config
- `memory/feedback_ci_visibility.md` — Why we enforce "check CI first"
- `memory/feedback_staging_supabase_empty.md` — Staging seed ops sprint
- `docs/retros/sprint-173-ci-unblock.md` — The S173 firefight that birthed The Harness
