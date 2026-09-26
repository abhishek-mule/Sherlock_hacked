"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import RecordAvatar from "@/components/record-avatar";

type Hit = {
  SRNO?: unknown;
  NAME?: unknown;
  FIRSTNAME?: unknown;
  "LAST NAME"?: unknown;
  ROLLNO?: unknown;
  REGISTRATION_NO?: unknown;
  "PROGRAMME/BRANCH"?: unknown;
  _filled?: number;
  _match?: { kind: string; via: string; score: number } | null;
};

const KIND_TONE: Record<string, string> = {
  id: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  exact: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
  tokens: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  fuzzy: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
};

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/students?q=${encodeURIComponent(q)}&limit=12`);
        const data = await res.json();
        setHits(data.ok ? (data.results as Hit[]) : []);
      } catch {
        setHits([]);
      } finally {
        setLoading(false);
      }
    }, 140);
    return () => clearTimeout(t);
  }, [q, open]);

  const go = (h: Hit) => {
    setOpen(false);
    router.push(`/record/${encodeURIComponent(String(h.SRNO ?? ""))}`);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-sm text-slate-500 hover:border-slate-400 min-w-[15rem]"
      >
        <span>Search records…</span>
        <kbd className="ml-auto text-[10px] font-mono border rounded px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800">
          ⌘K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Name, roll no, registration no, email…"
          value={q}
          onValueChange={setQ}
        />
        <CommandList>
          <CommandEmpty>
            {loading ? "Searching local dataset…" : "No match. Try a roll number or a shorter name."}
          </CommandEmpty>
          {hits.length > 0 && (
            <CommandGroup heading={`Records (${hits.length})`}>
              {hits.map((h, i) => {
                const name = [h.FIRSTNAME, h["LAST NAME"]].filter(Boolean).join(" ") || String(h.NAME ?? "");
                return (
                  <CommandItem
                    key={`${h.SRNO}-${i}`}
                    value={`${name} ${h.ROLLNO ?? ""}`}
                    onSelect={() => go(h)}
                    className="gap-3"
                  >
                    <RecordAvatar
                      identity={String(h.REGISTRATION_NO ?? h.ROLLNO ?? h.SRNO ?? name)}
                      name={name}
                      size={24}
                    />
                    <span className="font-medium">{name}</span>
                    <span className="text-xs text-slate-400 font-mono">{String(h.ROLLNO ?? "")}</span>
                    {h["PROGRAMME/BRANCH"] ? (
                      <span className="text-xs text-slate-500 truncate max-w-[16rem]">
                        {String(h["PROGRAMME/BRANCH"])}
                      </span>
                    ) : null}
                    {h._filled ? (
                      <Badge variant="outline" className="ml-auto text-[10px]">
                        {h._filled} fields
                      </Badge>
                    ) : null}
                    {h._match ? (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded ${KIND_TONE[h._match.kind] ?? ""}`}
                      >
                        {h._match.kind}
                      </span>
                    ) : null}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
