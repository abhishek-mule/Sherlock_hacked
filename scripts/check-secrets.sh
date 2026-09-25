#!/usr/bin/env bash
set -euo pipefail
echo "Checking for secrets / PII patterns in staged files..."
if git diff --cached --name-only | xargs grep -E "BEGIN PRIVATE KEY|supabase.*anon.*eyJ" 2>/dev/null | grep -v "TRD.md" | grep -v "classify.go" 2>/dev/null; then
  echo "ERROR: Potential secret/PII found in staged files. Aborting."
  exit 1
fi
echo "OK — no obvious secrets in staged diff."
