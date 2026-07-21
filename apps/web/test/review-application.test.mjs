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

function richText(text = "Join Rebuild today.") {
  return [
    {
      _key: "block-1",
      _type: "block",
      children: [{ _key: "span-1", _type: "span", marks: ["strong"], text }],
      markDefs: [{ _key: "link-1", _type: "link", href: "https://act.rebuild.us/join" }],
      style: "normal",
      listItem: "bullet",
      level: 1,
    },
    {
      _key: "image-1",
      _type: "image",
      asset: { _ref: "image-1", _type: "reference" },
      alt: "Unchanged image metadata",
    },
  ];
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

test("an approved current review writes structurally intact rich-text overrides", () => {
  const source = message({
    key: "splash.about.statement",
    kind: "richText",
    sourceHash,
    value: richText(),
  });
  const reviewedSpanishRichText = richText("Únete a Rebuild hoy.");
  const result = applyApprovedReview({
    review: review({
      messages: [{
        key: source.key,
        kind: "richText",
        sourceHash,
        reviewedSpanishRichText,
      }],
    }),
    messages: [source],
    overrides: { locale: "es", messages: [] },
  });

  assert.deepEqual(result, {
    status: "applied",
    overrides: {
      locale: "es",
      messages: [{
        key: source.key,
        kind: "richText",
        sourceHash,
        value: reviewedSpanishRichText,
      }],
    },
    appliedKeys: [source.key],
  });
});

test("a changed English rich-text source marks a review stale without writing overrides", () => {
  const overrides = { locale: "es", messages: [] };
  const result = applyApprovedReview({
    review: review({
      messages: [{
        key: "splash.about.statement",
        kind: "richText",
        sourceHash,
        reviewedSpanishRichText: richText("Únete a Rebuild hoy."),
      }],
    }),
    messages: [message({
      key: "splash.about.statement",
      kind: "richText",
      sourceHash: "b".repeat(64),
      value: richText("Build Rebuild today."),
    })],
    overrides,
  });

  assert.equal(result.status, "stale");
  assert.strictEqual(result.overrides, overrides);
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

test("a reviewed rich-text message cannot alter non-text structure", () => {
  const source = message({
    key: "splash.about.statement",
    kind: "richText",
    sourceHash,
    value: richText(),
  });
  const reviewedSpanishRichText = richText("Únete a Rebuild hoy.");
  reviewedSpanishRichText[0].markDefs[0].href = "https://untrusted.example";

  assert.throws(
    () => applyApprovedReview({
      review: review({
        messages: [{
          key: source.key,
          kind: "richText",
          sourceHash,
          reviewedSpanishRichText,
        }],
      }),
      messages: [source],
      overrides: { locale: "es", messages: [] },
    }),
    /Reviewed Portable Text for splash\.about\.statement does not match the English structure/,
  );
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

test("hash-matched rich-text overrides resolve before generated Spanish", () => {
  const source = message({
    key: "privacy.body",
    kind: "richText",
    value: richText(),
    sourceHash: hashSource("richText", richText()),
  });
  const generated = {
    locale: "es",
    messages: [{ key: source.key, kind: source.kind, sourceHash: source.sourceHash, value: richText("Generado") }],
  };
  const overrides = {
    locale: "es",
    messages: [{ key: source.key, kind: source.kind, sourceHash: source.sourceHash, value: richText("Revisado") }],
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
