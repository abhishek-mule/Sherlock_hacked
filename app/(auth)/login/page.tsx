"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Glasses, Lock, Loader2, Moon, Sun, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useTheme } from "next-themes";
import { DEMO_USER, setDemoSession } from "@/lib/session";
import { ClientOnly } from "@/components/client-only";

export const dynamic = "force-dynamic";

/**
 * Local sign-in.
 *
 * The project has no hosted backend, so there is nothing to authenticate
 * against. This gate exists only to keep the record views behind a deliberate
 * entry point on a shared machine.
 */
export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const u = username.trim().toLowerCase();
    if (u !== DEMO_USER.username || password !== DEMO_USER.username) {
      setError("Incorrect username or password.");
      return;
    }

    setIsLoading(true);
    setDemoSession();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 flex items-center justify-center p-4 relative">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 text-white hover:bg-white/10"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        aria-label="Toggle theme"
      >
        <ClientOnly>
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </ClientOnly>
      </Button>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-4 bg-white/5 rounded-full backdrop-blur-sm mb-4">
            <Glasses className="h-12 w-12 text-teal-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to Sherlock</h1>
          <p className="text-slate-400">Sign in to open the local record workspace</p>
        </div>

        <Card className="p-6 bg-white/10 backdrop-blur-lg border-white/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-white">
                Username
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="porus"
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-400 focus:border-teal-400 focus:ring-teal-400/20"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-400 focus:border-teal-400 focus:ring-teal-400/20"
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
              className="w-full bg-teal-500 hover:bg-teal-600 text-white transition-all duration-200"
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

          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-sm text-slate-400">
              Demo access:{" "}
              <button
                type="button"
                onClick={() => {
                  setUsername(DEMO_USER.username);
                  setPassword(DEMO_USER.username);
                  setError("");
                }}
                className="text-teal-300 hover:text-teal-200 font-mono"
              >
                {DEMO_USER.username} / {DEMO_USER.username}
              </button>
            </p>
          </div>
        </Card>

        <div className="mt-8 text-center text-xs text-slate-400">
          <p>Local-first. Records are read from files on this machine.</p>
        </div>
      </div>
    </div>
  );
}
