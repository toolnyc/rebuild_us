import assert from "node:assert/strict";
import test from "node:test";
import { hashSource } from "../src/i18n/hash.mjs";
import { translationEntries, translationRegistry } from "../src/i18n/registry.mjs";

const richText = [
  {
    _key: "block-1",
    _type: "block",
    children: [{ _key: "span-1", _type: "span", text: "Survivors lead recovery." }],
    markDefs: [],
    style: "normal",
  },
];

const snapshot = {
  siteSettings: {
    announcementText: "Community call Thursday",
    announcementCtaLabel: "Register",
    announcementCtaUrl: "https://act.rebuild.us/register",
    socialLinks: ["https://example.com"],
  },
  splash: {
    heroHeadline: "We rebuild together",
    aboutStatement: richText,
    whyJoinColumns: [{ title: "Organize", body: "Build local power", internalId: "column-1" }],
    heroImage: { asset: { _ref: "image-1" }, alt: "People gathering" },
    joinEmbedUrl: "https://act.rebuild.us/join",
    campaignId: "campaign-1",
  },
  resourcesPage: {
    title: "Resources",
    newsletterCopy: "Stay informed",
    newsletterFormUrl: "https://act.rebuild.us/newsletter",
  },
  privacyPage: {
    title: "Privacy",
    body: richText,
    slug: { current: "privacy" },
  },
  guides: [{ _id: "guide-1", title: "Prepare your claim", file: { asset: { _ref: "file-1" } }, section: "insurance", order: 1 }],
  videos: [{ _id: "video-1", title: "How to recover", youtubeUrl: "https://youtube.com/watch?v=1", order: 1 }],
};

test("runtime and generator derive identical translation entries", () => {
  const runtimeEntries = translationRegistry(snapshot).flatMap((owner) =>
    owner.messages.map((message) => ({
      ...message,
      route: owner.route,
      sourceHash: hashSource(message.kind, message.value),
    })),
  );

  const generatorEntries = translationEntries(snapshot);

  assert.deepEqual(generatorEntries, runtimeEntries);
  assert.deepEqual(
    [...new Set(generatorEntries.map((entry) => entry.owner))],
    ["site", "splash", "resourcesPage", "privacyPage", "guide.guide-1", "video.video-1"],
  );
  assert.deepEqual(
    [...new Set(generatorEntries.map((entry) => entry.route))],
    ["/", "/resources", "/privacy"],
  );
  assert(generatorEntries.every((entry) => /^[a-f0-9]{64}$/.test(entry.sourceHash)));
});

test("registry excludes non-translatable content fields", () => {
  const entries = translationEntries(snapshot);
  const excludedValues = new Set([
    "https://act.rebuild.us/register",
    "https://example.com",
    "People gathering",
    "https://act.rebuild.us/join",
    "campaign-1",
    "https://act.rebuild.us/newsletter",
    "privacy",
    "guide-1",
    "file-1",
    "insurance",
    "https://youtube.com/watch?v=1",
    "video-1",
  ]);

  assert(entries.every((entry) => !excludedValues.has(entry.value)));
  assert(entries.every((entry) => !entry.path.some((segment) => ["asset", "file", "youtubeUrl", "slug"].includes(segment))));
});
