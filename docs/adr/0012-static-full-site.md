# 0012 - The full site is static and reuses the splash design system

- Status: Accepted
- Date: 2026-11-18
- Amends: [0001](./0001-stack.md) (its "Phase 2" description)

## Context

ADR-0001 split the rebuild into a static splash (Phase 1) and a later full site
"with backend and auth" that would add user accounts, CRM integration, and the
ClaimReady policy-scan feature. The ADR that detailed that backend (0002) was
removed when the docs were pruned to the shipped architecture.

The full site is now scheduled to launch the week of 2026-12-02. Its scope is set
by the V2 Figma file (sitemap, wireframes, and layout blocks; see
[`docs/full-site.md`](../full-site.md)). That file shows content pages only:
Home, Rebuild Ready Network, Resources, Membership Hub, Get Involved, Newsroom
with archive and story pages, and four utility pages. The Membership Hub is three
link cards. Nothing in it requires a login or server-side state.

## Decision

1. **The full site is fully static.** Same stack as the splash: Astro
   `output: 'static'` on Vercel, content from Sanity at build time, rebuilt on
   publish. No user accounts, backend, or database.
2. **Member self-service is linked, not built.** Membership Hub cards link out to
   the systems that already hold that state (Solidarity Tech and Fundraise Up).
3. **User accounts, a backend, and the ClaimReady policy scan are out of scope**
   for this launch. If they return they need their own ADR.
4. **The existing design system is reused unchanged** (ADR-0004,
   `docs/design-system.md`). The V2 wireframes define layout, block order, and
   draft copy. They do not introduce new tokens, fonts, or a new visual language.

## Alternatives considered

- **Build accounts and a member portal for launch**, as ADR-0001 anticipated.
  Rejected: the approved sitemap and wireframes do not call for it, and the
  launch date leaves no room for it.
- **Opt individual routes into SSR** (the path ADR-0001 kept open). Not needed:
  no page in the V2 file depends on per-request data.

## Consequences

- New pages are additive: new routes, components, and Sanity types on the
  existing architecture. ADRs 0005, 0008, 0009, 0010, and 0011 continue to apply.
- News archive pagination and story pages are generated at build time; a new
  article goes live on the next publish-triggered rebuild.
- The placeholder Sanity singletons created for the earlier information
  architecture (`aboutPage`, `newsPage`, `contactPage`, `caseStudiesPage`,
  `memberPortalPage`) do not match the V2 sitemap and should be repurposed or
  retired as their replacements are built.
- ADR-0001's SSR opt-in remains available, so a later account or portal feature
  would not require rebuilding the static pages.
