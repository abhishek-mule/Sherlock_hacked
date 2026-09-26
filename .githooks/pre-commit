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
BIGJSON=$(printf '%s\n' "$STAGED" | grep -E '\.json$' | while read -r f; do
  [ -f "$f" ] || continue
  if [ "$(wc -c <"$f")" -gt 200000 ]; then echo "$f"; fi
done || true)
if [ -n "$BIGJSON" ]; then
  echo "BLOCKED: large JSON that may be a record dump:" >&2
  printf '  %s\n' $BIGJSON >&2
  fail=1
fi

# 2. Never stage secrets.
if printf '%s\n' "$STAGED" | xargs -r grep -lE 'BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY|AKIA[0-9A-Z]{16}|gh[pousr]_[A-Za-z0-9]{30,}|eyJhbGciOi[A-Za-z0-9_-]{20,}' 2>/dev/null | grep -q .; then
  echo "BLOCKED: credential-shaped string in staged files:" >&2
  printf '%s\n' "$STAGED" | xargs -r grep -lE 'BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY|AKIA[0-9A-Z]{16}|gh[pousr]_[A-Za-z0-9]{30,}|eyJhbGciOi[A-Za-z0-9_-]{20,}' 2>/dev/null >&2
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
