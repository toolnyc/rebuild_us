# REBUILD.US

Re-development of [rebuild.us](https://rebuild.us) for newworld.inc. This is a rebrand and full information-architecture change from the current WordPress site to a new "national association for disaster survivors" positioning.

See `CONTEXT.md` for the domain language and `docs/adr/` for architectural decisions (start with `docs/adr/0001-stack.md`).

## Stack (decided, not yet scaffolded)

- **Frontend:** Astro hybrid mode (SSG default, SSR opt-in via Vercel adapter from Phase 1), Tailwind CSS v4 with brand design tokens
- **CMS:** Sanity (Studio on Sanity hosting); document types — `siteSettings`, `splashPage`, `privacyPage`, `resourcesPage`, `aboutPage`, `newsPage`, `contactPage`, `caseStudiesPage`, `memberPortalPage` (stubs with `visible` flag, Phase 1), `newsArticle`, `resource`, `impactStory`, `testimonial`, `person` (Phase 2 content types)
- **Structure:** pnpm-workspace monorepo (`apps/web`, `apps/studio`)
- **Hosting:** Vercel, rebuilt on publish via Sanity webhook → Vercel deploy hook
- **Integrations (Phase 1):** Solidarity Tech — founding-member signup form embed (`act.rebuild.us`) and get-involved form embed (`act.rebuild.us/join-rebuild`)
- **Integrations (Phase 2):** Clerk (auth), Neon Postgres (database), Drizzle ORM, ClaimReady API proxy, Solidarity Tech bidirectional sync
- **Tooling:** TypeScript strict, Prettier, ESLint

See `docs/adr/0001-stack.md` (Phase 1 architecture) and `docs/adr/0002-backend-auth-integrations.md` (Phase 2 architecture).

## Agent skills

### Issue tracker

Issues and PRDs live as GitHub issues, managed via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Five canonical triage roles mapped to identically-named GitHub labels. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
