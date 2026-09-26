/**
 * Record matching for the local dataset.
 *
 * Goals: find the record the analyst means, even with typos, partial names,
 * reordered names, or an ID typed into the name box — and never silently
 * return a wrong person as an exact match.
 *
 * Strategy (highest signal first):
 *   3  exact ID hit (roll / registration / enrollment / ERP)
 *   2  exact field equality on a strong identifier
 *   1  all query tokens present across the name fields
 *   0  fuzzy similarity >= threshold
 *
 * Fuzzy uses Jaro-Winkler (good at transpositions and prefixes) combined with
 * a token-containment bonus, which handles "adit singh" -> "aditi singh"
 * and "borkar abha" -> "abha borkar" without a dictionary.
 */

export type Row = Record<string, unknown>;

const NAME_FIELDS = ["NAME", "FIRSTNAME", "MIDDLE NAME", "LAST NAME"] as const;
const ID_FIELDS = [
  "ROLLNO",
  "REGISTRATION_NO",
  "ENROLLMENT NUMBER",
  "ABC ID NUMBER",
  "College ERP No.",
  "University Enrollment No.",
] as const;

const norm = (v: unknown) => String(v ?? "").trim().toLowerCase();
const squash = (s: string) => s.replace(/[^a-z0-9]/g, "");

/** Jaro similarity, 0..1. */
export function jaro(a: string, b: string): number {
  if (a === b) return 1;
  if (!a.length || !b.length) return 0;

  const matchWindow = Math.max(0, Math.floor(Math.max(a.length, b.length) / 2) - 1);
  const aFlags = new Array<boolean>(a.length).fill(false);
  const bFlags = new Array<boolean>(b.length).fill(false);

  let matches = 0;
  for (let i = 0; i < a.length; i++) {
    const start = Math.max(0, i - matchWindow);
    const end = Math.min(i + matchWindow + 1, b.length);
    for (let j = start; j < end; j++) {
      if (bFlags[j] || a[i] !== b[j]) continue;
      aFlags[i] = true;
      bFlags[j] = true;
      matches++;
      break;
    }
  }
  if (matches === 0) return 0;

  let transpositions = 0;
  let k = 0;
  for (let i = 0; i < a.length; i++) {
    if (!aFlags[i]) continue;
    while (!bFlags[k]) k++;
    if (a[i] !== b[k]) transpositions++;
    k++;
  }
  transpositions /= 2;

  const m = matches;
  return (m / a.length + m / b.length + (m - transpositions) / m) / 3;
}

/** Jaro-Winkler with a 0.1 prefix bonus (max 4 chars). */
export function jaroWinkler(a: string, b: string): number {
  const j = jaro(a, b);
  if (j < 0.7) return j;
  let prefix = 0;
  const max = Math.min(4, a.length, b.length);
  while (prefix < max && a[prefix] === b[prefix]) prefix++;
  return j + prefix * 0.1 * (1 - j);
}

export type MatchKind = "id" | "exact" | "tokens" | "fuzzy" | "none";

export interface Scored {
  row: Row;
  score: number;
  kind: MatchKind;
  /** Field that produced the match, for provenance display. */
  via: string;
}

const FUZZY_MIN = 0.82;
const STRONG_FIELDS = [...NAME_FIELDS, "EMAILID", "MOBILE NO."] as const;

function nameParts(row: Row): string[] {
  return [row.FIRSTNAME, row["MIDDLE NAME"], row["LAST NAME"]]
    .map((v) => squash(norm(v)))
    .filter(Boolean);
}

function rowName(row: Row): string {
  return nameParts(row).join(" ");
}

export function filledCount(row: Row): number {
  let n = 0;
  for (const [k, v] of Object.entries(row)) {
    if (k.startsWith("_")) continue;
    if (v !== "" && v != null) n++;
  }
  return n;
}

export function scoreRow(row: Row, query: string): Scored {
  const q = norm(query);
  const qs = squash(q);
  if (!q) return { row, score: 0, kind: "none", via: "" };

  // 3 — exact identifier hit
  for (const f of ID_FIELDS) {
    const v = norm(row[f]);
    if (v && (v === q || squash(v) === qs)) {
      return { row, score: 100, kind: "id", via: f };
    }
  }

  // 2 — exact equality on a strong field
  for (const f of STRONG_FIELDS) {
    if (norm(row[f]) === q) return { row, score: 95, kind: "exact", via: f };
  }

  // 1 — every query token present somewhere in the identity fields
  const haystack = [
    ...NAME_FIELDS.map((f) => norm(row[f])),
    norm(row["PROGRAMME/BRANCH"]),
    norm(row["CITY/VILLAGE(PERMANENT)"]),
    norm(row["COLLEGE"]),
  ]
    .join(" ")
    .split(/\s+/);
  const haySet = new Set(haystack);
  const tokens = q.split(/\s+/).filter(Boolean);
  if (tokens.length > 0 && tokens.every((t) => haySet.has(t))) {
    return { row, score: 90 - (tokens.length - 1), kind: "tokens", via: "NAME" };
  }

  // 0 — fuzzy against the assembled name
  const name = rowName(row);
  if (name) {
    let best = jaroWinkler(squash(name), qs);
    // partial query ("borka" for "abha borkar") should still land
    if (qs.length >= 3) {
      for (const part of name.split(" ")) {
        best = Math.max(best, jaroWinkler(part, qs));
      }
    }
    if (best >= FUZZY_MIN) {
      return { row, score: best * 70, kind: "fuzzy", via: "NAME" };
    }
  }

  return { row, score: 0, kind: "none", via: "" };
}

/**
 * Rank all rows. Identical names are separated by record completeness so the
 * fullest record surfaces first instead of an arbitrary row.
 */
export function rank(rows: Row[], query: string, limit = 50): Scored[] {
  const hits = rows.map((r) => scoreRow(r, query));
  return hits
    .filter((h) => h.kind !== "none")
    .sort((a, b) => b.score - a.score || filledCount(b.row) - filledCount(a.row))
    .slice(0, limit);
}

export function explain(s: Scored): string {
  switch (s.kind) {
    case "id":
      return `exact ${s.via}`;
    case "exact":
      return `exact ${s.via}`;
    case "tokens":
      return "all name tokens matched";
    case "fuzzy":
      return `fuzzy ${(s.score / 70).toFixed(2)}`;
    default:
      return "";
  }
}
