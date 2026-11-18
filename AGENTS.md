> **Where things live** - Client: NewWorld | Bucket: `clients/NewWorld/` | Dropbox: `_Clients/NewWorld/` | Registry: Notion "Repos" DB (IDs in `~/Code/toolhub/CoS/NOTION.md`)

# REBUILD.US

Re-development of [rebuild.us](https://rebuild.us) for newworld.inc. This is a rebrand and full information-architecture change from the current WordPress site to a new "national association for disaster survivors" positioning.

See `CONTEXT.md` for the domain language and `docs/adr/` for architectural decisions (start with `docs/adr/0001-stack.md`).

## Current phase: full site build

The splash site (Phase 1) is live at `www.rebuild.us`. The project is now building the **full site**, launching the **week of 2026-12-02**: new pages laid out per the V2 wireframes and styled with the existing design system. It stays fully static (ADR-0012).

Read `docs/full-site.md` before building any page. It holds the sitemap, the page list with proposed routes, the block order per page, the mapping from Figma layout blocks to existing components, and the open questions.

Design sources (Figma file `EmtlSAPCMoFBiEl5noWHWZ`, "Rebuild - V2"):

- Sitemap: <https://www.figma.com/design/EmtlSAPCMoFBiEl5noWHWZ/Rebuild---V2?node-id=1-11>
- Components (layout blocks): <https://www.figma.com/design/EmtlSAPCMoFBiEl5noWHWZ/Rebuild---V2?node-id=1-60>
- Wireframes (pages): <https://www.figma.com/design/EmtlSAPCMoFBiEl5noWHWZ/Rebuild---V2?node-id=1-480>

The wireframes are grayscale and define layout and draft copy only. Visual styling comes from `docs/design-system.md`.

## Stack

- **Frontend:** Astro `output: 'static'` with the Vercel adapter, Tailwind CSS v4 with brand design tokens (`docs/design-system.md`)
- **CMS:** Sanity (Studio on Sanity hosting); document types in use — `siteSettings`, `splashPage`, `privacyPage`, `resourcesPage`, `resourceGuide`, `resourceVideo`, `sharePage` (unlisted PDF pages at `/share/<slug>`, ADR-0011). Five placeholder page singletons from the earlier IA also exist, hidden and unrendered: `aboutPage`, `newsPage`, `contactPage`, `caseStudiesPage`, `memberPortalPage`. Spanish is editor-managed via parallel `*Es` fields (ADR-0008)
- **Structure:** pnpm-workspace monorepo (`apps/web`, `apps/studio`)
- **Hosting:** Vercel, rebuilt on publish via Sanity webhook → Vercel deploy hook; canonical origin is `https://www.rebuild.us` (ADR-0010). A push to `main` deploys to production
- **Integrations:** Solidarity Tech (`act.rebuild.us`) — founding-member signup and get-involved form embeds, whose URLs are set in `siteSettings`, with UTM pass-through (ADR-0009); Fundraise Up — checkout modal opened after the signup form submits (capture-then-pay, ADR-0005)
- **Tooling:** TypeScript strict; Prettier is installed in `apps/web` but has no config file and is not enforced; there is no ESLint and no CI. Tests are `node --test` files run by `pnpm --filter web test`

See `docs/adr/0001-stack.md` and the other ADRs in `docs/adr/` for the decisions behind this. There is no backend, auth, or database.

## Workflows

### Checks before committing

```
pnpm --filter web test      # astro build, then node --test test/*.test.mjs
pnpm --filter studio build  # only when apps/studio changed
```

The web build reads live Sanity content, so it needs `SANITY_PROJECT_ID` in `apps/web/.env`. `test/spanish-routes.test.mjs` asserts the built route pairs; extend it when adding routes.

Type checks are not installed as dependencies; run them with `pnpm dlx`. Both pass clean and should stay that way:

```
cd apps/web && pnpm dlx --package=@astrojs/check --package=typescript@6 astro-check
cd apps/studio && pnpm dlx --package=typescript@6 tsc --noEmit -p .
```

### After any Sanity schema change

Schema changes in `apps/studio/schemaTypes/` are not reflected in the live Studio until you redeploy:

```
cd apps/studio && npx sanity deploy
```

Studio is hosted at `https://rebuild-us.sanity.studio/`. The web app (`apps/web`) reads the schema at build time via the Sanity client, so no Studio redeploy is needed for web rebuilds — only for making new/changed fields visible to content editors.

### Do not run the seed script against production

`pnpm --filter studio seed` (`apps/studio/scripts/seed.mjs`) calls `createOrReplace` on `siteSettings`, the page singletons, and the seeded guides and videos. Run against the production dataset it overwrites live content with placeholder copy.

## Agent skills

### Issue tracker

Issues and PRDs live as GitHub issues, managed via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Five canonical triage roles mapped to identically-named GitHub labels. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
