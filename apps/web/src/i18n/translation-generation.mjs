import { createHash } from "node:crypto";

export const protectedTerms = ["Rebuild", "Claims Ready", "ClaimReady"];

export function validateProtectedTerms(source, translation, key) {
  for (const term of protectedTerms) {
    if (countOccurrences(source, term) !== countOccurrences(translation, term)) {
      throw new Error(`DeepL changed a protected term in ${key}.`);
    }
  }
}

export async function refreshGeneratedMessages({ messages, generatedMessages, translate }) {
  const current = new Map(
    generatedMessages.map((message) => [`${message.key}:${message.kind}:${message.sourceHash}`, message]),
  );
  const output = [];
  const changed = [];

  for (const message of messages) {
    const existing = current.get(`${message.key}:${message.kind}:${message.sourceHash}`);
    if (existing) {
      output.push({
        key: existing.key,
        kind: existing.kind,
        sourceHash: existing.sourceHash,
        value: existing.value,
      });
      continue;
    }

    const value = await translate(message);
    const generated = { key: message.key, kind: message.kind, sourceHash: message.sourceHash, value };
    output.push(generated);
    changed.push({ ...message, generated });
  }

  return { messages: output, changed };
}

export function pendingReviewDocuments(changed) {
  const byOwner = new Map();
  for (const message of changed) {
    const messages = byOwner.get(message.owner) ?? [];
    messages.push(message);
    byOwner.set(message.owner, messages);
  }

  return [...byOwner].map(([owner, messages]) => ({
    _id: reviewDocumentId(owner),
    _type: "translationReview",
    locale: "es",
    owner: {
      id: owner,
      displayName: owner,
      route: messages[0].route,
    },
    messages: messages.map(({ key, kind, sourceHash, value, generated }) => ({
      _key: messageKey(key),
      key,
      kind,
      ...reviewValueFields("english", kind, value),
      sourceHash,
      ...reviewValueFields("generatedSpanish", kind, generated.value),
    })),
    status: "pending",
    generation: { provider: "DeepL" },
  }));
}

/**
 * @param {{ kind: string; value: string | object[]; key: string }} message
 * @param {(texts: string[]) => Promise<string[]>} translate
 */
export async function translateMessage(message, translate) {
  const spans = message.kind === "plain"
    ? [{ text: message.value }]
    : portableSpans(message.value);
  if (!spans.length) return structuredClone(message.value);

  const translations = await translate(spans.map((span) => span.text));
  if (translations.length !== spans.length) throw new Error(`Translation returned incomplete text for ${message.key}.`);
  spans.forEach((span, index) => validateProtectedTerms(span.text, translations[index], message.key));
  if (message.kind === "plain") return translations[0];

  const clone = structuredClone(message.value);
  spans.forEach((span, index) => { clone[span.block].children[span.child].text = translations[index]; });
  return clone;
}

export async function upsertPendingReviews(client, changed) {
  const reviews = pendingReviewDocuments(changed);
  await Promise.all(reviews.map((review) => client.createOrReplace(review)));
  return reviews;
}

function reviewValueFields(name, kind, value) {
  return kind === "richText"
    ? { [`${name}RichText`]: value }
    : { [name]: value };
}

function reviewDocumentId(owner) {
  return `translation-review-es-${messageKey(owner)}`;
}

function messageKey(value) {
  return createHash("sha256").update(value).digest("hex").slice(0, 24);
}

function countOccurrences(text, term) {
  return text.split(term).length - 1;
}

function portableSpans(blocks) {
  return blocks.flatMap((block, blockIndex) => Array.isArray(block.children)
    ? block.children.flatMap((child, childIndex) =>
      child._type === "span" && typeof child.text === "string" && child.text
        ? [{ text: child.text, block: blockIndex, child: childIndex }]
        : [])
    : []);
}
