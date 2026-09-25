# Sherlock Hacked — Local-First Desktop OSINT Platform

> **Evidence collection → normalization → correlation → confidence → timeline**

Sherlock Hacked is rebuilt as a **local-first desktop investigation platform** (Go core + Wails + React). The legacy Next.js app is retained as deprecated; the shipped product is `Go + SQLite` with explicit evidence handling.

[![Go](https://img.shields.io/badge/Go-1.22+-00ADD8)]() [![Wails](https://img.shields.io/badge/Wails-v2-DF0000)]() [![SQLite](https://img.shields.io/badge/SQLite-FTS5-003B57)]()

## Architecture

```
React+TS (frontend/) → Wails bindings (app.go) → Go Core (internal/core) → SQLite (data/sherlock.db)
                                    ↘ CLI (cmd/cli) shares same core
```
Core subsystems: TargetNormalizer, ProviderRegistry, DiscoveryEngine (worker pool, 5 concurrency), EvidenceCollector, ConfidenceEngine, EntityResolver, CorrelationEngine, Cache, RateLimiter, ReportGenerator, Security (SSRF).

```
PostgreSQL backup (local) → inspect→classify→allowlist→normalize→ SQLite → validation report
Default: synthetic/fixtures only. Real student PII needs --include-private (local only, never committed).
```

See `PRD.md` and `TRD.md` for full product/technical spec.

## Quickstart

```bash
# Prerequisites: Go 1.22+, Node 18+, Wails v2.8 (`go install github.com/wailsapp/wails/v2/cmd/wails@latest`)
git clone https://github.com/abhishek-mule/Sherlock_hacked.git
cd Sherlock_hacked
git checkout feat/wails-go-core   # or main after PR

# Desktop (Wails)
wails doctor          # verify prerequisites
wails dev             # Go + Vite HMR
wails build           # → build/bin/SherlockHacked

# CLI (secondary, same core)
go build -o bin/sherlock-hacked ./cmd/cli
./bin/sherlock-hacked providers list
./bin/sherlock-hacked db status
./bin/sherlock-hacked db import db_cluster-31-07-2025@22-17-59.backup
ALLOW_PRIVATE_IMPORT=1 ./bin/sherlock-hacked db import db_cluster-31-07-2025@22-17-59.backup --include-private
./bin/sherlock-hacked scan username johndoe
./bin/sherlock-hacked investigate johndoe@example.com
./bin/sherlock-hacked export <investigation-id> --format json|csv|md

# Frontend only (without Wails)
cd frontend && npm install && npm run build
```

## Database — Local-First, Private by Default

- `data/sherlock.db` is SQLite + WAL, gitignored. Do **not** commit `*.backup` / `*.db`.
- Default import loads **synthetic fixtures** (`fixtures/synthetic/`) + sanitized `admission_data`/`osint_data`. Sensitive `student_data` (≈180 cols: Aadhaar, mobiles, addresses, bank, etc.) is `SENSITIVE` and skipped unless `--include-private` + `ALLOW_PRIVATE_IMPORT=1`.
- Row-count validation is logged: `admission_data` 963 / `osint_data` 13 / `student_data` 124 in backup → SQLite counts verified.
- Offline guarantee: with providers disabled, local FTS search, Cases/Evidence/Reports work fully.

## GUI

Pages: Dashboard, Investigate (target input → live FOUND/NOT_FOUND/INCONCLUSIVE/RATE_LIMITED/BLOCKED), Cases, Evidence (filter by status/confidence), Entities (graph), Providers (toggle), Database (status/import), Reports (JSON/CSV/Markdown), Settings. GUI never implements OSINT directly — all via `App.*` Wails bindings.

## Adding a Provider

Create `internal/providers/<type>/myprov.go` implementing `registry.Provider` (`ID()`, `Name()`, `TargetTypes()`, `Check(ctx, target)`) and register in `internal/providers/registry.go`. No GUI change needed. See `ATTRIBUTION.md` for reference projects.

## Testing & Quality

```bash
go test ./...              # unit: target, registry, discovery isolation, ssrf, import
go vet ./...
cd frontend && npm run build && npx tsc --noEmit
go test ./internal/import -v
```

Provider failures are isolated — one `ERROR` does not abort investigation (`internal/core/discovery/engine_test.go` asserts this).

## Security & Responsible Use

- All external data untrusted; never executed. SSRF blocked (private IP ranges), parameterized SQL, `robots.txt` respected where applicable, rate-limited (1 req/s/host), bounded concurrency (5).
- No auth/CAPTCHA/paywall bypass. Use only with authorization/consent.
- Secrets via env (`.env` gitignored). See `.env.example`.

## Legacy Next.js

`app/` (Next.js 13 + Supabase) is deprecated but kept for one release. Supabase anon key leak removed — now requires `NEXT_PUBLIC_SUPABASE_*` env. See `TRD.md` §13.

## License & Attribution

See `ATTRIBUTION.md` — holehe, user-scanner, toutatis, Mr.Holmes, OnionSearch inspirations. Respect their licenses.
