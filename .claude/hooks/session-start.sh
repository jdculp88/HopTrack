#!/bin/bash
# HopTrack — Sprint 173 — session-start hook
# Runs on SessionStart. Prints current project state so Claude never opens
# a session blind to the pipeline status.
#
# Enforces the S173 retro action item: "no claiming green without proof".
# Every session starts with the actual GitHub Actions state visible.

set -e

PROJECT_ROOT="${CLAUDE_PROJECT_DIR:-$(pwd)}"
cd "$PROJECT_ROOT" || exit 0

# Build the context string
CONTEXT=""

# Git state
BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
STATUS=$(git status --porcelain 2>/dev/null | head -10)
if [ -z "$STATUS" ]; then
  GIT_STATE="clean"
else
  CHANGED_COUNT=$(echo "$STATUS" | wc -l | tr -d ' ')
  GIT_STATE="$CHANGED_COUNT uncommitted files"
fi
CONTEXT="${CONTEXT}## Git State\nBranch: \`$BRANCH\`\nWorking tree: $GIT_STATE\n\n"

# CI status (last 3 runs) — requires gh CLI
if command -v gh >/dev/null 2>&1; then
  CI_STATUS=$(timeout 10 gh run list --workflow=CI --limit 3 --json conclusion,headSha,displayTitle --jq '.[] | "- \(.conclusion // "pending") \(.headSha[:7]) \(.displayTitle)"' 2>/dev/null || echo "(gh CLI unavailable or not authenticated)")
  if [ -n "$CI_STATUS" ]; then
    CONTEXT="${CONTEXT}## Recent CI Runs\n${CI_STATUS}\n\n"
  fi
fi

# Current sprint (from CLAUDE.md "Where We Are" section)
CURRENT_SPRINT=$(grep -E "^\*\*Last Completed Sprint:" CLAUDE.md 2>/dev/null | head -1 | sed 's/\*\*//g' || echo "(not found)")
if [ -n "$CURRENT_SPRINT" ]; then
  CONTEXT="${CONTEXT}## Sprint State\n$CURRENT_SPRINT\n\n"
fi

# Output as JSON for Claude to see at session start
# Only emit if we actually have content
if [ -n "$CONTEXT" ]; then
  # Escape for JSON
  ESCAPED=$(echo -e "$CONTEXT" | jq -Rs .)
  cat <<EOF
{
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": ${ESCAPED}
  }
}
EOF
fi

exit 0
