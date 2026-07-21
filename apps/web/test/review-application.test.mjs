import assert from "node:assert/strict";
import test from "node:test";
import { hashSource } from "../src/i18n/hash.mjs";
import { applyApprovedReview } from "../src/i18n/review-application.mjs";
import { resolveMessage } from "../src/i18n/resolve.mjs";

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

function review(overrides = {}) {
  return {
    _id: "review-1",
    locale: "es",
    status: "approved",
    messages: [
      {
        key: "splash.heroHeadline",
        kind: "plain",
        sourceHash,
        reviewedSpanish: "Únete a Rebuild",
      },
    ],
    ...overrides,
  };
}

test("an approved current review writes reviewed plain-text overrides", () => {
  const result = applyApprovedReview({
    review: review(),
    messages: [message()],
    overrides: { locale: "es", messages: [] },
  });

  assert.equal(result.status, "applied");
  assert.deepEqual(result.overrides, {
    locale: "es",
    messages: [
      {
        key: "splash.heroHeadline",
        kind: "plain",
        sourceHash,
        value: "Únete a Rebuild",
      },
    ],
  });
});

test("a changed English source marks a review stale without writing overrides", () => {
  const overrides = { locale: "es", messages: [] };
  const result = applyApprovedReview({
    review: review(),
    messages: [message({ sourceHash: "b".repeat(64), value: "Build Rebuild" })],
    overrides,
  });

  assert.equal(result.status, "stale");
  assert.strictEqual(result.overrides, overrides);
});

test("hash-matched overrides resolve before generated Spanish", () => {
  const source = message({ sourceHash: hashSource("plain", "Join Rebuild") });
  const generated = {
    locale: "es",
    messages: [{ key: source.key, kind: source.kind, sourceHash: source.sourceHash, value: "Generado" }],
  };
  const overrides = {
    locale: "es",
    messages: [{ key: source.key, kind: source.kind, sourceHash: source.sourceHash, value: "Revisado" }],
  };

  assert.deepEqual(resolveMessage(source, generated, overrides), {
    status: "reviewed",
    message: overrides.messages[0],
  });
});

test("missing or changed Spanish does not resolve to English", () => {
  const source = message({ sourceHash: hashSource("plain", "Join Rebuild") });
  const empty = { locale: "es", messages: [] };
  assert.deepEqual(resolveMessage(source, empty, empty), { status: "missing" });

  const stale = {
    locale: "es",
    messages: [{ key: source.key, kind: source.kind, sourceHash: "b".repeat(64), value: "Español anterior" }],
  };
  assert.deepEqual(resolveMessage(source, empty, stale), {
    status: "stale",
    message: stale.messages[0],
  });
});
