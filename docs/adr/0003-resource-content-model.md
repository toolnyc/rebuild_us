# 0003 - Resource content model: two document types

- Status: Accepted
- Date: 2026-07-14

## Context

Building the Resources page (`/resources`) required modeling resources in Sanity.
Until now, resources existed only as an inline array on the `splashPage` singleton
(`resourceItems`), duplicated content, and could not be reused. `CONTEXT.md`
described a single **Resource** with a **format** (article, video, or downloadable
guide) and a **section** (Preparation & Response, or Assistance & Eligibility).

The Resources wireframe splits content into two distinct experiences: a "Written
Guides" area grouped by section, and a flat "Video Library". Guides are downloadable
PDFs tied to a section; videos are YouTube embeds with no meaningful section.

## Decision

Model resources as **two standalone document types** rather than one
`resource`-with-`format` type:

- **`resourceGuide`** — `title`, `section` (required enum), `file` (PDF), `order`.
- **`resourceVideo`** — `title`, `youtubeUrl` (required), `order`.

The `splashPage` singleton references a curated, ordered subset of `resourceGuide`
documents via a `featuredResources` reference array (replacing the inline
`resourceItems`). The `resourcesPage` singleton holds only intro/heading copy and
queries the two types directly.

## Alternatives considered

- **Single `resource` type with a `format` field**, with `section` conditionally
  required only for guides. Preserves the single-Resource glossary term but forces
  format-conditional fields and validation, and mixes two visually and structurally
  distinct concepts in one Studio list.
- **Inline arrays on `resourcesPage`** (mirroring the old splash pattern). Simplest,
  but content is not reusable across pages and diverges from a first-class resource
  model.

## Consequences

- The single **Resource** glossary term now maps to two document types; `CONTEXT.md`
  is updated to reflect the guide/video split.
- The **article** format is deferred (Phase 1 ships guides + videos only).
- The splash and Resources page draw from the same source; editors manage guides and
  videos in dedicated Studio lists and hand-pick the splash's featured guides.
- Reversing this (collapsing back to one type) would require a schema change plus a
  content migration, hence recording it here.
