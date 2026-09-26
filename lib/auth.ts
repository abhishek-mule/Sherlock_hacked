import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";

/**
 * Local credential store.
 *
 * The single operator credential is a salted SHA-256 hash in data/auth.json,
 * which is gitignored. Neither the password nor its hash lives in source, and
 * nothing about it is rendered in the UI.
 *
 * A weak password is still brute-forceable offline by anyone who obtains
 * data/auth.json, so treat that file as a secret.
 */

const ROOT = process.cwd();
const AUTH_FILE = path.join(ROOT, "data", "auth.json");
const SECRET_FILE = path.join(ROOT, "data", "session-secret");

type Stored = { username: string; salt: string; hash: string; updated_at?: string };

let cached: Stored | null | undefined;

export function readCredential(): Stored | null {
  if (cached !== undefined) return cached;
  try {
    if (!existsSync(AUTH_FILE)) {
      cached = null;
      return cached;
    }
    const parsed = JSON.parse(readFileSync(AUTH_FILE, "utf8")) as Stored;
    if (!parsed?.username || !parsed?.salt || !parsed?.hash) {
      cached = null;
      return cached;
    }
    cached = parsed;
    return cached;
  } catch {
    cached = null;
    return cached;
  }
}

function sha256(input: string, salt: string): string {
  return createHash("sha256").update(`${salt}:${input}`).digest("hex");
}

/** Constant-time comparison that does not leak length via early return. */
export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) {
    // still burn a comparison so timing does not reveal the mismatch
    timingSafeEqual(ab, ab);
    return false;
  }
  return timingSafeEqual(ab, bb);
}

export function verifyCredentials(username: string, password: string): boolean {
  const rec = readCredential();
  if (!rec) return false;
  // Hash both regardless of username match so timing does not reveal which
  // field was wrong.
  const candidate = sha256(password, rec.salt);
  const userOk = safeEqual(rec.username.toLowerCase(), (username ?? "").trim().toLowerCase());
  const passOk = safeEqual(rec.hash, candidate);
  return userOk && passOk;
}

export function isConfigured(): boolean {
  return readCredential() !== null;
}

/* ---- session signing ---- */

let secretCache: string | null = null;

export function sessionSecret(): string {
  if (secretCache) return secretCache;
  if (process.env.APP_SESSION_SECRET) {
    secretCache = process.env.APP_SESSION_SECRET;
    return secretCache;
  }
  try {
    if (existsSync(SECRET_FILE)) {
      secretCache = readFileSync(SECRET_FILE, "utf8").trim();
      if (secretCache) return secretCache;
    }
    mkdirSync(path.join(ROOT, "data"), { recursive: true });
    secretCache = randomBytes(32).toString("hex");
    writeFileSync(SECRET_FILE, secretCache, { mode: 0o600 });
    return secretCache;
  } catch {
    // Fall back to a per-process secret: sessions simply do not survive restart.
    secretCache = randomBytes(32).toString("hex");
    return secretCache;
  }
}

export const COOKIE_NAME = "sh_session";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12h

export function issueSession(username: string): string {
  const expires = Date.now() + SESSION_TTL_MS;
  const payload = `${encodeURIComponent(username)}.${expires}`;
  const sig = createHash("sha256").update(`${sessionSecret()}:${payload}`).digest("hex");
  return `${payload}.${sig}`;
}

export function verifySession(token: string | undefined | null): string | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [encUser, expiresRaw, sig] = parts;
  const expires = Number(expiresRaw);
  if (!Number.isFinite(expires) || Date.now() > expires) return null;
  const payload = `${encUser}.${expiresRaw}`;
  const expect = createHash("sha256").update(`${sessionSecret()}:${payload}`).digest("hex");
  if (!safeEqual(expect, sig)) return null;
  return decodeURIComponent(encUser);
}
