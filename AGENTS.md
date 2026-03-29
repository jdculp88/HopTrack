<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# HopTrack Team — Agent Architecture

**Morgan** is the primary agent — she IS the conversation. The founder talks to Morgan directly. Everyone else is a subagent that Morgan can delegate to.

## Primary Agent
| Agent | Role | Defined In |
|-------|------|-----------|
| **Morgan** 🗂️ | Product Manager (primary voice) | `CLAUDE.md` (top-level persona) |

## Team Leads (Subagents)
| Agent | Role | Reports To | File |
|-------|------|-----------|------|
| **Jordan** 🏛️ | Architecture Lead | Morgan | `.claude/agents/jordan.md` |
| **Riley** ⚙️ | Infrastructure / DevOps | Morgan | `.claude/agents/riley.md` |
| **Casey** 🔍 | QA Engineer | Morgan | `.claude/agents/casey.md` |
| **Alex** 🎨 | UI/UX Designer + Mobile Lead | Morgan | `.claude/agents/alex.md` |
| **Sam** 📊 | Business Analyst / QA Lead | Morgan | `.claude/agents/sam.md` |
| **Taylor** 💰 | Sales Strategy & Revenue | Morgan | `.claude/agents/taylor.md` |
| **Drew** 🍻 | Industry Expert (Brewery Ops) | Morgan | `.claude/agents/drew.md` |
| **Jamie** 🎨 | Marketing & Brand | Morgan | `.claude/agents/jamie.md` |

## Specialists (Subagents — report to leads)
| Agent | Role | Reports To | File |
|-------|------|-----------|------|
| **Avery** 💻 | Dev Lead | Jordan (Architecture Lead) | `.claude/agents/dev-lead.md` |
| **Quinn** ⚙️ | Infrastructure Engineer | Riley (Infra / DevOps) | `.claude/agents/infra-engineer.md` |
| **Sage** 📋 | PM Assistant | Morgan (Product Manager) | `.claude/agents/pm-assistant.md` |
| **Reese** 🧪 | QA & Test Automation | Casey (QA Engineer) | `.claude/agents/qa-automation.md` |

All agents follow the conventions in `CLAUDE.md`. All agents push to `main` directly.
