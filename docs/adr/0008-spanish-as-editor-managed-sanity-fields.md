# 0008 - Spanish as editor-managed Sanity fields with a one-time DeepL seed

- Status: Accepted
- Date: 2026-09-03
- Supersedes: [0006](0006-build-time-translation-tables.md), [0007](0007-translation-review-automation.md)

## Context

ADR-0006 and ADR-0007 designed a full translation pipeline: version-controlled
tables, source hashing, a Sanity review queue, and a signed GitHub Action that
regenerates and commits translations on every publish. That design optimized for
continuously managed translations.

The requirement changed. Rebuild needs one initial Spanish translation of every
public page and the resource PDFs, editable afterwards by non-technical authors,
and explicitly does not need machinery that tracks or re-translates future English
edits. Under that scope the pipeline's machinery (hashing, review queue,
automation) is cost without benefit, and its editing surface (Git-committed JSON)
is inaccessible to the people who will actually maintain the Spanish copy.

## Decision

Spanish copy lives in Sanity, on the same documents as the English source, in
fields suffixed `Es` (e.g. `heroHeadlineEs`, `bodyEs`, `titleEs`), grouped under
an "Español" tab where the document type uses field groups. Shared UI labels
(nav, footer, guide-section headings, stat labels, announcement) get `*Es` fields
on `siteSettings`. `resourceGuide` additionally gains a `fileEs` PDF field.

The initial translation is a one-time seed: a script
(`apps/web/scripts/seed-spanish.mjs`) reads the previously generated translation
table from git history (branch `spanish-translations`) and writes each value into
its `*Es` field. A second script (`apps/web/scripts/translate-pdfs.mjs`) sends
each `resourceGuide` PDF through the DeepL document API and uploads the result as
`fileEs`. Both scripts are deleted once the seed is verified in Studio.

The `/es/` pages query the `*Es` fields at build time and fall back to the
English value for anything not yet translated, so future English edits never
break the Spanish pages. Guides and videos are the exception: they are omitted
from `/es/resources` until they have a `titleEs`, and a guide without `fileEs`
links its English PDF under the Spanish title.

## Alternatives considered

- **Keep the ADR-0006/0007 pipeline**: rejected. The review queue, hash
  invalidation, and GitHub Action exist to manage ongoing translation, which is
  no longer a requirement, and they make JSON files in Git the editing surface
  for non-technical authors.
- **Runtime translation or a localization plugin**: rejected (unchanged from
  ADR-0006). SEO-indexable static output and a deterministic build remain
  requirements.

## Consequences

- Editors own Spanish copy entirely in Studio; no engineering involvement is
  needed to fix or update translations, and the existing publish → Vercel rebuild
  webhook deploys Spanish edits the same way as English ones.
- Nothing detects stale Spanish after English edits. This is accepted: the
  fallback keeps pages whole, and updating the `*Es` field is an editorial task.
- The build loses the version-controlled translation input ADR-0006 wanted;
  Spanish is now dataset state like any other content.
- ADR-0006's `/es/` URL scheme, canonical English slugs, and hreflang alternates
  are unchanged.
