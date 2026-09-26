import { Avatar, Style } from "@dicebear/core";
// Plain JSON import: the import-attribute form (`with { type: "json" }`) needs
// TypeScript 5.3+, and this repo is on 5.2. resolveJsonModule is enabled.
import definition from "@dicebear/styles/notionists.json";

/**
 * Deterministic avatar generator.
 *
 * Rendered on the server from the installed @dicebear packages rather than
 * fetched from api.dicebear.com, so avatars still work with no network — the
 * same offline-first guarantee the rest of the app makes.
 *
 * The seed is derived from a stable record identifier, so the same person always
 * gets the same face and colour, and two people with the same name do not
 * collide.
 */

export const dynamic = "force-dynamic";

const PALETTE = ["ff5d8f", "ffb703", "43aa8b", "4d96ff", "b57bff"];
const SIZES = [32, 48, 64, 96, 128, 256];

const style = new Style(definition);

export async function GET(
  req: Request,
  { params }: { params: { seed?: string } },
) {
  const url = new URL(req.url);
  // The seed arrives as a *path* segment (/api/avatar/<seed>), not a query
  // param. Reading searchParams here silently gave every record the same
  // fallback seed and therefore an identical face.
  const raw = params?.seed ?? url.searchParams.get("seed") ?? "";
  const seed = decodeURIComponent(String(raw)).slice(0, 120) || "sherlock";
  const requested = Number(url.searchParams.get("size") ?? 96);
  const size = SIZES.includes(requested) ? requested : 96;

  try {
    const avatar = new Avatar(style, { backgroundColor: PALETTE, seed });
    const svg = avatar.toString();

    return new Response(svg, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        // Immutable per seed: the bytes never change for a given seed+size.
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("avatar generation failed", { status: 500 });
  }
}
