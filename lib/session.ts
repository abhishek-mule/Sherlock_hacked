/**
 * Local-only session handling.
 *
 * There is no hosted backend any more. A "session" is a flag in localStorage so
 * the app can gate its views, which is entirely adequate for a tool that reads
 * from files on the analyst's own machine.
 *
 * If you later need real accounts, replace this module — the callers only use
 * `isAuthenticated`, `signOut` and `setDemoSession`.
 */

const DEMO_KEY = "sherlock_demo_session";
const DEMO_USER_KEY = "sherlock_demo_user";

export const DEMO_USER = {
  id: "demo-porus",
  email: "porus@demo.local",
  username: "porus",
  role: "demo",
} as const;

function storage(): Storage | null {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

export function isDemoSession(): boolean {
  return storage()?.getItem(DEMO_KEY) === "1";
}

export function setDemoSession(): void {
  const s = storage();
  if (!s) return;
  s.setItem(DEMO_KEY, "1");
  s.setItem(DEMO_USER_KEY, JSON.stringify(DEMO_USER));
}

export function clearDemoSession(): void {
  const s = storage();
  if (!s) return;
  s.removeItem(DEMO_KEY);
  s.removeItem(DEMO_USER_KEY);
}

export function getDemoUser(): typeof DEMO_USER | null {
  const raw = storage()?.getItem(DEMO_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as typeof DEMO_USER;
  } catch {
    return null;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  return isDemoSession();
}

export async function getCurrentUser(): Promise<typeof DEMO_USER | null> {
  return isDemoSession() ? getDemoUser() : null;
}

export async function signOut(): Promise<boolean> {
  clearDemoSession();
  return true;
}
