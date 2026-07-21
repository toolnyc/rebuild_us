import type { TranslationMessage, TranslationTable } from "./contract";
import { resolveMessage as resolve } from "./resolve.mjs";
import type { TranslatableMessage } from "./registry";

export type ResolutionStatus = "reviewed" | "generated" | "stale" | "missing";

export interface ResolvedMessage {
  status: ResolutionStatus;
  message?: TranslationMessage;
}

export function resolveMessage(
  source: TranslatableMessage,
  generated: TranslationTable,
  overrides: TranslationTable,
): ResolvedMessage {
  return resolve(source, generated, overrides) as ResolvedMessage;
}
