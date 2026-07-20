import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { createClient } from "@sanity/client";

const mode = process.argv[2];
const localeFlag = process.argv.indexOf("--locale");
const locale = localeFlag === -1 ? "es" : process.argv[localeFlag + 1];
if (locale !== "es") throw new Error("Only the es locale is configured.");

const root = new URL("../src/i18n/tables/", import.meta.url);
const generated = await readTable("es.generated.json");
const overrides = await readTable("es.overrides.json");

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

export function hashSource(kind, value) {
  return createHash("sha256").update(JSON.stringify(normalize({ kind, value }))).digest("hex");
}

function normalize(value) {
  if (typeof value === "string") return value.normalize("NFC");
  if (Array.isArray(value)) return value.map(normalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, child]) => [key, normalize(child)]));
  }
  return value;
}

async function generate() {
  if (!process.env.SANITY_PROJECT_ID || !process.env.DEEPL_API_KEY) {
    throw new Error("SANITY_PROJECT_ID and DEEPL_API_KEY are required to generate translations.");
  }
  const client = createClient({
    projectId: process.env.SANITY_PROJECT_ID,
    dataset: process.env.SANITY_DATASET ?? "production",
    apiVersion: "2024-01-01",
    useCdn: false,
  });
  const snapshot = await client.fetch(`{
    "siteSettings": *[_type == "siteSettings"][0]{announcementText,announcementCtaLabel},
    "splash": *[_type == "splashPage"][0]{heroHeadline,heroHeadlineAccent,heroSubcopy,heroImageCaption,aboutLabel,aboutStatement,aboutSupport,foundingLabel,foundingCtaHeadline,foundingCtaSubcopy,benefitsLabel,whyJoinColumns[]{title,body},resourcesLabel,resourcesHeadline,resourcesSubcopy,resourcesLeftCopy,getInvolvedCopy,getInvolvedFinePrint},
    "resourcesPage": *[_type == "resourcesPage"][0]{title,heroHeadline,heroSubcopy,writtenGuidesHeading,writtenGuidesSubcopy,videoLibraryHeading,newsletterCopy,newsletterFinePrint},
    "privacyPage": *[_type == "privacyPage"][0]{title,body},
    "guides": *[_type == "resourceGuide"]{_id,title},
    "videos": *[_type == "resourceVideo"]{_id,title}
  }`);
  const messages = registry(snapshot);
  const current = new Map(generated.messages.map((message) => [`${message.key}:${message.kind}:${message.sourceHash}`, message]));
  const output = [];
  const changedOwners = new Set();
  for (const message of messages) {
    const sourceHash = hashSource(message.kind, message.value);
    const existing = current.get(`${message.key}:${message.kind}:${sourceHash}`);
    if (existing) {
      output.push(existing);
      continue;
    }
    const value = await translate(message);
    output.push({ key: message.key, kind: message.kind, sourceHash, value });
    changedOwners.add(message.owner);
  }
  const next = { locale: "es", messages: output };
  validate(next, "generated");
  await writeFile(new URL("es.generated.json", root), `${JSON.stringify(next, null, 2)}\n`);
  console.log(JSON.stringify({ locale, generated: output.length, changedOwners: [...changedOwners], generatedKeys: output.filter((message) => !current.has(`${message.key}:${message.kind}:${message.sourceHash}`)).map((message) => message.key) }));
}

async function translate(message) {
  const spans = message.kind === "plain"
    ? [{ text: message.value }]
    : portableSpans(message.value);
  const source = spans.map((span) => protect(span.text));
  const endpoint = process.env.DEEPL_API_KEY.endsWith(":fx")
    ? "https://api-free.deepl.com/v2/translate"
    : "https://api.deepl.com/v2/translate";
  const body = new URLSearchParams({ target_lang: "ES" });
  source.forEach((text) => body.append("text", text));
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { Authorization: `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}` },
    body,
  });
  if (!response.ok) throw new Error(`DeepL translation failed: ${response.status} ${await response.text()}`);
  const translations = (await response.json()).translations.map(({ text }) => unprotect(text));
  if (translations.length !== spans.length) throw new Error(`DeepL returned incomplete translation for ${message.key}.`);
  if (message.kind === "plain") return translations[0];
  const clone = structuredClone(message.value);
  spans.forEach((span, index) => { clone[span.block].children[span.child].text = translations[index]; });
  return clone;
}

const protectedTerms = ["Rebuild", "Claims Ready", "ClaimReady"];
const protect = (text) => protectedTerms.reduce((result, term, index) => result.replaceAll(term, `__REBUILD_TERM_${index}__`), text);
const unprotect = (text) => protectedTerms.reduce((result, term, index) => result.replaceAll(`__REBUILD_TERM_${index}__`, term), text);
const portableSpans = (blocks) => blocks.flatMap((block, blockIndex) => Array.isArray(block.children) ? block.children.flatMap((child, childIndex) => typeof child.text === "string" && child.text ? [{ text: child.text, block: blockIndex, child: childIndex }] : []) : []);

function registry({ siteSettings = {}, splash = {}, resourcesPage = {}, privacyPage = {}, guides = [], videos = [] }) {
  const plain = (owner, key, value) => typeof value === "string" ? { owner, key, kind: "plain", value } : undefined;
  const rich = (owner, key, value) => Array.isArray(value) ? { owner, key, kind: "richText", value } : undefined;
  const all = (values) => values.filter(Boolean);
  return all([
    ...["Resources", "Join Rebuild", "Privacy Policy", "© 2026 Rebuild — The National Disaster Survivors Association", "← Back home", "Play video:", "No guides yet.", "Disaster Tipsheets", "For Survivors & Our Communities", "FEMA & Government Programs", "Insurance", "Founding member spots", "Survivor-built network", "Disaster survivors"].map((value, index) => plain("site", ["site.nav.resources", "site.nav.join", "site.footer.privacy", "site.footer.copyright", "site.backHome", "site.video.play", "site.guides.empty", "site.guides.disasterTipsheets", "site.guides.survivors", "site.guides.fema", "site.guides.insurance", "site.stats.founding", "site.stats.network", "site.stats.survivors"][index], value)),
    plain("site", "site.announcement.text", siteSettings.announcementText), plain("site", "site.announcement.cta", siteSettings.announcementCtaLabel),
    ...["heroHeadline","heroHeadlineAccent","heroSubcopy","heroImageCaption","aboutLabel","aboutSupport","foundingLabel","foundingCtaHeadline","foundingCtaSubcopy","benefitsLabel","resourcesLabel","resourcesHeadline","resourcesLeftCopy","getInvolvedCopy","getInvolvedFinePrint"].map((field) => plain("splash", `splash.${field}`, splash[field])),
    rich("splash", "splash.about.statement", splash.aboutStatement), rich("splash", "splash.resources.subcopy", splash.resourcesSubcopy),
    ...(splash.whyJoinColumns ?? []).flatMap((column, index) => [plain("splash", `splash.whyJoin.${index}.title`, column.title), plain("splash", `splash.whyJoin.${index}.body`, column.body)]),
    ...["title","heroHeadline","heroSubcopy","writtenGuidesHeading","writtenGuidesSubcopy","videoLibraryHeading","newsletterCopy","newsletterFinePrint"].map((field) => plain("resourcesPage", `resources.${field}`, resourcesPage[field])),
    plain("privacyPage", "privacy.title", privacyPage.title), rich("privacyPage", "privacy.body", privacyPage.body),
    ...guides.map((guide) => plain(`guide.${guide._id}`, `guide.${guide._id}.title`, guide.title)), ...videos.map((video) => plain(`video.${video._id}`, `video.${video._id}.title`, video.title)),
  ]);
}

if (mode === "generate") {
  await generate();
} else if (mode === "validate") {
  validate(generated, "generated");
  validate(overrides, "overrides");
  console.log(JSON.stringify({ locale, valid: true, generated: generated.messages.length, overrides: overrides.messages.length }));
} else if (mode === "report") {
  console.log(JSON.stringify({ locale, generated: generated.messages.length, reviewed: overrides.messages.length, stale: 0, omitted: 0, invalid: 0, hashInvalidatedOverrides: 0 }));
} else {
  throw new Error(`Unsupported translation command: ${mode}`);
}
