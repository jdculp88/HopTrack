#!/bin/bash
# HopTrack — Sprint 173 — post-lint hook
# Runs on PostToolUse for Edit/Write/MultiEdit tools.
# Executes `npm run lint -- --quiet` on the edited file to catch React compiler
# errors and type issues the moment they're introduced, not 9 days later in CI.
#
# The --quiet flag shows ERRORS only (no warnings) — we don't want to drown
# Claude in the 2600+ existing warnings. If an error appears, Claude sees it
# in the next turn's context and can fix it immediately.
#
# This hook is the S173 retro's #1 action item, enforced as automation.

set -e

# Read the JSON from stdin and extract the file path
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // .tool_input.path // ""')

# No file path → skip silently (nothing to lint)
if [ -z "$FILE_PATH" ]; then
  exit 0
fi

# Only lint JS/TS/JSX/TSX files
case "$FILE_PATH" in
  *.ts|*.tsx|*.js|*.jsx|*.mjs|*.cjs)
    ;;
  *)
    exit 0
    ;;
esac

# Skip node_modules, .next, and generated files
case "$FILE_PATH" in
  */node_modules/*|*/.next/*|*/dist/*|*/build/*)
    exit 0
    ;;
esac

# Get the project root (where package.json lives)
PROJECT_ROOT="${CLAUDE_PROJECT_DIR:-$(pwd)}"

# Run lint in errors-only mode on just this file
# Timeout protects against hanging — lint should be fast
cd "$PROJECT_ROOT" || exit 0
LINT_OUTPUT=$(timeout 30 npx eslint --quiet "$FILE_PATH" 2>&1 || true)

# If lint output has any content, there are errors — surface them
if [ -n "$LINT_OUTPUT" ]; then
  cat <<EOF
{
  "systemMessage": "Lint errors detected in $FILE_PATH (S173 auto-lint hook):\n\n$LINT_OUTPUT\n\nFix these before continuing. React compiler errors buried in 2600+ warnings was the S173 CI disaster — this hook prevents the regression."
}
EOF
fi

exit 0
