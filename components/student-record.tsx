"use client";

import { useMemo, useState } from "react";

/**
 * Full record renderer.
 *
 * Two display modes, because "the field is empty for this person" and "the
 * field does not exist in the dataset" are very different facts and the
 * previous version conflated them by hiding every empty value:
 *
 *   "populated" (default) — only fields with a value, for quick reading
 *   "all fields"          — every column in the record, empties marked "—"
 */

type Row = Record<string, unknown>;

const GROUPS: { key: string; label: string; fields: string[] }[] = [
  { key: "identity", label: "Identity", fields: ["SRNO","NAME","FIRSTNAME","MIDDLE NAME","LAST NAME","GENDER","DOB","BIRTH_PLACE","NATIONALITY","BLOOD GROUP","MARITAL STATUS","RELIGION","CATEGORY","SUB_CASTE","SOCIAL CATEGORY","PHYSICALLY_HANDICAPPED","TYPE OF DISABILITY","ADHAAR NO","PASSPORT NO.","IDENTI_MARK","MTONGUE","OTHER LANGUAGE","HEIGHT","WEIGHT"] },
  { key: "contact", label: "Contact", fields: ["MOBILE NO.","STUDENT MOBILE NO.2","STUDENT ALTERNATE MOBILE NO.","EMAILID","ALTERNATE EMAIL ID","LANDLINE NO","LANDLINE NO_LOCAL"] },
  { key: "enrollment", label: "Enrollment & Admission", fields: ["REGISTRATION_NO","ENROLLMENT NUMBER","ABC ID NUMBER","ROLLNO","ADMISSION TYPE","ADMISSION TYPE1","ADMISSION THROUGH","ADMISSION DATE","ADMISSION BATCH","ADMISSION CATEGORY","INTEGRATED APPLICATION ID","PROGRAM LEVEL","YEAR","SEMESTER","ACADEMIC YEAR","PROGRAMME/BRANCH","DEGREE","MEDIUM OF INSTRUCTION","HOSTELLER","TRANSPORTATION","PAYMENT TYPE","ADMITTED STATUS","ADMISSION STATUS","INFORMATION VERIFIED","UPLOADED DOCUMENTS","Merit_no."] },
  { key: "family", label: "Family", fields: ["IS PARENTS ALIVE","FATHERNAME","FATHERMIDDLENAME","FATHERLASTNAME","FATHERMOBILE","FATHER'S ALTERNATE MOBILE NO.","FATHER'S OFFICE PHONE NO.","FATHER'S QUALIFICATION","FATHER'S OCCUPATION","FATHER EMAIL","MOTHERNAME","MOTHERMOBILE","MOTHER'S ALTERNATE MOBILE NO.","MOTHER'S QUALIFICATION","MOTHER'S OCCUPATION","MOTHER EMAIL","MOTHER'S OFFICE PHONE NO","ANNUAL FAMILY INCOME","GUARDIAN NAME","GUARDIAN CONTACT NO","RELATION WITH GUARDIAN","GUARDIAN OCCUPATION","GUARDIAN QUALIFICATION"] },
  { key: "address", label: "Address", fields: ["ADDRESS(PERMANENT)","CITY/VILLAGE(PERMANENT)","TALUKA(PERMANENT)","DISTRICT_PERMANENT","STATE_PERMANENT","AREA POST OFFICE","AREA POLICE STATION","PIN_PER","ADDRESS(LOCAL)","CITY/VILLAGE(LOCAL)","TALUKA(LOCAL)","DISTRICT_LOCAL","STATE_LOCAL","LANDLINE NO_LOCAL","AREA POST OFFICE LOCAL","AREA POLICE STATION LOCAL","PIN_LOCAL"] },
  { key: "schooling", label: "Schooling (10th)", fields: ["SCHOOL/COLLEGE","10TH SCHOOL/COLLEGE NAME","10TH BOARD","10TH YEAR OF EXAM","10TH MEDIUM","10TH MARKS OBTAINED","10TH OUT OF MARKS","10TH PERCENTILE","SEAT NO.","SCHOOL/COLLEGE ADDRESS"] },
  { key: "higher", label: "Higher Secondary (12th)", fields: ["12TH SCHOOL/COLLEGE NAME","12TH BOARD","12TH YEAR OF EXAM","12TH MEDIUM","12TH SEAT NO.","PHY. OBT. MARKS","PHY. TOTAL MARKS","CHE. OBT. MARKS","CHE. TOTAL MARKS","MATH OBT. MARKS","MATH TOTAL MARKS","PCM OBT. MARKS","PCM PERCENTAGE","VOCATIONAL SUBJECT","VOC. OBTAINED MARKS","VOC. TOTAL MARKS","12TH MARKS OBTAINED","12TH OUT OF MARKS","12TH PERCENTILE","12TH SCHOOL/COLLEGE ADDRESS"] },
  { key: "diploma", label: "Diploma", fields: ["DIPLOMA SCHOOL/COLLEGE NAME","DIPLOMA BOARD","DIPLOMA YEAR OF EXAM","DIPLOMA MEDIUM","DIPLOMA MARKS OBTAINED","DIPLOMA OUT OF MARKS","DIPLOMA PERCENTILE","DIPLOMA SEAT NO.","DIPLOMA SCHOOL/COLLEGE ADDRESS"] },
  { key: "entrance", label: "Entrance Exam", fields: ["ENTRANCE EXAM","ENTRANCE EXAM SEAT NO.","ENTRANCE EXAM NAME","ENTRANCE EXAM SEAT NUMBER","YEAR_OF_EXAM","PERCENTILE(ENTRANCE EXAM)","ENTRANCE EXAM YEAR","ENTRANCE EXAM PERCENTAGE","RANK"] },
  { key: "qualification", label: "Last Qualification", fields: ["LAST QUALIFICATION","LAST QUALIFICATION SCHOOL / COLLEGE NAME","LAST QUALIFICATION BOARD","LAST QUALIFICATION QUALIFYING EXAM","LAST QUALIFICATION SEAT NO.","LAST QUALIFICATION YEAR OF EXAM","LAST QUALIFICATION MARK OBTAINED","LAST QUALIFICATION OUT OF MARKS","LAST QUALIFICATION PERCENTAGE","LAST QUALIFICATION GRADE","LAST QUALIFICATION DGPA/CGPA","LAST QUALIFICATION COLLEGE ADDRESS"] },
  { key: "phd", label: "PhD", fields: ["PHD SCHOOL/COLLEGE NAME","PHD BOARD","PHD QUALIFYING EXAM","PHD YEAR OF EXAM","PHD SEAT NO.","PHD MARKS OBTAINED","PHD OUT OF MARKS","PHD PERCENTAGE","PHD GRADE","PHD SCHOOL/COLLEGE ADDRESS"] },
  { key: "health", label: "Vaccination", fields: ["ARE YOU VACCINATED ? YES OR NO","VACCINE NAME","FIRSTDOSE_VACCINATION_CENTER","SECONDDOSE_VACCINATION_CENTER","FIRSTDOSE_VACCINATED_DATE","SECONDDOSE_VACCINATED_DATE"] },
  { key: "bank", label: "Bank, Sports & Achievements", fields: ["BANK NAME","IFSCCODE","BANKADDRESS","SPORT_NAME","SPORT_LEVEL","ACHIEVEMENT_DETAILS"] },
];

const MASKED = /^[*]+\../;

function isPresent(v: unknown): boolean {
  return v !== undefined && v !== null && v !== "";
}

/** Present and readable (not a redaction placeholder). */
function isFilled(v: unknown): boolean {
  return isPresent(v) && !MASKED.test(String(v));
}

function Field({ name, value, showEmpty }: { name: string; value: unknown; showEmpty: boolean }) {
  const filled = isFilled(value);
  if (!filled && !showEmpty) return null;
  return (
    <div className="min-w-0">
      <dt className="text-[11px] uppercase tracking-wide text-slate-400">{name}</dt>
      <dd className={`text-sm break-words ${filled ? "text-slate-800 dark:text-slate-100" : "text-slate-300 dark:text-slate-600"}`}>
        {filled ? String(value) : "—"}
      </dd>
    </div>
  );
}

export default function StudentRecord({
  record,
  redacted,
  onReveal,
}: {
  record: Row;
  redacted: boolean;
  onReveal?: () => void;
}) {
  const [open, setOpen] = useState<Record<string, boolean>>({ identity: true, enrollment: true });
  const [showEmpty, setShowEmpty] = useState(false);

  const allColumns = useMemo(
    () => Object.keys(record).filter((k) => !k.startsWith("_")),
    [record],
  );

  const { sections, extras, filledCount, columnCount } = useMemo(() => {
    const known = new Set<string>();
    for (const g of GROUPS) for (const f of g.fields) known.add(f);

    const secs = GROUPS.map((g) => {
      const present = g.fields.filter((f) => f in record);
      g.fields.forEach((f) => known.add(f));
      const rows = g.fields
        .map((f) => ({ f, v: record[f] }))
        .filter((r) => showEmpty || isFilled(r.v));
      return { ...g, rows, hasAny: present.length > 0 };
    }).filter((s) => (showEmpty ? s.hasAny : s.rows.length > 0));

    const ex = Object.entries(record).filter(
      ([k, v]) => !k.startsWith("_") && !known.has(k) && (showEmpty || isFilled(v)),
    );

    let filled = 0;
    for (const k of allColumns) if (isFilled(record[k])) filled++;

    return { sections: secs, extras: ex, filledCount: filled, columnCount: allColumns.length };
  }, [record, showEmpty, allColumns]);

  const pct = columnCount ? Math.round((filledCount / columnCount) * 100) : 0;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
        <span>
          <strong className="text-slate-700 dark:text-slate-200">{filledCount}</strong> of{" "}
          {columnCount} fields populated ({pct}%)
        </span>
        <label className="ml-auto inline-flex cursor-pointer items-center gap-1.5">
          <input
            type="checkbox"
            checked={showEmpty}
            onChange={(e) => setShowEmpty(e.target.checked)}
            className="h-3.5 w-3.5 rounded border-slate-300"
          />
          Show empty fields
        </label>
        {redacted && onReveal && (
          <button
            onClick={onReveal}
            className="rounded border border-amber-400 px-2.5 py-1 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/30"
          >
            Reveal high-risk fields (local only)
          </button>
        )}
      </div>

      {redacted && (
        <p className="text-[11px] text-slate-400">
          High-risk identifiers (Aadhaar, passport, bank, IFSC, family income) are masked.
        </p>
      )}

      <div className="h-1 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div className="h-full bg-teal-500" style={{ width: `${pct}%` }} />
      </div>

      {sections.map((s) => {
        const isOpen = !!open[s.key];
        const filledInGroup = s.rows.filter((r) => isFilled(r.v)).length;
        return (
          <div key={s.key} className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <button
              onClick={() => setOpen((o) => ({ ...o, [s.key]: !o[s.key] }))}
              className="flex w-full items-center justify-between bg-slate-50 px-4 py-2.5 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-700/50"
            >
              <span className="text-sm font-semibold">{s.label}</span>
              <span className="text-xs text-slate-500">
                {filledInGroup}/{s.rows.length}
                {showEmpty ? "" : " shown"}
              </span>
            </button>
            {isOpen && (
              <dl className="grid grid-cols-1 gap-x-4 gap-y-2 p-4 sm:grid-cols-2 lg:grid-cols-3">
                {s.rows.map(({ f, v }) => (
                  <Field key={f} name={f} value={v} showEmpty={showEmpty} />
                ))}
              </dl>
            )}
          </div>
        );
      })}

      {extras.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="bg-slate-50 px-4 py-2.5 text-sm font-semibold dark:bg-slate-800/60">
            Other fields ({extras.length})
          </div>
          <dl className="grid grid-cols-1 gap-x-4 gap-y-2 p-4 sm:grid-cols-2 lg:grid-cols-3">
            {extras.map(([k, v]) => (
              <Field key={k} name={k} value={v} showEmpty={showEmpty} />
            ))}
          </dl>
        </div>
      )}
    </div>
  );
}
