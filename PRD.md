# Sherlock Hacked — Product Requirements Document (PRD)

**Version:** 1.0.0  
**Date:** 2025-07-31 / Updated 2026-09-26  
**Status:** Approved — `feat/wails-go-core` → PR → `main`  
**Repository:** https://github.com/abhishek-mule/Sherlock_hacked  
**Local backup:** `db_cluster-31-07-2025@22-17-59.backup` (PostgreSQL cluster dump, 706KB, local-only)

---

## 1. Executive Summary

Sherlock Hacked is being rebuilt as a **local-first desktop OSINT investigation platform**, not a thin web wrapper. The current `main` branch (Next.js + Supabase) is a student-data viewer with fake OSINT links (string-concatenated GitHub/Instagram URLs). This PRD redefines it as a serious tool where the **desktop GUI is the primary product** and the CLI is a secondary automation/debug interface.

**Core thesis:**

> **Evidence collection → normalization → correlation → confidence → investigation timeline**

rather than dumping “found on 37 sites.”

**Delivery:** `Go core + Wails + React+TypeScript` desktop app, `SQLite (FTS5)` as shipped DB, PostgreSQL only as a development/import source for the supplied backup. Real student PII never ships in the public repo.

---

## 2. Goals & Non-Goals

### 2.1 Goals

1. **Usable offline.** Full investigation, entity search, timeline, and reporting work with local DB even if every external provider is disabled or the machine is offline.
2. **Evidence-grade findings.** Every observation is traceable to target, provider, timestamp, method, raw/normalized value, status, confidence, and source URL.
3. **Professional desktop UX.** Wails GUI with Dashboard / Investigate / Cases / Evidence / Entities (graph) / Providers / Database / Reports / Settings.
4. **Local data ownership.** The supplied Postgres backup is imported through an explicit, auditable, non-destructive pipeline with allowlisting and row-count validation.
5. **Extensible provider model.** Adding a site does not touch the GUI — only the provider registry.
6. **Responsible OSINT.** No auth bypass, no CAPTCHA/paywall bypass, ToS-aware, rate-limited, with legal/ethical safeguards.

### 2.2 Non-Goals

- Not a cloud SaaS; no cloud DB required for normal operation.
- Not a credential-harvesting or dark-web bypass tool.
- Not a replacement for human analyst judgment — correlation is `potential relationship` only, never an identity claim.
- Not shipping real `student_data` PII (Aadhaar, mobile, bank, addresses) in the public repo or releases.

---

## 3. Users & Use Cases

### 3.1 Primary Users

- **OSINT analyst / researcher** (authorized investigations with consent or on own assets).
- **Student / security learner** exploring lawful footprint discovery.
- **Developer / contributor** adding providers or running offline entity searches.

### 3.2 Illustrative User Stories

- *As an analyst, I enter `johndoe` (username) and start an investigation, see per-provider statuses (FOUND / INCONCLUSIVE / RATE_LIMITED) with confidence and evidence links.*
- *As an analyst offline, I search local entities imported from the backup and still get FTS5 results, timeline, and export.*
- *As a contributor, I add a new username provider by creating `internal/providers/username/acme.go` and registering it in `manifest.json` — no GUI change.*

---

## 4. Product Scope (Functional Requirements)

### 4.1 Investigation Targets (authorized only)

Username, email address, phone number (E.164), domain, IP address, URL, cryptocurrency address (where lawful tooling exists). Each target is normalized and validated before any network call.

### 4.2 Discovery & Providers

- **Username enumeration** (template-driven, e.g., `https://github.com/{username}`) with body/regex + status checks; false-positive handling.
- **Email public footprint discovery** via lawful public endpoints only (inspired by holehe methodology, but without abusing password-reset flows).
- **Domain intelligence** (RDAP/WHOIS via lawful API, DNS).
- **URL inspection** and public metadata extraction.
- **Public breach/exposure checks** only through lawful/public interfaces.
- **Onion search** as an explicitly gated provider (`--tor` + SOCKS proxy, off by default).
- Provider selection is configurable per investigation; a provider failure never crashes the investigation.

Provider status is explicit (not boolean):

```
FOUND | NOT_FOUND | INCONCLUSIVE | RATE_LIMITED | BLOCKED | UNAVAILABLE | ERROR
```

No result is never presented as proof of non-existence.

### 4.3 Local Database & Import (Critical)

Given `db_cluster-31-07-2025@22-17-59.backup` (Postgres cluster dump, Supabase 963 + 13 + 124 rows):

- **Default shipped DB is SQLite** (`data/sherlock.db`, FTS5). Postgres is dev/import source only — not embedded in desktop binary.
- **Default import is synthetic/fixtures only.** Real `student_data` requires explicit `--include-private` local flag.
- **Pipeline is non-destructive & auditable:**

```
PostgreSQL backup → inspect + classify → allowlisted tables/columns → normalization → SQLite → validation + row-count report
```

- Sensitive columns (Aadhaar, mobiles, emails, addresses, bank, family income, caste/blood group, DOB, guardian data) are classified `SENSITIVE` and excluded unless the flag is set.
- The backup file, generated `*.db`, and any `sherlock.db` are `.gitignore`'d; pre-commit hook blocks PII patterns.
- Reproducible import: `App.DBImport(path)` (Wails) and `sherlock-hacked db import <backup> [--include-private]` (CLI).

### 4.4 Evidence & Confidence

Every finding captures:

```
target, provider, query, observed_value, normalized_value, status, confidence,
timestamp, source_url, evidence_type, collection_method, error?
```

Confidence tiers:

```
VERIFIED | STRONG | WEAK | AMBIGUOUS | NEGATIVE | INCONCLUSIVE
```

UI clearly separates **evidence vs. inference**. No manufactured certainty.

### 4.5 Correlation & Entity Resolution

- Builds `Target → Profile URLs → identifiers → observations` graph.
- Never auto-claims two identities are the same person. Output is `PotentialRelationship { evidenceIds[], score, note, confidence }` with supporting evidence.
- Entity resolution via dedup on normalized keys (email lowercased, username canonicalized).

### 4.6 Search & Discovery UX

- FTS5 search over local entities (name, email, domain) with fuzzy matching where appropriate; indexed.
- Respects `robots.txt` where applicable; provider-specific rate limits; bounded concurrency; no auth-boundary bypass.

### 4.7 Investigation Reports & Exports

- **JSON** (full, reproducible), **CSV** (flattened), **Markdown** (human-readable) exports.
- Report includes: target, collection timestamp, providers queried, findings, evidence, source references, confidence, errors/inconclusive, correlation notes, `schemaVersion`.
- Deterministic and diff-friendly.

### 4.8 Desktop GUI (Primary)

Wails GUI layout:

```
┌─────────────────────────────────────────────────────┐
│ SHERLOCK HACKED                          ● Local DB │
├───────────────┬─────────────────────────────────────┤
│ Dashboard     │  Investigation                      │
│ Investigate   │  [ username / email / phone ... ]   │
│ Cases         │  [ Start Investigation ]            │
│ Evidence      │  Progress ████████████░░  78%       │
│ Entities      │  Findings → Evidence → Graph        │
│ Providers     │  Timeline → Confidence              │
│ Database      │                                     │
│ Reports       │                                     │
│ Settings      │                                     │
└───────────────┴─────────────────────────────────────┘
```

Views: Dashboard (stats), Investigate (target form + live progress), Cases (investigation history), Evidence (filterable table by status/confidence), Entities (React Flow graph), Providers (enable/toggle + rate-limit display), Database (status + import), Reports (export), Settings.

GUI never implements OSINT logic directly — it calls Wails-bound Go core.

### 4.9 CLI (Secondary)

Same Go core, for automation/debugging:

```bash
sherlock-hacked scan username johndoe
sherlock-hacked investigate user@example.com --providers github,reddit
sherlock-hacked providers list
sherlock-hacked db status
sherlock-hacked db import db_cluster-31-07-2025@22-17-59.backup --include-private
sherlock-hacked export <investigation.json|csv|md>
```

Output example:

```
Target: johndoe

[+] GitHub       FOUND       (STRONG)
[+] Reddit       FOUND       (WEAK)
[?] Instagram    INCONCLUSIVE
[-] Example      NOT FOUND
[!] Provider X   RATE LIMITED

Evidence: 12  Potential correlations: 4  High-confidence: 7
```

### 4.10 Performance

Async with bounded concurrency (default 5), connection reuse, timeouts (8s), retries (2 exponential + jitter), provider-specific rate limits (`1 req/s` default), caching, request deduplication, graceful cancellation (`context.WithCancel`), structured logging (`slog`). Unlimited concurrency is prohibited.

---

## 5. Privacy, Legal & Ethical Requirements

- All external data is untrusted; never execute fetched content.
- Guards against SSRF (private IP block), command/path injection, unsafe deserialization, SQL injection, log injection, arbitrary file writes.
- Secrets via env only (`DATABASE_URL`, `TOR_PROXY` etc.), never in repo or normal output.
- Responsible-use guidelines in README and in-app disclaimer: investigations only with authorization/consent.
- No bypass of authentication, CAPTCHAs, paywalls, or access controls.

---

## 6. Success Metrics

- [ ] `wails dev` and `wails build` succeed; GUI launches offline and shows local investigations.
- [ ] Import pipeline produces validated `sherlock.db` from backup with row-count report; synthetic fixtures work without flag.
- [ ] Investigation with 2 mock providers: one fails, one succeeds — GUI shows FOUND + ERROR without crash.
- [ ] Exports (JSON/CSV/Markdown) are deterministic and complete.
- [ ] `go test ./...` + `vitest` + `golangci-lint` + `tsc --noEmit` all pass.
- [ ] No PII or secrets in `git diff --cached` or releases.

---

## 7. Release & Branching

- Implementation on `feat/wails-go-core` → PR → `main`. No direct push to `main`.
- Legacy Next.js `app/` deprecated but retained for one release alongside `frontend/` (Wails). Next release may remove it after parity.
- Public repo ships only schema/migrations/synthetic fixtures/import tooling.

---

## 8. Open Questions Resolved by This PRD

- Desktop DB is SQLite; Postgres is import-only.
- Real `student_data` PII is local-only, opt-in via flag.
- GUI is primary, CLI secondary, shared Go core.
- Provider development gated on DB skeleton validation (see TRD).

