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
    const source = current.get(`${message.key}:${message.kind}:${message.sourceHash}`);
    const value = reviewedValue(message, source);
    if (value === undefined) return [];
    return [{
      key: message.key,
      kind: message.kind,
      sourceHash: message.sourceHash,
      value,
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

/** @param {unknown} reviewMessage @param {unknown} source */
function reviewedValue(reviewMessage, source) {
  if (isPlainReviewedMessage(reviewMessage)) return reviewMessage.reviewedSpanish;
  if (!reviewMessage || typeof reviewMessage !== "object" || !source || typeof source !== "object") return undefined;

  const review = /** @type {Record<string, unknown>} */ (reviewMessage);
  const current = /** @type {Record<string, unknown>} */ (source);
  if (review.kind !== "richText" || !Array.isArray(review.reviewedSpanishRichText)) return undefined;
  if (!Array.isArray(current.value) || !hasMatchingPortableTextStructure(current.value, review.reviewedSpanishRichText)) {
    throw new Error(`Reviewed Portable Text for ${String(review.key)} does not match the English structure.`);
  }
  return review.reviewedSpanishRichText;
}

/** @param {unknown} source @param {unknown} reviewed */
function hasMatchingPortableTextStructure(source, reviewed) {
  if (Array.isArray(source) || Array.isArray(reviewed)) {
    return Array.isArray(source)
      && Array.isArray(reviewed)
      && source.length === reviewed.length
      && source.every((value, index) => hasMatchingPortableTextStructure(value, reviewed[index]));
  }
  if (source && reviewed && typeof source === "object" && typeof reviewed === "object") {
    const sourceRecord = /** @type {Record<string, unknown>} */ (source);
    const reviewedRecord = /** @type {Record<string, unknown>} */ (reviewed);
    const sourceKeys = Object.keys(sourceRecord);
    return sourceKeys.length === Object.keys(reviewedRecord).length
      && sourceKeys.every((key) => key in reviewedRecord
        && (sourceRecord._type === "span" && key === "text"
          ? typeof reviewedRecord[key] === "string"
          : hasMatchingPortableTextStructure(sourceRecord[key], reviewedRecord[key])));
  }
  return source === reviewed;
}
