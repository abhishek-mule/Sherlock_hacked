# Sherlock Hacked — Local-First Record Intelligence

Search and inspect the two local workbooks, with evidence-grade matching and provenance.
Everything runs on your machine. No hosted backend, no Supabase, no account.

---

## Run locally

### Requirements

| Tool | Version | Needed for |
|------|---------|-----------|
| Node.js | 18+ (20/22 recommended) | web app |
| Python 3 | 3.9+ with `openpyxl` | converting the `.xlsx` workbooks |
| Go | 1.22+ | CLI + the OSINT core |
| JDK 17 | optional | only for building the Android APK |

```bash
# Python dependency (once)
pip3 install --break-system-packages openpyxl
```

### Steps

```bash
git clone https://github.com/abhishek-mule/Sherlock_hacked.git
cd Sherlock_hacked

# 1. install web dependencies
npm install

# 2. build the local dataset from the two workbooks
#    (db_cluster_data.xlsx and "MASTER DATABASE 7BT CT 2026_27 B(2).xlsx"
#     must sit in the repo root — they are gitignored and never uploaded)
python3 scripts/ingest.py

# 3. start the app
npm run dev
```

Open <http://localhost:3000> and sign in with:

```
username: porus
password: porus
```

You should see the header pill read `124 rec · 178 fld`. If it says **no dataset**, step 2
did not run or the workbooks were not found.

### Step 2 output

```
  wrote data/full-students.json  (124 records)
  wrote data/master-7bt.json    (69 records)
  wrote data/osint.json         (13 records)
  wrote data/admissions.json    (963 records)

  unified=124  master_7bt_merge=49  osint_merge=3
  fields per student record = 178 (student_data) + 15 (master)
```

Re-run it any time the workbooks change — it overwrites cleanly.

### Other entrypoints

```bash
go run ./cmd/cli db status              # local SQLite store
go run ./cmd/cli providers list         # registered OSINT providers
go run ./cmd/cli scan username johndoe  # username enumeration
go run ./version

cd frontend && npm run dev              # Wails/Vite frontend alone
wails dev                               # desktop shell (needs the Wails toolchain)
```

---

## Where the data lives

```
*.xlsx                     ← your workbooks (gitignored, never uploaded)
data/full-students.json    ← 124 records × 178 fields (gitignored)
data/master-7bt.json       ← 69 records
data/osint.json            ← 13 records
data/admissions.json       ← 963 records
data/reveal-audit.log      ← written when high-risk fields are revealed
fixtures/synthetic/        ← sanitized sample committed to the repo
```

The full dataset is served **server-side** by `app/api/students`, so PII is never bundled
into the browser JavaScript.

**Privacy behaviour**

- Aadhaar, passport, bank, IFSC and family income are **masked by default**
  (`644106635909` → `**********09`)
- Unmasking requires a request from `localhost`; a public host gets `reveal_blocked`
- Every unmask is appended to `data/reveal-audit.log`
- `.githooks/pre-commit` blocks workbooks, `data/*.json`, record dumps >200 KB and
  credential-shaped strings. CI re-checks the same things.

Records are shown exactly as they exist in the workbooks. Where two workbooks describe
the same person, the UI reports that as **provenance** (see the Sources tab), not as proof
of identity.

---

## Search

| Query type | Example | Behaviour |
|---|---|---|
| Exact ID | `101`, `230110570` | wins over any name guess |
| Exact field | `abha`, `gunjan` | direct equality on a name field |
| All tokens | `aditi singh` | every token must appear |
| Fuzzy | `borka`, `adit singh` | Jaro-Winkler ≥ 0.82, tolerates typos |
| Too short | `a`, `ab` | never claims "no match" — offers suggestions |

Press `⌘K` / `Ctrl+K` for the command palette. `Enter` opens the top result, `Esc` clears.

---

## Architecture

```
Next.js pages ──> /api/students ──> data/*.json        (record search, local)
Wails bindings ──> internal/core ──> SQLite             (OSINT engine)
cmd/cli ─────────> internal/core                          (same core, no UI)
```

`internal/core`: `target` normalizer, `provider` registry, `discovery` engine (5-way
concurrency, 3 retries with backoff, 1 h cache, per-host rate limit), `evidence`,
`confidence`, `entity` resolver, `correlation`, `report` (JSON/CSV/Markdown), `security`
(SSRF guard).

Statuses are never collapsed to a boolean: `FOUND`, `NOT_FOUND`, `INCONCLUSIVE`,
`RATE_LIMITED`, `BLOCKED`, `UNAVAILABLE`, `ERROR`. Correlation produces a *potential
relationship* with supporting evidence — never an identity claim.

### Adding a provider

Implement `registry.Provider` (`ID`, `Name`, `TargetTypes`, `Check(ctx, target)`) in
`internal/providers/<type>/`, then register it in `internal/providers/registry.go`. No UI
change required.

---

## Testing

```bash
go test ./... -race      # matcher-independent core: discovery isolation, ssrf, import
go vet ./...
npm run build            # typecheck + production build
```

CI (`.github/workflows/verify.yml`) additionally asserts that no dataset file and no
credential is tracked in git.

---

## Responsible use

This tool aggregates personal data about identifiable people. Use it only for
infrastructure you own or have written authorisation to assess. High-risk identifiers are
masked by default for a reason. Do not redistribute the workbooks or the generated
`data/*.json`.

## License & Attribution

Inspiration and licensing notes in `ATTRIBUTION.md` (holehe, user-scanner, toutatis,
Mr.Holmes, OnionSearch).
