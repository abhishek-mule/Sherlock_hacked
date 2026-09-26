"use client";

import type { ReactNode } from "react";

/**
 * Key-facts summary.
 *
 * Always shows every listed field, marking blanks as "not recorded" rather than
 * hiding them. A hidden empty field is indistinguishable from a field the tool
 * never read, which is exactly the confusion this view removes.
 */

type Rec = Record<string, unknown>;

const SUMMARY: { field: string; label: string }[] = [
  { field: "NAME", label: "Full name" },
  { field: "ROLLNO", label: "Roll no" },
  { field: "REGISTRATION_NO", label: "Registration no" },
  { field: "GENDER", label: "Gender" },
  { field: "CATEGORY", label: "Category" },
  { field: "SUB_CASTE", label: "Sub-caste" },
  { field: "SOCIAL CATEGORY", label: "Social category" },
  { field: "RELIGION", label: "Religion" },
  { field: "NATIONALITY", label: "Nationality" },
  { field: "BLOOD GROUP", label: "Blood group" },
  { field: "PROGRAMME/BRANCH", label: "Programme / branch" },
  { field: "DEGREE", label: "Degree" },
  { field: "YEAR", label: "Year" },
  { field: "SEMESTER", label: "Semester" },
  { field: "ADMISSION TYPE", label: "Admission type" },
  { field: "ADMISSION CATEGORY", label: "Admission category" },
  { field: "CITY/VILLAGE(PERMANENT)", label: "City / village" },
  { field: "DISTRICT_PERMANENT", label: "District" },
  { field: "STATE_PERMANENT", label: "State" },
  { field: "PHYSICALLY_HANDICAPPED", label: "Physically handicapped" },
  { field: "HOSTELLER", label: "Hosteller" },
  { field: "SPORT_NAME", label: "Sport" },
  { field: "ACHIEVEMENT_DETAILS", label: "Achievements" },
  { field: "HEIGHT", label: "Height" },
  { field: "WEIGHT", label: "Weight" },
  { field: "10TH PERCENTILE", label: "10th percentile" },
  { field: "12TH PERCENTILE", label: "12th percentile" },
];

function present(v: unknown): boolean {
  return v !== undefined && v !== null && v !== "";
}

function isMasked(v: unknown): boolean {
  return present(v) && /^\*+\./.test(String(v));
}

export default function Overview({ record }: { record: Rec }) {
  const missing = SUMMARY.filter((s) => !present(record[s.field])).length;
  const masked = SUMMARY.filter((s) => isMasked(record[s.field])).length;

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500 dark:text-slate-400">
        {SUMMARY.length - missing} of {SUMMARY.length} key fields recorded
        {masked > 0 ? ` · ${masked} masked until revealed` : ""}
      </p>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-3 lg:grid-cols-4 dark:border-slate-800 dark:bg-slate-900">
        {SUMMARY.map(({ field, label }) => {
          const raw = record[field];
          const has = present(raw);
          return (
            <div key={field} className="min-w-0">
              <dt className="text-[11px] uppercase tracking-wide text-slate-400">{label}</dt>
              <dd
                className={`text-sm break-words ${
                  has ? "text-slate-800 dark:text-slate-100" : "italic text-slate-300 dark:text-slate-600"
                }`}
              >
                {has ? String(raw) : "not recorded"}
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
