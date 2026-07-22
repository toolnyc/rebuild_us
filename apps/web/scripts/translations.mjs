import { readFile, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { createClient } from "@sanity/client";
import { translationEntries } from "../src/i18n/registry.mjs";
import { applyApprovedReview } from "../src/i18n/review-application.mjs";
import {
  protectedTerms,
  refreshGeneratedMessages,
  translateMessage,
  upsertPendingReviews,
} from "../src/i18n/translation-generation.mjs";

const mode = process.argv[2];
const reviewId = process.argv[3];
const localeFlag = process.argv.indexOf("--locale");
const locale = localeFlag === -1 ? "es" : process.argv[localeFlag + 1];
if (locale !== "es") throw new Error("Only the es locale is configured.");

const root = new URL("../src/i18n/tables/", import.meta.url);
const projectRoot = new URL("../../..", import.meta.url);
const generated = await readTable("es.generated.json");
const overrides = await readTable("es.overrides.json");
const run = promisify(execFile);

async function readTable(name) {
  return JSON.parse(await readFile(new URL(name, root), "utf8"));
}

function validate(table, name) {
  if (table.locale !== "es" || !Array.isArray(table.messages)) throw new Error(`Invalid ${name} table.`);
  const keys = new Set();
  for (const message of table.messages) {
    if (!message.key || keys.has(message.key)) throw new Error(`Invalid or duplicate key in ${name} table.`);
    keys.add(message.key);
    if (!["plain", "richText", "metadata"].includes(message.kind)) throw new Error(`Invalid kind for ${message.key}.`);
    if (!/^[a-f0-9]{64}$/.test(message.sourceHash)) throw new Error(`Invalid source hash for ${message.key}.`);
    if ((message.kind === "richText") !== Array.isArray(message.value)) throw new Error(`Invalid value for ${message.key}.`);
  }
}

async function generate() {
  if (!process.env.SANITY_PROJECT_ID || !process.env.SANITY_API_TOKEN || !process.env.DEEPL_API_KEY) {
    throw new Error("SANITY_PROJECT_ID, SANITY_API_TOKEN, and DEEPL_API_KEY are required to generate translations.");
  }
  const client = createSanityClient();
  const snapshot = await fetchTranslationSource(client);
  const messages = translationEntries(snapshot);
  const { messages: output, changed } = await refreshGeneratedMessages({
    messages,
    generatedMessages: generated.messages,
    translate,
  });
  const next = { locale: "es", messages: output };
  validate(next, "generated");
  const reviews = await upsertPendingReviews(client, changed);
  await writeFile(new URL("es.generated.json", root), `${JSON.stringify(next, null, 2)}\n`);
  console.log(JSON.stringify({
    locale,
    generated: output.length,
    generatedKeys: changed.map((message) => message.key),
    changedOwners: reviews.map((review) => review.owner.id),
    reviewsUpserted: reviews.length,
  }));
}

async function applyReview() {
  if (!reviewId) throw new Error("A translation review ID is required.");
  if (!process.env.SANITY_PROJECT_ID || !process.env.SANITY_API_TOKEN) {
    throw new Error("SANITY_PROJECT_ID and SANITY_API_TOKEN are required to apply a translation review.");
  }
  await ensureGitIndexIsClean();
  const client = createSanityClient();
  const [review, snapshot] = await Promise.all([
    client.fetch(
      `*[_id == $reviewId && _type == "translationReview"][0]{
        _id, locale, status, messages[]{key, kind, sourceHash, reviewedSpanish, reviewedSpanishRichText}
      }`,
      { reviewId },
    ),
    fetchTranslationSource(client),
  ]);
  if (!review) throw new Error(`Translation review "${reviewId}" was not found.`);

  const result = applyApprovedReview({
    review,
    messages: translationEntries(snapshot),
    overrides,
  });
  if (result.status === "stale") {
    await client.patch(review._id).set({ status: "stale" }).commit();
    console.log(JSON.stringify({ reviewId, status: "stale", staleKeys: result.staleKeys }));
    return;
  }

  validate(result.overrides, "overrides");
  await writeFile(new URL("es.overrides.json", root), `${JSON.stringify(result.overrides, null, 2)}\n`);
  try {
    await run("pnpm", ["--filter", "web", "build"], { cwd: projectRoot.pathname });
    const changed = await run("git", ["diff", "--quiet", "--", "apps/web/src/i18n/tables/es.overrides.json"], {
      cwd: projectRoot.pathname,
    }).then(
      () => false,
      () => true,
    );
    if (!changed) {
      const { stdout: commitSha } = await run("git", ["rev-parse", "HEAD"], { cwd: projectRoot.pathname });
      await client.patch(review._id).set({ status: "applied", appliedCommit: commitSha.trim() }).commit();
      console.log(JSON.stringify({ reviewId, status: "applied", appliedKeys: result.appliedKeys, commitSha: commitSha.trim() }));
      return;
    }
    await run("git", ["add", "apps/web/src/i18n/tables/es.overrides.json"], { cwd: projectRoot.pathname });
    await run("git", ["commit", "-m", "Apply reviewed Spanish translations"], { cwd: projectRoot.pathname });
    await run("git", ["push"], { cwd: projectRoot.pathname });
    const { stdout: commitSha } = await run("git", ["rev-parse", "HEAD"], { cwd: projectRoot.pathname });
    await client.patch(review._id).set({ status: "applied", appliedCommit: commitSha.trim() }).commit();
    console.log(JSON.stringify({ reviewId, status: "applied", appliedKeys: result.appliedKeys, commitSha: commitSha.trim() }));
  } catch (error) {
    await writeFile(new URL("es.overrides.json", root), `${JSON.stringify(overrides, null, 2)}\n`);
    throw error;
  }
}

function createSanityClient() {
  return createClient({
    projectId: process.env.SANITY_PROJECT_ID,
    dataset: process.env.SANITY_DATASET ?? "production",
    apiVersion: "2024-01-01",
    useCdn: false,
    token: process.env.SANITY_API_TOKEN,
  });
}

async function fetchTranslationSource(client) {
  return client.fetch(`{
    "siteSettings": *[_type == "siteSettings"][0]{announcementText,announcementCtaLabel},
    "splash": *[_type == "splashPage"][0]{heroHeadline,heroHeadlineAccent,heroSubcopy,heroImageCaption,aboutLabel,aboutStatement,aboutSupport,foundingLabel,foundingCtaHeadline,foundingCtaSubcopy,benefitsLabel,whyJoinColumns[]{title,body},resourcesLabel,resourcesHeadline,resourcesSubcopy,resourcesLeftCopy,getInvolvedCopy,getInvolvedFinePrint},
    "resourcesPage": *[_type == "resourcesPage"][0]{title,heroHeadline,heroSubcopy,writtenGuidesHeading,writtenGuidesSubcopy,videoLibraryHeading,newsletterCopy,newsletterFinePrint},
    "privacyPage": *[_type == "privacyPage"][0]{title,body},
    "guides": *[_type == "resourceGuide"]{_id,title},
    "videos": *[_type == "resourceVideo"]{_id,title}
  }`);
}

async function ensureGitIndexIsClean() {
  const path = "apps/web/src/i18n/tables/es.overrides.json";
  const options = { cwd: projectRoot.pathname };
  const unstaged = await run("git", ["diff", "--quiet", "--", path], options).then(
    () => false,
    () => true,
  );
  const staged = await run("git", ["diff", "--cached", "--quiet"], options).then(
    () => false,
    () => true,
  );
  if (unstaged || staged) throw new Error(`${path} and the Git index must be clean before applying a review.`);
}

async function translate(message) {
  return translateMessage(message, async (texts) => {
    const endpoint = process.env.DEEPL_API_KEY.endsWith(":fx")
      ? "https://api-free.deepl.com/v2/translate"
      : "https://api.deepl.com/v2/translate";
    const body = new URLSearchParams({ target_lang: "ES" });
    texts.map(protect).forEach((text) => body.append("text", text));
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { Authorization: `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}` },
      body,
    });
    if (!response.ok) throw new Error(`DeepL translation failed: ${response.status} ${await response.text()}`);
    return (await response.json()).translations.map(({ text }) => unprotect(text));
  });
}

const protect = (text) => protectedTerms.reduce((result, term, index) => result.replaceAll(term, `__REBUILD_TERM_${index}__`), text);
const unprotect = (text) => protectedTerms.reduce((result, term, index) => result.replaceAll(`__REBUILD_TERM_${index}__`, term), text);

if (mode === "generate") {
  await generate();
} else if (mode === "apply-review") {
  await applyReview();
} else if (mode === "validate") {
  validate(generated, "generated");
  validate(overrides, "overrides");
  console.log(JSON.stringify({ locale, valid: true, generated: generated.messages.length, overrides: overrides.messages.length }));
} else if (mode === "report") {
  console.log(JSON.stringify({ locale, generated: generated.messages.length, reviewed: overrides.messages.length, stale: 0, omitted: 0, invalid: 0, hashInvalidatedOverrides: 0 }));
} else {
  throw new Error(`Unsupported translation command: ${mode}`);
}
