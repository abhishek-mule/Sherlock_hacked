"use client";

import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

type SignInResult = { ok: boolean; error?: string };

type AuthState = {
  ready: boolean;
  authenticated: boolean;
  configured: boolean;
  signIn: (username: string, password: string) => Promise<SignInResult>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthState>({
  ready: false,
  authenticated: false,
  configured: true,
  signIn: async (): Promise<SignInResult> => ({ ok: false }),
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [configured, setConfigured] = useState(true);
  const router = useRouter();

  const check = useCallback(async () => {
    try {
      const res = await fetch("/api/auth");
      const data = await res.json();
      setConfigured(!!data.configured);
      setAuthenticated(!!data.authenticated);
    } catch {
      setAuthenticated(false);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    void check();
  }, [check]);

  const signIn = useCallback(
    async (username: string, password: string) => {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.ok) {
        setAuthenticated(true);
        return { ok: true };
      }
      return { ok: false, error: data.error ?? "Sign-in failed" };
    },
    [],
  );

  const signOut = useCallback(async () => {
    await fetch("/api/auth", { method: "DELETE" });
    setAuthenticated(false);
    router.push("/login");
  }, [router]);

  return (
    <Ctx.Provider value={{ ready, authenticated, configured, signIn, signOut }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);

/**
 * Client-side guard. Convenience only — the real enforcement is the 401 from
 * /api/students, since a redirect alone would not protect the JSON.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { ready, authenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && !authenticated) router.replace("/login");
  }, [ready, authenticated, router]);

  if (!ready) {
    return (
      <div className="grid min-h-[60vh] place-items-center text-sm text-slate-500">
        Loading…
      </div>
    );
  }
  if (!authenticated) return null;
  return <>{children}</>;
}
