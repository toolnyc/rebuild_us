# Spanish translation implementation specification

- Status: Approved
- Date: 2026-07-17
- Initial target locale: `es`
- Normative design: [ADR-0006](adr/0006-build-time-translation-tables.md) and
  [ADR-0007](adr/0007-translation-review-automation.md)

## Outcome

Publish static, indexable Spanish counterparts for every current public route:

| English      | Spanish         |
| ------------ | --------------- |
| `/`          | `/es/`          |
| `/resources` | `/es/resources` |
| `/privacy`   | `/es/privacy`   |

English remains the only source content managed on the existing page and resource
documents. Spanish is generated through DeepL, reviewed by non-technical authors in
Sanity, and deployed only from version-controlled tables committed to `main`.

## Boundaries

- Translate public copy and Portable Text spans only.
- Do not translate document IDs, slugs, URLs, image alt-text identifiers, embed
  sources, analytics values, PII, or protected names including `Rebuild`, `Claims
Ready`, and `ClaimReady`.
- Keep English routes and canonical English slugs unchanged.
- Do not add localized fields to `splashPage`, `resourcesPage`, `privacyPage`,
  `resourceGuide`, `resourceVideo`, or `siteSettings`.
- Do not read translations at runtime, use translated HTML, or serve English text as
  a fallback inside an `es` page.

## Architecture

### Source and registry

Add `apps/web/src/i18n/registry.ts` as the complete typed inventory of public copy.
It reads the same English query results used by the page templates and emits ordered
descriptors:

```ts
type MessageKind = "plain" | "richText" | "metadata";

interface TranslatableMessage {
  key: string;
  kind: MessageKind;
  value: string | PortableTextBlock[];
  owner: string;
}

interface ContentOwner {
  id: string;
  route: "/" | "/resources" | "/privacy";
  messages: TranslatableMessage[];
}
```

Initial key families:

| Owner               | Key examples                                                 | Fields                                       |
| ------------------- | ------------------------------------------------------------ | -------------------------------------------- |
| `site`              | `site.nav.resources`, `site.nav.join`, `site.footer.privacy` | shared UI labels, copyright copy             |
| `splash`            | `splash.hero.heading`, `splash.about.statement`              | all translatable `splashPage` display fields |
| `resourcesPage`     | `resources.hero.heading`, `resources.newsletter.copy`        | resources-page display fields                |
| `privacyPage`       | `privacy.title`, `privacy.body`                              | title and Portable Text body                 |
| `guide.<sanity-id>` | `guide.<id>.title`                                           | guide title                                  |
| `video.<sanity-id>` | `video.<id>.title`                                           | video title                                  |

The registry must make exclusions explicit beside each owner. It must be the only
module allowed to enumerate translatable content. Templates receive a resolved
localized view model, never a raw table lookup.

### Tables and resolution

Create:

```text
apps/web/src/i18n/
  contract.ts
  hash.ts
  registry.ts
  resolve.ts
  glossary.ts
  providers/deepl.ts
  tables/es.generated.json
  tables/es.overrides.json
```

`contract.ts` implements the ADR-0006 table schema with Zod-free TypeScript
validators (no runtime validation dependency is currently installed). `hash.ts`
serializes `kind` and the source value with NFC normalization and stable object-key
ordering, then hashes it with Node's `crypto.createHash('sha256')`.

`resolve.ts` must:

1. calculate the current source hash;
2. select an exact hash- and kind-matched override first;
3. then select a matching generated message;
4. return the resolved message and status;
5. report a missing message to its owner so the `es` renderer omits that owner or
   item.

The `es` renderer may render a stale prior Spanish message, but it must omit a new
guide, video, or whole owner that has no usable Spanish message. This applies during
a provider outage only. Malformed tables and structural validation failures still
fail automation.

`glossary.ts` is the provider-independent protected-term mapping. The DeepL adapter
uses it to configure or apply its glossary and validates that protected terms remain
unchanged in generated output.

### Portable Text

`providers/deepl.ts` batches each contiguous textual span with its key and position.
It clones Portable Text blocks and all non-text structure unchanged, then substitutes
only returned translated spans. Marks, annotations, list nesting, `_key`, `_type`,
and embedded non-text blocks must compare equal before and after translation.

`RichText.astro` remains the sole renderer for English and Spanish Portable Text.
No HTML is saved in a table or introduced into the renderer.

### Localized Astro rendering

Refactor the existing route templates into shared page renderers or data-to-props
functions so English and Spanish use identical markup:

```text
apps/web/src/pages/index.astro
apps/web/src/pages/resources.astro
apps/web/src/pages/privacy.astro
apps/web/src/pages/es/index.astro
apps/web/src/pages/es/resources.astro
apps/web/src/pages/es/privacy.astro
```

The `/es/*` files load English Sanity data, resolve it through the registry and
`es` tables, then pass the result to the same components now used by:

- `src/pages/index.astro`
- `src/pages/resources.astro`
- `src/pages/privacy.astro`

Update `BaseLayout.astro` to accept `locale`, canonical URL, and alternate URL
metadata. It must set `lang="es"` for localized documents, emit canonical plus
`hreflang="en"` and `hreflang="es"` alternates, and use translated metadata.

Update `Nav.astro` and `sections/Footer.astro` with a locale-aware route helper and
a visible `English | Español` switcher on desktop and mobile. It maps equivalent
known routes directly and links unsupported future English routes to `/es/`.
`privacy.astro` must also use the shared navigation and footer so the agreed
switcher appears on all initial routes.

Add sitemap generation or a static sitemap route that emits all six routes. Spanish
entries use `hreflang` alternates, canonical English slugs, and only include a route
when its root owner has usable localized output.

## Automation

### Commands

Add workspace scripts:

```text
pnpm --filter web translations:validate
pnpm --filter web translations:generate --locale es
pnpm --filter web translations:report --locale es
```

`generate` reads published Sanity data, resolves existing tables, calls DeepL only
for unmatched hashes, validates the result, writes `es.generated.json`, creates or
refreshes pending review records, and emits a machine-readable report. It is
idempotent for an unchanged source snapshot.

`validate` checks table shape, unknown/duplicate keys, hash and kind matches,
Portable Text structure, protected terms, and localization coverage. `report`
outputs machine, reviewed, stale, omitted, invalid, and hash-invalidated-override
counts with owner and key detail.

### GitHub Action

Add `.github/workflows/translations.yml` with two authenticated dispatch paths:

1. **English content publish**: a Sanity webhook sends a signed event. The workflow
   acquires a concurrency lock for `translations-main`, runs generation and
   validation, commits generated tables directly to `main` using a least-privilege
   automation identity, and lets that commit trigger Vercel.
2. **Review approval**: a Sanity webhook dispatches the review ID. The workflow
   fetches the record, rechecks every source hash against the registry, writes only
   valid approved messages to `es.overrides.json` with `reviewed` metadata, validates
   it, commits to `main`, and marks the review applied. Any stale review is returned
   to pending status without committing.

Use repository/environment secrets for `SANITY_*`, `DEEPL_API_KEY`, a webhook
signature secret, and the automation GitHub credential. Never include credentials
in generated output, logs, tables, or client code. The action must use concurrency
grouping and optimistic Sanity document revisions to avoid overwriting simultaneous
publishes or reviews.

### Sanity review queue

Add `translationReview` under `apps/studio/schemaTypes/` and register it from
`schemaTypes/index.ts`. Required fields:

| Field           | Purpose                                                                       |
| --------------- | ----------------------------------------------------------------------------- |
| `locale`        | Initial locked value: `es`                                                    |
| `owner`         | stable owner ID, display name, and route                                      |
| `messages`      | key, kind, English snapshot, source hash, generated Spanish, reviewer Spanish |
| `status`        | `pending`, `approved`, `stale`, `applied`                                     |
| `generation`    | provider, model, generated time, generated table revision                     |
| `approval`      | reviewer identity and approval time                                           |
| `appliedCommit` | resulting Git commit SHA                                                      |

Build a focused Studio desk view that filters pending Spanish reviews and makes the
English snapshot, generated Spanish, and editable reviewed Spanish visible together.
The unit of work is exactly one owner and locale, not individual strings or an
unbounded publish batch.

## Failure behavior

| Condition                           | English deploy   | Spanish output                 | Required report             |
| ----------------------------------- | ---------------- | ------------------------------ | --------------------------- |
| DeepL failure with prior message    | continues        | stale Spanish message          | provider failure, stale key |
| DeepL failure with no prior message | continues        | affected item or owner omitted | omission, missing key       |
| malformed/generated table           | stops automation | no commit or deploy            | validation errors           |
| stale reviewer hash                 | continues        | prior resolved value remains   | invalidated review          |
| invalid Portable Text result        | stops automation | no commit or deploy            | structural error            |

## Validation plan

Add unit tests for canonical hashing, table validation, override precedence,
invalidated overrides, missing-message omission, DeepL request/response mapping,
protected-term preservation, and Portable Text structural invariance.

Add Astro build tests that verify:

- every initial English and Spanish route builds;
- Spanish HTML has `lang="es"`, canonical URLs, and reciprocal alternate links;
- navigation and footer switchers map all six routes correctly;
- guide/video URLs and Solidarity Tech embeds remain unchanged;
- stale content remains Spanish, and missing fresh content is omitted rather than
  rendered in English;
- sitemap output contains localized entries only when renderable.

The workflow runs translation validation before committing, then `pnpm build`.

## Delivery sequence

1. Add table contracts, hashing, registry, resolver, fixtures, and validation tests.
2. Add the DeepL adapter, generation/report CLI, initial `es.generated.json`, and
   stable English-only build verification.
3. Refactor route data flow, add `/es/*` pages, metadata, sitemap, and switchers.
4. Add the `translationReview` schema and Studio review desk view.
5. Add signed GitHub Action dispatch, concurrency, generated-table commits, and
   review-approval override commits.
6. Seed production Spanish tables, verify the six-route deployment, and exercise
   stale and no-prior-message outage cases in a non-production dataset.
