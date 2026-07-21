import type { TranslationMessage, TranslationTable } from "./contract";
import { sourceHash } from "./hash.ts";
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
  const hash = sourceHash(source.kind, source.value);
  const matches = (message: TranslationMessage) =>
    message.key === source.key &&
    message.kind === source.kind &&
    message.sourceHash === hash;

  const override = overrides.messages.find(matches);
  if (override) return { status: "reviewed", message: override };

  const generatedMessage = generated.messages.find(matches);
  if (generatedMessage) return { status: "generated", message: generatedMessage };

  const stale = [...overrides.messages, ...generated.messages].find(
    (message) => message.key === source.key && message.kind === source.kind,
  );
  if (stale) return { status: "stale", message: stale };

  return { status: "missing" };
}
