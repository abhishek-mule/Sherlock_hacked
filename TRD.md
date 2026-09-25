# Sherlock Hacked — Technical Requirements Document (TRD)

**Version:** 1.0.0  
**Date:** 2026-09-26  
**Status:** Approved — implements PRD v1.0.0  
**Stack:** Go + Wails v2 + React + TypeScript + SQLite (FTS5)  
**Repo:** https://github.com/abhishek-mule/Sherlock_hacked (`feat/wails-go-core` → PR → `main`)  
**Backup:** `db_cluster-31-07-2025@22-17-59.backup` (PostgreSQL cluster dump, 706KB, Supabase, local-only)

---

## 1. Architecture Overview

```
┌──────────────────────────────────────────┐
│     React + TypeScript Frontend          │
│  Vite, Tailwind, TanStack Query,         │
│  React Flow, Recharts  (frontend/)       │
├──────────────────────────────────────────┤
│        Wails v2 Bridge (app.go)          │
│  Typed bindings: App.Investigate(),      │
│  App.DBStatus(), App.ExportReport()      │
├──────────────────────────────────────────┤
│              Go Core (internal/)         │
│  target / registry / discovery /         │
│  evidence / entity / correlation /       │
│  confidence / cache / limiter /          │
│  report / security / import / db         │
├──────────────────────────────────────────┤
│           SQLite (FTS5)                  │
│  sherlock.db — portable desktop DB       │
│  Postgres dump → import tool → SQLite    │
└──────────────────────────────────────────┘
                  ▲
     Local Postgres dump (import only, docker-compose)
```

**Invariants:**

- GUI never contains OSINT logic; it calls Go core via Wails bindings.
- CLI (`cmd/cli`) shares the same Go core — no duplication.
- A provider failure never crashes an investigation (isolated `errgroup` + per-provider `Status`).
- Offline invariant: with providers disabled, local FTS5 search + Cases/Evidence/Reports remain fully usable.

---

## 2. Technology Choices

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Desktop | Wails v2 (Go + WebView) | Single Go binary, typed bindings, cross-platform, smaller than Electron |
| Core | Go 1.22+ | Fast dev, excellent net/http, goroutine worker pools, low maintenance vs Rust for I/O-bound OSINT |
| Frontend | React 18 + Vite + TypeScript 5 + Tailwind + TanStack Query + React Flow + Recharts | Wails react-ts template default, proven |
| DB shipped | SQLite + FTS5 | Single file, no server, ideal for desktop |
| DB import source | PostgreSQL 15 (docker-compose, ephemeral) | Backup is Postgres; used once to parse `COPY ... FROM stdin` then transform |
| HTTP | `net/http` + `context`, `golang.org/x/time/rate`, `golang.org/x/sync/errgroup` | Bounded concurrency, cancellation |
| CLI | `spf13/cobra` | Standard |
| Logging | `log/slog` (structured) | Deterministic, no secrets |
| Config | `os.Getenv` + `.env.example`, `internal/config` | Secrets never in repo |
| Tests | `go test` + `vitest` (frontend), `net/http/httptest`, `testify` | Mock external providers |

---

## 3. Repository Layout (Target)

```
.
├── wails.json, main.go, app.go
├── go.mod, go.sum
├── frontend/
│   ├── src/pages/{Dashboard,Investigate,Cases,Evidence,Entities,Providers,Database,Reports,Settings}.tsx
│   ├── src/components/{InvestigationForm,ProgressBar,EvidenceTable,GraphView,Timeline,ProviderCard}.tsx
│   ├── src/hooks/useInvestigation.ts  # TanStack Query over wailsjs bindings
│   ├── wailsjs/  # generated — gitignored except go/
│   └── vite.config.ts, tailwind.config.ts, tsconfig.json
├── internal/
│   ├── config/config.go
│   ├── core/
│   │   ├── target/normalizer.go
│   │   ├── registry/registry.go + manifest.json
│   │   ├── discovery/engine.go
│   │   ├── evidence/collector.go
│   │   ├── confidence/engine.go
│   │   ├── entity/resolver.go
│   │   ├── correlation/engine.go
│   │   ├── cache/cache.go
│   │   └── limiter/limiter.go
│   ├── providers/
│   │   ├── base.go  # HttpProvider with timeout/retry/rate-limit
│   │   ├── username/{github.go,reddit.go}
│   │   ├── email/discovery.go
│   │   ├── domain/rdap.go
│   │   ├── url/metadata.go
│   │   └── onion/search.go  # gated
│   ├── db/
│   │   ├── sqlite.go, postgres.go, interface.go
│   │   ├── schema.go
│   │   └── migrations/*.sql
│   ├── import/
│   │   ├── pgdump.go  # parses backup
│   │   └── classify.go # PII classification
│   ├── security/{ssrf.go, validate.go}
│   └── report/{json.go, csv.go, markdown.go}
├── cmd/cli/main.go
├── scripts/{db-inspect.sh, check-secrets.sh, seed-synthetic.go}
├── fixtures/synthetic/{students.json, admissions.json, osint.json}
├── data/.gitkeep  # sherlock.db + *.backup gitignored
├── supabase/migrations/  # legacy, retained
├── app/  # legacy Next.js — deprecated, kept 1 release
└── docker-compose.yml  # postgres:15 for import only
```

Legacy `app/` stays but is not the build artifact. `frontend/` is the Wails GUI.

---

## 4. Database Design

### 4.1 Engine Decision

- **Shipped:** SQLite (`data/sherlock.db`, `journal_mode=WAL`, `foreign_keys=ON`, FTS5).
- **Import-only:** PostgreSQL 15 via `docker-compose.yml` (or direct `COPY` parser without server — Go parser preferred to avoid requiring Docker at import time; Docker is fallback).

### 4.2 Verified Backup Schema (Read-Only Audit)

Dump: `PostgreSQL cluster dump`, UTF8, Supabase roles. Public tables:

- `public.admission_data` (963 rows): `sr_no, merit_no, mht_cet_score, application_id, full_name, gender, category, seat_type, branch, college, city, seat_level, status, admitted, created_at`.
- `public.osint_data` (13 rows): `sr_no, roll_no, permanent_registration_no, type, sex, student_name, mother_name, name, connection, title, education_1, education_2, location, github, connections, open_to_work, about, skills, achievements, merit_no, marks, application_id, admission_category, seat_type, pro_pic, posts`.
- `public.student_data` (124 rows, ~180 cols, quoted identifiers): `"SRNO" bigint, "REGISTRATION_NO" bigint, "NAME" text, "FIRSTNAME" text, "MOBILE NO." bigint, "EMAILID" text, "ADHAAR NO" bigint, "DOB" text, "ADDRESS(PERMANANT)" text, "BANK NAME" text, "IFSCCODE" text, ...` — full audit in `internal/import/classify.go`.

No indexes on public tables besides auth; migration adds them.

### 4.3 Classification & Allowlist

`internal/import/classify.go` tags columns:

- `PUBLIC` (safe synthetic): `admission_data.mht_cet_score`, `osint_data.skills` (sanitized), etc.
- `SENSITIVE` (requires `--include-private`): `student_data."ADHAAR NO"`, `"MOBILE NO."`, `"EMAILID"`, `"ADDRESS(PERMANANT)"`, `"BANK NAME"`, `"ANNUAL FAMILY INCOME"`, `"CATEGORY"/"SUB_CASTE"`, `"DOB"`, guardian fields, etc.

Default import without flag: creates SQLite schema but **does not populate SENSITIVE columns** — inserts synthetic fixtures instead. With `--include-private`, allowlisted SENSITIVE tables are populated locally after explicit confirmation.

### 4.4 Target SQLite Schema (Migrations)

```sql
-- investigations
CREATE TABLE investigations (
  id TEXT PRIMARY KEY,  -- uuid
  target_raw TEXT NOT NULL,
  target_normalized TEXT NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('username','email','phone','domain','ip','url','crypto')),
  status TEXT NOT NULL DEFAULT 'running',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
  completed_at TEXT
);
CREATE INDEX idx_investigations_target ON investigations(target_normalized);

-- observations / evidences (one row per provider check)
CREATE TABLE observations (
  id TEXT PRIMARY KEY,
  investigation_id TEXT NOT NULL REFERENCES investigations(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  query TEXT NOT NULL,
  observed_value TEXT,
  normalized_value TEXT,
  status TEXT NOT NULL CHECK (status IN ('FOUND','NOT_FOUND','INCONCLUSIVE','RATE_LIMITED','BLOCKED','UNAVAILABLE','ERROR')),
  confidence TEXT NOT NULL CHECK (confidence IN ('VERIFIED','STRONG','WEAK','AMBIGUOUS','NEGATIVE','INCONCLUSIVE')),
  source_url TEXT,
  evidence_type TEXT,
  collection_method TEXT,
  raw_body_snippet TEXT, -- truncated, no secrets
  error TEXT,
  collected_at TEXT NOT NULL
);
CREATE INDEX idx_observations_investigation ON observations(investigation_id);
CREATE INDEX idx_observations_provider ON observations(provider);
CREATE INDEX idx_observations_status ON observations(status);

-- entities (resolved)
CREATE TABLE entities (
  id TEXT PRIMARY KEY,
  canonical_value TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  created_at TEXT NOT NULL
);

-- relationships (potential only)
CREATE TABLE relationships (
  id TEXT PRIMARY KEY,
  from_entity TEXT NOT NULL REFERENCES entities(id),
  to_entity TEXT NOT NULL REFERENCES entities(id),
  evidence_ids TEXT NOT NULL, -- JSON array
  score REAL NOT NULL,
  note TEXT NOT NULL,
  confidence TEXT NOT NULL
);

-- provider cache
CREATE TABLE provider_cache (
  key TEXT PRIMARY KEY, -- provider:target
  response TEXT NOT NULL,
  created_at TEXT NOT NULL,
  ttl_seconds INTEGER NOT NULL DEFAULT 3600
);

-- local imported data (SQLite, FTS5)
-- admission_data, osint_data, student_data_synthetic (sanitized)
CREATE VIRTUAL TABLE entities_fts USING fts5(canonical_value, type, content='entities', content_rowid='rowid');
```

Migrations are idempotent (`CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`), versioned via `schema_migrations` table.

### 4.5 FTS5 & Query Performance

- Trig trigram or `porter` tokenizer for name/email fuzzy.
- Bounded queries: `SELECT ... LIMIT 100` + pagination.
- Validation step logs `admission_data 963 | osint_data 13 | student_data 124 (synthetic|private)` row counts.

---

## 5. Core Engine Contracts

### 5.1 Types

```go
type TargetType string // username|email|phone|domain|ip|url|crypto
type Target struct { Raw, Normalized string; Type TargetType }
type Status string // FOUND/NOT_FOUND/INCONCLUSIVE/RATE_LIMITED/BLOCKED/UNAVAILABLE/ERROR
type Confidence string // VERIFIED/STRONG/WEAK/AMBIGUOUS/NEGATIVE/INCONCLUSIVE

type Evidence struct {
  Target Target; Provider, Query string
  ObservedValue, NormalizedValue *string
  Status Status; Confidence Confidence
  Timestamp time.Time; SourceURL, EvidenceType, CollectionMethod string
  Error *string; RawSnippet *string
}

type Provider interface {
  ID() string
  Name() string
  TargetTypes() []TargetType
  Check(ctx context.Context, t Target) (Evidence, error)
}
```

### 5.2 Subsystems

- **TargetNormalizer:** `username` (3-30, `^[a-zA-Z0-9._-]+$`), `email` (RFC 5322 + lowercases), `phone` (E.164 via `nyaruka/phonenumbers`), `domain` (punycode, `net.LookupIP` validation), `ip` (`net.ParseIP`), `url` (`url.Parse` + SSRF block). Invalid target → typed error, no network call.
- **ProviderRegistry:** Loads `internal/core/registry/manifest.json` (analogous to holehe `modules.py` + user-scanner `data.json`). Hot-reload safe, validates `Provider` contract at startup.
- **DiscoveryEngine:** `errgroup` + `semaphore(5)`, per-provider `rate.Limiter` (1 req/s default, configurable per host), `context.WithTimeout(8s)` per check, 2 retries exponential (`100ms * 2^n + jitter`), `http.Client` with connection reuse. Deduplicates by `provider:target` cache key. Collects `Evidence` slices; never propagates panic.
- **EvidenceCollector:** Persists to `observations` with provenance.
- **ConfidenceEngine:** Deterministic rules (e.g., `status==FOUND && body contains profile marker → STRONG; ambiguous 200 → INCONCLUSIVE`).
- **EntityResolver:** `strings.ToLower` + `norm.NFC` canonicalization, unique constraint.
- **CorrelationEngine:** Outputs `PotentialRelationship` only.
- **Cache:** SQLite `provider_cache` with TTL; `Get` checks `created_at + ttl > now`.
- **Reports:** Deterministic JSON/CSV/Markdown including `schemaVersion`, `providersQueried`.

---

## 6. Provider Architecture

```
internal/providers/
  base.go           # HttpProvider: Do(ctx, req) with timeout/retry/limiter/user-agent
  username/
    github.go       # GET https://github.com/{u} — check marker, handle 404/429
    reddit.go
  email/
    discovery.go    # lawful public discovery; attribution to holehe idea
  domain/
    rdap.go         # RDAP + DNS via net.Resolver
  url/
    metadata.go     # HEAD + meta tags, SSRF-guarded
  onion/
    search.go       # SOCKS5h via TOR_PROXY, --tor only
  manifest.json     # [{id, name, targetTypes, urlTemplate, checkStrategy}]
```

- Each provider is a separate file implementing `Provider`; adding one does not modify GUI or core.
- `robots.txt` fetched and respected where host serves it and provider is search-like.
- No credential use; no paywall/CAPTCHA bypass.
- `ATTRIBUTION.md` credits holehe/user-scanner/toutatis/Mr.Holmes/OnionSearch inspirations with licenses.

---

## 7. Security Requirements

- **SSRF:** `internal/security/ssrf.go` blocks `10/8, 172.16/12, 192.168/16, 127/8, ::1, fc00::/7, link-local`; `url.Parse` + `net.LookupIP` double-check; redirects followed only to public IPs (max 3).
- **Injection:** Parameterized SQL only (`database/sql` + `?`); no `fmt.Sprintf` queries; `html/template` auto-escape; no `exec` of external content.
- **Secrets:** `internal/config` reads `DATABASE_URL`, `TOR_PROXY` from env; `.env` gitignored; pre-commit `scripts/check-secrets.sh` greps for `BEGIN PRIVATE KEY|sk-` + leaked Supabase anon key pattern.
- **Deserialization:** `encoding/json` strict; max body 512KB; reject non-UTF8.
- **File writes:** `filepath.Clean` + `filepath.Join(dataDir)` only; no traversal.
- **Logging:** `slog` JSON, no PII at INFO; DEBUG only with `--debug` and local.

---

## 8. Offline & Local-First Guarantees

- SQLite DB ships with synthetic data; `Investigate` with providers disabled still creates `investigations` row and allows `Entities → FTS5 search → Timeline → Export`.
- Provider network errors map to `UNAVAILABLE`/`ERROR` but do not delete local evidence.
- Wails GUI shows `● Local DB` indicator (green when SQLite open, red on error).

---

## 9. Wails Bindings (Go → Frontend)

```go
// app.go
type App struct { db DB; engine *discovery.Engine; importer *import.Service }
func (a *App) DBStatus() DBStatus
func (a *App) DBImport(path string, includePrivate bool) ImportReport
func (a *App) Investigate(req InvestigateRequest) (Investigation, error)
func (a *App) ListInvestigations() ([]Investigation, error)
func (a *App) GetEvidence(investigationID string) ([]Evidence, error)
func (a *App) GetGraph(investigationID string) (Graph, error)
func (a *App) ExportReport(id string, format string) (string, error) // returns file path
func (a *App) ListProviders() ([]ProviderInfo, error)
```

Frontend consumes via `wailsjs/go/main/App` + TanStack Query. No direct `fetch` to external OSINT endpoints from the browser — all via Go.

---

## 10. CLI (Secondary, Same Core)

```
sherlock-hacked scan username johndoe [--providers github,reddit] [--output json]
sherlock-hacked investigate user@example.com
sherlock-hacked providers list
sherlock-hacked db status
sherlock-hacked db import <backup> [--include-private]
sherlock-hacked export <id> [--format json|csv|md]
```

Shares `internal/core` and `internal/db`.

---

## 11. Testing Strategy

| Layer | Tool | Cases |
|-------|------|-------|
| Go core | `go test ./... -race -cover` | `target/normalizer` table-driven, `registry` load, `confidence` rules, `limiter` (token bucket), `cache` TTL, `entity` dedup, `discovery` with 2 `httptest` providers (one `500`, one `200 FOUND`), `ssrf` blocklist, `export` determinism |
| Import | `go test ./internal/import` | Fixture `COPY` snippet → SQLite, sensitive flag honored, row counts |
| DB | `go test ./internal/db` | Migrations idempotent, FTS5 search, duplicate handling |
| Frontend | `vitest` + `@testing-library/react` | `InvestigationForm` validation, `EvidenceTable` status badges, `GraphView` render |
| E2E | `wails build` smoke + `go vet` | GUI launches, `DBStatus` green, investigation round-trip |
| Lint/Type | `golangci-lint`, `tsc --noEmit`, `eslint`, `prettier` | CI must pass |

Mocks via `httptest.NewServer`; no live external calls in CI.

---

## 12. Build, Run & Deploy

```bash
# Prerequisites
go 1.22+, node 18+, wails v2.8 (go install github.com/wailsapp/wails/v2/cmd/wails@latest), docker (optional, import only)

# Dev
wails doctor
go mod tidy
wails dev              # Go + Vite HMR

# Import (default synthetic, no PII)
go run ./cmd/cli db status
go run ./cmd/cli db import db_cluster-31-07-2025@22-17-59.backup
# Private local only (explicit)
go run ./cmd/cli db import db_cluster-31-07-2025@22-17-59.backup --include-private

# Test & Lint
go test ./... -race -cover
golangci-lint run
npm --prefix frontend run lint && npx tsc --noEmit

# Build
wails build            # → build/bin/SherlockHacked (platform binary)

# CLI
go build -o bin/sherlock-hacked ./cmd/cli
./bin/sherlock-hacked providers list
```

Artifacts are local binaries; no cloud deploy. Releases are GitHub Releases with `ATTRIBUTION.md` and synthetic-only `sherlock.db`.

---

## 13. Branching & Delivery (Per Your Final Decision)

- `feat/wails-go-core` branch → PR → `main`. **No direct push to `main`.**
- **Gate:** Do not start `internal/providers/*` implementation until Phase 1 (DB skeleton + Wails app boots) is validated (`wails dev` OK, `go test` OK, `db status` shows synthetic FTS5).
- Public repo ships only `schema`, `migrations`, `fixtures/synthetic`, `import` tooling. Real `data/sherlock.db` and `*.backup` are local.

---

## 14. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| PII leak | Allowlist + `--include-private` + `.gitignore` + pre-commit hook + synthetic fixtures; row-count report before/after |
| Provider staleness (404→200 site change) | `Status` + `Confidence` model, `INCONCLUSIVE` for ambiguous 200, per-provider `rawBodySnippet` for debugging |
| Rate-limit / 429 | Per-host limiter, exponential backoff, `RATE_LIMITED` status surfaced |
| SSRF via user-supplied URL | Private IP block + redirect check + max body |
| Wails cross-platform build | `wails doctor` in CI, `build/` excluded, `frontend/wailsjs` generated |

---

## 15. Traceability to PRD

Every PRD §4.x maps to a TRD §5-6 subsystem and a test in §11. Offline guarantee (§4.3/§8) is verified by `go test -run TestOfflineInvestigate`.
