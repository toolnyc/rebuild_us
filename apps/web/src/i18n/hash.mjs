// @ts-check

import { createHash } from "node:crypto";

/** @param {unknown} value @returns {unknown} */
function normalize(value) {
  if (typeof value === "string") return value.normalize("NFC");
  if (Array.isArray(value)) return value.map(normalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, child]) => [key, normalize(child)]),
    );
  }
  return value;
}

/**
 * @param {import("./contract").MessageKind} kind
 * @param {string | import("./contract").PortableTextBlock[]} value
 */
export function hashSource(kind, value) {
  return createHash("sha256")
    .update(JSON.stringify(normalize({ kind, value })))
    .digest("hex");
}

export const sourceHash = hashSource;
