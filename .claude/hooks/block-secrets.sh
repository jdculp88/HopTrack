#!/bin/bash
# HopTrack — Sprint 173 — block-secrets hook
# Runs on PreToolUse for Bash commands. Blocks any attempt to:
#   1. git add/commit a .env file
#   2. Run a command containing a known secret pattern
#   3. Stage a file matching *secret*, *credentials*, *.pem, *.key
#
# Fires synchronously — keep fast. Reads Claude's tool_input from stdin.

set -e

# Read the JSON from stdin and extract the command
INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // ""')

# Empty command → allow (not our concern)
if [ -z "$COMMAND" ]; then
  exit 0
fi

# Block 1: git staging/committing .env files
if echo "$COMMAND" | grep -qE '(git add|git commit).*\.env([^-].*|$)'; then
  cat <<EOF
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "Sprint 173 safety hook: blocked attempt to stage/commit a .env file. Secrets must never enter git history. Use .env.local (gitignored) for real values and .env.local.example for the template."
  }
}
EOF
  exit 0
fi

# Block 2: known secret patterns in the command itself
if echo "$COMMAND" | grep -qE '(SUPABASE_SERVICE_ROLE_KEY=[a-zA-Z0-9]|STRIPE_SECRET_KEY=sk_|sk_live_[a-zA-Z0-9]|sk_test_[a-zA-Z0-9]|ANTHROPIC_API_KEY=sk-ant|RESEND_API_KEY=re_|CRON_SECRET=[a-zA-Z0-9]{20})'; then
  cat <<EOF
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "Sprint 173 safety hook: blocked command containing what looks like a real secret. Never pass secrets on the command line — they're visible in shell history, process lists, and logs. Use environment variables set in .env.local instead."
  }
}
EOF
  exit 0
fi

# Block 3: staging files that look like credentials/keys
if echo "$COMMAND" | grep -qE 'git add.*(credentials|secret|\.pem$|\.key$|id_rsa|id_ed25519)'; then
  cat <<EOF
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "Sprint 173 safety hook: blocked attempt to stage a file that looks like a credential or key. If this is a false positive (e.g., a test fixture), rename the file or commit it explicitly outside of Claude."
  }
}
EOF
  exit 0
fi

# All checks passed — allow the command
exit 0
