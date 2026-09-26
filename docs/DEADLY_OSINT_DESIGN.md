# Sherlock — Deadly In-Depth OSINT (Design > SpiderFoot / theHarvester / Amass / Recon-ng / Sherlock)

This redesign makes Sherlock **local-first + evidence-grade + graph-driven**, beating each reference on its own turf while staying lawful.

## Sources (local-only)
- `db_cluster_data.xlsx` — admission_data (964), osint_data (14), student_data (125 / 178 cols)
- `MASTER DATABASE 7BT CT 2026_27 B(2).xlsx` — CT-B (68, has_master enrichment: Email/Phone/DOB/Enrollment/Address)
- `db_cluster-31-07-2025@22-17-59.backup` — Postgres dump (synced)
- Ingest: `python3 /tmp/gen.py` → `fixtures/synthetic/unified-sanitized.json` (124, no PII) + `data/unified-full.json` (full, gitignored)
- Search: precise local ranking (exact token/roll/reg > substring), capped 50, enriched with OSINT/admission

## Why this beats each

| Tool | Best at | Sherlock is deadlier because |
|---|---|---|
| SpiderFoot | Automated correlation across 100+ sources | **Confidence + Timeline + Evidence graph**: every finding has provenance, not just dump; correlation is `potential relationship` with score |
| theHarvester | Emails/subdomains/hosts | **theHarvester panel** via crt.sh / Hunter-lawful + email format OSINT + breach hint (local HaveIBeenPwned check gated) |
| Amass | Attack-surface subdomains | **Amass-lite**: DNS + RDAP + crt.sh subdomains + graph of `domain → subdomains → IPs → ASNs` |
| Recon-ng | Modular marketplace | **Recon-ng marketplace**: `internal/providers/registry` = typed `Provider` interface + `manifest.json` — add a `.go` file, no GUI change |
| Sherlock (Siddhant) | Username across 120 sites | **120-site hunter**: `HttpProvider` + per-host limiter + 429/403 handling + `FOUND/NOT_FOUND/INCONCLUSIVE` — not boolean |

## Architecture (local-first)

```
XLSX (2) ──ingest──> unified-sanitized.json (124) ──search──> Precise Results
       └─> data/unified-full.json (gitignored, full PII local) ──OSINT enrich──> Identity
Frontend (Next 13) ──Investigate Workspace──> Go Core (11 providers) ──SQLite FTS──> Timeline
                                   └─> Wails bindings (desktop) / API routes (web)
```

**Go Core (already shipped):** `target/normalizer`, `registry`, `discovery` (5 concurrency, 3 retries, 1h cache), `evidence`, `confidence`, `entity`, `correlation`, `report` (json/csv/md), `security/ssrf`.

## Investigate Workspace (new)

Route: `/`, `/osint`, `/investigate` — **Tabs: Overview | Identity | Usernames | Emails | Domains | Exposure | Graph | Timeline | Report**

- **Overview**: merged record from both XLSX (name/roll/branch/city/gender/category + has_master badge) + OSINT summary
- **Identity**: full precise card + Permanent Address (local only), DOB (local only), enrollment/ERP
- **Usernames**: 120-site checker (GitHub/Reddit/npm/HN + extended) — status chips FOUND/NOT_FOUND/INCONCLUSIVE
- **Emails**: lawful holehe-style hint (Gravatar, format) + breach hint
- **Domains**: RDAP + DNS + crt.sh subs
- **Exposure**: breach/exposure checklist (local HaveIBeenPwned API gated)
- **Graph**: `Target → Profiles → Emails → Domains` (React Flow, potential relationships)
- **Timeline**: `collected_at` per observation
- **Report**: export JSON/CSV/Markdown with provenance

All provider checks are **opt-in** (toggle per investigation), rate-limited, and never claim identity — `correlation` outputs `PotentialRelationship { evidence_ids, score, note }`.

## Security / Ethics (non-negotiable)

- Local-only XLSX: `*.xlsx`, `data/*.json`, `*.backup`, `*.db` gitignored; fixtures sanitized only
- SSRF block (`127/8`, `10/8`, `fc00::/7`), 3-redirect cap, 512KB body cap, `robots.txt` respect where applicable
- No auth/CAPTCHA/paywall bypass, no brute-force, `TOR_PROXY` gated for onion

## Next builds

1. **/api/osint/username** — Next route proxying Go `discovery` (avoids CORS, keeps evidence model)
2. **Provider marketplace**: `internal/providers/manifest.json` + CLI `sherlock providers add <site>`
3. **Amass / theHarvester workers**: `internal/providers/domain/crtsh.go`, `email/harvester.go`
4. **Wails `investigate` graph** already scaffolded in `frontend/src/pages/Investigate.tsx`
