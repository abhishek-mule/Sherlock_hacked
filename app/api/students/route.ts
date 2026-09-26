import { promises as fs } from "fs";
import path from "path";
import { rank, filledCount } from "@/lib/match";

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

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim().toLowerCase();
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

  if (revealRequested && !reveal) {
    return Response.json(
      { ok: false, reason: "reveal_blocked", hint: "High-risk fields can only be revealed from a local machine." },
      { status: 403 },
    );
  }

  let out: Row[];
  let matches: { kind: string; via: string; score: number }[] = [];
  if (q) {
    const ranked = rank(rows, q, limit);
    out = ranked.map((r) => r.row);
    matches = ranked.map((r) => ({ kind: r.kind, via: r.via, score: Math.round(r.score) }));
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
