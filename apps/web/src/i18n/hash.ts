import { hashSource } from "./hash.mjs";
import type { MessageKind, PortableTextBlock } from "./contract";

export function sourceHash(kind: MessageKind, value: string | PortableTextBlock[]): string {
  return hashSource(kind, value);
}
