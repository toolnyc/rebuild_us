# 0007 - Sanity review queue with Git-committed translation overrides

- Status: Accepted
- Date: 2026-07-17

## Context

The translation-table design requires generated tables and reviewed overrides to be
version-controlled inputs to a deterministic build. The people approving Spanish
copy are non-technical authors, so asking them to edit JSON or GitHub pull requests
would make the review process inaccessible.

Sanity is the existing editorial surface, but making translated fields part of each
source document would reintroduce the CMS localization model rejected in ADR-0006.
Vercel builds cannot safely write generated tables back to the repository either.

## Decision

Add a Sanity `translationReview` workflow document scoped to one locale and one
content owner. It stores the English snapshot, source hashes, proposed translated
messages, and approval metadata. It is not a localized field on source content and
is not read by the public site at build or runtime.

A signed GitHub Action handles both content-publish and review-approval webhooks:

1. On English publish, it fetches canonical source content, resolves or generates
   translations with the provider adapter, validates tables, creates or refreshes
   review records, and commits generated tables to `main`.
2. On review approval, it revalidates each reviewed message against the current
   registry and commits matching values to `<locale>.overrides.json` on `main`.

Commits to `main` trigger Vercel, so deployment inputs are always versioned.

## Alternatives considered

- **Non-technical authors edit Git files or pull requests**: rejected because it
  makes copy review dependent on engineering tools and expertise.
- **Sanity localization fields on source documents**: rejected because Spanish
  becomes an editor-managed content duplicate and deploys lose a versioned,
  reproducible translation input.
- **Vercel build writes tables**: rejected because builds cannot reliably commit
  their generated source back to Git and output would diverge from the repository.
- **External translation management system**: deferred because it adds another
  editorial product without a demonstrated need beyond the existing Sanity Studio.

## Consequences

- Reviewers remain in Sanity while Git remains the public site's override source of
  truth.
- GitHub Actions needs narrowly scoped credentials for Sanity, DeepL, and committing
  to this repository; none may enter the tables or client bundle.
- Publish and approval workflows need idempotency, concurrency control, and audit
  reporting.
- Translation review records may become stale after English edits and must be
  regenerated before approval.
