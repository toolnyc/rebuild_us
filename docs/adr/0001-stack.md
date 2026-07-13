# 0001 - Stack: Astro + Sanity monorepo on Vercel

- Status: Accepted
- Date: 2026-06-28
- Updated: 2026-07-13

> This ADR covers the Phase 1 (splash) architecture only. Phase 1 is fully
> static. The ClaimReady integration and full-site backend decisions (auth,
> database, hybrid SSR) are recorded in ADR-0002.

## Context

We are rebuilding rebuild.us (currently WordPress on Pantheon) as a rebrand with a new information architecture. The build is split into two phases: a static splash page for launch (Phase 1), followed by a full site with backend and auth (Phase 2). Phase 1 is content-heavy but editor-infrequent; Phase 2 introduces user accounts, CRM integration, and the ClaimReady policy-scan feature.

## Decision

- **Frontend:** Astro. Phase 1 is fully static (SSG), deployed to Vercel. Phase 2 uses Astro hybrid mode with the Vercel adapter so that only `/api/*` routes run server-side; all other pages remain static.
- **Styling:** Tailwind CSS v4 with brand design tokens. Brand fonts are New Burns Trial (display) and Armand Grotesk Test (body); files live in `apps/web/public/fonts/`. Token names use CSS custom properties (`--font-display`, `--font-body`, `--font-ui`).
- **CMS:** Sanity. Studio deployed to Sanity's hosting. Document types: `siteSettings`, `newsArticle`, `resource`, `impactStory`, `testimonial`, `person`. `siteSettings` is used from Phase 1 onward to control nav and footer link visibility. Marketing pages are built as Astro components rather than CMS-managed.
- **Repo structure:** pnpm-workspace monorepo — `apps/web` (Astro) and `apps/studio` (Sanity Studio). Sanity Studio is scaffolded from Phase 1 (required for `siteSettings`).
- **Hosting:** Vercel.
- **Integrations (Phase 1):** Solidarity Tech. The founding-member signup form is a Solidarity Tech iframe embed (`act.rebuild.us`). Newsletter sections are stubbed pending integration decision. Donations link out to the existing AN-hosted `donate.rebuild.us` page.
- **Tooling:** TypeScript strict, Prettier (`prettier-plugin-astro`), ESLint (`eslint-plugin-astro`). No git hooks or test framework at setup; add Playwright smoke tests later if needed.

## Consequences

- The public site stays fast and cheap (static CDN), with editor changes going live via a publish-triggered Vercel rebuild. Infrequent edits make this acceptable.
- Sanity Studio is a Phase 1 dependency (not Phase 2) because `siteSettings` controls nav/footer link visibility on the splash page.
- The Solidarity Tech iframe embed keeps Phase 1 fully static with no server-side handling required.
- Marketing pages favor design control and speed over editability; if staff later need to reword them frequently, revisit with a Sanity page-builder.
- Phase 2 hybrid mode is additive: switching individual routes to SSR does not require rebuilding the static pages.
