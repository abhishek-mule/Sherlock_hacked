"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Database, Loader2, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";

type Hit = {
  SRNO?: unknown;
  NAME?: unknown;
  FIRSTNAME?: unknown;
  "LAST NAME"?: unknown;
  ROLLNO?: unknown;
  "PROGRAMME/BRANCH"?: unknown;
  "CITY/VILLAGE(PERMANENT)"?: unknown;
  GENDER?: unknown;
  CATEGORY?: unknown;
  _filled?: number;
  _match?: { kind: string; via: string; score: number } | null;
  _sources?: Record<string, unknown>;
};

const KIND: Record<string, { label: string; cls: string }> = {
  id: { label: "ID match", cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" },
  exact: { label: "Exact", cls: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300" },
  tokens: { label: "Name match", cls: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300" },
  fuzzy: { label: "Similar", cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" },
};

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [meta, setMeta] = useState<{ total: number; fields: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (meta) return;
    fetch("/api/students?limit=1")
      .then((r) => r.json())
      .then((d) => d.ok && setMeta({ total: d.total_records, fields: d.fields_per_record }))
      .catch(() => {});
  }, [meta]);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setHits([]);
      setSearched(false);
      return;
    }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/students?q=${encodeURIComponent(term)}&limit=40`);
        const data = await res.json();
        if (!data.ok) {
          setHits([]);
          setSearched(true);
          return;
        }
        setHits(data.results as Hit[]);
        setSearched(true);
      } catch {
        toast({ title: "Search failed", description: "Local dataset unreadable", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }, 160);
    return () => clearTimeout(t);
  }, [q, toast]);

  const open = (h: Hit) => router.push(`/record/${encodeURIComponent(String(h.SRNO ?? ""))}`);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && hits.length > 0) open(hits[0]);
    if (e.key === "Escape") setQ("");
  };

  return (
    <div className="space-y-6">
      <section className="pt-6 text-center">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Record search</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {meta ? (
            <>
              {meta.total} local records · {meta.fields} fields each · fuzzy matching on
            </>
          ) : (
            "Local dataset ·"
          )}{" "}
          name, roll number, registration number or email
        </p>
      </section>

      <section className="mx-auto max-w-2xl">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="e.g.  Abha   ·   101   ·   230110570   ·   abha.borkar12@…"
            className="h-12 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 pl-10 pr-10 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
          />
          {q && (
            <button
              onClick={() => setQ("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label="Clear"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {loading && (
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
            <Loader2 className="h-3 w-3 animate-spin" /> searching…
          </div>
        )}
      </section>

      <section className="mx-auto max-w-4xl space-y-2">
        {loading && hits.length === 0 &&
          [0, 1, 2].map((i) => <Skeleton key={i} className="h-16 rounded-lg" />)}

        {!loading && searched && hits.length === 0 && (
          <div className="rounded-lg border border-dashed border-slate-300 dark:border-slate-700 p-10 text-center">
            <Database className="mx-auto h-6 w-6 text-slate-400" />
            <p className="mt-2 text-sm font-medium">No match for “{q.trim()}”</p>
            <p className="mt-1 text-xs text-slate-500">
              Check the spelling, or search by roll / registration number. Identical names are
              separated by record completeness.
            </p>
          </div>
        )}

        {hits.map((h, i) => {
          const name =
            [h.FIRSTNAME, h["LAST NAME"]].filter(Boolean).join(" ") || String(h.NAME ?? "");
          const kind = KIND[h._match?.kind ?? "tokens"] ?? KIND.tokens;
          return (
            <button
              key={`${h.SRNO}-${i}`}
              onClick={() => open(h)}
              className="group flex w-full items-center gap-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 text-left transition hover:border-teal-400 hover:shadow-sm"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 text-sm font-semibold text-white">
                {(String(h.FIRSTNAME ?? name)[0] ?? "?").toUpperCase()}
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="truncate font-medium">{name}</span>
                  <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] ${kind.cls}`}>
                    {kind.label}
                  </span>
                </span>
                <span className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {h.ROLLNO ? <span className="font-mono">roll {String(h.ROLLNO)}</span> : null}
                  {h["PROGRAMME/BRANCH"] ? <span>{String(h["PROGRAMME/BRANCH"])}</span> : null}
                  {h["CITY/VILLAGE(PERMANENT)"] ? (
                    <span>{String(h["CITY/VILLAGE(PERMANENT)"])}</span>
                  ) : null}
                </span>
              </span>

              <span className="hidden sm:flex shrink-0 items-center gap-2">
                {h._filled ? (
                  <Badge variant="outline" className="text-[10px]">
                    {h._filled} fields
                  </Badge>
                ) : null}
                <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-teal-500" />
              </span>
            </button>
          );
        })}

        {!searched && !loading && (
          <div className="grid gap-2 pt-2 sm:grid-cols-3">
            {[
              { t: "Exact ID", d: "Roll, registration or enrollment number beats any name guess." },
              { t: "Name tokens", d: "All tokens must appear, so “adit singh” still finds Aditi Singh." },
              { t: "Fuzzy", d: "Jaro-Winkler tolerates typos and transpositions." },
            ].map((c) => (
              <div key={c.t} className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
                <p className="text-xs font-semibold">{c.t}</p>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                  {c.d}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-4xl">
        <Button variant="ghost" size="sm" onClick={() => router.push("/download")}>
          Install on Android
        </Button>
      </section>
    </div>
  );
}
