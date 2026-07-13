# 0001 - Stack: Astro + Sanity monorepo on Vercel

- Status: Accepted
- Date: 2026-06-28
- Updated: 2026-07-13 (brand palette adopted from approved mid-fi design)

> This ADR covers the Phase 1 (splash) architecture only. Phase 1 is fully
> static. The ClaimReady integration and full-site backend decisions (auth,
> database, hybrid SSR) are recorded in ADR-0002.

## Context

We are rebuilding rebuild.us (currently WordPress on Pantheon) as a rebrand with a new information architecture. The build is split into two phases: a static splash page for launch (Phase 1), followed by a full site with backend and auth (Phase 2). Phase 1 is content-heavy but editor-infrequent; Phase 2 introduces user accounts, CRM integration, and the ClaimReady policy-scan feature.

## Decision

- **Frontend:** Astro with the Vercel adapter in static mode (SSG default, per-route SSR opt-in via `export const prerender = false`). Astro v5 removed the `hybrid` output option; `static` now behaves identically. Phase 1 uses this to support Sanity draft-preview routes (`/api/preview`, `/api/disable-preview`); all content pages remain static. Phase 2 adds further SSR routes for the ClaimReady proxy and auth.
- **Styling:** Tailwind CSS v4 with brand design tokens. Brand fonts are New Burns Trial (display) and Armand Grotesk Test (body); files live in `apps/web/public/fonts/`. Token names use CSS custom properties (`--font-display`, `--font-body`, `--font-ui`). Brand color tokens (adopted from the approved mid-fi design): `--color-cream` `#F1E9DD` (page background), `--color-ink` `#1F1B17` (text + nav/footer/dark sections), `--color-muted` `#6B655C` (secondary text), `--color-white` `#FFFFFF` (cards), `--color-accent-yellow` `#ECF278`, `--color-accent-orange` `#F4552A`, `--color-accent-sage` `#A7B795`.
- **CMS:** Sanity. Studio deployed to Sanity's hosting. Phase 1 document types: `siteSettings`, `splashPage`, `privacyPage` (full content); `resourcesPage`, `aboutPage`, `newsPage`, `contactPage`, `caseStudiesPage`, `memberPortalPage` (stubs: `title` + `visible` only). Phase 2 content types: `newsArticle`, `resource`, `impactStory`, `testimonial`, `person`. Each page document has a `visible` boolean; when `false`, the page and all nav/footer/section links to it are suppressed. `siteSettings` holds non-page config only (form embed URLs, social URLs, section toggles). `splashPage` is a singleton holding all editable homepage copy.
- **Repo structure:** pnpm-workspace monorepo — `apps/web` (Astro) and `apps/studio` (Sanity Studio). Sanity Studio is scaffolded from Phase 1 (required for `siteSettings`).
- **Hosting:** Vercel.
- **Integrations (Phase 1):** Solidarity Tech. The founding-member signup form is a Solidarity Tech iframe embed (`act.rebuild.us`). Newsletter sections are stubbed pending integration decision. Donations link out to the existing AN-hosted `donate.rebuild.us` page.
- **Tooling:** TypeScript strict, Prettier (`prettier-plugin-astro`), ESLint (`eslint-plugin-astro`). No git hooks or test framework at setup; add Playwright smoke tests later if needed.

## Consequences

- The public site stays fast and cheap (static CDN), with editor changes going live via a publish-triggered Vercel rebuild. Infrequent edits make this acceptable.
- Sanity Studio is a Phase 1 dependency (not Phase 2) because `siteSettings` controls nav/footer link visibility on the splash page.
- The Solidarity Tech iframe embed keeps Phase 1 fully static with no server-side handling required.
- Homepage copy is managed in Sanity via the `splashPage` singleton. `siteSettings` stays thin (nav/footer flags only). This keeps the Studio unambiguous for non-technical editors.
- Phase 2 hybrid mode is additive: switching individual routes to SSR does not require rebuilding the static pages.
