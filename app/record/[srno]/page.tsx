"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Copy, Database, FileWarning, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StudentRecord from "@/components/student-record";
import RecordAvatar from "@/components/record-avatar";
import { useToast } from "@/components/ui/use-toast";

type Rec = Record<string, unknown>;

const SOURCE_LABEL: Record<string, string> = {
  db_cluster_data: "db_cluster_data.xlsx · student_data",
  master_7bt: "MASTER DATABASE 7BT CT 2026_27 B(2).xlsx · CT-B",
  osint_data: "db_cluster_data.xlsx · osint_data",
  admission_data: "db_cluster_data.xlsx · admission_data",
};

const SOURCE_FIELD: Record<string, string[]> = {
  master_7bt: ["Sr. No.", "Category (HSC / Diploma)", "Father's Name", "Mother Name", "Year of Admission", "University Enrollment No.", "College ERP No.", "Parents Contact No.", "Students Contact No.", "E Mail ID", "Permanent Address"],
  osint_data: ["student_name", "name", "title", "education_1", "education_2", "location", "github", "connections", "open_to_work", "about", "skills", "achievements", "marks", "posts"],
  admission_data: ["application_id", "mht_cet_score", "branch", "college", "city", "seat_type", "seat_level", "status", "admitted"],
};

export default function RecordPage() {
  const { srno } = useParams<{ srno: string }>();
  const [rec, setRec] = useState<Rec | null>(null);
  const [redacted, setRedacted] = useState(true);
  const [emptyEverywhere, setEmptyEverywhere] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  // Which columns are empty across the whole dataset, not just this record.
  useEffect(() => {
    fetch("/api/students?limit=1&coverage=1")
      .then((r) => r.json())
      .then((d) => Array.isArray(d?.empty_in_every_record) && setEmptyEverywhere(d.empty_in_every_record))
      .catch(() => {});
  }, []);

  const load = async (reveal = false) => {
    setLoading(true);
    try {
      // Primary-key lookup, not a search — the record view must not depend on
      // fuzzy ranking to resolve a record it already knows the id of.
      const url = `/api/students?srno=${encodeURIComponent(String(srno ?? ""))}&limit=1&fields=all${
        reveal ? "&reveal=1" : ""
      }`;
      const res = await fetch(url);
      const data = await res.json();
      if (!data.ok || !data.results?.length) {
        setRec(null);
        return;
      }
      setRec(data.results[0]);
      setRedacted(!!data.redacted);
    } catch {
      setRec(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [srno]);

  const name = rec
    ? [rec.FIRSTNAME, rec["LAST NAME"]].filter(Boolean).join(" ") || String(rec.NAME ?? "")
    : "";
  const sources = (rec?._sources ?? null) as Record<string, unknown> | null;
  const filledText = rec ? `${String(rec._filled ?? 0)} fields populated` : "";
  const match = (rec?._match ?? null) as { kind?: string } | null;
  const matchText = match?.kind ? ` · matched by ${match.kind}` : "";

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/")} aria-label="Back">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        {loading ? (
          <Skeleton className="h-7 w-56" />
        ) : (
          <div className="flex min-w-0 items-center gap-3">
            <RecordAvatar
              identity={String(
                rec?.REGISTRATION_NO ?? rec?.ROLLNO ?? rec?.SRNO ?? srno ?? "",
              )}
              name={name}
              size={44}
            />
            <div className="min-w-0">
              <h1 className="truncate text-xl font-semibold tracking-tight">
                {name || `Record ${srno}`}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {filledText}
                {matchText}
              </p>
            </div>
          </div>
        )}
        {rec && (
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto"
            onClick={() => {
              navigator.clipboard
                .writeText(JSON.stringify(rec, null, 2))
                .then(() => toast({ title: "Copied record JSON" }))
                .catch(() => toast({ title: "Copy failed", variant: "destructive" }));
            }}
            aria-label="Copy record JSON"
          >
            <Copy className="h-4 w-4" />
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-20 rounded-lg" />
          <Skeleton className="h-40 rounded-lg" />
        </div>
      ) : !rec ? (
        <div className="rounded-lg border border-dashed border-slate-300 dark:border-slate-700 p-10 text-center">
          <FileWarning className="mx-auto h-6 w-6 text-slate-400" />
          <p className="mt-2 text-sm font-medium">Record not available</p>
          <p className="mt-1 text-xs text-slate-500">
            Ingest the workbooks first: <code>python3 scripts/ingest.py</code>
          </p>
        </div>
      ) : (
        <Tabs defaultValue="record">
          <TabsList>
            <TabsTrigger value="record">Record</TabsTrigger>
            <TabsTrigger value="sources">Sources</TabsTrigger>
            <TabsTrigger value="raw">Raw</TabsTrigger>
          </TabsList>

          <TabsContent value="record" className="mt-4">
            <StudentRecord
              record={rec}
              redacted={redacted}
              onReveal={() => load(true)}
            />
            {emptyEverywhere.length > 0 && (
              <details className="mt-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <summary className="cursor-pointer px-4 py-2.5 text-sm font-medium">
                  {emptyEverywhere.length} columns are empty in every record
                </summary>
                <p className="px-4 pb-2 text-xs text-slate-500 dark:text-slate-400">
                  These columns exist in the source workbook but contain no value for any of the
                  124 records. They are not dropped by this tool.
                </p>
                <ul className="flex flex-wrap gap-1.5 px-4 pb-4">
                  {emptyEverywhere.map((c) => (
                    <li
                      key={c}
                      className="rounded border border-slate-200 px-1.5 py-0.5 text-[11px] text-slate-500 dark:border-slate-700"
                    >
                      {c}
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </TabsContent>

          <TabsContent value="sources" className="mt-4 space-y-3">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Every field in this record traces back to one of the local workbooks. Nothing is
              inferred from an external source.
            </p>
            {sources &&
              Object.entries(SOURCE_LABEL).map(([key, label]) => {
                const on = !!sources[key];
                const block = rec[`_${key}`] as Rec | undefined;
                const extra = SOURCE_FIELD[key] ?? [];
                return (
                  <div
                    key={key}
                    className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                  >
                    <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 px-4 py-2.5">
                      <Database className="h-3.5 w-3.5 text-slate-400" />
                      <span className="text-sm font-medium">{label}</span>
                      <Badge
                        variant="outline"
                        className={`ml-auto text-[10px] ${
                          on
                            ? "border-emerald-300 text-emerald-700 dark:border-emerald-700 dark:text-emerald-300"
                            : "text-slate-400"
                        }`}
                      >
                        {on ? "merged" : "not present"}
                      </Badge>
                    </div>
                    {on && block && (
                      <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-2 p-4">
                        {extra
                          .filter((f) => block[f] !== "" && block[f] != null)
                          .map((f) => (
                            <div key={f} className="min-w-0">
                              <dt className="text-[11px] uppercase tracking-wide text-slate-400">{f}</dt>
                              <dd className="text-sm break-words">{String(block[f])}</dd>
                            </div>
                          ))}
                      </dl>
                    )}
                  </div>
                );
              })}
          </TabsContent>

          <TabsContent value="raw" className="mt-4">
            <pre className="max-h-[70vh] overflow-auto rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-4 text-[11px] leading-relaxed">
              {JSON.stringify(rec, null, 2)}
            </pre>
          </TabsContent>
        </Tabs>
      )}

      <p className="flex items-start gap-2 pt-2 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
        <Layers className="mt-0.5 h-3 w-3 shrink-0" />
        Records are shown exactly as they exist in the local workbooks. Cross-source agreement is
        reported as provenance, never as proof that two records describe the same person. See{" "}
        <Link href="/docs/DEADLY_OSINT_DESIGN.md" className="underline">
          the design notes
        </Link>
        .
      </p>
    </div>
  );
}
