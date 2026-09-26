"use client";

import { useEffect, useMemo, useState } from "react";

/** Static field->group layout (mirrors /api/students/fields). */
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
  { key: "bank", label: "Bank & Sports", fields: ["BANK NAME","IFSCCODE","BANKADDRESS","SPORT_NAME","SPORT_LEVEL","ACHIEVEMENT_DETAILS"] },
];

const MASKED = /^[*]+./;

function isFilled(v: unknown): boolean {
  return v !== undefined && v !== null && v !== "" && !MASKED.test(String(v));
}

export default function StudentRecord({
  record,
  redacted,
  onReveal,
}: {
  record: Record<string, unknown>;
  redacted: boolean;
  onReveal?: () => void;
}) {
  const [open, setOpen] = useState<Record<string, boolean>>({ identity: true, enrollment: true });

  const sections = useMemo(
    () =>
      GROUPS.map((g) => {
        const rows = g.fields
          .map((f) => ({ f, v: record[f] }))
          .filter((r) => isFilled(r.v));
        return { ...g, rows };
      }).filter((s) => s.rows.length > 0),
    [record],
  );

  const extras = useMemo(() => {
    const known = new Set(GROUPS.flatMap((g) => g.fields));
    return Object.entries(record).filter(
      ([k, v]) => !k.startsWith("_") && !known.has(k) && isFilled(v),
    );
  }, [record]);

  const totalShown = sections.reduce((n, s) => n + s.rows.length, 0) + extras.length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>
          {totalShown} field{totalShown === 1 ? "" : "s"} filled
          {redacted ? " — high-risk identifiers masked" : " — full local record"}
        </span>
        {redacted && onReveal && (
          <button
            onClick={onReveal}
            className="px-2.5 py-1 rounded border border-amber-400 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/30"
          >
            Reveal high-risk fields (local only)
          </button>
        )}
      </div>

      {sections.map((s) => {
        const isOpen = !!open[s.key];
        return (
          <div key={s.key} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-800">
            <button
              onClick={() => setOpen((o) => ({ ...o, [s.key]: !o[s.key] }))}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-700/50"
            >
              <span className="font-semibold text-sm">{s.label}</span>
              <span className="text-xs text-slate-500">{s.rows.length} fields</span>
            </button>
            {isOpen && (
              <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-2 p-4">
                {s.rows.map(({ f, v }) => (
                  <div key={f} className="min-w-0">
                    <dt className="text-[11px] uppercase tracking-wide text-slate-400">{f}</dt>
                    <dd className="text-sm text-slate-800 dark:text-slate-100 break-words">{String(v)}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        );
      })}

      {extras.length > 0 && (
        <div className="border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800">
          <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 font-semibold text-sm">
            Other fields ({extras.length})
          </div>
          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-2 p-4">
            {extras.map(([k, v]) => (
              <div key={k} className="min-w-0">
                <dt className="text-[11px] uppercase tracking-wide text-slate-400">{k}</dt>
                <dd className="text-sm break-words">{String(v)}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  );
}
