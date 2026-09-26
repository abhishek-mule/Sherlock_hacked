#!/usr/bin/env node
/**
 * Set the single local operator credential.
 *
 * Writes a salted SHA-256 hash to data/auth.json (gitignored) so the
 * credential never appears in source, in the UI, or in git.
 *
 *   node scripts/set-auth.mjs
 *   node scripts/set-auth.mjs --username alice
 *
 * Options, in order of precedence:
 *   1. --username / APP_USERNAME
 *   2. --password / APP_PASSWORD           (otherwise prompted, never echoed)
 *   3. interactive prompts for both
 */

import { createHash, randomBytes } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import readline from "node:readline";

const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname), "..");
const AUTH_FILE = path.join(ROOT, "data", "auth.json");
const SESSION_SECRET_FILE = path.join(ROOT, "data", "session-secret");

function hash(password, salt) {
  return createHash("sha256").update(`${salt}:${password}`).digest("hex");
}

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 ? process.argv[i + 1] : undefined;
}

function askHidden(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    const onData = (char) => {
      if (["\n", "\r", ""].includes(String(char))) {
        process.stdin.removeListener("data", onData);
      } else {
        // swallow so the password is not echoed
        readline.moveCursor(process.stdout, 0, -1);
        readline.clearLine(process.stdout, 1);
      }
    };
    process.stdin.on("data", onData);
    rl.question(question, (answer) => {
      rl.close();
      process.stdout.write("\n");
      resolve(answer.trim());
    });
  });
}

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(question, (a) => {
    rl.close();
    resolve(a.trim());
  }));
}

let username = arg("username") || process.env.APP_USERNAME;
let password = arg("password") || process.env.APP_PASSWORD;

if (!username) username = await ask("Username: ");
if (!password) password = await askHidden("Password: ");

if (!username || !password) {
  console.error("username and password are both required");
  process.exit(1);
}
if (password.length < 4) {
  console.error("password must be at least 4 characters");
  process.exit(1);
}
if (password.length < 8) {
  console.warn(
    `warning: a ${password.length}-character password is weak. This is a local single-operator ` +
      "tool, so the risk is physical access rather than offline cracking, but consider longer.",
  );
}

const salt = randomBytes(16).toString("hex");
mkdirSync(path.join(ROOT, "data"), { recursive: true });
writeFileSync(
  AUTH_FILE,
  `${JSON.stringify({ username, salt, hash: hash(password, salt), updated_at: new Date().toISOString() }, null, 2)}\n`,
  { mode: 0o600 },
);

// Session signing secret, generated once.
if (!existsSync(SESSION_SECRET_FILE)) {
  writeFileSync(SESSION_SECRET_FILE, randomBytes(32).toString("hex"), { mode: 0o600 });
}

const masked = username.slice(0, 1) + "*".repeat(Math.max(0, username.length - 1));
console.log(`credential stored for "${masked}" -> data/auth.json (gitignored)`);
console.log("data/auth.json and data/session-secret must never be committed.");
