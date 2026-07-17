# 0006 - Build-time translation tables

- Status: Accepted
- Date: 2026-07-17

## Context

Rebuild needs SEO-indexable Spanish pages while keeping English content as the only
editor-managed content in Sanity. Runtime translation would compromise SEO,
accessibility, and deterministic output. CMS field localization would add translated
content tables to every document type and create editorial overhead.

The site will grow from static pages into CMS-driven pages, guides, videos, news
articles, and other content. Translation must therefore have stable identifiers,
preserve review work when pages are reorganized, and avoid a provider outage blocking
an English content deployment.

## Decision

Use version-controlled, build-time translation tables for each target locale.
Tables map semantic, content-owner-scoped keys to translated structured messages.
English remains the source of truth.

Generated translations and human overrides are separate. An override wins only when
its English source hash matches the current source. Changed content is translated and
served immediately with `machine` status until reviewed. If generation fails, retain
the last Spanish message with `stale` status and report the failure without blocking
the English deployment.

Discover translatable content through a typed registry. Do not recursively translate
all strings. The generator uses a provider-neutral adapter and records provider/model
provenance without coupling the table format to a vendor.

Spanish routes use `/es/` prefixes and canonical English slugs. Localized slugs are
outside this decision.

The normative contract is in
[`docs/buildtime-translation-table-spec.md`](../buildtime-translation-table-spec.md).

## Alternatives considered

- **Runtime translation with a cache**: rejected because public pages require static,
  crawlable localized HTML, and cache mutation adds operational state to rendering.
- **Sanity field-level localization**: rejected because it duplicates every
  translatable field and makes English-plus-Spanish editorial workflows mandatory.
- **Source-text hashes as message keys**: rejected because copy edits and content
  reorganization break identity and invalidate review work unnecessarily.
- **Page-payload translations**: rejected because page composition changes would
  invalidate unrelated translations and prevent reuse across templates.
- **Provider-specific table schema**: rejected because translation-vendor changes
  should be isolated to an adapter.

## Consequences

- Builds are deterministic from versioned English content, tables, and overrides.
- New public pages and document types must add registry descriptors before localized
  rendering.
- Review status and provider failures are auditable through table metadata and build
  reports.
- The repository retains generated translations, increasing diffs when content
  changes but making translation output reviewable and reproducible.
- Translation adapter credentials remain build-environment secrets and never enter
  source-controlled tables.
