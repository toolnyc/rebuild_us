// @ts-check

import { hashSource } from "./hash.mjs";

/**
 * @param {{ key: string; kind: string; value: string | object[] }} source
 * @param {{ messages: object[] }} generated
 * @param {{ messages: object[] }} overrides
 */
export function resolveMessage(source, generated, overrides) {
  const hash = hashSource(source.kind, source.value);
  const matches = (message) =>
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
