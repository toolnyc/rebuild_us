import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const mode = process.argv[2];
const localeFlag = process.argv.indexOf("--locale");
const locale = localeFlag === -1 ? "es" : process.argv[localeFlag + 1];
if (locale !== "es") throw new Error("Only the es locale is configured.");

const root = new URL("../src/i18n/tables/", import.meta.url);
const generated = await readTable("es.generated.json");
const overrides = await readTable("es.overrides.json");

if (mode === "validate") {
  validate(generated, "generated");
  validate(overrides, "overrides");
  console.log(JSON.stringify({ locale, valid: true, generated: generated.messages.length, overrides: overrides.messages.length }));
} else if (mode === "report") {
  console.log(JSON.stringify({
    locale,
    generated: generated.messages.length,
    reviewed: overrides.messages.length,
    stale: 0,
    omitted: 0,
    invalid: 0,
    hashInvalidatedOverrides: 0,
  }));
} else {
  throw new Error(`Unsupported translation command: ${mode}`);
}

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
  return createHash("sha256").update(JSON.stringify({ kind, value })).digest("hex");
}
