import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { COOKIE_NAME, isConfigured, issueSession, verifySession } from "@/lib/auth";

export const dynamic = "force-dynamic";

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status });
}

export async function GET() {
  if (!isConfigured()) {
    return json({ ok: false, configured: false }, 503);
  }
  const session = verifySession(cookies().get(COOKIE_NAME)?.value);
  return json({ ok: true, configured: true, authenticated: !!session });
}

export async function POST(req: Request) {
  if (!isConfigured()) {
    return json(
      {
        ok: false,
        configured: false,
        hint: "No credential stored. Run: npm run auth:setup",
      },
      503,
    );
  }

  let username = "";
  let password = "";
  try {
    const body = (await req.json()) as { username?: string; password?: string };
    username = String(body?.username ?? "");
    password = String(body?.password ?? "");
  } catch {
    return json({ ok: false, error: "Malformed request" }, 400);
  }

  const { verifyCredentials } = await import("@/lib/auth");
  if (!verifyCredentials(username, password)) {
    // Deliberately vague: never reveal which field was wrong.
    return json({ ok: false, error: "Incorrect username or password" }, 401);
  }

  const res = json({ ok: true });
  res.cookies.set(COOKIE_NAME, issueSession(username), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 12 * 60 * 60,
  });
  return res;
}

export async function DELETE() {
  const res = json({ ok: true });
  res.cookies.set(COOKIE_NAME, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
