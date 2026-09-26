"use client";

import { useState } from "react";

/**
 * Deterministic avatar for a record.
 *
 * `identity` should be a stable id (registration number, roll number) rather
 * than a display name, so records that share a name still differ.
 */
export default function RecordAvatar({
  identity,
  name,
  size = 40,
  className = "",
}: {
  identity: string;
  name?: string;
  size?: number;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const seed = identity || name || "unknown";
  const initials = (name || seed)
    .replace(/[^A-Za-z ]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  if (failed) {
    return (
      <span
        className={`grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 font-semibold text-white ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.4 }}
        title={name}
      >
        {initials || "?"}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/api/avatar/${encodeURIComponent(seed)}?size=${size}`}
      alt={name ? `Avatar for ${name}` : "Record avatar"}
      width={size}
      height={size}
      title={name}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`shrink-0 rounded-full bg-slate-100 object-cover dark:bg-slate-800 ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
