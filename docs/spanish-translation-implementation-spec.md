# Spanish translation automation

## Outcome

Publishing English content in Sanity automatically refreshes the Spanish
**translation table** with DeepL and deploys it. Content authors can later review
that Spanish in Sanity, make an edit, and publish their approved override.

English remains the source content. Spanish remains a version-controlled build
input, not a second set of fields on every source document.

## Scope

This specification covers the initial public routes:

| English      | Spanish         |
| ------------ | --------------- |
| `/`          | `/es/`          |
| `/resources` | `/es/resources` |
| `/privacy`   | `/es/privacy`   |

It adds only the automation missing from the current translation implementation.
It does not add a release gate, a new service, granular permissions, or an
additional editorial product.

## Publishing flow

### Automatic translation

1. A content author publishes an English public page, Guide, Video, or site setting
   in Sanity.
2. A Sanity webhook sends `sanity-content-published` to the existing
   GitHub `repository_dispatch` workflow.
3. The `generate` job runs
   `pnpm --filter web translations:generate --locale es`.
4. The generator reads the current English source, reuses messages whose source hash
   has not changed, and sends only new or changed messages to DeepL.
5. The job validates the updated generated table, builds the web app, and commits
   `apps/web/src/i18n/tables/es.generated.json` to `main`.
6. The normal Vercel deployment from `main` publishes the refreshed Spanish output.
7. The same job creates or refreshes one pending **translation review** per changed
   content owner.

Machine translation is published automatically. Authors do not need to translate
before publishing English content.

### Author override

1. An author opens **Spanish Translation Reviews** in Sanity Studio.
2. The review shows the English snapshot, machine Spanish, and an editable Spanish
   value for each changed translation message.
3. The author edits any message they want to improve, changes the review status to
   `approved`, and publishes the review document.
4. A second Sanity webhook sends `sanity-translation-approved` to the same GitHub
   workflow.
5. The `apply-review` job rechecks the English source hashes, writes the approved
   current messages to `apps/web/src/i18n/tables/es.overrides.json`, validates and
   builds, then commits to `main`.
6. The next Vercel deployment renders the reviewed Spanish because overrides take
   precedence over generated messages.

## Existing components and required changes

### Translation tables and resolver

Keep the current table contract:

```ts
interface TranslationTable {
  locale: "es";
  messages: TranslationMessage[];
}
```

`es.generated.json` stores DeepL output. `es.overrides.json` stores approved human
changes. `resolveMessage` already selects a hash-matched override before a
hash-matched generated message, so no new resolution model is needed.

### Translation registry

`apps/web/src/i18n/registry.ts` remains the inventory of translatable English
content and existing owner groups:

- `site`
- `splash`
- `resourcesPage`
- `privacyPage`
- `guide.<sanity-id>`
- `video.<sanity-id>`

Remove the duplicated registry from `apps/web/scripts/translations.mjs`. Extract the
shared registry data and source traversal into one ESM-compatible module that both
the Node generator and the Astro runtime can use. The generator and runtime must
therefore agree on keys, owners, paths, kinds, and source hashes.

### Generator

Extend `apps/web/scripts/translations.mjs` to:

- use the shared registry;
- keep matching generated messages unchanged;
- generate only new or changed messages with DeepL;
- validate every protected term after translation: `Rebuild`, `Claims Ready`, and
  `ClaimReady` must be unchanged;
- create or refresh pending Sanity `translationReview` documents for owners with
  new machine translations; and
- emit a concise JSON report for the workflow log.

The generator must retain the current table schema. Do not add English text,
quality labels, or timestamps to generated table messages.

### Translation reviews

Keep `translationReview` as the Sanity workflow document. A review is one locale
and one existing content owner, such as `splash` or `guide.<id>`.

Update the schema so it can store the same value type as the table:

- plain messages use editable text;
- rich-text messages use Portable Text, with their non-text structure retained;
- each message records its key, kind, English snapshot, source hash, generated
  Spanish, and optional reviewed Spanish;
- review status remains `pending`, `approved`, `stale`, or `applied`.

The existing Studio desk list remains the author entry point. Authors edit the
reviewed Spanish and set the status to `approved`; no custom permissions or new
Studio application are required.

### Review application command

Add an `apply-review` command under `apps/web/scripts/` that accepts a review ID:

1. fetch the approved review from Sanity;
2. fetch the current English source and rebuild the registry;
3. apply only messages with matching key, kind, and source hash to
   `es.overrides.json`;
4. validate the override table and build the web app;
5. return the review to `stale` if its English changed; otherwise mark it `applied`
   with the resulting commit SHA.

The command must never add an English fallback to a Spanish page.

### GitHub workflow

Complete `.github/workflows/translations.yml`:

- keep the existing `translations-main` concurrency group;
- on `sanity-content-published`, generate, validate, build, create/update reviews,
  and commit the generated table if it changed;
- on `sanity-translation-approved`, run the review-application command, validate,
  build, and commit the override table if it changed; and
- use the existing repository secrets for Sanity, DeepL, and the automation token.

Sanity is configured with two direct GitHub repository-dispatch webhooks, one for
English public-content publishes and one for approved translation reviews. No
additional endpoint or service is introduced.

## Content rules

- Translate public text and Portable Text spans only.
- Preserve Portable Text marks, annotations, list nesting, `_key`, `_type`, embeds,
  and non-text blocks.
- Do not translate URLs, document IDs, asset references, form embeds, campaign IDs,
  image metadata, or slugs.
- Preserve `Rebuild`, `Claims Ready`, and `ClaimReady` exactly.
- Never render English as a Spanish fallback.

## Failure behavior

- An English publish remains independent of translation automation. It is not held
  for DeepL or review.
- If DeepL, table validation, or the web build fails, do not commit a new generated
  table. The prior committed Spanish deployment remains intact.
- A source message without a Spanish translation is omitted from the Spanish output.
  A prior Spanish message may remain stale only when the existing resolver can use
  it, never as English fallback.
- If an author approves a review after its English source changes, do not write an
  override. Mark the review `stale` so the author can review the latest generated
  translation.

## Implementation sequence

1. Consolidate the registry used by the generator and runtime.
2. Extend generation to create and refresh pending reviews.
3. Update the review schema for editable plain and Portable Text Spanish values.
4. Add the review-application command.
5. Complete both GitHub workflow jobs and configure the two Sanity dispatch
   webhooks.
6. Add focused tests and exercise one English publish plus one author override in
   the production-equivalent Sanity dataset.

## Acceptance criteria

- Publishing English content automatically commits only required new or changed
  Spanish messages to `es.generated.json`.
- The generated-table commit triggers a Spanish deployment without author action.
- A pending review appears in Sanity for each changed content owner.
- An author can edit Spanish, approve the review, and publish a deployed override.
- A matching override wins over generated Spanish at build time.
- Changed or missing Spanish never becomes English text on an `/es/*` page.
- Portable Text structure, URLs, embeds, assets, campaign IDs, and protected names
  are preserved.
- A failed translation or validation run does not replace the last committed Spanish
  table.
