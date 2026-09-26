"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Database, Download, FileSearch, LogOut, Moon, Network, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { AuthProvider, useAuth } from "@/components/auth";
import { CommandPalette } from "@/components/command-palette";
import { ClientOnly } from "@/components/client-only";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Search", icon: FileSearch },
  { href: "/entities", label: "Entities", icon: Network },
  { href: "/download", label: "Download", icon: Download },
];

function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { signOut } = useAuth();
  const [ds, setDs] = useState<{ total: number; fields: number; ok: boolean } | null>(null);

  const { authenticated } = useAuth();

  useEffect(() => {
    if (!authenticated) return;
    let alive = true;
    fetch("/api/students?limit=1")
      .then((r) => r.json())
      .then((d) => alive && setDs({ total: d.total_records ?? 0, fields: d.fields_per_record ?? 0, ok: !!d.ok }))
      .catch(() => alive && setDs({ total: 0, fields: 0, ok: false }));
    return () => {
      alive = false;
    };
  }, [authenticated]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white/85 dark:bg-slate-950/85 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 h-14 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-gradient-to-br from-teal-500 to-cyan-500 text-white text-xs font-bold">
              SH
            </span>
            <span className="font-semibold tracking-tight hidden sm:block">Sherlock Hacked</span>
          </Link>

          <nav className="hidden sm:flex items-center gap-1 ml-2">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm transition-colors",
                  pathname === n.href
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800",
                )}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <CommandPalette />

            <span
              title={
                ds?.ok
                  ? `Local dataset: ${ds.total} records x ${ds.fields} fields`
                  : "Local dataset not ingested — run python3 scripts/ingest.py"
              }
              className={cn(
                "hidden lg:inline-flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-full border",
                ds?.ok
                  ? "border-emerald-300 text-emerald-700 bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:bg-emerald-950/40"
                  : "border-amber-300 text-amber-700 bg-amber-50 dark:border-amber-800 dark:text-amber-300 dark:bg-amber-950/40",
              )}
            >
              <Database className="h-3 w-3" />
              {ds?.ok ? `${ds.total} rec · ${ds.fields} fld` : "no dataset"}
            </span>

            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-8 w-8 grid place-items-center rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle theme"
            >
              <ClientOnly>
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </ClientOnly>
            </button>

            <button
              onClick={() => {
                void signOut();
              }}
              className="h-8 w-8 grid place-items-center rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6">{children}</main>

      <footer className="border-t border-slate-200 dark:border-slate-800 py-4">
        <div className="mx-auto max-w-7xl px-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
          <span>Local-first. Workbooks and generated data stay on this machine.</span>
          <span>High-risk identifiers masked by default; revealing is local-only and audit-logged.</span>
        </div>
      </footer>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Shell>{children}</Shell>
    </AuthProvider>
  );
}
