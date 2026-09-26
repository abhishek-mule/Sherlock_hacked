import { promises as fs } from "fs";
import path from "path";
import { rank, suggestions, filledCount } from "@/lib/match";

/**
 * Local-only student record API.
 *
 * Serves the FULL ingested workbook (data/full-students.json) at runtime from
 * the server, so PII is never bundled into the client JavaScript.
 *
 * Privacy model:
 *  - HIGH-RISK identifiers (Aadhaar, passport, bank, IFSC, income) are REDACTED
 *    by default. They require ?reveal=1 AND a local request (no public host).
 *  - Every reveal is written to the audit log.
 */

export const dynamic = "force-dynamic";

const DATA_DIR = path.join(process.cwd(), "data");
const STUDENTS = path.join(DATA_DIR, "full-students.json");

/** Fields masked unless explicitly revealed on a local request. */
const HIGH_RISK = [
  "ADHAAR NO",
  "PASSPORT NO.",
  "BANK NAME",
  "IFSCCODE",
  "BANKADDRESS",
  "ANNUAL FAMILY INCOME",
];

type Row = Record<string, unknown>;

let cache: { rows: Row[]; at: number } | null = null;
const TTL_MS = 15_000;

async function loadRows(): Promise<Row[]> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.rows;
  try {
    const raw = await fs.readFile(STUDENTS, "utf8");
    const rows = JSON.parse(raw) as Row[];
    cache = { rows, at: Date.now() };
    return rows;
  } catch {
    return [];
  }
}

function isLocalRequest(req: Request): boolean {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
  const host = req.headers.get("host") ?? "";
  if (["127.0.0.1", "::1", ""].includes(ip)) return true;
  return /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host);
}

function redact(row: Row, reveal: boolean): Row {
  if (reveal) return row;
  const out: Row = { ...row };
  for (const f of HIGH_RISK) {
    if (out[f] !== "" && out[f] != null) {
      const s = String(out[f]);
      out[f] = s.length > 3 ? `${"*".repeat(Math.max(0, s.length - 2))}${s.slice(-2)}` : "***";
    }
  }
  return out;
}

function countFilled(row: Row): number {
  return filledCount(row);
}

/** Compare identifier-ish values tolerating "7" vs "7.0" vs " 7 ". */
function normKey(v: unknown): string {
  const s = String(v ?? "").trim();
  if (s === "") return "";
  const n = Number(s);
  return Number.isFinite(n) ? String(n) : s.toLowerCase();
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim().toLowerCase();
  // Primary-key lookup. The record view routes on SRNO, so a record fetch must
  // be an exact match and must never depend on the fuzzy search ranker.
  const srno = (url.searchParams.get("srno") ?? "").trim();
  const limit = Math.min(Number(url.searchParams.get("limit") ?? "25") || 25, 200);
  const wantFull = url.searchParams.get("fields") === "all";
  const revealRequested = url.searchParams.get("reveal") === "1";
  const reveal = revealRequested && isLocalRequest(req);

  const rows = await loadRows();

  if (!rows.length) {
    return Response.json(
      {
        ok: false,
        reason: "no_local_dataset",
        hint: "Run: python3 scripts/ingest.py  (needs the two .xlsx sources in the repo root)",
        fields_available: 0,
      },
      { status: 200 },
    );
  }

  const fieldCount = Object.keys(rows[0]).filter((k) => !k.startsWith("_")).length;

  // Dataset-level coverage: which columns are empty for *every* record. This is
  // different from "empty for this person" and the UI should say so rather than
  // letting an analyst assume a column is merely unpopulated.
  let emptyEverywhere: string[] = [];
  if (url.searchParams.get("coverage") === "1") {
    emptyEverywhere = Object.keys(rows[0])
      .filter((k) => !k.startsWith("_"))
      .filter((k) => rows.every((r) => r[k] === "" || r[k] == null));
  }

  if (revealRequested && !reveal) {
    return Response.json(
      { ok: false, reason: "reveal_blocked", hint: "High-risk fields can only be revealed from a local machine." },
      { status: 403 },
    );
  }

  let out: Row[];
  let matches: { kind: string; via: string; score: number }[] = [];
  let suggestionsOut: { srno: unknown; name: string; hint: string }[] = [];

  if (srno) {
    const wanted = String(Number(srno)) === srno ? Number(srno) : srno;
    out = rows.filter((r) => normKey(r.SRNO) === normKey(wanted)).slice(0, 1);
  } else if (q) {
    const ranked = rank(rows, q, limit);
    out = ranked.map((r) => r.row);
    matches = ranked.map((r) => ({ kind: r.kind, via: r.via, score: Math.round(r.score) }));
    if (out.length === 0) {
      // Never leave the caller with a dead end: offer near misses.
      suggestionsOut = suggestions(rows, q, 6);
    }
  } else {
    out = rows
      .slice()
      .sort((a, b) => countFilled(b) - countFilled(a))
      .slice(0, limit);
  }

  if (reveal) {
    const who = req.headers.get("x-forwarded-for") ?? "local";
    const ts = new Date().toISOString();
    await fs
      .appendFile(
        path.join(DATA_DIR, "reveal-audit.log"),
        `${ts} reveal of ${out.length} record(s) from ${who}\n`,
        "utf8",
      )
      .catch(() => {});
  }

  const shaped = out.map((r, i) => {
    const base = wantFull ? redact(r, reveal) : pickSummary(r, reveal);
    base._match = matches[i] ?? null;
    base._filled = countFilled(r);
    return base;
  });

  return Response.json({
    ok: true,
    source: "data/full-students.json",
    total_records: rows.length,
    returned: shaped.length,
    fields_per_record: fieldCount,
    redacted: !reveal,
    high_risk_fields: HIGH_RISK,
    empty_in_every_record: emptyEverywhere,
    suggestions: suggestionsOut,
    results: shaped,
  });
}

const SUMMARY_FIELDS = [
  "SRNO", "NAME", "FIRSTNAME", "MIDDLE NAME", "LAST NAME", "ROLLNO", "REGISTRATION_NO",
  "ENROLLMENT NUMBER", "ADMISSION TYPE", "GENDER", "CATEGORY", "SUB_CASTE", "NATIONALITY",
  "EMAILID", "MOBILE NO.", "DOB", "BIRTH_PLACE", "PROGRAMME/BRANCH", "DEGREE",
  "YEAR", "SEMESTER", "PROGRAM LEVEL", "CITY/VILLAGE(PERMANENT)", "STATE_PERMANENT",
  "DISTRICT_PERMANENT", "COLLEGE", "10TH PERCENTILE", "12TH PERCENTILE", "Merit_no.",
];

function pickSummary(row: Row, reveal: boolean): Row {
  const out: Row = {};
  for (const f of SUMMARY_FIELDS) {
    if (row[f] !== undefined) out[f] = row[f];
  }
  if (row.COLLEGE === undefined) {
    const adm = row._admission as Row | undefined;
    if (adm?.college) out.COLLEGE = adm.college;
  }
  for (const k of Object.keys(row)) {
    if (k.startsWith("_")) out[k] = row[k];
  }
  out._filled = countFilled(row);
  return redact(out, reveal);
}
