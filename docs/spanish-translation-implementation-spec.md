# Spanish translation implementation specification

- Status: Approved (simplified)
- Date: 2026-09-03 (revised; original 2026-07-17)
- Normative design: [ADR-0008](adr/0008-spanish-as-editor-managed-sanity-fields.md)
  (supersedes ADR-0006 and ADR-0007)

## Outcome

Publish static, indexable Spanish counterparts for every current public route:

| English      | Spanish         |
| ------------ | --------------- |
| `/`          | `/es/`          |
| `/resources` | `/es/resources` |
| `/privacy`   | `/es/privacy`   |

Every page's copy and every resource-guide PDF gets one initial Spanish
translation, produced by DeepL. Afterwards, Spanish is ordinary editor-managed
Sanity content: authors edit `*Es` fields in Studio and the existing publish →
Vercel rebuild webhook deploys their changes. There is no ongoing translation
management — no review queue, no staleness tracking, no automation.

## Boundaries

- Translate public copy, Portable Text spans, and resource-guide PDFs only.
- Do not translate document IDs, slugs, URLs, image alt-text identifiers, embed
  sources, analytics values, PII, or protected names including `Rebuild`,
  `Claims Ready`, and `ClaimReady`.
- English routes, English slugs, and English fields are unchanged.

## Architecture

### Sanity fields

Each translatable English field has a sibling `*Es` field on the same document,
in an "Español" field group where the type uses groups:

- `siteSettings`: Spanish shared UI labels — nav (`navResourcesEs`, `navJoinEs`),
  footer (`footerPrivacyEs`, `footerCopyrightEs`), guide section headings,
  stat labels, `videoPlayEs`, `downloadLabelEs`, `backHomeEs`,
  `guidesEmptyEs`, announcement copy.
- `splashPage`: `*Es` for every display field, `aboutStatementEs` and
  `resourcesSubcopyEs` as Portable Text, and `titleEs`/`bodyEs` on each
  `whyJoinColumns` item.
- `resourcesPage`: `*Es` for every display field.
- `privacyPage`: `titleEs`, `bodyEs` (Portable Text).
- `resourceGuide`: `titleEs`, `fileEs` (Spanish PDF).
- `resourceVideo`: `titleEs`.

### Rendering

The `/es/*` pages (`apps/web/src/pages/es/`) query the same documents as the
English pages and pass `es ?? en` for each value, so untranslated fields fall
back to English and future English edits never break the Spanish pages. Two
exceptions on `/es/resources`: a guide or video without `titleEs` is omitted,
and a guide without `fileEs` links its English PDF under its Spanish title.

`BaseLayout.astro` takes `locale`, `canonicalUrl`, and `alternateUrl`; it sets
`lang`, the canonical link, and reciprocal `hreflang="en"` / `hreflang="es"`
alternates. `Nav.astro` and `sections/Footer.astro` render a visible
`English | Español` switcher mapping the three route pairs. `sitemap.xml.ts`
emits all six routes with hreflang alternates.

## One-time seed

Two scripts in `apps/web/scripts/`, both deleted after verification:

1. `seed-spanish.mjs <table.json> [--apply]` — reads the generated translation
   table (in git history on branch `spanish-translations`; extract with
   `git show spanish-translations:apps/web/src/i18n/tables/es.generated.json`)
   and writes each message into its `*Es` field. Dry-run by default.
2. `translate-pdfs.mjs [--apply] [--force]` — sends each `resourceGuide` PDF to
   the DeepL document API (EN→ES), uploads the result as a Sanity file asset,
   and sets `fileEs`.

The yellow pill headers in the guides are artwork (not a text layer), so DeepL
could not translate them. They were patched separately: pill regions were
detected in the rendered pages, OCR'd, translated, and redrawn as overlays
(same yellow stadium style, Basis Grotesque Pro Bold) onto the DeepL-translated
PDFs. This was a one-time pixel-surgery pass; if a guide's source design ever
gets proper Spanish artwork, upload it to `fileEs` and it will simply replace
the patched version.

Both require a **write-capable** `SANITY_API_TOKEN` in `apps/web/.env` (the
default token is read-only) plus `DEEPL_API_KEY` for the PDF script.

## Runbook

1. Create an editor-token at sanity.io/manage and set it as `SANITY_API_TOKEN`
   in `apps/web/.env`.
2. `cd apps/studio && npx sanity deploy` so the Español fields appear in Studio.
3. Extract the table and run the seed; verify the Español tabs in Studio.
4. Run `node scripts/translate-pdfs.mjs --apply`; spot-check the Spanish PDFs.
5. Trigger a Vercel rebuild and verify `/es/`, `/es/resources`, `/es/privacy`.
6. Delete both scripts and the extracted table file.

## Validation

`pnpm --filter web test` builds the site and asserts: all six routes build;
Spanish pages carry `lang="es"`, canonical URLs, and reciprocal hreflang
alternates; the switchers link each route pair; the sitemap lists all six
routes.
