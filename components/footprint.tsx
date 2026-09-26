"use client";

import type { ReactNode } from "react";

/**
 * Local footprint view.
 *
 * Everything shown here comes from the three workbook sheets, each attributed
 * to its source. Nothing is inferred, and nothing is fetched from an external
 * service about a named person: a handle or link is displayed because the
 * workbook already contains it, not because this tool went looking.
 */

type Rec = Record<string, unknown>;

const LABELS: Record<string, string> = {
  student_name: "Name on OSINT sheet",
  name: "Display name",
  title: "Headline",
  connection: "Connections",
  connections: "Connections",
  education_1: "Education 1",
  education_2: "Education 2",
  location: "Location",
  github: "GitHub",
  open_to_work: "Open to work",
  about: "About",
  skills: "Skills",
  achievements: "Achievements",
  marks: "Marks",
  posts: "Posts",
  application_id: "Application ID",
  mht_cet_score: "MHT-CET score",
  merit_no: "Merit number",
  full_name: "Name on admission sheet",
  branch: "Branch",
  college: "College",
  city: "City",
  seat_type: "Seat type",
  seat_level: "Seat level",
  status: "Status",
  admitted: "Admitted",
  "Category (HSC / Diploma)": "Entry category",
  "Year of Admission": "Year of admission",
  "University Enrollment No.": "University enrolment no.",
  "College ERP No.": "College ERP no.",
  "Parents Contact No.": "Parents contact",
  "Students Contact No.": "Student contact",
  "E Mail ID": "Email on 7BT sheet",
  "Permanent Address": "Permanent address",
  "Father's Name": "Father's name",
  "Mother Name": "Mother's name",
};

function present(v: unknown): boolean {
  return v !== undefined && v !== null && v !== "" && !/^\*+\./.test(String(v));
}

function Panel({
  title,
  source,
  data,
  emptyNote,
}: {
  title: string;
  source: string;
  data: Rec | undefined;
  emptyNote?: string;
}) {
  const entries = data ? Object.entries(data).filter(([, v]) => present(v)) : [];

  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 px-4 py-2.5 dark:bg-slate-800/60">
        <h3 className="text-sm font-semibold">{title}</h3>
        <span className="text-[11px] text-slate-500">{source}</span>
      </header>
      {entries.length === 0 ? (
        <p className="px-4 py-3 text-xs text-slate-500">
          {emptyNote ?? "No values on this sheet for this record."}
        </p>
      ) : (
        <dl className="grid grid-cols-1 gap-x-4 gap-y-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map(([k, v]) => {
            const isLink = k === "github";
            const value = String(v);
            return (
              <div key={k} className="min-w-0">
                <dt className="text-[11px] uppercase tracking-wide text-slate-400">
                  {LABELS[k] ?? k.replace(/_/g, " ")}
                </dt>
                <dd className="text-sm break-words">
                  {isLink ? (
                    <a
                      href={value}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-teal-600 underline underline-offset-2 dark:text-teal-400"
                    >
                      {value}
                    </a>
                  ) : (
                    value
                  )}
                </dd>
              </div>
            );
          })}
        </dl>
      )}
    </section>
  );
}

export default function Footprint({ record }: { record: Rec }) {
  const sources = (record._sources ?? {}) as Rec;
  const osint = record._osint as Rec | undefined;
  const admission = record._admission as Rec | undefined;
  const master = record._master as Rec | undefined;

  const presentCount = [
    sources.osint_data ? 1 : 0,
    sources.admission_data ? 1 : 0,
    sources.master_7bt ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white p-4 text-xs dark:bg-slate-900">
        <p className="font-medium text-slate-700 dark:text-slate-200">
          {presentCount} of 3 secondary sheets contributed data to this record
        </p>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Every value below is reproduced from a local workbook. Where two sheets name the same
          person, that agreement is reported as a source match — it is not a claim that the records
          are the same individual, which would need human verification.
        </p>
      </div>

      <Panel
        title="Public profile data"
        source="db_cluster_data.xlsx · osint_data"
        data={osint}
        emptyNote="This person does not appear on the osint_data sheet. That sheet covers a different cohort — it is not evidence that they have no public presence."
      />
      <Panel
        title="Admission record"
        source="db_cluster_data.xlsx · admission_data"
        data={admission}
        emptyNote="No matching row on the admission_data sheet."
      />
      <Panel
        title="Master 7BT record"
        source="MASTER DATABASE 7BT CT 2026_27 B(2).xlsx · CT-B"
        data={master}
        emptyNote="Not enrolled on the 7BT master sheet, or the name did not match exactly."
      />

      <p className="pt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
        This view is deliberately read-only. It reports what your own spreadsheets contain and
        does not attempt to discover additional information about a named person from external
        services. The general-purpose provider engine in{" "}
        <code className="font-mono">internal/providers</code> remains available for infrastructure
        you are authorised to assess.
      </p>
    </div>
  );
}
