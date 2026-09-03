// @ts-check
/**
 * One-time seed: writes Spanish translations into Sanity `*Es` fields.
 *
 * Translation source: the generated table produced by the retired DeepL
 * pipeline. It lives only in git history on the spanish-translations
 * branch — extract it with:
 *   git show spanish-translations:apps/web/src/i18n/tables/es.generated.json > /tmp/es-seed.json
 * and pass the path as argv[2].
 *
 * Usage:
 *   node scripts/seed-spanish.mjs <es.generated.json>           # dry run
 *   node scripts/seed-spanish.mjs <es.generated.json> --apply   # write to Sanity
 *
 * Requires SANITY_PROJECT_ID, SANITY_DATASET, and a SANITY_API_TOKEN with
 * write access in apps/web/.env (the default token is read-only).
 *
 * Delete this script once the seed has been verified in Studio.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createClient } from "@sanity/client";

/** Table key -> [singleton, Es field]. */
const SITE_FIELDS = {
  "site.nav.resources": "navResourcesEs",
  "site.nav.join": "navJoinEs",
  "site.footer.privacy": "footerPrivacyEs",
  "site.footer.copyright": "footerCopyrightEs",
  "site.backHome": "backHomeEs",
  "site.video.play": "videoPlayEs",
  "site.guides.empty": "guidesEmptyEs",
  "site.guides.disasterTipsheets": "guidesDisasterTipsheetsEs",
  "site.guides.survivors": "guidesSurvivorsEs",
  "site.guides.fema": "guidesFemaEs",
  "site.guides.insurance": "guidesInsuranceEs",
  "site.stats.founding": "statsFoundingEs",
  "site.stats.network": "statsNetworkEs",
  "site.stats.survivors": "statsSurvivorsEs",
  "site.announcement.text": "announcementTextEs",
  "site.announcement.cta": "announcementCtaLabelEs",
};

const SPLASH_RICH_TEXT = {
  "splash.about.statement": "aboutStatementEs",
  "splash.resources.subcopy": "resourcesSubcopyEs",
};

const PRIVACY_FIELDS = {
  "privacy.title": "titleEs",
  "privacy.body": "bodyEs",
};

function loadEnv() {
  const envPath = join(dirname(fileURLToPath(import.meta.url)), "..", ".env");
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\n]*)"?\s*$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
  }
}

async function main() {
  const [tablePath, flag] = process.argv.slice(2);
  if (!tablePath) {
    console.error("Usage: node scripts/seed-spanish.mjs <es.generated.json> [--apply]");
    process.exit(1);
  }
  const apply = flag === "--apply";
  loadEnv();

  const table = JSON.parse(readFileSync(tablePath, "utf8"));

  const client = createClient({
    projectId: process.env.SANITY_PROJECT_ID,
    dataset: process.env.SANITY_DATASET,
    token: process.env.SANITY_API_TOKEN,
    apiVersion: "2025-01-01",
    useCdn: false,
  });

  const ids = await client.fetch(`{
    "siteSettings": *[_type == "siteSettings"][0]._id,
    "splash": *[_type == "splashPage"][0]._id,
    "resourcesPage": *[_type == "resourcesPage"][0]._id,
    "privacyPage": *[_type == "privacyPage"][0]._id
  }`);
  const splash = await client.fetch(`*[_type == "splashPage"][0]{ whyJoinColumns }`);

  /** @type {Map<string, Record<string, unknown>>} docId -> fields to set */
  const patches = new Map();
  const setField = (docId, field, value) => {
    if (!docId) throw new Error(`Missing singleton document for ${field}`);
    const fields = patches.get(docId) ?? {};
    fields[field] = value;
    patches.set(docId, fields);
  };

  /** @type {Map<number, Record<string, string>>} whyJoin column index -> Es fields */
  const whyJoinEs = new Map();
  const skipped = [];

  for (const message of table.messages) {
    const { key, kind, value } = message;

    if (SITE_FIELDS[key]) {
      setField(ids.siteSettings, SITE_FIELDS[key], value);
      continue;
    }
    if (SPLASH_RICH_TEXT[key] || PRIVACY_FIELDS[key]) {
      if (kind !== "richText" && key === "privacy.body") skipped.push(`${key}: expected richText, got ${kind}`);
      setField(SPLASH_RICH_TEXT[key] ? ids.splash : ids.privacyPage, SPLASH_RICH_TEXT[key] ?? PRIVACY_FIELDS[key], value);
      continue;
    }

    let match = key.match(/^splash\.([\w]+)$/);
    if (match) {
      setField(ids.splash, `${match[1]}Es`, value);
      continue;
    }
    match = key.match(/^splash\.whyJoin\.(\d+)\.(title|body)$/);
    if (match) {
      const prior = whyJoinEs.get(Number(match[1])) ?? {};
      whyJoinEs.set(Number(match[1]), { ...prior, [`${match[2]}Es`]: value });
      continue;
    }
    match = key.match(/^resources\.([\w]+)$/);
    if (match) {
      setField(ids.resourcesPage, `${match[1]}Es`, value);
      continue;
    }
    match = key.match(/^(guide|video)\.([\w-]+)\.title$/);
    if (match) {
      setField(match[2], "titleEs", value);
      continue;
    }
    skipped.push(`unmapped key: ${key}`);
  }

  // The "Download ↓" label was never in the generated table (it lived in the
  // Resources component); seed it directly.
  setField(ids.siteSettings, "downloadLabelEs", "Descargar ↓");

  // Merge whyJoinColumns translations into the splash patch as a whole-array set.
  if (whyJoinEs.size > 0) {
    const columns = (splash?.whyJoinColumns ?? []).map((column, i) => ({
      ...column,
      ...(whyJoinEs.get(i) ?? {}),
    }));
    setField(ids.splash, "whyJoinColumns", columns);
  }

  const fieldCount = [...patches.values()].reduce((n, f) => n + Object.keys(f).length, 0);
  console.log(`${apply ? "Applying" : "Dry run:"} ${patches.size} document(s), ${fieldCount} field(s).`);
  for (const [docId, fields] of patches) {
    console.log(`\n${docId}:`);
    for (const [field, value] of Object.entries(fields)) {
      const preview = typeof value === "string" ? value.slice(0, 80) : Array.isArray(value) ? `[${value.length} blocks/items]` : value;
      console.log(`  ${field} = ${JSON.stringify(preview)}`);
    }
  }
  if (skipped.length > 0) console.log(`\nSkipped (${skipped.length}):\n  ${skipped.join("\n  ")}`);

  if (!apply) {
    console.log("\nDry run only — re-run with --apply to write.");
    return;
  }
  for (const [docId, fields] of patches) {
    await client.patch(docId).set(fields).commit();
    console.log(`patched ${docId}`);
  }
  console.log("Done. Verify the Español fields in Studio.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
