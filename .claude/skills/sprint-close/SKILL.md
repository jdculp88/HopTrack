---
name: sprint-close
description: Runs the HopTrack Sprint Close Ceremony — retro, CLAUDE.md update, agent files, memory, seed-next-day, single commit. Use ONLY when Joshua explicitly says "close the sprint", "end the sprint", "wrap the sprint", "sprint close", or "let's close this out". Do NOT auto-trigger based on context — this ceremony has side effects (runs scripts, modifies memory, creates commits) and must only run on explicit founder command.
disable-model-invocation: true
allowed-tools: Bash(git add *) Bash(git commit *) Bash(git status *) Bash(git log *) Bash(git diff *) Bash(git push *) Bash(node scripts/seed-next-day.mjs)
---

# Sprint Close Ceremony

When Joshua signals a sprint close, Sage runs the full ceremony under Morgan's oversight in this exact order — no shortcuts, no skipping steps. **Non-negotiable. Every sprint closes clean.**

## The 6 Steps

### 1. Retro (live first, then saved)
- Deliver the retro **live in chat FIRST** — everyone speaks, everyone gets roasted (lovingly)
- The team chimes in naturally — not just one voice, not Jordan writing in silence
- Roasts are encouraged. Roasting the founder is part of the culture.
- After the live retro, save it to `docs/retros/sprint-NNN-retro.md` (match the current sprint number)
- Keep the roasts in the saved file — they're part of the history

### 2. Update CLAUDE.md
- Update the "Where We Are" section with the sprint summary
- Include: sprint number, theme, tracks completed, files changed, test count, lint status, retro location
- Match the tone and density of existing sprint entries — this is a living document

### 3. Update agent files (only if needed)
- Check `.claude/agents/` for any roles or context that changed this sprint
- If new team members joined, roles shifted, or a catchphrase evolved — update the affected file
- If nothing changed, skip this step (no busy work)

### 4. Update memory
- Update `MEMORY.md` index at `/Users/jdculp/.claude/projects/-Users-jdculp-Projects-hoptrack/memory/`
- Add or update relevant memory files for what future conversations should carry forward
- Focus on decisions, blockers, and context — not code details

### 5. seed-next-day
- Run `node scripts/seed-next-day.mjs`
- Advances Pint & Pixel one day forward
- Do not skip this — it's what keeps the demo data current

### 6. Commit everything
- **Single commit** with ALL changes from steps 2–5
- Push straight to `main` (no PR — the founder trusts the team)
- Commit message reflects the sprint theme and the biggest ships
- Include the standard Claude Code co-author trailer

## Rules
- Do NOT skip steps. Every sprint closes clean.
- Do NOT split into multiple commits. One commit, one push.
- Do NOT forget `seed-next-day` — it keeps Pint & Pixel current.
- Do NOT cut the retro short. The team deserves to speak.
- Do NOT update agent files unless something actually changed this sprint.
