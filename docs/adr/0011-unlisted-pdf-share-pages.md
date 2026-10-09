# 0011 - Unlisted PDF share pages

- Status: Accepted
- Date: 2026-10-09

## Context

Staff need to hand out a stable `rebuild.us` URL for one-off PDFs (flyers,
briefings, partner handouts) without adding them to the Resources page or the
site navigation. Sanity CDN URLs work but are long, unbranded, and change when
a file is re-uploaded.

## Decision

A `sharePage` Sanity document type renders a full-screen PDF page at
`/share/<slug>` and `/es/share/<slug>`.

- **Editor-controlled URL.** The slug is the URL; it is restricted to
  `a-z0-9` and single hyphens and must be unique across `sharePage` documents.
  Because routes are namespaced under `/share/`, no reserved-word list is needed.
- **Chromeless.** `SharePdfPage.astro` is a standalone `<html>` document rather
  than a `BaseLayout` page: no Nav, Footer, Tailwind, or analytics. It still
  sets `<link rel="canonical">` against the www origin (ADR-0010).
- **`<object>`, not `<iframe>`.** Fallback content inside `<object>` renders
  when the browser cannot display PDFs inline (e.g. Android Chrome); inside
  `<iframe>` it never does. The fallback is a direct download link.
- **Unlisted, not private.** Pages are excluded from `sitemap.xml` and the nav
  but carry no `noindex`; anyone with the link (or a crawler that finds it) can
  reach them. The PDF itself is public on the Sanity CDN regardless.
- **Spanish follows ADR-0008.** Optional `titleEs` / `fileEs` fields; the `/es`
  page is always built and falls back to the English assets. `hreflang`
  alternates are emitted only when a translation exists, on both pages, so the
  pair stays reciprocal.
- **Static.** Routes come from `getStaticPaths`; a new or changed share page
  goes live on the next publish-triggered Vercel rebuild. Unknown slugs 404.

## Consequences

- Editors get a copy-to-clipboard link in Studio but the link only resolves
  after publish + rebuild (roughly a minute).
- iOS Safari renders only the first page of an inline PDF; users there must
  use the browser's open/download affordance. Accepted for now.
- If share pages should ever be hidden from search, add
  `<meta name="robots" content="noindex">` to `SharePdfPage.astro`; if they
  should be discoverable, add them to `sitemap.xml.ts`.
