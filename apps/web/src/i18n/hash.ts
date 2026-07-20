import { createHash } from "node:crypto";
import type { MessageKind, PortableTextBlock } from "./contract";

function normalize(value: unknown): unknown {
  if (typeof value === "string") return value.normalize("NFC");
  if (Array.isArray(value)) return value.map(normalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, child]) => [key, normalize(child)]),
    );
  }
  return value;
}

export function sourceHash(kind: MessageKind, value: string | PortableTextBlock[]): string {
  return createHash("sha256")
    .update(JSON.stringify(normalize({ kind, value })))
    .digest("hex");
}
