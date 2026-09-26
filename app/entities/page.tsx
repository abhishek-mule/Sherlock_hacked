"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Network, Users } from "lucide-react";
import { RequireAuth } from "@/components/auth";

/**
 * Entity index over the local dataset.
 *
 * Deliberately not a deanonymisation dashboard: it groups records by shared
 * non-sensitive keys so an analyst can see dataset shape, and links out to the
 * record view. Cross-identity merging stays out of scope on purpose.
 */
type Rec = Record<string, unknown>;

export default function EntitiesPage() {
  const [rows, setRows] = useState<Rec[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/students?limit=200")
      .then((r) => r.json())
      .then((d) => setRows(d.ok ? d.results : []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  const groups = useMemo(() => {
    const byBranch = new Map<string, Rec[]>();
    const byCity = new Map<string, Rec[]>();
    const byCategory = new Map<string, Rec[]>();
    for (const r of rows) {
      const push = (m: Map<string, Rec[]>, k: unknown) => {
        const key = String(k ?? "").trim();
        if (!key) return;
        const list = m.get(key) ?? [];
        list.push(r);
        m.set(key, list);
      };
      push(byBranch, r["PROGRAMME/BRANCH"]);
      push(byCity, r["CITY/VILLAGE(PERMANENT)"]);
      push(byCategory, r.CATEGORY);
    }
    const toArr = (m: Map<string, Rec[]>) =>
      Array.from(m.entries())
        .map(([key, list]) => ({ key, list }))
        .sort((a, b) => b.list.length - a.list.length);
    return { branch: toArr(byBranch), city: toArr(byCity), category: toArr(byCategory) };
  }, [rows]);

  const filter = (key: string) => key.toLowerCase().includes(q.trim().toLowerCase());

  return (
    <RequireAuth>
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Entities</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Dataset shape grouped by branch, city and category. {rows.length} records indexed.
        </p>
      </header>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Filter groups…"
        className="h-10 w-full max-w-md rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm outline-none focus:border-teal-500"
      />

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {(
            [
              ["Programme / Branch", groups.branch, Network],
              ["City / Village", groups.city, Users],
              ["Category", groups.category, Users],
            ] as const
          ).map(([label, list, Icon]) => {
            const shown = list.filter((g) => filter(g.key)).slice(0, 12);
            if (shown.length === 0) return null;
            return (
              <section key={label}>
                <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                  <Icon className="h-3.5 w-3.5 text-slate-400" />
                  {label}
                </h2>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {shown.map((g) => (
                    <div
                      key={g.key}
                      className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-medium">{g.key}</span>
                        <span className="shrink-0 rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px]">
                          {g.list.length}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {g.list.slice(0, 6).map((r, i) => (
                          <button
                            key={i}
                            onClick={() => router.push(`/record/${encodeURIComponent(String(r.SRNO ?? ""))}`)}
                            className="rounded border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 text-[11px] hover:border-teal-400 hover:text-teal-600"
                          >
                            {String(r.FIRSTNAME ?? "")} {String(r["LAST NAME"] ?? "")}
                          </button>
                        ))}
                        {g.list.length > 6 && (
                          <span className="px-1 py-0.5 text-[11px] text-slate-400">
                            +{g.list.length - 6}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
    </RequireAuth>
  );
}
