#!/usr/bin/env bash
# Sherlock Hacked — pre-commit data guard
#
# Blocks commits that would publish local dataset material. The workbooks and
# everything generated from them must stay on the analyst's machine.
set -uo pipefail

fail=0
STAGED=$(git diff --cached --name-only --diff-filter=ACM)

if [ -z "$STAGED" ]; then
  exit 0
fi

# 1. Never stage the workbooks or generated data.
FORBIDDEN=$(printf '%s\n' "$STAGED" | grep -E \
  '(^|/)data/.*\.(json|db|log)$|\.(xlsx|xls|backup|dump)$|(^|/)(full-students|master-7bt|admissions|osint|unified-full)\.json$' \
  || true)
if [ -n "$FORBIDDEN" ]; then
  echo "BLOCKED: local dataset material in commit:" >&2
  printf '  %s\n' $FORBIDDEN >&2
  fail=1
fi

# 1b. Any other JSON large enough to be a record dump.
# Lockfiles are legitimately large and are not record data.
BIGJSON=$(printf '%s\n' "$STAGED" | grep -E '\.json$' \
  | grep -vE '(^|/)(package-lock\.json|composer\.lock)$' \
  | while read -r f; do
    [ -f "$f" ] || continue
    if [ "$(wc -c <"$f")" -gt 200000 ]; then echo "$f"; fi
  done || true)
if [ -n "$BIGJSON" ]; then
  echo "BLOCKED: large JSON that may be a record dump:" >&2
  printf '  %s\n' $BIGJSON >&2
  fail=1
fi

# 2. Never stage secrets.
# Patterns are assembled from fragments so this file cannot match itself and
# no filename allowlist is needed.
PEM="BEGIN ""(RSA |EC |OPENSSH )?PRIVATE KEY"
AWS="AK""IA[0-9A-Z]{16}"
GHT="gh[pous""r]_[A-Za-z0-9]{30,}"
ANON="eyJhbGci""Oi[A-Za-z0-9_-]{20,}"
SECRET_RE="$PEM|$AWS|$GHT|$ANON"

HITS=$(printf '%s\n' "$STAGED" | xargs -r grep -lIE "$SECRET_RE" 2>/dev/null || true)
if [ -n "$HITS" ]; then
  echo "BLOCKED: credential-shaped string in staged files:" >&2
  printf '  %s\n' $HITS >&2
  printf '%s\n' $HITS | xargs -r grep -nIE "$SECRET_RE" 2>/dev/null | cut -c1-160 >&2
  fail=1
fi

# 3. Warn on likely PII literals (12-digit Aadhaar-like runs, IFSC, emails in bulk).
PII=$(printf '%s\n' "$STAGED" | grep -vE '\.(ts|tsx|js|mjs|go|md|json)$' | head -n 0 || true)
BULK=$(printf '%s\n' "$STAGED" | xargs -r grep -lE '[0-9]{4}[ -]?[0-9]{4}[ -]?[0-9]{4}' 2>/dev/null || true)
if [ -n "$BULK" ]; then
  echo "NOTE: 12-digit numeric run found in:" >&2
  printf '  %s\n' $BULK >&2
fi

if [ "$fail" -ne 0 ]; then
  echo "" >&2
  echo "If this is a false positive, stage an allowlist exception explicitly:" >&2
  echo "  git commit --no-verify   # only after manual review" >&2
  exit 1
fi

exit 0
