// @ts-check
/**
 * One-time script: translates every resourceGuide PDF into Spanish via the
 * DeepL document API and stores the result on the guide's `fileEs` field.
 *
 * Usage:
 *   node scripts/translate-pdfs.mjs           # dry run (lists guides)
 *   node scripts/translate-pdfs.mjs --apply   # translate + upload
 *   node scripts/translate-pdfs.mjs --apply --force   # retranslate guides that already have fileEs
 *
 * Requires SANITY_PROJECT_ID, SANITY_DATASET, SANITY_API_TOKEN (write access),
 * and DEEPL_API_KEY in apps/web/.env.
 *
 * Delete this script once the Spanish PDFs have been verified in Studio.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createClient } from "@sanity/client";

const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 5 * 60 * 1000;

function loadEnv() {
  const envPath = join(dirname(fileURLToPath(import.meta.url)), "..", ".env");
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\n]*)"?\s*$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function translateDocument(pdfBuffer, filename) {
  const apiKey = process.env.DEEPL_API_KEY;
  if (!apiKey) throw new Error("DEEPL_API_KEY is required.");
  const host = apiKey.endsWith(":fx") ? "https://api-free.deepl.com" : "https://api.deepl.com";
  const auth = { Authorization: `DeepL-Auth-Key ${apiKey}` };

  const form = new FormData();
  form.append("file", new Blob([pdfBuffer], { type: "application/pdf" }), filename);
  form.append("source_lang", "EN");
  form.append("target_lang", "ES");
  const upload = await fetch(`${host}/v2/document`, { method: "POST", headers: auth, body: form });
  if (!upload.ok) throw new Error(`DeepL document upload failed: ${upload.status} ${await upload.text()}`);
  const { document_id, document_key } = await upload.json();

  const deadline = Date.now() + POLL_TIMEOUT_MS;
  for (;;) {
    if (Date.now() > deadline) throw new Error(`Timed out waiting for DeepL document ${document_id}`);
    await sleep(POLL_INTERVAL_MS);
    const statusResponse = await fetch(`${host}/v2/document/${document_id}`, {
      method: "POST",
      headers: { ...auth, "Content-Type": "application/json" },
      body: JSON.stringify({ document_key }),
    });
    if (!statusResponse.ok) throw new Error(`DeepL status check failed: ${statusResponse.status}`);
    const status = await statusResponse.json();
    if (status.status === "done") break;
    if (status.status === "error") throw new Error(`DeepL translation error: ${status.error_message ?? "unknown"}`);
  }

  const result = await fetch(`${host}/v2/document/${document_id}/result`, {
    method: "POST",
    headers: { ...auth, "Content-Type": "application/json" },
    body: JSON.stringify({ document_key }),
  });
  if (!result.ok) throw new Error(`DeepL result download failed: ${result.status}`);
  return Buffer.from(await result.arrayBuffer());
}

async function main() {
  const args = process.argv.slice(2);
  const apply = args.includes("--apply");
  const force = args.includes("--force");
  loadEnv();

  const client = createClient({
    projectId: process.env.SANITY_PROJECT_ID,
    dataset: process.env.SANITY_DATASET,
    token: process.env.SANITY_API_TOKEN,
    apiVersion: "2025-01-01",
    useCdn: false,
  });

  const guides = await client.fetch(
    `*[_type == "resourceGuide"] | order(order asc) { _id, title, "fileUrl": file.asset->url, "hasEs": defined(fileEs) }`,
  );
  const targets = guides.filter((g) => g.fileUrl && (force || !g.hasEs));
  console.log(`${guides.length} guide(s); ${targets.length} to translate${force ? " (forced)" : ""}:`);
  for (const guide of targets) console.log(`  ${guide.title} — ${guide.fileUrl}`);
  const noFile = guides.filter((g) => !g.fileUrl);
  if (noFile.length > 0) console.log(`  skipped (no PDF): ${noFile.map((g) => g.title).join(", ")}`);

  if (!apply) {
    console.log("\nDry run only — re-run with --apply to translate and upload.");
    return;
  }

  for (const guide of targets) {
    console.log(`\nTranslating: ${guide.title}`);
    const pdf = Buffer.from(await (await fetch(guide.fileUrl)).arrayBuffer());
    const translated = await translateDocument(pdf, `${guide.title}.pdf`);
    const filename = `${guide.title.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "")}-es.pdf`;
    const asset = await client.assets.upload("file", translated, { filename, contentType: "application/pdf" });
    await client
      .patch(guide._id)
      .set({ fileEs: { _type: "file", asset: { _type: "reference", _ref: asset._id } } })
      .commit();
    console.log(`  uploaded ${filename} and set fileEs on ${guide._id}`);
  }
  console.log("\nDone. Verify the Spanish PDFs in Studio.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
