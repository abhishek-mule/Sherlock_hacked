"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Glasses, Loader2, Lock, Moon, ShieldAlert, Sun, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useTheme } from "next-themes";
import { ClientOnly } from "@/components/client-only";

export const dynamic = "force-dynamic";

/**
 * Operator sign-in.
 *
 * The credential is a salted hash in data/auth.json, set once via
 * `npm run auth:setup`. Nothing about it is rendered here — no hint, no default
 * value, no placeholder that gives it away.
 */
export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [configured, setConfigured] = useState<boolean | null>(null);
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    fetch("/api/auth")
      .then((r) => r.json())
      .then((d) => {
        setConfigured(!!d.configured);
        if (d.authenticated) router.replace("/");
      })
      .catch(() => setConfigured(true));
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.ok) {
        router.push("/");
        router.refresh();
      } else {
        setError(data.error ?? "Sign-in failed");
      }
    } catch {
      setError("Could not reach the local server");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 p-4">
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-4 text-white hover:bg-white/10"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        aria-label="Toggle theme"
      >
        <ClientOnly>
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </ClientOnly>
      </Button>

      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center justify-center rounded-full bg-white/5 p-4 backdrop-blur-sm">
            <Glasses className="h-12 w-12 text-teal-400" />
          </div>
          <h1 className="mb-2 text-3xl font-bold text-white">Sherlock Hacked</h1>
          <p className="text-slate-400">Authorised access only</p>
        </div>

        <Card className="border-white/20 bg-white/10 p-6 backdrop-blur-lg">
          {configured === false ? (
            <div className="flex items-start gap-3 text-sm">
              <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
              <div>
                <p className="font-medium text-white">No credential configured</p>
                <p className="mt-1 text-slate-300">
                  Run <code className="font-mono text-teal-300">npm run auth:setup</code> to create
                  the operator account. It is stored as a salted hash in{" "}
                  <code className="font-mono text-teal-300">data/auth.json</code> and is never
                  committed.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-white">
                  Username
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="border-white/10 bg-white/5 pl-10 text-white placeholder:text-slate-400 focus:border-teal-400 focus:ring-teal-400/20"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-white/10 bg-white/5 pl-10 text-white placeholder:text-slate-400 focus:border-teal-400 focus:ring-teal-400/20"
                    required
                  />
                </div>
              </div>

              {error && (
                <p role="alert" className="text-sm text-red-300">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="w-full bg-teal-500 text-white transition-all hover:bg-teal-600"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>
          )}
        </Card>

        <p className="mt-8 text-center text-xs text-slate-400">
          Local-first. Records stay on this machine.
        </p>
      </div>
    </div>
  );
}
