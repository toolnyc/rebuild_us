// @ts-check

/**
 * @typedef {import("./contract").TranslationMessage} TranslationMessage
 * @typedef {import("./contract").TranslationTable} TranslationTable
 */

/**
 * @param {{
 *   review: { locale?: string; status?: string; messages?: unknown[] };
 *   messages: { key: string; kind: string; sourceHash: string }[];
 *   overrides: TranslationTable;
 * }} input
 */
export function applyApprovedReview({ review, messages, overrides }) {
  if (review.locale !== "es" || review.status !== "approved" || !Array.isArray(review.messages)) {
    throw new Error("Review must be an approved Spanish translation review.");
  }

  const current = new Map(messages.map((message) => [`${message.key}:${message.kind}:${message.sourceHash}`, message]));
  const stale = review.messages.filter((message) => !matchesCurrent(message, current));
  if (stale.length) {
    return { status: "stale", overrides, staleKeys: stale.map((message) => message.key) };
  }

  /** @type {TranslationMessage[]} */
  const additions = review.messages.flatMap((message) => {
    if (!isPlainReviewedMessage(message)) return [];
    return [{
      key: message.key,
      kind: message.kind,
      sourceHash: message.sourceHash,
      value: message.reviewedSpanish,
    }];
  });
  const reviewedKeys = new Set(additions.map((message) => message.key));

  return {
    status: "applied",
    overrides: {
      locale: "es",
      messages: [...overrides.messages.filter((message) => !reviewedKeys.has(message.key)), ...additions],
    },
    appliedKeys: additions.map((message) => message.key),
  };
}

/** @param {unknown} value @param {Map<string, unknown>} current */
function matchesCurrent(value, current) {
  if (!value || typeof value !== "object") return false;
  const message = /** @type {Record<string, unknown>} */ (value);
  return typeof message.key === "string"
    && typeof message.kind === "string"
    && typeof message.sourceHash === "string"
    && current.has(`${message.key}:${message.kind}:${message.sourceHash}`);
}

/** @param {unknown} value */
function isPlainReviewedMessage(value) {
  if (!value || typeof value !== "object") return false;
  const message = /** @type {Record<string, unknown>} */ (value);
  return message.kind === "plain"
    && typeof message.key === "string"
    && typeof message.sourceHash === "string"
    && typeof message.reviewedSpanish === "string"
    && message.reviewedSpanish.trim().length > 0;
}
