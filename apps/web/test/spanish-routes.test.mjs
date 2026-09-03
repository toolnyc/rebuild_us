// @ts-check
/**
 * Build-level checks for the Spanish routes. Run after `astro build`
 * (`pnpm --filter web test` does this automatically).
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const dist = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");
const read = (path) => readFileSync(join(dist, path), "utf8");

const origin = "https://www.rebuild.us";
const routes = [
  { en: "/", es: "/es/", enFile: "index.html", esFile: "es/index.html" },
  { en: "/resources", es: "/es/resources", enFile: "resources/index.html", esFile: "es/resources/index.html" },
  { en: "/privacy", es: "/es/privacy", enFile: "privacy/index.html", esFile: "es/privacy/index.html" },
];

for (const { en, es, enFile, esFile } of routes) {
  test(`${en} and ${es} build with locale, canonical, and hreflang metadata`, () => {
    const enHtml = read(enFile);
    const esHtml = read(esFile);

    assert.match(enHtml, /lang="en"/);
    assert.match(esHtml, /lang="es"/);

    assert.ok(enHtml.includes(`<link rel="canonical" href="${origin}${en}">`));
    assert.ok(esHtml.includes(`<link rel="canonical" href="${origin}${es}">`));

    for (const html of [enHtml, esHtml]) {
      assert.ok(html.includes(`<link rel="alternate" hreflang="en" href="${origin}${en}">`));
      assert.ok(html.includes(`<link rel="alternate" hreflang="es" href="${origin}${es}">`));
    }
  });
}

test("language switchers link each route pair", () => {
  for (const { en, es, enFile, esFile } of routes) {
    assert.ok(read(enFile).includes(`href="${es}"`), `${en} should link to ${es}`);
    assert.ok(read(esFile).includes(`href="${en}"`), `${es} should link to ${en}`);
  }
});

test("sitemap lists all six routes with hreflang alternates", () => {
  const sitemap = read("sitemap.xml");
  for (const { en, es } of routes) {
    assert.ok(sitemap.includes(`<loc>${origin}${en}</loc>`));
    assert.ok(sitemap.includes(`<loc>${origin}${es}</loc>`));
    assert.ok(sitemap.includes(`hreflang="es" href="${origin}${es}"`));
  }
});
