import { createHash } from "node:crypto";

export const protectedTerms = ["Rebuild", "Claims Ready", "ClaimReady"];

export function validateProtectedTerms(source, translation, key) {
  for (const term of protectedTerms) {
    if (source.includes(term) && !translation.includes(term)) {
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
      english: value,
      sourceHash,
      generatedSpanish: generated.value,
    })),
    status: "pending",
    generation: { provider: "DeepL" },
  }));
}

export async function upsertPendingReviews(client, changed) {
  const reviews = pendingReviewDocuments(changed);
  await Promise.all(reviews.map((review) => client.createOrReplace(review)));
  return reviews;
}

function reviewDocumentId(owner) {
  return `translation-review-es-${messageKey(owner)}`;
}

function messageKey(value) {
  return createHash("sha256").update(value).digest("hex").slice(0, 24);
}
