import assert from "node:assert/strict";
import test from "node:test";
import {
  pendingReviewDocuments,
  refreshGeneratedMessages,
  upsertPendingReviews,
  validateProtectedTerms,
} from "../src/i18n/translation-generation.mjs";

const sourceHash = "a".repeat(64);

function message(overrides = {}) {
  return {
    owner: "splash",
    route: "/",
    key: "splash.heroHeadline",
    kind: "plain",
    sourceHash,
    value: "Join Rebuild",
    ...overrides,
  };
}

test("generation retains matching messages and translates only changed messages", async () => {
  const existing = { key: "splash.heroHeadline", kind: "plain", sourceHash, value: "Únete a Rebuild" };
  const changed = message({ key: "splash.heroSubcopy", sourceHash: "b".repeat(64), value: "Organize together" });
  const translated = [];

  const result = await refreshGeneratedMessages({
    messages: [message(), changed],
    generatedMessages: [existing],
    translate: async (entry) => {
      translated.push(entry.key);
      return "Organícense juntos";
    },
  });

  assert.deepEqual(translated, ["splash.heroSubcopy"]);
  assert.deepEqual(result.messages, [
    existing,
    { key: changed.key, kind: changed.kind, sourceHash: changed.sourceHash, value: "Organícense juntos" },
  ]);
  assert.deepEqual(result.changed.map((entry) => entry.key), ["splash.heroSubcopy"]);
});

test("protected terms must remain in generated Spanish", () => {
  assert.doesNotThrow(() => validateProtectedTerms("Join Rebuild and Claims Ready", "Únete a Rebuild y Claims Ready", "key"));
  assert.throws(
    () => validateProtectedTerms("Join Rebuild", "Únete a Reconstruir", "splash.heroHeadline"),
    /DeepL changed a protected term in splash\.heroHeadline/,
  );
});

test("pending reviews are created or refreshed once per changed owner", async () => {
  const changed = [
    {
      ...message(),
      generated: { key: "splash.heroHeadline", kind: "plain", sourceHash, value: "Únete a Rebuild" },
    },
    {
      ...message({ key: "splash.heroSubcopy", sourceHash: "b".repeat(64), value: "Organize together" }),
      generated: { key: "splash.heroSubcopy", kind: "plain", sourceHash: "b".repeat(64), value: "Organícense juntos" },
    },
  ];
  const reviews = pendingReviewDocuments(changed);
  const writes = [];

  await upsertPendingReviews({ createOrReplace: async (review) => writes.push(review) }, changed);

  assert.equal(reviews.length, 1);
  assert.equal(writes.length, 1);
  assert.equal(writes[0].status, "pending");
  assert.equal(writes[0].owner.id, "splash");
  assert.deepEqual(writes[0].messages.map((entry) => entry.key), ["splash.heroHeadline", "splash.heroSubcopy"]);
  assert.deepEqual(writes[0].messages.map((entry) => entry.english), ["Join Rebuild", "Organize together"]);
  assert.deepEqual(writes[0].messages.map((entry) => entry.sourceHash), [sourceHash, "b".repeat(64)]);
});

test("a failed translation leaves the existing generated messages unchanged", async () => {
  const existing = [{ key: "splash.heroHeadline", kind: "plain", sourceHash, value: "Únete a Rebuild" }];

  await assert.rejects(
    refreshGeneratedMessages({
      messages: [message(), message({ key: "splash.heroSubcopy", sourceHash: "b".repeat(64) })],
      generatedMessages: existing,
      translate: async () => {
        throw new Error("DeepL unavailable");
      },
    }),
    /DeepL unavailable/,
  );

  assert.deepEqual(existing, [{ key: "splash.heroHeadline", kind: "plain", sourceHash, value: "Únete a Rebuild" }]);
});
