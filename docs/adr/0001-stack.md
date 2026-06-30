# 0001 - Stack: Astro + Sanity monorepo on Vercel

- Status: Accepted (partially under review)
- Date: 2026-06-28

> ⚠ **Under review — pending ClaimReady meeting (2026-06-30).** The Claims Ready
> integration requires a server-side component (API key must never reach the
> browser, plus PDF upload/storage and a submit-and-poll API), which conflicts
> with the "fully static, no backend" decisions below. Inline ⚠ flags mark the
> affected points. No decision is changed yet; see
> `docs/claimready/meeting-questions.md`. ADR-0002 will record the resolution
> once vendor answers are in.

## Context

We are rebuilding rebuild.us (currently WordPress on Pantheon) as a rebrand with a new information architecture. The new site is content-heavy: a News collection and a structured Resources library (articles, videos, downloadable guides), plus Impact Stories and Testimonials. Content is edited by non-technical staff, but updates are infrequent. Donations and email/SMS signup are handled today by Action Network and will stay there.

## Decision

- **Frontend:** Astro, rendered as a static site (SSG). Rebuilt on content publish via a Sanity webhook that calls a Vercel deploy hook.
- **Styling:** Tailwind CSS v4 with brand design tokens. The current design is grayscale low-fi wireframes, so tokens start as placeholders and are swapped when the visual brand lands.
- **CMS:** Sanity. Studio deployed to Sanity's hosting (keeps the public site fully static). Document types: `siteSettings`, `newsArticle`, `resource`, `impactStory`, `testimonial`, `person`. Marketing pages (Home, Who We Are, What We Do, Claims Ready, Rebuild Foundation) are built directly as Astro components rather than CMS-managed. <!-- ⚠ pending ClaimReady meeting: the "Claims Ready" page likely becomes an interactive scan flow (upload → poll → results), not a purely static marketing page. -->
- **Repo structure:** pnpm-workspace monorepo — `apps/web` (Astro) and `apps/studio` (Sanity Studio).
- **Hosting:** Vercel (static).
- **Integrations:** Action Network. Signup uses a custom-branded form that blind-POSTs (no API key in the browser) to the AN form helper endpoint, keeping the site fully static and handling email + SMS opt-in. Donations link out to the existing AN-hosted donate.rebuild.us page. <!-- ⚠ pending ClaimReady meeting: ClaimReady is a new, server-side API integration (Bearer API key, submit-and-poll) — not blind-POST and not browser-safe. Not yet reflected here. -->
- **Tooling:** TypeScript strict, Prettier (`prettier-plugin-astro`), ESLint (`eslint-plugin-astro`). No git hooks or test framework at setup; add a Playwright smoke test later if needed.

## Consequences

- The public site stays fast and cheap (static CDN), with editor changes going live via a publish-triggered rebuild — acceptable given infrequent edits.
- Sanity is a second service requiring a project ID and a Studio deploy, but its editing UX and image CDN justify this for non-technical editors and image-heavy content.
- No backend is required: blind-POST signup and external donations keep everything static. <!-- ⚠ pending ClaimReady meeting: directly conflicts with the integration, which needs a server-side proxy to hold the API key, accept/host the policy PDF, and run the auth→submit→poll flow. -->
- Marketing pages favor design control and speed over editability; if staff later need to reword them often, revisit with a Sanity page-builder (would supersede part of this ADR).
- Brand tokens are placeholders until hi-fi design exists; a Figma MCP connection can pull exact specs when available.
