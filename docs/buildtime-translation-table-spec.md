# Build-time translation table specification

- Status: Approved design
- Initial locale: `es`
- Source locale: `en`

## Purpose

Generate deterministic, static localized pages from the English source of truth
without adding translated fields to Sanity. The design must support new public pages
and content types without changing the translation-table contract.

## Non-goals

- Runtime translation or runtime cache reads
- Editor-authored localization fields in Sanity
- Localized URL slugs
- Translating identifiers, URLs, embeds, PII, or registered proper names

## Route contract

English remains unprefixed. Localized routes use a BCP 47 locale prefix and the
canonical English slug:

```text
/resources
/es/resources
/news/<english-slug>
/es/news/<english-slug>
```

Localized slugs may be added later as a routing feature. They are outside this
translation-table contract.

## Content discovery

A typed translatable-content registry is the sole inventory of text to translate.
Every page template and CMS document type with localized output contributes a
descriptor. A descriptor declares:

- its content owner and message-key builder
- translatable fields and their kind: `plain`, `richText`, or `metadata`
- the canonical English source value for each key
- explicit exclusions

Do not recursively translate arbitrary strings. Exclusions include Sanity IDs,
slugs, URLs, iframe/embed sources, analytics values, PII, and protected proper
names such as `Rebuild`, `Claims Ready`, and `ClaimReady`.

Keys are semantic and owner-scoped, never derived from source text:

```text
site.nav.join
site.footer.copyright
splash.hero.heading
resources.intro.body
guide.<sanity-document-id>.title
newsArticle.<sanity-document-id>.body
```

`richText` values use the existing structured rich-text representation. Translation
must preserve annotations, marks, list structure, and embedded non-text nodes.
Translated HTML is forbidden.

## Table files

Store immutable generated tables and hand-edited overrides under source control:

```text
apps/web/src/i18n/
  registry.ts
  tables/
    es.generated.json
    es.overrides.json
```

The generator writes `*.generated.json`. Humans only edit `*.overrides.json`. Both
are reviewed and committed with the English content change that produced them. Build
output is derived from these files and is not a source of truth.

Each locale has independent files, allowing future locales without schema changes.

## Table contract

```ts
type Locale = 'es' | (string & {});
type MessageKind = 'plain' | 'richText' | 'metadata';
type MessageStatus = 'machine' | 'reviewed' | 'stale';

interface TranslationProvenance {
  provider: string;
  model?: string;
  generatedAt: string;
}

interface TranslationMessage {
  key: string;
  kind: MessageKind;
  sourceHash: string;
  value: string | PortableTextBlock[];
  status: MessageStatus;
  provenance?: TranslationProvenance;
  reviewedAt?: string;
  reviewedBy?: string;
  staleFromSourceHash?: string;
}

interface TranslationTable {
  schemaVersion: 1;
  locale: Locale;
  sourceLocale: 'en';
  generatedAt: string;
  messages: Record<string, TranslationMessage>;
}
```

`sourceHash` is SHA-256 of a canonical serialization of the message kind and English
source value. The canonical serializer must normalize Unicode to NFC and use stable
JSON property ordering for structured values.

## Resolution

For each registry entry at build time:

1. Compute the current English `sourceHash`.
2. Use an override only when its key, kind, and `sourceHash` exactly match.
3. Otherwise use a generated message with an exact `sourceHash` match.
4. For a changed or missing generated message, translate through the
   provider-neutral adapter, validate the result, and write a `machine` message.
5. If generation fails, retain the last valid locale message as `stale`, preserve its
   original source hash, and emit a structured build error report.

An override whose hash no longer matches is retained in version history but is not
resolved. This prevents an approved translation from silently describing changed
English content.

New English changes therefore serve fresh machine Spanish immediately and are
visible to reviewers through the `machine` status. A provider outage never blocks an
English deployment; it preserves the last usable Spanish page with `stale` messages.

## Translation-provider boundary

The generator depends on a narrow provider-neutral adapter:

```ts
interface TranslationProvider {
  translate(input: {
    sourceLocale: 'en';
    targetLocale: Locale;
    messages: Array<{ key: string; kind: MessageKind; value: unknown }>;
    glossary?: Record<string, string>;
  }): Promise<Array<{ key: string; value: unknown; provider: string; model?: string }>>;
}
```

Provider-specific APIs, glossary IDs, credentials, and model configuration belong in
the adapter and build environment, not table entries. Generated messages retain
provider and model provenance for auditability.

## Build validation

The build must fail for malformed table data, duplicate keys, unknown registry keys,
kind mismatches, invalid rich-text structure, or a locale route with no usable
message. It must not fail the English deployment solely because a provider request
failed when a valid prior locale message is available.

Emit a machine-readable translation report containing:

- current machine, reviewed, and stale counts
- missing and invalid keys
- hash-invalidated overrides
- provider failures and retained stale keys

CI should reject hand edits to generated files that do not pass contract validation.

## Adding a page or content type

1. Add its public route using the existing English slug.
2. Register every translatable output field with semantic key builders.
3. Add explicit exclusions for non-translatable fields.
4. Generate locale tables and commit their changes.
5. Verify localized rendering, `lang`, alternate links, and sitemap output.

No translation-table schema change is needed for a new page, document type, or
locale.

## Operational lifecycle

- English content publish triggers a deployment.
- The build calculates changed keys and translates only content with no matching
  message hash.
- Reviewers add a hash-matched override and mark it `reviewed`.
- The next build resolves that override ahead of generated text.
- Build reports identify machine and stale messages for follow-up.
